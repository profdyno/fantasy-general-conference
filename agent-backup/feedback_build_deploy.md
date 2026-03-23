---
name: Build and Deploy Workflow
description: Must build from client/ dir, use port 3002, and run node from project root
type: feedback
---

Always build Vite from the client/ directory (`cd client && npx vite build`), NOT from the project root — root builds output to wrong location causing ENOENT errors.

**Why:** The vite.config.js is in client/ and the dist/ output must land in client/dist/ where Express serves it.

**How to apply:** When rebuilding and restarting:
```
kill $(lsof -ti:3002) 2>/dev/null
cd /home/profdyno/projects/fantasygenconf/client && npx vite build
cd /home/profdyno/projects/fantasygenconf && node server/src/index.js
```
Server runs on port 3002. The top-down forecast app uses 3001.
