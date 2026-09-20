import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const DEFAULT_HUB_URL = 'https://appdoers-hub-two.vercel.app'

export const LAPTOP_TOKEN_SETUP_INSTRUCTIONS = `This laptop has no Appdoers Hub token. STOP. Each person must use their own token.

1. In Hub go to My Account → Cursor setup and generate a token.
2. From this repo root, in a real terminal (not an agent chat), run:
   node tools/setup-hub-token.mjs
3. Open this folder in Cursor and start a new Agent chat. The agent will run whoami, confirm client/project as you, then create Hub tickets before any file edit.

Do not copy someone else's token. Time and tickets belong to the token owner.
If whoami shows a different person, stop and run setup again with your token.`

export function getUserHubEnvPath(home = process.env.USERPROFILE || process.env.HOME || os.homedir()) {
  if (!home) return null
  return path.join(home, '.appdoers', 'hub.env')
}

export function hubEnvCandidatePaths(workspaceRoot, home) {
  return [
    getUserHubEnvPath(home),
    workspaceRoot ? path.join(workspaceRoot, '.env.local') : null,
    workspaceRoot ? path.join(workspaceRoot, '.env.hub') : null,
    workspaceRoot ? path.join(workspaceRoot, '..', '.env.hub') : null,
  ].filter(Boolean)
}

export function parseDotEnv(content) {
  const values = {}
  for (const rawLine of String(content || '').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    values[key] = value
  }
  return values
}

export function readHubEnvPresence({
  workspaceRoot,
  home,
  env = process.env,
  readFileSync = fs.readFileSync,
  existsSync = fs.existsSync,
} = {}) {
  if (env.APPDOERS_HUB_URL && env.APPDOERS_CURSOR_TOKEN) {
    return {
      hubUrlSet: true,
      tokenSet: true,
      envFile: getUserHubEnvPath(home),
    }
  }

  let hubUrlSet = Boolean(env.APPDOERS_HUB_URL)
  let tokenSet = Boolean(env.APPDOERS_CURSOR_TOKEN)
  let envFile = getUserHubEnvPath(home)

  for (const filePath of hubEnvCandidatePaths(workspaceRoot, home)) {
    if (!existsSync(filePath)) continue
    let loaded = {}
    try {
      loaded = parseDotEnv(readFileSync(filePath, 'utf8'))
    } catch {
      continue
    }
    if (!hubUrlSet && loaded.APPDOERS_HUB_URL) hubUrlSet = true
    if (!tokenSet && loaded.APPDOERS_CURSOR_TOKEN) {
      tokenSet = true
      envFile = filePath
    }
    if (hubUrlSet && tokenSet) {
      return { hubUrlSet, tokenSet, envFile: filePath }
    }
  }

  return { hubUrlSet, tokenSet, envFile }
}

export function writeLaptopHubEnv({
  hubUrl = DEFAULT_HUB_URL,
  token,
  home,
  mkdirSync = fs.mkdirSync,
  writeFileSync = fs.writeFileSync,
} = {}) {
  const envPath = getUserHubEnvPath(home)
  if (!envPath) {
    throw new Error('Could not resolve home directory for ~/.appdoers/hub.env')
  }
  if (!token) {
    throw new Error('APPDOERS_CURSOR_TOKEN is required')
  }
  mkdirSync(path.dirname(envPath), { recursive: true })
  const body = `APPDOERS_HUB_URL=${hubUrl}\nAPPDOERS_CURSOR_TOKEN=${token}\n`
  writeFileSync(envPath, body, { encoding: 'utf8', mode: 0o600 })
  return envPath
}

export function missingTokenHookDecision() {
  return {
    permission: 'deny',
    user_message: 'Set up your Appdoers Hub token on this laptop before changing files.',
    agent_message: `BLOCKED: ${LAPTOP_TOKEN_SETUP_INSTRUCTIONS}`,
  }
}

export function sessionStartContext({ tokenSet }) {
  const setup = tokenSet
    ? 'Hub token is present on this laptop. On the first message of this chat you MUST run `node tools/hub-workflow-cli.mjs whoami` then `show-session`, then AskQuestion to confirm client / project / team member. Do not edit files until a Hub ticket exists. Use the CLI only.'
    : LAPTOP_TOKEN_SETUP_INSTRUCTIONS
  return {
    additional_context: setup,
  }
}
