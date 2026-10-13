# Design: Loopstak, the block world

Recorded 2026-10-13 from the built site. Source of truth: `src/app/globals.css`, `src/components/world/`, `src/components/Motion.tsx`.
This replaces the chrome "Loop & Stack" tour and the clay plan. Owner brief: start fresh from main, all four Services, a full 3D scroll world, home plus four Service pages.

## Idea
Loopstak builds from small parts and hands every part to the owner. The whole site is one world of small blocks (one instanced mesh, one draw call) that rebuilds itself as you scroll: the infinity loop (the logo's "oo"), a city with one lit shop (the statement), a website, a gear loop with a message going in and a mint reply coming out, two tools joined by a plug, a classroom table, the four-layer stack (process), a mint key that turns as you scroll (ownership), one person beside a stack of work (who builds it), and the loop again. Mint only ever means "yours".

## Colour
| Token | Value | Use |
|---|---|---|
| `--bg` | #0c0d0d | page, WebGL clear colour and fog |
| `--fg` | #eceae3 | type; also the stone colour of the blocks (shader 0.9/0.88/0.84) |
| `--muted` | #a3a49d | secondary copy (7.6:1) |
| `--mint` | #02c39a | the one accent: primary actions and the parts that are the client's own |
| `--line` / `--line-2` | fg at 13% / 24% | hairlines and outlines |
Dark only, by brand choice. All text pairs pass AA (axe scan clean on every page).

## Type
Three voices (2026-10-13, replaced the single stretched Archivo):
- **Bricolage Grotesque** for display (headlines, statement, prices, menu, work names). Variable width axis 75-100: headings open from narrow to full width as they rise in (`--wd`, tweened in `Motion.tsx`; the hero does it in CSS), and menu names widen on hover. It has no italic, so headline emphasis is weight and mint, never a fake slant.
- **Geist** for reading (body, buttons, form labels). Italic allowed in body copy.
- **Geist Mono** for numbers, price units and small uppercase labels (chapter index, tab numbers, footer and FAQ headings, work kind).

## 3D (src/components/world)
- `forms.ts`: shapes are built on a grid in code (no model files). Each shape keeps a block budget (desktop 7,000, phones 2,600, budget phones 1,600) by growing the grid unit. Staged shapes (`site:1..4` and so on) share one centre so a Service page's object builds in place.
- `engine.ts`: a float data texture holds every block's place in every shape on the page (one row per section). The vertex shader flies each block from one shape to the next: bottom blocks first, a lift and a tumble mid-flight. Spare blocks become sparse dust. A soft light pool grounds each shape. Matte lighting with a soft chamfer from face UVs, rim light, distance fog.
- Scroll drives it through normal page scroll (ADR 0001): section boundaries crossing the middle of the screen move a single damped value. Per-shape poses can turn with scroll (the key turns, the stack swings).
- Desktop: the shape sits opposite the copy (camera view offset). Phones: above the copy, copy on a scrim, pixel ratio capped at 1.5.
- Loads after the page is idle (three.js is a separate chunk). No WebGL: a quiet dot field. Reduced motion: shapes snap to their finished pose, nothing spins or drifts. Decorative only: `aria-hidden`, no pointer events.

## Motion (GSAP, one library)
- Hero headline: CSS-only line rise, so first paint never waits on JS.
- `[data-split]` headings rise line by line from a mask; `[data-reveal]` blocks fade up once; the statement's words light up as you scroll; Work pans sideways while pinned (desktop); primary buttons are magnetic.
- Page to page, the world persists and the last shape rebuilds into the new page's first shape.
- Every move is skipped under reduced motion, and a 2.6 s timeout guarantees nothing stays hidden.

## Components (borrowed patterns, see THIRD_PARTY_NOTICES.md)
- Buttons: Uiverse "animated-button" (gharsh11032000): a circle fills the pill, arrows swap sides.
- Price tabs and the LKR/USD switch: SmoothUI Animated Tabs (sliding marker and pill).
- Prices: SmoothUI Price Flow (digits roll up to LKR, down to USD).
- FAQ: SmoothUI Basic Accordion feel on native `<details>`.
- Cards: SmoothUI Glow Hover Card (mint light follows the pointer along the border).
- Inputs: Uiverse input (Lucaasbre) focus line.
All rebuilt in CSS and existing GSAP: no Motion library added.

## Layout
Every scene is at least one screen tall. Sections never repeat the same move twice in a row: hero split, full-width statement, four Service chapters, pinned horizontal Work, process, a calm prices board, keys, who builds it, contact. Prices: both lists are in the HTML and `<html data-list>` (set before paint from a country cookie, or the visitor's choice) shows one, so pages stay static.

## Rules
- Every action works: Cal.com link if set, else WhatsApp, else the on-page form.
- No invented proof, numbers or testimonials. Work is labelled Client or Own venture. Service pages without client results say so.
- No Anthropic logo, no partner or certified wording.
