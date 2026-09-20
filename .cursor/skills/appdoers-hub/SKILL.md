---
name: appdoers-hub
description: Use on EVERY request in this repository, including the first message of a new chat. Appdoers Hub is the source of truth — confirm session, create or use a ticket before any file edit, CLI-only, stages, and time tracking. Do not skip for small changes or unrelated-looking folders.
---

# Appdoers Hub

Appdoers Hub is the source of truth for all work in this and every Appdoers project. Follow this on every request, including the first message of a new chat. Do not skip it because a folder looks unrelated, because the user asked for a small change, or because rules already exist.

USE THE CLI ONLY. Never call Hub HTTP endpoints yourself. All Hub actions:

```
node tools/hub-workflow-cli.mjs <command>
```

If `tools/hub-workflow-cli.mjs` is missing, install the kit from the project root before doing anything else (PowerShell):

```
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/AppdoersDevTeam/Appdoers-Hub/master/hub-cursor-kit/install-project.ps1 -OutFile $env:TEMP\hub-install.ps1; & $env:TEMP\hub-install.ps1"
```

If that fails on token/setup, or this is a **new laptop / new teammate**, STOP. Each person must generate their own token in Hub → My Account → Cursor setup, then run:

```
node tools/setup-hub-token.mjs
```

See `HUB-SETUP.md`. Do not copy another person's token. If `whoami` shows someone else, stop and tell them to update `APPDOERS_CURSOR_TOKEN` on that laptop.

## Session (every new agent chat, even if `.hub-session.json` exists)

1. Run `whoami`. Show team member + token name.
2. Run `show-session`.
3. Ask the user to confirm with AskQuestion.
   - Session exists: "Continue as {client_name} / {project_name} / {team_member_name}?"
   - Missing or declined: `list-clients` → ask which client → `list-projects --client-id <uuid>` → ask which project → `set-session` with those ids and the whoami team member (name + team-user-id).
4. Session team member MUST be the token owner. If the user says they are someone else, STOP and tell them to update `APPDOERS_CURSOR_TOKEN`.
5. Echo confirmed `client_name`, `project_name`, `team_member_name`, and ids before other work.

Never guess client, project, or person. Never pick a project by name alone (names collide). Folder names are hints only. Confirm both `company_name` and project name. To switch later: `clear-session` and repeat.

## Tickets (before any code edit)

- User gave a ticket id → `get-ticket` and use it. If it is on the wrong client/project, `update-ticket --project-id "<correct-uuid>"` with a note.
- No ticket id → `create-ticket --title "..." --stage pm` (session project), then `claim-ticket`.
- Include the ticket id in progress updates and the final response.
- Do not edit application code until session is confirmed and a ticket exists.

## Stages (do not skip)

`pm` (intake) → claim / `developer` (implement + notes) → `qa` → `reviewer` → `done`

`done` only after explicit QA pass AND reviewer approval.

If blocked: keep the current stage and add a note starting with `BLOCKED:`

## Time

Timer starts on `claim-ticket` or `move-ticket --stage developer`.

Gaps over 5 minutes are idle and must not be logged.

When implementation for a user request is complete, run `flush-ticket-time --ticket-id "<id>"` before the final reply.

Moving to `qa`, `reviewer`, or `done` auto-flushes.

Never pass hours or `time_spent` yourself. Time belongs to the token owner.

## Commands

`whoami`, `verify-setup`

`show-session`, `list-clients`, `list-projects --client-id <uuid>`, `set-session`, `clear-session`

`create-ticket`, `get-ticket`, `list-tickets`, `update-ticket`, `move-ticket`, `claim-ticket`, `note`

`show-ticket-time`, `flush-ticket-time`
