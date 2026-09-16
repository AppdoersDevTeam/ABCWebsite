---
name: push-to-live
description: Stages all changes, commits with updates changelogs DDMMYYYY, and pushes to origin main. Use when the user says Push to live, push live, deploy live to GitHub, or go live.
---

# Push to live

Run this immediately. Do not ask first. Do not add extra git or changelog steps.

```bash
npm run push:live
```

That is the project's `git add .` + `git commit -m "updates changelogs DDMMYYYY"` + `git push -u origin main`, with the date in Pacific/Auckland `DDMMYYYY`.

Then tell the user whether the commit and push succeeded.
