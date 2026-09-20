#!/usr/bin/env node
/**
 * One-time Hub token setup for this laptop.
 * Never commit the token. Writes %USERPROFILE%\.appdoers\hub.env (or ~/.appdoers/hub.env).
 */
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DEFAULT_HUB_URL,
  LAPTOP_TOKEN_SETUP_INSTRUCTIONS,
  writeLaptopHubEnv,
} from './hub-laptop-setup.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cliPath = path.join(repoRoot, 'tools', 'hub-workflow-cli.mjs')

function print(msg) {
  output.write(`${msg}\n`)
}

async function promptToken() {
  if (!input.isTTY) {
    print(LAPTOP_TOKEN_SETUP_INSTRUCTIONS)
    process.exit(1)
  }

  print('')
  print('Paste your token from Hub → My Account → Cursor setup.')
  print('It is saved only on this laptop. Do not use someone else\'s token.')
  print('')

  const rl = readline.createInterface({ input, output })
  try {
    const token = (await rl.question('APPDOERS_CURSOR_TOKEN: ')).trim()
    return token
  } finally {
    rl.close()
  }
}

const token = await promptToken()
if (!token) {
  print('APPDOERS_CURSOR_TOKEN is required.')
  process.exit(1)
}

const envPath = writeLaptopHubEnv({
  hubUrl: process.env.APPDOERS_HUB_URL || DEFAULT_HUB_URL,
  token,
})

print('')
print(`Saved to this laptop only: ${envPath}`)
print('Running verify-setup...')

const result = spawnSync(process.execPath, [cliPath, 'verify-setup'], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: process.env,
})

if (result.status !== 0) {
  print('')
  print('Token saved but verify-setup failed. Generate a new token in Hub and run this again.')
  process.exit(result.status || 1)
}

print('')
print('Setup complete. Open this folder in Cursor and start a new Agent chat.')
