# Hub setup for every laptop

Appdoers Hub is required for all work in this repo. The Cursor rules, file-edit hook, and Hub CLI are **in git** — anyone who clones this folder and opens it in Cursor gets them automatically.

What is **not** in git is your Hub token. Each person must set up their own token on their own machine. Do not copy a teammate's token.

## Once per person, per laptop

1. Install **Node.js 18+**.
2. Clone this repo and run `npm install`.
3. In **Hub** go to **My Account → Cursor setup** and generate a token.
4. From the repo root, in a **real terminal** (PowerShell, Terminal — not an Agent chat), run:

```bash
node tools/setup-hub-token.mjs
```

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File "tools\setup-my-cursor-token.ps1"
```

That writes `%USERPROFILE%\.appdoers\hub.env` (or `~/.appdoers/hub.env`). Never commit that file.

5. Open **this folder** in Cursor → new Agent chat. The agent must run `whoami`, confirm client / project / you, then create a Hub ticket before any file edit.

## If the agent cannot talk to Hub

Tell it to stop. Generate a token in Hub, run `node tools/setup-hub-token.mjs`, then start a **new** Agent chat.

If `whoami` shows someone else, you are using the wrong token. Run setup again with **your** token.

## What the repo already enforces

- Always-apply Cursor rules require Hub session + tickets on every chat.
- `.cursor/hooks.json` blocks Write / StrReplace / Delete when there is no active Hub ticket, and when this laptop has no Hub token.
- `node tools/hub-workflow-cli.mjs` is the only allowed Hub API.
