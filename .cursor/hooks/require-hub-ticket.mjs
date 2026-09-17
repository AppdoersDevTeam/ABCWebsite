#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { decideHubTicketHook } from './require-hub-ticket-lib.mjs'

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const timeFilePath = path.join(workspaceRoot, '.hub-ticket-time.json')

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = []
    process.stdin.on('data', (chunk) => chunks.push(chunk))
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    process.stdin.on('error', reject)
  })
}

function readTicketState() {
  if (!fs.existsSync(timeFilePath)) {
    return { active_ticket_id: null, current_ticket_id: null }
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(timeFilePath, 'utf8'))
    return {
      active_ticket_id: parsed.active_ticket_id ?? null,
      current_ticket_id: parsed.current_ticket_id ?? null,
    }
  } catch {
    return { active_ticket_id: null, current_ticket_id: null }
  }
}

const raw = await readStdin()
let input = {}
if (raw.trim()) {
  try {
    input = JSON.parse(raw)
  } catch {
    input = {}
  }
}

const decision = decideHubTicketHook(input, readTicketState())
process.stdout.write(`${JSON.stringify(decision)}\n`)
process.exit(0)
