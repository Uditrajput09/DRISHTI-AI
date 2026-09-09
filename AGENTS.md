# AGENTS.md — Workspace Rules for DRISHTI-AI

*This file is auto-loaded by Antigravity (and other AGENTS.md-compatible tools) at the start of every session — you don't need to paste it in manually. Keep it short and concrete; put longer context in brain.md / architecture.md / progress.md instead of growing this file.*

## Before Doing Anything
Read, in this order: `brain.md` → `architecture.md` → `progress.md`.
At the end of the session, update `progress.md` (move finished items, note blockers, set the "next session starting point").

## Project
AI-based landslide early warning system (DRISHTI-AI MVP, deadline 20 Sept 2026). Full context lives in `brain.md`.

## Tech Stack
- Backend: Python + FastAPI
- DB: PostgreSQL + PostGIS (fallback: SQLite if PostGIS setup blocks progress — note the fallback in progress.md if used)
- ML: scikit-learn / XGBoost
- Dashboard: React + Leaflet.js
- Field app: React (mobile-responsive), offline-first
- Alerts: Fast2SMS (SMS) + Firebase Cloud Messaging (push) + LibreTranslate (multilingual)
- Containerization: Docker Compose

Don't swap any of these without logging the change (and why) in brain.md's Decisions Log first.

