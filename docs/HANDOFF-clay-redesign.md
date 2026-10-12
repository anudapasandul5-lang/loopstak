# Handoff: Loopstak clay redesign, orchestrated build

Written 2026-10-12 at the end of the planning session. Read this first.

## Where everything is
- PRD: GitHub issue **#1**. Tickets: issues **#2-#23** (= tickets 01-22), sub-issues of #1, with native "blocked by" links, label `ready-for-agent`, and a **Builder model** line in each.
- Repo docs: `GLOSSARY.md`, `docs/adr/0001-gsap-native-scroll-not-drei-scrollcontrols.md`, `docs/agents/*`, `froztech-design.md` (visual reference), `froztech-website-brief.md`, `PRODUCT.md`, `DESIGN.md` (old look; the PRD's look section replaces its palette and fonts).
- Project skills are committed in `.claude/skills/`: design-taste-frontend, redesign-existing-projects, emil-design-eng, review-animations, impeccable, web-design-guidelines, scroll-craft (skip its paid kie.ai script), gsap-core, gsap-scrolltrigger, react-three-fiber, threejs-loaders, blender-web-pipeline.
- Build branch: `redesign-clay` (ticket #2 creates it from `main`). `main` stays as it is until launch (#23).

## Split: cloud session and PC session (Anuda's decision)
- **Cloud session** (claude.ai/code on this repo): every ticket except Blender modelling. Opus orchestrates; helpers build.
- **PC session** (Anuda's laptop, Blender 5.2 + Blender MCP via `.mcp.json`): only Blender modelling, on branch `clay-models`. It commits compressed GLBs, Blender-rendered stills and the size-budget script under `public/models/` and `public/stills/`, and pushes. Ticket #4 (clay test) and the model parts of #10, #14 and #15-#18 happen there.
- The cloud session pulls `clay-models` into `redesign-clay` when models are ready. Until then it uses code-made placeholder clay shapes with the same names and sizes, so swapping is a file change.
- In the cloud, the `blender` MCP server in `.mcp.json` will fail to start (it points at a Windows path). Ignore it.

## How the build runs
- **Opus = the main session = orchestrator and reviewer.** It works the frontier (tickets whose blockers are closed), writes each helper a complete brief, reviews every result (reads the diff; runs tsc, eslint, unit tests, production build; looks at screenshots at 1440 px and ~400 px), merges into `redesign-clay`, comments the result on the issue and closes it.
- **Helpers:** Sonnet for build tickets, Haiku for #8, #20, #22. Pin the model on every helper. Never Opus as a helper.
- **At most 3-4 helpers at once**, each in its own worktree. Brief narrowly: the issue number, the exact docs to read, the acceptance criteria, and when to stop and report.

## Wave plan
1. **Wave 1:** cloud: #2 (look + engine), #3 (copy). PC: #4 (Blender test).
2. **Gates (stop and ask Anuda):** copy (#3), clay stills (#4), any purchase, any deploy, any outbound message. Keep other unblocked tickets moving meanwhile.
3. **Wave 2 (after #2):** #5 prices, #6 form, #8 PostHog; then #7 alerts after #6.
4. **Wave 3:** home sections #9-#14 as blockers clear; service pages #15, then #16-#18.
5. **Wave 4:** #19 phones, then #20 budget; #21 accessibility and #22 search/links.
6. **#23 launch** with Anuda, only on his written OK.

## Traps
- **Tailwind v4 in worktrees** can scan the main checkout, so new classes silently don't render. Check the served CSS for new classes; use a temporary `@source` line for previews and remove it before committing. Final checks always run on the merged branch.
- **Never link (junction/symlink) `node_modules` into a worktree** that will be removed; run `npm install` in the worktree.
- Next.js 16 differs from training data: read `node_modules/next/dist/docs/` before writing Next code.
- Integrity: no invented proof, numbers or testimonials; no AI claim next to FLOST8; FLOST8 screenshots use fake data only; no Anthropic logo or partner/certified wording.
- Clay must not look like a toy (an earlier painted-signboard look was rejected as childish).
- Talk to Anuda in plain school-level words, short sentences, numbered steps, one next step under 2 minutes. He uses Windows PowerShell.

## Open inputs from Anuda
Photo, WhatsApp number, enquiry email, friend's GitHub link, AI build clips (or OK to record demo clips), account setups (Cal.com, Telegram bot, Anthropic API key, Google Sheet + service account, Resend DNS), loopstak.co purchase. Launch no later than 2026-11-01.
