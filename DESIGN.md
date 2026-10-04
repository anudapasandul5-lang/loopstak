# Design: Loopstak (Loop & Stack)

Recorded from the built site, 2026-10-04. Source of truth: `src/app/globals.css`, `src/components/Scene.tsx`, `src/components/Motion.tsx`.
This replaced an earlier "Painted Fascia" signboard look that the owner rejected as childish.

## World
The name made physical: a **loop** and a **stack**. One fixed WebGL canvas sits behind real HTML. Scrolling flies the camera along a spline through a chrome infinity loop (the logo's "oo"), a stack of glass layers that build a website, the keys handed over on day one, and the live work, ending on the loop again. User-pinned direction; references: Pinterest and award-site research (dark pages, chrome/glass objects, camera tied to scroll).

## Color
| Token | Value | Use |
|---|---|---|
| `--bg` | #07070a | the void; also the WebGL clear colour and fog |
| `--fg` | #f4f2ee | type |
| `--muted` | #9a9ca6 | secondary copy |
| `--lime` | #d6ff3a | the one signal: buttons, numerals, key tag, progress line |
| `--line` | white at 14% | hairlines |
Contrast: lime/ink on buttons and fg/muted on bg all pass AA.

## Type
- **Unbounded** (display, 700-800, tracking -0.035 to -0.05em, line-height 0.9-0.98). Wide and heavy, echoes the logo's geometric forms.
- **Schibsted Grotesk** (reading). Chosen over the Next.js default (Geist) for a bit more character.
- Logo: `public/brand/loopstak-white.png`, never retyped.

## 3D scene (Three.js)
- Chrome loop: tube along a 3D lemniscate, `MeshPhysicalMaterial` metal with clearcoat and iridescence, lit by a PMREM `RoomEnvironment`. Lime data packets circle it.
- Stack: six canvas-textured glass layers (grid, wireframe, content, action, follow-up, finished site) with lime edge frames; the camera flies through them, then views them obliquely.
- Keys: five chrome keys (Domain, Hosting, Email, Analytics, Code), the first in lime, each with a tag.
- Work: a 2x2 wall of four live-site screenshots; each card is a real link (raycast hit-test on click, pointer cursor on hover), and hovering a work row in the panel scales its card.
- Scenes only render while the camera can reach them (stack fades in after the loop, keys and wall are culled otherwise), so they never bleed into each other.
- Dust particles for depth, exponential fog.
- Camera: Catmull-Rom spline through waypoints; scroll position picks the point by bracketing the viewport centre between section centres; a per-section horizontal view offset keeps the 3D opposite the copy (desktop) or lifts it above the copy (phones, wider FOV for portrait).
- Decorative only: `aria-hidden`, `pointer-events: none`. WebGL failure falls back to a static gradient. Pixel ratio is capped; the loop pauses when the tab is hidden.

## Motion (anime.js v4 + Emil Kowalski rules)
- Opening push-in: an anime.js tween on a plain object drives camera distance, loop scale and dust opacity (2.8s, `out(4)`).
- Section headings: `splitText` into words, rise + unblur with 65ms stagger. Copy blocks and list rows stagger in once, on first view (IntersectionObserver). The hero headline, lede and buttons use a CSS-only entrance so the first paint never waits on JS.
- Price numbers roll to the new currency (520ms) with anime.js; the currency symbol is hidden mid-roll so a half-way number never reads as a price, and a fast second tap cancels the first tween.
- Hidden-until-revealed text (below the hero) only while `html.anim` is set by the head script; a 2.5s timeout and reduced-motion both remove it, and Motion skips hiding if the timeout already fired, so content is never stuck invisible.
- CSS: custom ease-out curves, no `transition: all`, no `scale(0)`, 160-220ms feedback, press scale 0.97, hover gated by `(hover: hover) and (pointer: fine)`, scroll-progress line via scroll-driven animation, `prefers-reduced-motion` honoured.

## Layout and components
- Full-height scenes; copy in a 36rem panel on alternating sides. On desktop the panel is a blurred dark glass surface (functional: it keeps text legible over the 3D). On phones it is a bottom scrim.
- Lists are hairline rows, not cards. Prices are large Unbounded numerals with an LKR/USD toggle (USD labelled approximate).
- Pills (full-radius) for actions; lime primary, outlined ghost.
- Mobile: a sticky lime action bar appears after ~420px of scroll (JS scroll listener, works in every browser); the header button is hidden on phones to avoid duplication.

## Copy voice
Concrete, first person singular, one dry joke allowed, no agency-speak. Lead hook: "Who has the password to your website?" Answered by the ownership section ("The keys are yours."). No invented testimonials, metrics or timelines; past work is labelled as built before Loopstak existed, under the owner's own name.

## Rules
- Every CTA works: WhatsApp when `NEXT_PUBLIC_WHATSAPP` is set, otherwise the on-page form.
- One accent colour, and lime means "this is yours" (primary action, key objects, ownership rows, the data packets); step numbers and currency labels are muted.
- No gradient text, no eyebrows, no emoji icons.
