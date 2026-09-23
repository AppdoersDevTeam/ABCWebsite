---
name: push-to-live
description: Stages all changes, commits with a work-based message, and pushes to origin main. Use when the user says Push to live, push live, deploy live to GitHub, go live, or push all changes.
---

# Push to live

Run this immediately. Do not ask first.

**Commit message must describe the work done** (include Change ID when available). Never use `updates changelogs DDMMYYYY`.

```bash
npm run push:live -- "type(scope): short description of the work [CHG-YYYY-DDMM-NNN]"
```

Example:

```bash
npm run push:live -- "perf(admin): cut dashboard Supabase request storms [CHG-2026-2209-002]"
```

That stages all changes, commits with your message, and pushes to `origin main`.

Then tell the user the commit hash, the message used, and whether the push succeeded.
