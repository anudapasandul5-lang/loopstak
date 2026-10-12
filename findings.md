# Clay detail findings — 2026-10-13

Eight approved shapes/story retained. Loop: grooves and bead bands. Stack: strata and a raised page. Gears: spoke holes and hub bolts. Site: card labels, sun/hill relief and button label. Plug: casing seams and grip grooves, including lit state. Teaching: notebooks and smoother faceless heads. Keys: panels, handle, hinges and cut-out bow. Frame: shared clay finish and existing screenshots.

## Evidence

- Eight public GLBs total 1379.9 KB (1536 KB allowed), each <=400 KB. Gears largest at 379.9 KB. Textures: gears/frame 512; plug/table 768; loop/stack/site/keys 1024.
- Budget/pivot scripts exit 0. All eight glTF validators report no errors/warnings. Meshopt is informationally unsupported by the validator, so all eight also decoded through MeshoptDecoder/NodeIO with finite positions and valid indices.
- Native geometry check passes seven detailed models: names, geometry/material validity, true gear holes, key parent/turn axis/contact and exact floor placement. Exported plug preview state checked. All 13 Python scripts parse.
- Ten 2000x1500/320-sample stills reopened; all eight models and two alternate states checked at 400px. Review sheets in blender/raw: clay-detail-gate-2026-10-13.png and clay-detail-review-2026-10-13.png. Main review uses closed door to show details; public keys.webp is the open final pose.

## Build lessons

Fresh GPU-only processes avoid the slow hybrid-device bake. Anuda approved CPU test, then GPU runs. Executed model scripts overwrote runner key; protected model_key fixes multi-model builds. Windows commands use explicit Git sh.exe and npm gltf-transform.cmd.

Original UV warning remains diagnostic. Added hard gate and unsuccessful mapping repairs were rolled back. Actual previews exposed thin plug seams and overlapping door-frame joins; targeted material/geometry fixes resolved those visible defects. Default plug preview hides lit copies.

Rotated bounding boxes put the loop floor 3.2cm too low: transformed vertices fix contact. Apply key shaft rotation into mesh to preserve local Blender Y / glTF Z turn axis. Seat enlarged key geometry at lock, leaving named handle unchanged. Axis/contact tests failed before their fixes and pass afterward.

Not checked: moving models in the real website, phone frame rate, or owner finish approval. No issue comments, deployment, purchases or messages.