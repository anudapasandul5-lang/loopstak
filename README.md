# Loopstak

Website for Loopstak: websites, AI agents and automation, Claude integration and AI teaching for owner-run businesses in Sri Lanka and abroad. A home page plus one page per Service, set in a 3D world of small blocks that rebuilds itself as you scroll.

**Stack:** Next.js 16, React 19, Tailwind CSS 4, three.js, GSAP.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`, `npm test` (unit tests for the enquiry form and prices).

## Project notes

- `PRODUCT.md`: what the business sells and to whom
- `DESIGN.md`: the look, the 3D world and the motion rules
- `THIRD_PARTY_NOTICES.md`: credits for adapted SmoothUI and Uiverse patterns
- `CLAUDE.md` / `AGENTS.md`: instructions for AI coding agents
