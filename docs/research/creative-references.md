# Creative references for the redesign (13 Oct 2026)

Text-only summary. The full version with screenshots is in a private research page shared with Anuda. Third-party screenshots are not committed, because this repo is public.

## Decisions so far
- Replace the clay plan. No 3D objects, built in code only.
- Shop owners come first. The first screen must show in under 2.5 s on slow 4G, and heavier media may lazy-load lower down.
- Launch moved to 30 Nov 2026. Pick a direction by 22 Oct.

## Sites studied
Speed was measured on a throttled phone (slow 4G, CPU slowed 4×). "Main content" is LCP. "First load" is the data loaded in the first few seconds.

| Site | Group | Main content | First load | Borrow |
|---|---|---|---|---|
| [Realevate](https://realevate.agency/) | Bold type | 8.1 s | 1,107 KB | Photo window inside a sliding headline |
| [Noho](https://noho.ink/) | Bold type | 2.2 s | 1,510 KB | Restraint: one font, colour only from images |
| [Becane Paris](https://www.becaneparis.com/) | Bold type | 2.0 s | 478 KB | Huge wide capitals; fastest site tested |
| [Porto Rocha](https://www.portorocha.com/) | Bold type | 10.6 s | 1,661 KB | Live clock, project index |
| [Pensatori Irrazionali](https://pensatori-irrazionali.com/) | Scroll story | 5.3 s | unknown | Kinetic type (not its weight) |
| [Ragged Edge](https://raggededge.com/) | Scroll story | not recorded | 827 KB | One big project per screen |
| [Moto Card](https://www.moto-card.com/) | Quiet 3D | 1.1 s | 2,613 KB | One calm object, everything else still |
| [Vitra Chair Finder](https://findmy.vitra.com/en-en/questionnaire/chairs) | Playful | 8.6 s | 2,275 KB | Playful motion that still sells |
| [Little Troop](https://littletroop.com/) | Playful | 3.5 s | 1,715 KB | One witty transition |
| [Family](https://family.co/) | Playful | 28.0 s | 7,028 KB | Small UI polish (not the cartoon characters) |
| **Loopstak today** | | **1.6 s** | **1,141 KB** | Baseline: `docs/research/before/` |

## Why today's site looks cheap
1. **Shiny and plastic.** Chrome and glass are default 3D materials.
2. **Too busy.** Five effects compete (loop, orbiting dots, glass stack, dust and fog, card wall). Every reference picks one move.
3. **Means nothing.** The loop and glass don't express "you own every key". The keys section, the strongest idea, has no visual idea at all.
4. **Looks like a template.** Dark teal, mint and chrome together are a common startup-template look.
5. **Bugs.** On desktop, the "How it works" heading slides under the menu bar. On phones, the loop pushes the main button below the first screen.

## Directions
- **A. Handover (recommended).** Five key tags pass from a "Loopstak" column to a "Your business" column as you scroll. The hero is a big headline with a real client site showing through a window cut into it. 12–14 days.
- **B. Shopfront index.** Type-only editorial look with wide capitals, a live Colombo clock and a work index. Lightest and fastest to build, 9–10 days. Risk: can feel cold to shop owners.
- **C. Watch it get built.** Website pieces drop into place with 2D physics. Most playful, 15–17 days. Risk: toy look, fiddly on phones.

## Not checked
- Heron AI: Awwwards is blocked from the cloud, and its own site wasn't found.
- Speed figures come from one test run each. Use them to compare sites, not as exact numbers.
