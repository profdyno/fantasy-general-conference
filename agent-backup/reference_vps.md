---
name: VPS and Deployment Info
description: DigitalOcean VPS at 167.88.46.52, firewall managed with ufw, requires sudo for port access
type: reference
---

- VPS IP: 167.88.46.52
- Firewall: ufw (requires sudo — user must run interactively via `!` prefix)
- Port 3002 opened for this app
- Port 3001 used by top-down forecast app
- Node v18.19.1 (some packages warn about requiring Node 20+ but work fine)
- Production: `npm run start` builds client then serves on :3002
- Dev: `npm run dev` runs concurrently (server:3002 + vite dev server)
- GitHub: https://github.com/profdyno/fantasy-general-conference (authenticated via `gh auth login`)
