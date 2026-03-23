---
name: HTTP clipboard workaround
description: navigator.clipboard requires HTTPS — use execCommand fallback for HTTP access
type: feedback
---

The site is accessed over plain HTTP from remote machines (not localhost). `navigator.clipboard.writeText()` silently fails without HTTPS.

**Why:** User accesses the VPS via IP over HTTP (e.g., http://167.88.46.52:3002).

**How to apply:** Always use the `copyToClipboard()` fallback function that tries navigator.clipboard first, then falls back to `document.execCommand('copy')` with a temporary textarea.
