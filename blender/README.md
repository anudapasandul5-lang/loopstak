# Clay models (Blender 5.2, PC session, branch `clay-models`)

Every model is built by a script here, so it can be rebuilt exactly.

## Pipeline
1. In Blender (Blender MCP or the Scripting tab), set `KEY`, `SCRIPT`, `PREVIEW_CAM`, `PREVIEW_TARGET`, then
   `exec(open(r"C:/Users/anuda/orca/loopstak/blender/run_model.py").read())`.
   It builds the model (`m_<key>.py`), bakes soft sky light + ambient occlusion into one texture,
   exports `blender/raw/<key>.glb` and renders an unlit preview.
2. `sh blender/compress.sh <key>` → `public/models/<key>.glb` (meshopt + webp, textures ≤ 1024 px).
3. `node scripts/check-model-budget.mjs` → fails above 400 KB per file, 1.5 MB total, or 1024 px textures.
4. Stills for the WebGL fallback: `render_still()` in `clay_lib.py`, then
   `sh blender/flatten.sh blender/raw/still_<key>.png public/stills/<key>.webp` (on #121212).

## How to use the GLBs in R3F
- **Lighting is baked into the texture.** Use `MeshBasicMaterial` with the model's `map`
  (or keep the standard material and add only one gentle light; do not add strong lights or an environment,
  or it will look doubled). The bake is calibrated so an open top face shows the clay colour itself.
- Units: metres, glTF Y-up. Pivots are set for the motion each part needs (listed per model).
- Every moving part was baked on its own, so it carries no shadow from its neighbours and can move freely.
- Meshopt compression: load with drei `useGLTF(url, true, true)` or set `MeshoptDecoder` on the GLTFLoader.

## Models

### loop.glb — hero / statement / contact (ticket #4)
- Nodes: `Loop` (stone tube), `Bead_0`, `Bead_1`, `Bead_2` (mint data beads, each with extra `path_t`).
- The loop lies flat (in the XZ plane), centred on the origin, about 3.7 × 1.6 m. Tilt the group toward the camera at runtime.
- Path for the beads, in glTF axes, with t in [0, 2π): `s = sin t, d = 1 + s²`,
  `x = 1.6·cos t / d`, `y = 0.30·s`, `z = −1.6·s·cos t / d`. Each bead's start is its `path_t`.
- Still: `public/stills/loop.webp`.

### stack.glb — home process section (ticket #4, #13)
- Nodes: `Slab_1` … `Slab_6`, bottom to top (charcoal, warm grey, stone, sand, cream, **mint** = the finished site).
- Rest pose = stacked, bottom slab resting on y = 0. Each slab 2.4 × 1.6 × 0.24 m, 0.035 m apart, slightly hand-turned.
- Pivots are at each slab's centre: drop them in along Y.
- Still: `public/stills/stack.webp`.

### gears.glb — AI agents and automation (tickets #4, #10, #16)
- Nodes: `Gear_0` … `Gear_5` (stone / cream, warm-grey hubs), `Message` (cream bubble, three dots), `Reply` (**mint** bubble, two text lines).
- Gears lie flat in a ring (centre-to-centre 1.03 m, ring centred on the origin); each pivot is its own axle (glTF Y).
  They mesh: turn even gears by +a and odd gears by −a, same speed (12 teeth each).
- Bubbles stand upright facing the camera (−Z in glTF). Rest positions: `Message` at x = −2.55, `Reply` at x = +2.55.
  Story: Message slides into the ring, gears turn, Reply comes out the other side.
- Texture 768 px (saves budget). Still: `public/stills/gears.webp`.

### site.glb — Website design (tickets #10, #15)
- Nodes: `Base` (charcoal board 2.6 × 1.8), `Bar` (browser bar with three dots), `Title`, `Subtitle`, `Button` (**mint**), `Picture`, `Card_1` … `Card_3`.
- Lies flat; page top points to −Z in glTF. Parts sit on the Base (top of base at y = 0.14). Pivots at each part's centre.
- Story: Base first, then Bar, Title, Subtitle, Picture, Cards drop in; the mint Button lands last.
- Still: `public/stills/site.webp`.

### plug.glb — Claude integration (tickets #10, #17)
- Nodes: `Block_A` (stone "document" tool, raised text lines), `Block_B` (sand "sheet" tool, raised grid), `Plug` (cream two-sided connector with prongs and a grip),
  `Block_A_Lit`, `Block_B_Lit` (the same blocks in **mint**, at the same place).
- Rest pose = connected: blocks 1 m cubes centred at x = ±0.81, sitting on y = 0; the Plug sits in the 0.62 m gap at y = 0.5.
  Start with the Plug lifted above the gap and the Lit blocks hidden; drop the Plug in (Y axis), then fade/swap the Lit blocks in.
- Texture 768 px. Stills: `public/stills/plug.webp` (before) and `public/stills/plug-lit.webp` (lit).
- No Anthropic logo or marks anywhere on the model.

### table.glb — AI teaching (tickets #10, #18)
- Nodes: `Table` (warm grey, 2.7 × 1.1, top at y = 0.56), `Board` (cream board on a stand with three text lines and one **mint** highlighted line, pivot at its foot),
  `Figure_1` … `Figure_8` (simple faceless pegs, no limbs or faces; pivot at the feet on y = 0).
- Figures 1–4 stand along one long side, 5–8 along the other. Story: the table and board first, then figures rise in one by one.
- Texture 768 px. Still: `public/stills/table.webp`.
