# Froztech Design System (DESIGN.md)

Measured from https://www.froztech.com/ on 2026-10-12 using the browser's computed styles on the home page. Items marked **(inferred)** came from screenshots or judgment, not from code. Use this with `froztech-website-brief.md`, which has the copy and page structure.

## 1. Design intent

Dark, editorial and confident. Huge white headlines on near-black, lots of empty space, a quiet 3D wireframe graphic, and one hot orange-red accent. The feeling is "tech studio", not "corporate IT".

## 2. Color tokens

These are the colors actually used in the page, ranked by how much they appear.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#121212` (rgb 18,18,18) | Main dark background and dark text on light areas. Most used color. |
| `--paper` | `#FFFFFF` | Headlines and body text on dark. |
| `--black` | `#000000` | Pure black in places (buttons, overlays). |
| `--surface` | `#242424` (rgb 36,36,36) | Body and footer background, one step lighter than ink. |
| `--accent` | `#FF4D00` (rgb 255,77,0) | Accent. Used on only 3 elements. **(inferred)** the logo and the circle around "Help" may use it; the logo looked more crimson in the screenshot. Check before using for the logo. |
| `--accent-soft` | `#FC9149` (rgb 252,145,73) | Lighter orange, used once. |
| `--cream` | `#F8F6F3` and `#FAF9F5` | Rare off-white, used once each. Likely a light section or card. |
| `--ink-warm` | `#141413` | Almost the same as ink. Treat as `--ink`. |

Rules:
- Default is a dark theme. Do not add a light theme unless asked.
- Accent is rare. Max one or two uses per screen.
- Text contrast: white on `#121212` is about 18:1, which passes WCAG AAA. Orange `#FF4D00` on `#121212` is about 6:1, which passes AA for normal text. Check each pair when you build.

Suggested CSS:

```css
:root {
  --ink: #121212;
  --surface: #242424;
  --paper: #ffffff;
  --accent: #ff4d00;
  --accent-soft: #fc9149;
  --cream: #f8f6f3;
}
```

## 3. Typography

Three families appear in the live CSS:

| Role | Live font | Where | Free substitute |
|---|---|---|---|
| Display and headings | "Platform" | h1, h2, h3, footer headline | Space Grotesk or Archivo |
| Body copy and nav | "Cooper Lt BT" (a soft, old-style serif) | Paragraphs, nav links | Fraunces (light) or Lora |
| UI and base | "Favorit" | body default, buttons | Inter or DM Sans |

Both Platform and Favorit are commercial fonts, and Cooper Lt BT is a licensed font too. Do not copy the font files. Use the substitutes unless you have licenses.

Measured sizes (desktop, about 1150px wide):

| Style | Size | Line height | Weight | Notes |
|---|---|---|---|---|
| Section label (h1, h3) | 18px | 20px | 500 | UPPERCASE, small, with a trailing arrow like "HOW WE THINK →" |
| Statement / display (h2) | 110px | 110px | 500 | Sentence case, white. Line height 1.0 |
| Footer headline | 43px | 43px | 500 | "Got a project in mind? Contact us." |
| Body paragraph | 20px | 32px | 400 | Serif (Cooper), white on dark. Line height 1.6 |
| Nav link | 16px | 16px | 400 | |
| Button / UI | 16px | 18.4px | 400 | |

Responsive advice **(inferred)**: 110px headlines will not fit on phones. Use `clamp(2.5rem, 9vw, 6.9rem)` and keep line height at 1.0 to 1.1.

## 4. Layout and spacing

Measured spacing values were not extracted. What is clear from the screenshot and page height:

- Full-width sections stacked vertically, each about one screen tall or more.
- Small section label sits in the left column, big statement in the right two-thirds **(inferred)**.
- Generous vertical gaps (roughly 120 to 200px between sections) **(inferred)**.
- Use an 8px base grid. Suggested scale: 8, 16, 24, 32, 48, 80, 128, 192.

## 5. Components

### Header
- Transparent over the hero, logo "FROZTECH" on the left in a wide, letter-spaced wordmark, nav on the right: ABOUT, PORTFOLIO, CONTACT, SERVICES, flag.
- On small screens it becomes a full-screen overlay menu with a "Close Menu" button. Overlay lists Home, Developments, SEO, Cloud Services, Blog.
- SERVICES opens a dropdown with three groups: Development, SEO, Cloud Services.

### Hero
- Looping reel video with a round Play button (labeled "PLAY REEL" / "PAUSE REEL").
- Label "OUR AGENCY DEVELOPS →" and the headline "Websites, Software & Cloud DevOps".
- Scrolling ticker with the three trust lines.

### Statement block
- Large serif-looking sentence over a 3D wireframe/molecule image. Key words ("Help", "lots of caffeine.") are highlighted. A hand-drawn red ellipse circles "Help".

### Service card
- Number + title (`01 Cloud Services`), short paragraph, "CONTACT US →" link, two stacked images that swap on hover **(inferred)**.

### Portfolio strip
- Numbered list (01, 02, 03...) of client projects, each with a photo and a one-line title.
- Custom cursor labels exist in the page text: "VIEW", "DRAG", "OPEN", "PLAY", "PAUSE". These suggest a custom cursor that changes label on hover or drag.

### Contact band and footer
- "Contact us" button, then footer with big headline, three office blocks (Miami, Colombia, Lake Park), social links (Instagram, Facebook, LinkedIn), partner logo.

### Links and buttons
- Text links end with an arrow "→". Uppercase for calls to action.

## 6. Motion

Seen or implied: scrolling text ticker, hover image swap on cards, hand-drawn circle animation on "Help", custom cursor labels, full-screen menu transition, 3D graphic. No timing values were measured.

Suggested defaults: 200 to 300 ms ease-out for hovers, 500 to 700 ms for menu and section reveals. Respect `prefers-reduced-motion` and turn off the ticker, the circle drawing and parallax.

## 7. Imagery

- Dark, high-contrast photography for portfolio tiles.
- One 3D wireframe object as a hero accent.
- No stock people in the hero.
- Alt text exists on service images (they repeat the card title). Write real descriptions in a rebuild.

## 8. Accessibility checklist for the rebuild

1. Real HTML text for headlines. The live page builds some sentences from animated pieces, which screen readers and search engines can miss.
2. Keyboard-operable menu overlay with a visible focus ring (use the accent color).
3. Captions or a transcript for the reel, and a visible Pause button for the ticker.
4. Do not rely on the custom cursor for meaning. Every "VIEW" or "OPEN" action must also work with Tab and Enter.
5. Alt text that describes the image, not the card title.
6. Check the orange accent against both dark backgrounds before using it for small text.

## 9. Do and don't

Do: keep headlines huge, keep copy short, keep one accent color, leave space.
Don't: add gradients, drop shadows, stock icon sets or extra accent colors. None appear in the original.

## 10. What I could not measure

Exact spacing, container width, border radius, animation timing, breakpoints, and the logo's exact color. The page was read on a 1150px-wide window only, so mobile layout is not confirmed. Open the live site in dev tools to check these before pixel-matching.

## 11. Prompt to give Claude Code

> Read `froztech-website-brief.md` for content and `froztech-design.md` for visuals. Build the home page first in Next.js and Tailwind using the color tokens and type scale in the design file with the free font substitutes. Use placeholder images. Do not copy any proprietary font files. Do not copy the German text found on the live About page; it is spam. Tell me what you could not verify.
