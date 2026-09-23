import fs from 'node:fs'
import path from 'node:path'

/** Maximum single work burst logged on flush (90 minutes). */
export const MAX_BURST_MS = 90 * 60 * 1000

/** Gaps longer than this between CLI touches are treated as idle and not counted. */
export const IDLE_GAP_MS = 5 * 60 * 1000

/**
 * Minimum billable hours on any Hub time log (6 minutes).
 * Any positive / first flush below this ALWAYS rounds UP to 0.1 and is logged.
 */
export const MIN_LOG_HOURS = 0.1

const WORK_STAGES = new Set(['developer'])
const FLUSH_STAGES = new Set(['qa', 'reviewer', 'done'])

export function isWorkStage(stage) {
  return WORK_STAGES.has(String(stage ?? '').toLowerCase())
}

export function isFlushStage(stage) {
  return FLUSH_STAGES.has(String(stage ?? '').toLowerCase())
}

/** Convert ms → hours (2 decimal places). */
export function msToHours(ms) {
  return parseFloat((ms / 3_600_000).toFixed(2))
}

/**
 * Billable hours for a flush: any time spent below MIN_LOG_HOURS rounds UP to 0.1.
 * Zero unlogged with a prior Hub log → 0 (do not re-bill).
 * Zero unlogged but never logged to Hub yet → still 0.1 (log regardless).
 */
export function billableHours(unloggedMs, { neverLoggedToHub = false } = {}) {
  const ms = Math.max(0, unloggedMs)
  const raw = msToHours(ms)
  // Any positive ms (even < 36s, which rounds to 0.00h) still bills the minimum
  if (ms <= 0 && !neverLoggedToHub) return 0
  return Math.max(MIN_LOG_HOURS, raw)
}

