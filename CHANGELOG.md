# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and this project adheres to
[Semantic Versioning](https://semver.org/).

## 3.5.0 — 2026-10-03

### Added

- Optional global Deep Audit Mode with per-profile status history, optional notes and a 200-entry limit per step.
- Backup & Restore for one or all profiles, with strict validation, a 5 MB safety limit and confirmation before replacing browser data. Exports use iOS schema v2, whole-second UTC dates and reversible zero-based iOS / one-based web step-ID conversions; v1 iOS backups remain importable. CSV evidence and theme settings are excluded.
- Generator-derived MITRE ATT&CK® mappings for 35 techniques and 65 steps, technique dialogs, coverage by target maturity and OS scope, control links and technique/mapping-note search. Coverage includes CSV evidence using the dashboard's existing precedence.

### Changed

- About-page MITRE notices, reference links and About Me wording match the Swift source; privacy copy describes browser storage, explicit exports and in-memory CSV processing.
- Profiles record their creation date, with a one-time backfill for existing profiles. N/A reasons and audit notes share a 2,000-character limit.

### Fixed

- Backups record the running app version instead of a hardcoded value, never export a step whose stored state is unrecognised, and fall back to the web default target (ML1) when an imported value is unknown.

### Security

- Development-only dependencies updated to close new advisories: `brace-expansion` 1.1.18 → 1.1.21 and 5.0.9 → 5.0.12, `js-yaml` 4.3.1 → 4.3.2 (#44), `vitest`/`@vitest/mocker` 4.1.8 → 4.1.11 (#43). None ship in the production image.

## 3.4.2 — 2026-08-29

### Security

- `openssl`, `libcrypto3` and `libssl3` raised from 3.5.7-r0 to 3.5.8-r0. The web image installed openssl without ever upgrading, so it shipped whatever `nginx:alpine` carried (#41).
- The runtime stage is excluded from the build cache. Without this, a cached layer replays the `apk upgrade` result and silently reintroduces stale packages whenever a CVE lands without a source change. Both the scan build and the push build skip the cache for that stage, which also guarantees the image that is pushed is the one that was scanned (#41).

- `js-yaml` 4.2.0 → 4.3.1, closing the advisory for the previous range (#39).
- `nanoid` forced to `>=3.3.18` via an npm `overrides` entry, closing a high-severity
  advisory. It is a transitive dependency of `vite` → `postcss`, so the override is the
  only way to raise it without waiting upstream. Not declared as a direct dependency,
  since the application does not import it.
- `brace-expansion` and `postcss` (8.5.15 → 8.5.25) updated (#38, #37).
- `react-router` 7.16.0 → 7.18.2 (#34).

### Changed

- Re-enabled CodeRabbit gitleaks secret scanning and added advisory CodeRabbit
  configuration (#32, #31).

## 3.4.1 — 2026-07-16

### Fixed

- Hardened a reference-link test assertion to check the parsed URL host instead of a whole-URL substring, resolving CodeQL alert `js/incomplete-url-substring-sanitization`. Test-only change; no application behaviour is affected.

## 3.4.0 — 2026-07-16

### Added

- Workstation, Server and Both OS scope filtering on the About page, persisted per environment profile.
- Scope filtering across compliance dashboards, control pages, search, CSV exports and printable reports, with per-step scope badges.

## 3.3.1 — 2026-07-08

### Added

- About page now shows the running app version and build date, sourced automatically from `package.json` at build time so it never needs manual updates.
- About page links directly to the project's GitHub repository and to the E8 hardening audit & policy compliance checker (assessment script).

## 3.3.0 — 2026-07-08

### Added

- Windows Audit Policy entries now show uploaded CSV evidence status chips for matching AuditPolicy checks, including compliant, non-compliant and review states.
- The Audit Policy page now summarises matched audit-policy checks and discloses uploaded AuditPolicy checks that have no page entry.

### Changed

- CSV upload summaries now link to the Windows Audit Policy page and report page-entry AuditPolicy matches separately from Essential Eight step evidence.

## 3.2.0 — 2026-07-08

### Added

- CSV evidence upload now maps PowerShell Transcription and Audit Process Creation rows to their matching Essential Eight KB steps.
- Upload summaries now count audit-policy evidence separately and disclose E8 checks that have no matching KB step.

### Fixed

- ASR rows reported in Audit or Warn mode now count as non-compliant evidence rather than disappearing from the dashboard.
- Non-ASR review-only rows, unsupported checks, MDE rows and deliberately unmapped Windows hardening checks remain ignored without affecting step status.

## 3.1.0 — 2026-07-07

### Added

- Progress legend chips on control pages now filter the active maturity level by status, including multi-select, counts, a clear action and an explicit empty state.
- Home-page compliance chart rows now link directly to each mitigation's ML1 page with hover and keyboard focus affordances.

## 3.0.1 — 2026-07-05

Cybersecurity technical content corrections (ported from the Android review, shared across all platforms).

### Fixed

- Replaced the unsupported AppLocker environment variables `%TEMP%` and `%LOCALAPPDATA%` in Application Control ML1 with the AppLocker-compliant deny path `%OSDRIVE%\Users\*\AppData\Local\Temp\*`.
- Added a caveat to `sc config AppIDSvc start= auto` noting it returns Access Denied on Windows 10 1809+ and the GPO alternative should be used.
- Replaced the unrelated "Block third party cookies" GPO in the Edge Java step with `ExtensionInstallBlocklist = *`, and softened the ads step description to "many tracking-based ad networks".
- Added a gapNote to User Application Hardening ML1 acknowledging Edge Tracking Prevention does not provide complete ad-blocking compliance.
- Restricted the Mark-of-the-Web macro block policy list to supported apps (Word, Excel, PowerPoint, Access, Visio), noting Outlook, Project and Publisher do not support the policy.
- Appended a plaintext-credential caution to the `wbadmin enable backup` scheduling command.

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
