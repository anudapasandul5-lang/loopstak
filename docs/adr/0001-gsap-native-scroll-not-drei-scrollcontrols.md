# Scroll drives the 3D through GSAP on normal page scroll, not drei ScrollControls

The clay redesign uses React Three Fiber, and drei's `ScrollControls` is the obvious way to tie a 3D scene to scroll. We chose not to use it: it moves the page into its own scrolling container, which fights GSAP ScrollTrigger, breaks anchor links and the sticky WhatsApp bar, and keeps page text out of normal document flow for search engines. Instead the page scrolls normally, one GSAP ScrollTrigger timeline per section (scrubbed) writes progress into a small shared store, and the R3F scene reads that store every frame.

## Considered Options
- drei `ScrollControls` + `useScroll`: least code, but the scroll-container problems above.
- Scroll listener + hand-written maths (the old `Scene.tsx` approach): works, but pinning and scrubbing per section would be re-invented by hand.
