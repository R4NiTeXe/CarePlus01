# Security Policy & Accepted-Risk Log

## Audit gate

CI fails on any **critical** production vulnerability (`npm audit --omit=dev
--audit-level=critical`). Highs and moderates are triaged below: each is
either fixed, neutralized by architecture, or accepted with a revisit
condition. A finding leaves this log only when the code changes, not when
someone stops looking at it.

## Fix log

| Date (UTC) | Finding                               | Action                                                                                                                                | Proof                                                                                  |
| ---------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 2026-09-07 | `eslint@9` end-of-life (entire tree)  | Upgraded to v10 everywhere; frontend migrated off dead `next lint`; `overrides` pin the line                                          | `npm ls eslint` shows v10 only; both lints green                                       |
| 2026-09-07 | `swiper` critical prototype pollution | Upgraded 11 → 14                                                                                                                      | typecheck + production build green; carousel API unchanged                             |
| 2026-09-07 | `qs` NoSQL/DoS advisories             | Neutralized by architecture, not by version: Express `query parser` set to `simple`, so bracket/operator syntax can never reach Mongo | Live probe: `?status[$ne]=` returns unfiltered instead of executing; 39/39 tests green |

## Accepted risks (open)

| Finding                                                          | Severity | Why accepted                                                                                                                                                                           | Revisit when                                     |
| ---------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `postcss ≤8.5.22` nested inside Next.js (XSS / source-map reads) | High     | It compiles only our own source files at build time. Every advisory requires attacker-controlled CSS input, which does not exist in this system (no user CSS, no runtime compilation). | Next.js 16 upgrade (the only fix path; breaking) |
| `qs` moderates still listed by scanners                          | Moderate | Scanner lists presence, not reachability. The `simple` parser makes the vulnerable code paths unreachable (see fix log above).                                                         | If extended query parsing is ever re-enabled     |
| `@scarf/scarf` install telemetry via `swagger-ui-express`        | Info     | Phones home once per `npm install`, touches no runtime data.                                                                                                                           | If Swagger UI is ever replaced                   |

## Secrets & credentials

- Production never boots without real JWT secrets (fail-closed; verified:
  exit 1 with `Missing required env var`). Docker Compose refuses to start
  without `JWT_SECRET`/`JWT_ACCESS_SECRET`.
- `.env` files are git-ignored and have never been committed.
- Demo credentials printed on the marketing page are seeded demo accounts
  only — no real user data exists in this project.

## Reporting a vulnerability

Open a GitHub issue with `[security]` in the title. Do not post exploit
details publicly; maintainers will acknowledge within 7 days.
