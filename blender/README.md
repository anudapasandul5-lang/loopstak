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
