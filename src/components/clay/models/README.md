# Clay models

Every file here is a code-made placeholder for a future Blender export. Each will be replaced by
`public/models/<name>.glb`, loaded with drei `useGLTF`, keeping the same export name and props
`{ progress: number; reduced: boolean }`, so swapping a model is a change to one file.

| File (now) | Future GLB |
| --- | --- |
| `Loop.tsx` | `public/models/loop.glb` |
| `Stack.tsx` | `public/models/stack.glb` |
| (planned) `KeyDoor.tsx` | `public/models/key-door.glb` |
| (planned) `Frames.tsx` | `public/models/frames.glb` |
| (planned) `SvcSite.tsx` | `public/models/svc-site.glb` |
| (planned) `SvcGears.tsx` | `public/models/svc-gears.glb` |
| (planned) `SvcPlug.tsx` | `public/models/svc-plug.glb` |
| (planned) `SvcTable.tsx` | `public/models/svc-table.glb` |

Rules: use `clayMaterial` (matte, roughness 0.9) and the palette in `../clayMaterial.ts`; mint only
on parts that are "yours". The scene (not the model) reads the scroll store and moves the group.

## Fallback stills

`public/stills/loop.png` is a screenshot of this placeholder scene, shown when WebGL is
unavailable. Blender-rendered stills will replace it (same filename).
