---
name: Project Architecture
description: Express + SQLite + React/Vite monorepo on port 3002, mirrors top-down forecast patterns
type: project
---

Fantasy General Conference is a family prediction game for LDS General Conference.

**Stack:** Express 5 + better-sqlite3 (WAL mode) + React 19 + Vite, deployed on DigitalOcean VPS.

**Why:** Mirrors the existing top-down forecast project at /home/profdyno/topdown/ — same patterns, same server, no new services to sign up for.

**How to apply:**
- Server: CommonJS, port 3002, routes in server/src/routes/, SQLite at server/data/
- Client: ESM, Vite proxy to :3002, built to client/dist/, served by Express with SPA fallback
- Auth: simple admin password (SHA-256 hash in settings table), players identified by URL slug
- Real-time: SSE for live scoreboard updates
- GitHub: https://github.com/profdyno/fantasy-general-conference