export function createTicketTimeStore(workspaceRoot) {
  const timeFilePath = path.join(workspaceRoot, '.hub-ticket-time.json')

  function readState() {
    if (!fs.existsSync(timeFilePath)) {
      return { active_ticket_id: null, current_ticket_id: null, sessions: {} }
    }
    try {
      const parsed = JSON.parse(fs.readFileSync(timeFilePath, 'utf8'))
      return {
        active_ticket_id: parsed.active_ticket_id ?? null,
        current_ticket_id: parsed.current_ticket_id ?? parsed.active_ticket_id ?? null,
        sessions: parsed.sessions ?? {},
      }
    } catch {
      return { active_ticket_id: null, current_ticket_id: null, sessions: {} }
    }
  }

  function writeState(state) {
    fs.writeFileSync(timeFilePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
  }

  function ensureSession(state, ticketId, nowIso = new Date().toISOString()) {
    if (!state.sessions[ticketId]) {
      state.sessions[ticketId] = {
        started_at: nowIso,
        last_tick_at: nowIso,
        active_ms: 0,
        logged_ms: 0,
        has_logged_to_hub: false,
      }
    }
    if (state.sessions[ticketId].has_logged_to_hub === undefined) {
      state.sessions[ticketId].has_logged_to_hub = (state.sessions[ticketId].logged_ms ?? 0) > 0
    }
    return state.sessions[ticketId]
  }

  function tickSession(session, now = Date.now(), { finalizeSlice = false } = {}) {
    const lastTick = new Date(session.last_tick_at).getTime()
    const delta = now - lastTick
    if (delta <= 0) return

    if (finalizeSlice) {
      session.active_ms += Math.min(delta, MAX_BURST_MS)
    } else if (delta < IDLE_GAP_MS) {
      session.active_ms += delta
    }

    session.last_tick_at = new Date(now).toISOString()
  }

  function getUnloggedMs(session) {
    return Math.max(0, session.active_ms - (session.logged_ms ?? 0))
  }

  function startTicket(ticketId) {
    const state = readState()
    const nowIso = new Date().toISOString()

    if (state.active_ticket_id && state.active_ticket_id !== ticketId) {
      const previous = state.sessions[state.active_ticket_id]
      if (previous) tickSession(previous)
    }

    const session = ensureSession(state, ticketId, nowIso)
    if (!session.started_at) session.started_at = nowIso
    session.last_tick_at = nowIso
    state.active_ticket_id = ticketId
    state.current_ticket_id = ticketId
    writeState(state)
    return { ticket_id: ticketId, active_ms: session.active_ms, logged_ms: session.logged_ms }
  }

  function setCurrentTicket(ticketId) {
    const state = readState()
    state.current_ticket_id = ticketId
    writeState(state)
    return { ticket_id: ticketId }
  }

  function touchTicket(ticketId) {
    const state = readState()
    const session = state.sessions[ticketId]
    if (!session) return null
    tickSession(session)
    writeState(state)
    return {
      ticket_id: ticketId,
      active_ms: session.active_ms,
      logged_ms: session.logged_ms,
      unlogged_ms: getUnloggedMs(session),
    }
  }

  function getTicketTime(ticketId) {
    const state = readState()
    const session = state.sessions[ticketId]
    if (!session) return null
    tickSession(session)
    writeState(state)
    const unloggedMs = getUnloggedMs(session)
    return {
      ticket_id: ticketId,
      started_at: session.started_at,
      last_tick_at: session.last_tick_at,
      active_ms: session.active_ms,
      logged_ms: session.logged_ms,
      unlogged_ms: unloggedMs,
      active_hours: msToHours(session.active_ms),
      unlogged_hours: msToHours(unloggedMs),
      billable_hours_if_flushed: billableHours(unloggedMs, {
        neverLoggedToHub: !session.has_logged_to_hub,
      }),
      active_seconds: Math.round(session.active_ms / 1000),
      unlogged_seconds: Math.round(unloggedMs / 1000),
      is_active: state.active_ticket_id === ticketId,
      has_logged_to_hub: Boolean(session.has_logged_to_hub),
    }
  }

  function prepareFlush(ticketId, { finalize = false } = {}) {
    const state = readState()
    const session = state.sessions[ticketId]
    if (!session) {
      return {
        hours: 0,
        active_ms: 0,
        logged_ms: 0,
        finalize,
        rounded_up_to_minimum: false,
        raw_hours: 0,
      }
    }

    tickSession(session, Date.now(), { finalizeSlice: true })
    let unloggedMs = getUnloggedMs(session)
    // After a Hub log, ignore sub-second finalize noise so a double-flush does not re-bill 0.1
    if (session.has_logged_to_hub && unloggedMs < 1000) {
      unloggedMs = 0
      session.logged_ms = session.active_ms
    }

    const rawHours = msToHours(unloggedMs)
    const neverLoggedToHub = !session.has_logged_to_hub
    const hours = billableHours(unloggedMs, { neverLoggedToHub })
    const roundedUp = hours > 0 && rawHours < MIN_LOG_HOURS

    if (hours > 0) {
      session.logged_ms = session.active_ms
      session.has_logged_to_hub = true
    }

    const result = {
      hours,
      raw_hours: rawHours,
      active_ms: session.active_ms,
      logged_ms: session.logged_ms,
      unlogged_ms_before_flush: unloggedMs,
      finalize,
      rounded_up_to_minimum: roundedUp,
      below_minimum: false,
    }

    if (finalize) {
      if (state.active_ticket_id === ticketId) state.active_ticket_id = null
      if (state.current_ticket_id === ticketId) state.current_ticket_id = null
      delete state.sessions[ticketId]
    }

    writeState(state)
    return result
  }

  function getActiveTicketId() {
    return readState().active_ticket_id
  }

  function getCurrentTicketId() {
    const state = readState()
    return state.active_ticket_id || state.current_ticket_id || null
  }

  return {
    timeFilePath,
    startTicket,
    touchTicket,
    getTicketTime,
    getActiveTicketId,
    getCurrentTicketId,
    setCurrentTicket,
    prepareFlush,
    msToHours,
  }
}

export async function logTicketHours(hubFetch, ticketId, hours, description) {
  if (hours <= 0) {
    return { skipped: true, reason: 'zero_hours', hours }
  }

  // Safety net: never POST below the billable minimum
  const billedHours = Math.max(MIN_LOG_HOURS, hours)

  return hubFetch(`/api/cursor/tickets/${ticketId}/time`, {
    method: 'POST',
    body: JSON.stringify({
      hours: billedHours,
      description: description ?? 'Cursor active work (auto-logged)',
      is_billable: true,
    }),
  })
}
