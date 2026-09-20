/** Tools that change the repo and therefore require a Hub ticket. */
export const WRITE_TOOLS = new Set([
  'Write',
  'StrReplace',
  'Delete',
  'EditNotebook',
  'WriteFile',
  'ApplyPatch',
])

export function toolNameFromHookInput(input = {}) {
  return String(
    input.tool_name ||
      input.toolName ||
      input.tool ||
      input.toolType ||
      ''
  )
}

export function shouldRequireHubTicket(input = {}) {
  const name = toolNameFromHookInput(input)
  if (!name) return false
  if (WRITE_TOOLS.has(name)) return true
  return /^(Write|StrReplace|Delete|EditNotebook|WriteFile|ApplyPatch)$/i.test(name)
}

export function resolveTicketId(state = {}) {
  const active = typeof state.active_ticket_id === 'string' ? state.active_ticket_id.trim() : ''
  const current = typeof state.current_ticket_id === 'string' ? state.current_ticket_id.trim() : ''
  return active || current || null
}

export function decideHubTicketHook(input = {}, state = {}, options = {}) {
  if (!shouldRequireHubTicket(input)) {
    return { permission: 'allow' }
  }

  if (options.tokenPresent === false) {
    return {
      permission: 'deny',
      user_message: 'Set up your Appdoers Hub token on this laptop before changing files.',
      agent_message:
        'BLOCKED: this laptop has no Appdoers Hub token. STOP. Tell the user: generate a token in Hub → My Account → Cursor setup, then run `node tools/setup-hub-token.mjs` from the repo root in a real terminal. Do not edit files and do not use someone else\'s token.',
    }
  }

  const ticketId = resolveTicketId(state)
  if (ticketId) {
    return { permission: 'allow' }
  }

  return {
    permission: 'deny',
    user_message: 'A Hub ticket is required before changing files in this repo.',
    agent_message:
      'BLOCKED: no Hub ticket is active for this workspace. Before any Write, StrReplace, or Delete, run `node tools/hub-workflow-cli.mjs create-ticket --title "..."` then `node tools/hub-workflow-cli.mjs claim-ticket --ticket-id "<id>"` (or `move-ticket --stage developer`). Retry the edit after the ticket exists. Do not edit files without a ticket.',
  }
}
