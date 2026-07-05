# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and this project adheres to
[Semantic Versioning](https://semver.org/).

## 3.0.0 — 2026-07-05

iOS parity and desktop reporting release.

### Added

- Multi-state per-step tracking: Not Implemented, Implemented and Not Applicable with an optional local reason.
- Compliance dashboard on the home page with an overall SVG ring, per-mitigation stacked bars and target-scoped completion maths.
- ISM control capsules on implementation steps, generated from the iOS source, with ISM ID search support.
- Windows Audit Policy reference page generated from the iOS source and available in global search.
- Compliance report export as CSV plus printable home-page report output.
- Environment profiles with isolated tracking, target maturity, hide-completed and M365 licence preferences.
- Reset actions for the active profile or all app data, retaining the local theme preference.
- Verification-command rendering support via an intentionally empty web-only `verification.ts` data file for later reviewed content.

### Changed

- Legacy boolean ticks migrate to Implemented status under the new profile-scoped storage model.
- Evidence continues to count as Implemented, while manual Not Applicable takes precedence and audit failures still block manual implementation.
- Progress bars now include Not Applicable as an amber segment and exclude N/A steps from denominators.

## 2.0.0 — 2026-06-03

Implementation-tracking release: the reference now doubles as a lightweight,
client-side progress tracker with optional CSV audit evidence.

### Added

- Per-step manual implementation ticks persisted in browser `localStorage`, plus per-mitigation segmented progress bars.
- Client-side CSV evidence upload for `e8-hardening-audit-policy-compliance-checker`, with in-memory-only evidence state and an honest matched E8 checks summary.
- Home-page target maturity selector and hide-completed-mitigations switch using the per-target completion rule.
- Richer technical-detail presentation with recognised type chips while preserving verbatim code-block text and copy output.
- About-page reference link to the audit tool GitHub repository.
- Vitest coverage for CSV parsing, evidence mapping and status logic, plus Playwright coverage for progress, hide-complete, CSV evidence and the About link.

### Fixed

- Manual implementation ticks now toggle correctly under React StrictMode.
- Playwright v2 coverage now uses the correct Control 1 step count and badge-scoped evidence assertions.

## 1.0.0 — 2026-06-02

Initial public release — a self-hostable web version of the Essential 8 Knowledge
Base iOS app by MadDogWarner.

### Added

- React 19 + TypeScript + Vite single-page app with a desktop-first sidebar layout (responsive down to mobile).
- All eight Essential Eight controls, each with an ML0 baseline and ML1/ML2/ML3 maturity levels: summaries, numbered implementation steps, and copy-able Group Policy / registry / PowerShell / command blocks, ported verbatim from the iOS Swift source.
- "Beyond Windows built-in tooling" gap notes per maturity level.
- Microsoft 365 Additional Controls: selectable licensing mode (None / E3 + Entra ID P1 / E3 + Entra ID P2 / E5) that layers in the matching Microsoft 365 / Microsoft Defender additions; the selection is stored locally.
- Global search across controls, steps and technical details; deep-link URLs per control and maturity level; print / Save-as-PDF stylesheet; light/dark theme toggle.
- About & Privacy page with the canonical no-data-collection statement and authoritative reference links (ASD, Microsoft Learn).
- Single hardened Docker container: multi-stage build, nginx serving the static SPA with HTTP→HTTPS redirect, auto-generated self-signed certificate (with custom-certificate override), HSTS / CSP / `X-Content-Type-Options` / `Referrer-Policy` headers, and rate limiting.
- GitHub Actions workflow to build and publish the container image to GitHub Container Registry (GHCR).
- Vitest unit tests (data integrity, Microsoft 365 cumulative logic, privacy copy) and Playwright end-to-end tests (navigation, maturity tabs, deep links, search, copy, dark mode, Microsoft 365 additions, About).
- `scripts/generate-data.mjs` to regenerate the TypeScript data modules from the iOS Swift source, and `services/web/scripts/capture-screenshots.mjs` to regenerate the README screenshots.

### Security & privacy

- No backend, database, authentication, accounts, analytics or telemetry; the app makes no external network calls and stores only the theme and Microsoft 365 licensing-mode preferences in the browser.

## Credits

- **MadDogWarner** — creator and maintainer; author of the original iOS app.
- **Claude** (Anthropic) — plan, architecture, content-parity and security review.
- **Codex** — implementation of the SPA, Docker / nginx packaging, data port and tests.
