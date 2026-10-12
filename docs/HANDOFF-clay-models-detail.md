# Handoff: clay models, detail pass (for Codex)

Written 2026-10-13 by the Claude PC session. Branch: `clay-models`. Read this, then `blender/README.md`.

## Where things stand
- All 8 clay models are built, compressed and pushed in `public/models/` (974 KB of the 1.5 MB budget):
  loop, stack, gears, site, plug, table, keys, frame. Stills are in `public/stills/`.
- **Anuda gave the clay gate a GO (issue #4), with one condition:** "give them more detail and more clarity,
  they look unfinished, make them look baller". So the shapes and story stay; the finish must go up.
- The GO is **not yet recorded on issue #4** (public repo). Ask Anuda before posting.

## Work in progress (committed with this handoff, NOT yet tested)
1. `blender/clay_lib.py`
   - `clay_mat(key, pattern=None)` rewritten: tone wobble, lighter worn edges (Geometry › Pointiness),
     darker creases (local Ambient Occlusion node), fine grain + soft dimples as bump, optional patterns
     `"coil"` (spiral grooves; needs a `pattern` UV map) and `"strata"` (thin layer lines on object Z).
     All of it bakes into the texture, so it costs no geometry.
   - `reset_materials()` drops cached `clay_*` materials (call before rebuilding).
   - `tube()` also writes an unpacked `pattern` UV map; `export_model()` strips it before export and restores it.
   - Stills: `render_rig()` is now a product-shot rig (big soft key, cool fill, strong rim, soft top);
     `render_still()` adds an invisible shadow-catcher floor (contact shadow, nothing floats), defaults to
     2000×1500 at 320 samples.
   - `gpu_or_cpu()` / `force_cpu()`: GPU fails over to CPU and turns off the GPU denoiser.
     `bpy.app.driver_namespace["clay_force_cpu"] = True` forces CPU from the start.
2. `blender/m_loop.py`: coil-pattern stone tube with a slightly hand-rolled thickness; beads get a cream band
   and are turned so their local Z runs along the loop.
3. `blender/build.py` (new): headless build, no Blender window or MCP needed:
   ```
   "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup -P blender/build.py -- loop --test
   ```
   Options after the model keys: `--cpu`, `--test` (small fast stills), `--no-bake` (stills only).
   It holds every model's preview camera and still cameras (and the temporary poses for plug-lit, keys-open
   and the three-frame row).

## Blocker hit
- In the live Blender (MCP) session, Cycles failed with `Failed to retain CUDA context (Out of memory)`
  although the GPU (RTX 3050 6 GB) showed only 85 MB in use; the CPU retry then crashed Blender.
  Most likely a driver hiccup after many bakes in one long session.
- Anuda stopped the first headless `build.py` run before it started. **Ask him before launching Blender**,
  or ask him to restart Blender and click Connect in the BlenderMCP tab if you have the Blender MCP.
- If CUDA fails again, run with `--cpu` (slower: expect several minutes per 320-sample still).

## What to do next (in order)
1. Test the new material on the loop: `build.py -- loop --test`, then look at
   `blender/raw/still_loop_test.png` (flatten with `sh blender/flatten.sh in.png out.png`).
   Check: coil grooves visible but subtle, edges/creases read, contact shadow present, mint still #02c39a-like.
   Fix the node maths if the AO/Pointiness inputs error in Blender 5.2 (node socket names may differ).
2. Add detail per model (geometry where it's cheap, everything else via `clay_mat` patterns):
   - **stack**: `pattern="strata"` on slab sides; raise a simple page layout (bar, blocks, lines, in cream)
     on the top mint slab.
   - **gears**: round spoke holes in each gear, chamfered teeth, 3-4 small bolt dots on each hub;
     bubbles stay.
   - **site**: small raised details: lines on cards, a sun + hill relief on `Picture`, a text line on `Button`.
   - **plug**: grip grooves; a seam line round each block.
   - **table**: a small laptop or notebook slab in front of each figure; keep figures faceless and abstract.
   - **keys**: inset panels on the door, a handle, hinge knuckles, a cut-out pattern in the key bow.
   - **frame**: keep (it is mostly the screenshot).
3. For each model: `build.py -- <key>` (bake + export + preview + full stills), then
   `sh blender/compress.sh <key> [768|512]`, `node scripts/check-model-budget.mjs`,
   `node scripts/check-model-pivots.mjs`, flatten stills into `public/stills/*.webp`, look at them, commit and push.
   Texture sizes used: 1024 (loop, stack, site, keys), 768 (gears, plug, table), 512 (frame).
4. Update `blender/README.md` if node names or pivots change (cloud session builds on them).
5. Make a new review sheet for Anuda (same layout as `Projects/Loopstak/clay-test-stills-2026-10-13.png`
   in the vault) and log the session in the vault (`Sessions/log.md`, `Projects/Loopstak/STATUS.md`).

## Rules that must not break
- Budget: each GLB ≤ 400 KB, total ≤ 1.5 MB, textures ≤ 1024 px (the budget script enforces it).
- Pivots: animate the named empty, never `<name>_mesh`; `check-model-pivots.mjs` must pass.
- Mint #02c39a only on "this is yours" parts (beads, top slab, reply, button, lit blocks, key, floor tile, board line).
- Clay must look premium, not like a toy (the painted-signboard look was rejected as childish). Faceless,
  abstract figures. No Anthropic logo or marks on the plug.
- Never buy, deploy or send anything; never post on GitHub without Anuda's OK. Commit and push only on `clay-models`.
- Talk to Anuda in plain, short sentences; give him PowerShell, not bash, if he must run something.

## How to verify you're done
- Every still in `public/stills/` shows visible surface detail, clean edges, and a soft floor shadow.
- `node scripts/check-model-budget.mjs` and `node scripts/check-model-pivots.mjs` both exit 0.
- `gltf-transform validate` shows no errors on each GLB.
- Anuda says the new review sheet looks finished.
