# Clay models

Every file here is a code-made placeholder for a future Blender export. Each will be replaced by
`public/models/<name>.glb`, loaded with drei `useGLTF`, keeping the same export name and props
`{ progress: number; reduced: boolean }`, so swapping a model is a change to one file.

| File (now) | Future GLB |
| --- | --- |
| `Loop.tsx` | `public/models/loop.glb` |
| (planned) `Stack.tsx` | `public/models/stack.glb` |
| (planned) `KeyDoor.tsx` | `public/models/key-door.glb` |
| (planned) `Frames.tsx` | `public/models/frames.glb` |
| `SvcSite.tsx` | `public/models/svc-site.glb` |
| `SvcGears.tsx` | `public/models/svc-gears.glb` |
| `SvcPlug.tsx` | `public/models/svc-plug.glb` |
| `SvcTable.tsx` | `public/models/svc-table.glb` |

`shapes.ts` holds the soft-edged helpers the Service placeholders share (rounded box via three's
`RoundedBoxGeometry`, lathe disc, bevelled gear); not part of any GLB.

Rules: use `clayMaterial` (matte, roughness 0.9) and the palette in `../clayMaterial.ts`; mint only
on parts that are "yours". The scene (not the model) reads the scroll store and moves the group.

## Fallback stills

`public/stills/loop.png` is a screenshot of this placeholder scene, shown when WebGL is
unavailable. Blender-rendered stills will replace it (same filename).

`public/stills/svc-site.png`, `svc-gears.png`, `svc-plug.png` and `svc-table.png` are screenshots of the
Service placeholders (one per object, on the plinth), captured from the running build. Same rule: replace
with Blender renders under the same filenames.
