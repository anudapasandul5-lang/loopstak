# Clay models

Each file loads one Blender GLB from `public/models/` with drei `useGLTF` (the meshopt decoder is on by default in
drei's `useGLTF`) through `../glb.ts`, and drives the GLB's named handle nodes from `progress` (0..1).
Props: `{ progress, reduced, progressRef? }`. With a `progressRef` the model re-poses every frame without re-rendering.

The GLBs carry baked lighting, so `useClayGlb` swaps their material for an unlit `MeshBasicMaterial` with the
baked texture (no tone mapping). Do not add `clayMaterial` or strong lights to them.
`node scripts/list-glb-nodes.mjs` prints each GLB's node tree; `node scripts/check-model-pivots.mjs` checks the pivots.

| Component | GLB | Nodes animated | What moves |
| --- | --- | --- | --- |
| `Loop` | `loop.glb` | `Bead_0..2` | beads ride the infinity path (drift + progress) |
| `Stack` | `stack.glb` | `Slab_1..6` | slabs drop in one by one, tiny squash on landing |
| `KeyDoor` | `keys.glb` | `Key`, `Door` | key slides in and turns 90 degrees, door swings open (key rides along) |
| `SvcSite` | `site.glb` | `Base`, `Bar`, `Title`, `Subtitle`, `Picture`, `Card_1..3`, `Button` | parts drop in; mint button last |
| `SvcGears` | `gears.glb` | `Gear_0..5`, `Message`, `Reply` | gears turn (neighbours opposite); Message slides in and shrinks away, Reply grows out and slides right |
| `SvcPlug` | `plug.glb` | `Plug`, `Block_A/B`, `Block_A_Lit/B_Lit` | plug travels over and drops in; blocks swap to the mint copies |
| `SvcTable` | `table.glb` | `Board`, `Figure_1..8` | board pops up, figures rise seat by seat |

Not used yet: `frame.glb` (the Work cards use a CSS clay frame).

## Fallback stills

`public/stills/*.webp` are the Blender renders. ClayStage shows one when WebGL is missing or when the canvas
throws, which includes a GLB that fails to load (the error reaches ClayStage's boundary).
