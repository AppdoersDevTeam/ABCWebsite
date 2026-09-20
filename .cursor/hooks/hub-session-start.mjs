#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { readHubEnvPresence, sessionStartContext } from '../../tools/hub-laptop-setup.mjs'

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = []
    process.stdin.on('data', (chunk) => chunks.push(chunk))
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    process.stdin.on('error', reject)
  })
}

await readStdin()

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const presence = readHubEnvPresence({ workspaceRoot })
const output = sessionStartContext({ tokenSet: presence.tokenSet })
process.stdout.write(`${JSON.stringify(output)}\n`)
process.exit(0)