## Code Conventions
- Python: type hints on function signatures, PEP8, docstrings on public functions
- React: functional components + hooks, one component per file
- Folder structure: follow `architecture.md` exactly — if you need a new top-level folder, add it to architecture.md in the same change
- Keep modules small and single-purpose (ingestion/, ml/, api/, alerts/ stay separate — don't cross-import logic between them beyond clean interfaces)

## Environment & Secrets
- Never hardcode API keys, tokens, or credentials in source files
- Every key used must have a placeholder in `.env.example` with a comment explaining what it's for and where to get it
- Read all secrets via environment variables (`os.environ` / `.env` loader), never inline

## Mocked / Synthetic Data
- No real IoT sensors, and historical landslide records are a small seed dataset — this is expected for a hackathon MVP
- Any time you use mocked, synthetic, or heuristic-generated data in place of something real, comment it clearly at the point of use (e.g. `# MOCKED: no live sensor feed, using simulated soil moisture`)
- Never let mocked data pass silently as if it were live — this matters for demo Q&A honesty

## Testing
- After building each module, run it and confirm it actually returns/does what it claims before moving to the next module
- For the ML model: report precision/recall against the seed dataset before considering it done
- For offline sync: manually verify the queue-and-sync flow works, don't just assume the code compiles

## Priorities Under Time Pressure
If you have to cut scope, cut in this order (see brain.md for full reasoning):
1. Shrink pilot area further
2. Simplify offline sync
3. Reduce to 1 alert language + English
4. Simplify the ML model
Never cut: a working dashboard, at least one live alert, and one field report in the demo path.

## Git Conventions
- Commit messages: short imperative summary (e.g. `Add rainfall ingestion from Open-Meteo`), no need for conventional-commit prefixes unless the team adopts them later
- Don't commit `.env` (only `.env.example`)
- Don't commit generated model artifacts larger than a few MB — note in progress.md how to regenerate them instead

## Safety Guardrails
- Ask before deleting any file that isn't clearly a build artifact
- Ask before changing the pilot district or core tech stack (log the reason in brain.md first)
- Ask before any destructive DB operation (drop table, truncate) outside of local dev seeding

<!-- reticle:begin (managed by `reticle init` — edit outside these markers) -->
## Verifying with Reticle

This app is instrumented by **Reticle**, an in-app verification layer exposed as `reticle_*` MCP tools and the `npx @reticlehq/server` CLI (always through npx: Reticle's server is not installed into this project). Verifying is part of "done", not an optional extra.

**Verify when you have changed something a user can see or do.** A component, a form, a route, a request, a piece of state that reaches the screen. Do it BEFORE telling the user it is complete. Reading the diff proves nothing and unit tests do not run the app.

**Do not reach for Reticle when the change cannot show up in the running app.** It costs tool calls and the user's patience, and a verdict over an unrelated flow proves nothing about what you changed. Skip it for: documentation, comments, tests, build config, CI, dependency bumps with no user-facing effect, backend or CLI work with no UI surface, and any change to a project that is not a running web app. Say in one line that you skipped verification and why, rather than silently not doing it.

**How to verify:**

- Drive the flow with `reticle_act_and_wait({ ref, action, until })`. It names the consequence you expect BEFORE the action, which is the difference between a check and a rationalisation.
- Batch a multi-step journey (a login, a form) into one `reticle_act_sequence` rather than one round trip per field.
- Read the surrounding evidence with `reticle_snapshot`, `reticle_state`, `reticle_network`, `reticle_console`.
- **Only `reticle_act_and_wait` and `reticle_assert` produce a verdict.** `reticle_act` and everything else move or read the app and prove nothing, so a session ending without one of those two has no result however many tools it used.
- Covered flows: `npx @reticlehq/server gate` reports which recorded flows the changed files affect and whether they still pass.

**Setting Reticle up, or just restarted? You are mid-sequence — do not stop until a verdict exists.**
The whole of it is: instrument the app → get a dev server running → open the app in a browser →
drive one flow → report the verdict. Every step is yours to do, and none of them needs the user.
The ONE legitimate pause is a client restart, because a client reads its server list at startup;
when you come back, you are not finished, you are on the next step — resume it without being asked.
Stopping anywhere else leaves an app that looks installed and can verify nothing, which is the
single commonest way this goes wrong. `/reticle` carries the full recovery ladder when a step
does not work; use it rather than guessing, and never report the install as finished without a
verdict to point at.

**Nothing connected? Get the app running.**

**A dev server already running when `reticle init` ran does not have Reticle in its bundle.** It read the build config at boot; `init` edited it afterwards. It serves the old bundle and no session appears. In order:

1. **A dev server was already running?** Restart it, then hard-reload the tab. "Something is listening" does not mean the right bundle is served.
2. **Nothing was running?** Start it in the BACKGROUND and say so in one line. `reticle_sessions` gives you this project's own dev command in `next_action`; use that, never compose one. Started after `init`, it needs no restart.

Stopping to ask is how a verification turn ends with nothing verified.

Four guards, none optional:

1. **Never run two at once.** One dev server on the app's port. Restarting a stale one means stopping it first, not starting a second alongside it.
2. **Never guess the command.** It comes from `package.json` scripts. No recognisable dev script means say so and stop, not invent one.
3. **Never kill anything you did not start**, and never a daemon or a port holder. The one exception is the restart above, and say in one line that you did it.
4. **The permission prompt belongs to your host.** Never bypass, suppress or auto-approve it, and take a refusal as the answer.

A dev server that is already running does not pick up an edited build config or a newly created plugin file — restart it and hard-reload the tab. And if a server IS listening and still nothing connects, the cause is the SDK not loading in the page, not a missing dev server; do not tell the user to start one they are already running.

**Finish `src/reticle-dev.ts` before you claim setup is done.** `init` writes it and cannot always fill it in: a store that needs an argument only reading the code supplies (Jotai atoms, an XState actor, a TanStack `queryClient`) is left as a commented `registerStore` line. A file that registers nothing looks exactly like a finished one, and `reticle_state` then returns empty forever — which is indistinguishable from an app that has nothing to report, so it reads as success. Uncomment the line, complete it, and prove it by driving one flow and seeing your keys come back. If `init` told you to restart your client, this is the job waiting for you on the other side of that restart.

**Verify each feature as you finish it, not all of them at the end.** Asked for four, build one, drive it, get a verdict, then start the second. A red verdict after four builds has four suspects; after one it has none.

**Capture what a change is FOR while you are building it, not afterwards.** `reticle_intent` records the business outcome a change is meant to produce, and the only moment anybody knows it is while the change is being made. Pass `intent` when you save a flow, so the saved flow carries the reason it exists. A flow without one replays for months and then reports "step 3 failed" instead of what stopped being true for a user.

**Honesty, which is the whole point:**

- **`verified: "unknown"` is not a pass.** It means Reticle drove the app and could not tell what happened; `verifiedReason` says which clause decided that. Report it as unknown, never as working.
- **`verified: "no-fault"` is not a pass either.** It means nothing was DECLARED to prove: the page settled and no channel complained, but you asserted nothing, so there is no verification. You get it whenever `until` is omitted. Name a consequence the action changes — a signal, a request, a route, or store state — and call again.
- **Never weaken a check to make it green.** Downgrading, skipping or deleting an assertion is a finding, not a fix.
- **If Reticle cannot run** (no daemon, or this is not a running web app), say so. Do not skip verification silently.
- **Setup is not finished until one real flow has been driven and produced a verdict.** `init` exiting 0, the tools appearing, and a session being listed are all things that happen before anything has been verified.

**The `/reticle` skill runs this whole loop for you** — detect, connect, drive one flow, report. If your client does not have it, install it once: `/plugin marketplace add reticlehq/reticle` then `/plugin install reticle@reticlehq` in Claude Code, or `npx skills add reticlehq/reticle` anywhere the skills CLI works.

**A tool you need is missing? It exists.** The default surface advertises a subset; reach any other by name with `reticle_run { tool, args }`, and list them with `reticle_tools`. Two worth knowing: `reticle_context` returns this run's own memory — what is established, what is proven, what is still unverified — which is what you want after a compaction or when picking up work you did not start; `reticle_intent` records what a change was MEANT to do, while somebody still knows.

**Report Reticle's own defects with `reticle_feedback` the moment you notice**, then carry on with your task. You are the user Reticle is built for and the only one who can say what it cost you, and that knowledge is gone when your context is.

📄 **The rest is in [RETICLE.md](./RETICLE.md): what to do when the tools are missing, when a result carries `version_skew` or `update_available`, when `reticle_state` comes back empty, and how to write a feedback report that can be acted on. Read it when you hit one of those, not before.**
<!-- reticle:end -->
