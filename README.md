# Essential 8 Knowledge Base — Web

[![Build container](https://github.com/MaddogWarner/E8-Knowledgebase-Web/actions/workflows/build-container.yml/badge.svg)](https://github.com/MaddogWarner/E8-Knowledgebase-Web/actions/workflows/build-container.yml)
[![Latest release](https://img.shields.io/github/v/release/MaddogWarner/E8-Knowledgebase-Web?sort=semver)](https://github.com/MaddogWarner/E8-Knowledgebase-Web/releases)
[![Container: GHCR](https://img.shields.io/badge/ghcr.io-e8--knowledgebase--web-2496ed?logo=docker&logoColor=white)](https://github.com/MaddogWarner/E8-Knowledgebase-Web/pkgs/container/e8-knowledgebase-web)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A **self-hostable, offline web version** of the
[Essential 8 Knowledge Base iOS app](https://maddogwarner.com) by **MadDogWarner** —
a quick technical reference for system administrators implementing the **ASD
Essential Eight** using built-in Windows OS tooling. It ships as a single hardened
Docker container so a team can stand it up internally (a NOC screen, an internal
server) instead of reaching for a phone.

## Purpose

Pick one of the eight mitigations, choose a Maturity Level (ML1, ML2 or ML3), and
read the specific configuration changes — Group Policy paths, registry keys,
PowerShell, `wbadmin`, `icacls`, `vssadmin` — required to meet that level. A quick
reference for use next to a console, not a learning resource.

The optional **M365 Additional Controls** page lets you select a Microsoft 365
licensing mode so maturity-level pages show separate Microsoft 365 / Microsoft
Defender additions without mixing them into the built-in Windows guidance.

## Scope

- Covers the **November 2023** release of the ASD Essential Eight Maturity Model.
- Documents only configuration achievable with **built-in Windows OS tooling** (Group Policy, registry, AppLocker / WDAC, Microsoft Defender / ASR, Windows Update for Business, Windows LAPS, Windows Hello for Business, Windows Server Backup, ReFS, Credential Guard, etc.).
- Where a level needs capability beyond Windows built-ins, the gap is called out under **"Beyond Windows built-in tooling"**.
- M365 additions are hidden by default; when enabled they show as additional/partial supports for **E3 + Entra ID P1**, **E3 + Entra ID P2**, or **E5**.
- Always verify against the current ASD Maturity Model before implementing.

## Mitigations covered

1. Application Control · 2. Patch Applications · 3. Configure Microsoft Office
Macros · 4. User Application Hardening · 5. Restrict Administrative Privileges ·
6. Patch Operating Systems · 7. Multi-factor Authentication · 8. Regular Backups

Each control also surfaces an **ML0** baseline ("no controls implemented").

## Features

- Desktop-first layout: sidebar of all eight mitigations + M365 + About, with a wide content pane (responsive to mobile).
- Per-control overview, ML0 baseline, and ML1/ML2/ML3 maturity tabs with numbered, copy-able command / GPO / registry blocks.
- **Global search** across every control, step and technical detail.
- **Deep-link URLs** per control and maturity level (e.g. `/control/3/ml2`) for bookmarking and sharing.
- **Print / Save as PDF** for clean runbook output.
- **Dark mode** toggle (remembered locally).
- No accounts, no analytics, no data collection — entirely client-side and offline.

## Screenshots

| Home overview | Control detail (with M365 additions) |
| --- | --- |
| ![Home overview](screenshots/01-home.png) | ![Application Control with Microsoft 365 E5 additions](screenshots/03-maturity-with-m365-additions.png) |

| Global search | Microsoft 365 licensing modes |
| --- | --- |
| ![Search across controls, commands and registry keys](screenshots/07-search.png) | ![Microsoft 365 Additional Controls](screenshots/04-m365-settings-nested.png) |

| Dark mode |
| --- |
| ![Dark mode](screenshots/05-dark-mode.png) |

## Architecture

A single hardened container: a React + TypeScript + Vite SPA built and served by
nginx, which terminates TLS, redirects HTTP→HTTPS, and sets a strict
Content-Security-Policy and other security headers. There is **no backend and no
database** — all content is static, and the only stored state (M365 licensing mode,
theme) lives in the browser's `localStorage`.

```text
[ browser ] ──HTTPS──▶ [ nginx (TLS + security headers) ] ──▶ static SPA (dist/)
```

## Deploy

Requires Docker + Docker Compose.

### Option A — run the published image (GHCR)

```bash
docker run -d --name e8-kb \
  -p 80:80 -p 443:443 \
  -v "$PWD/certs:/etc/nginx/certs" \
  ghcr.io/maddogwarner/e8-knowledgebase-web:latest
```

### Option B — build from source with Compose

```bash
git clone https://github.com/MaddogWarner/E8-Knowledgebase-Web.git
cd E8-Knowledgebase-Web
cp .env.example .env          # optional: set HTTP_PORT / HTTPS_PORT
docker compose up --build -d
```

Browse to `https://localhost` (or the host's address). On first run nginx
generates a **self-signed certificate**, so your browser will warn once — expected
for an internal tool.

### Use your own certificate

Drop a `server.crt` and `server.key` into `./certs/` and restart:

```bash
cp your-cert.crt certs/server.crt
cp your-cert.key certs/server.key
docker compose restart web   # or: docker restart e8-kb
```

### Access control

The app ships with **no built-in authentication** — the Essential Eight is public
reference material. For internal deployments, place it behind your existing
network controls (VPN, SSO reverse proxy, IP allow-listing) as needed.

## Develop

```bash
cd services/web
npm install
npm run dev          # http://localhost:5173
npm run test         # unit tests (Vitest)
npm run test:e2e     # end-to-end tests (Playwright)
npm run build        # production build → dist/
npm run lint
npm run typecheck
```

### Regenerate Swift-derived data

The TypeScript data modules under `services/web/src/data/` are generated verbatim
from the original iOS Swift source. Point the generator at a local checkout of the
iOS project:

```bash
node scripts/generate-data.mjs --swift-root="/path/to/Essential 8 Knowledge Base"
```

Alternatively set the `E8KB_SWIFT_SOURCE` environment variable to the Swift source
directory.

### Regenerate screenshots

With the app running locally:

```bash
cd services/web
BASE_URL=http://localhost:5173 node scripts/capture-screenshots.mjs
```

## Privacy

This tool does not collect, record, store, transmit or share any user data, and
makes no external network calls. The licensing-mode and theme preferences are kept
only in your browser.

## Contributors

- **MadDogWarner** — creator and maintainer; author of the original Essential 8 Knowledge Base iOS app this is ported from. [maddogwarner.com](https://maddogwarner.com) · [GitHub](https://github.com/MaddogWarner)
- **Claude** (Anthropic) — plan, architecture, content-parity and security review.
- **Codex** — implementation (SPA, Docker, nginx, tests).

## Disclaimer

The content is a **reference**, not authoritative guidance. Changes — particularly
to AppLocker / WDAC, Credential Guard, ASR rules and `SmartcardLogonRequired` — can
lock users out or break business-critical software. Test in a representative
non-production environment first, and validate against the current ASD Essential
Eight Maturity Model and Microsoft documentation before applying in production.

## Licence

MIT — see [LICENSE](LICENSE).
