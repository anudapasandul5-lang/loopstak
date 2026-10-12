# Clay model detail pass — 2026-10-13

## Scope and acceptance
Keep the eight approved shapes, story, palette and animation handles. Improve surface finish, small explanatory details and grounding shadows. Each GLB <=400 KB, total <=1.5 MB, textures <=1024 px; budget, pivot and glTF validation must pass. Inspect full stills and a review sheet; final visual approval belongs to Anuda.

## Tickets
1. Complete: CPU loop material tests; full GPU bake/export/still inspected, finish tuned twice.
2. Complete: stack layout/strata, gear holes/bolts, site relief, plug grooves/seams, teaching notebooks, door panels/hardware/key cutout. Geometry contracts tested. Frame geometry retained.
3. Complete: all eight GLBs and ten 2000x1500/320-sample stills rebuilt, compressed and inspected at full size and 400px. Total 1379.9 KB / 1536 KB; largest 379.9 KB. Budget, pivots, all glTF validators, decoded geometry, syntax and native geometry tests pass.
4. Review outputs complete: review sheets and README ready; staged code diff reviewed. Owner finish approval remains pending. Git/session-close state is recorded in the vault's Loopstak STATUS; push only clay-models.

## Stress test
- Most uncertain assumption: fine material patterns survive the compressed baked atlas. Compare rendered source and exported preview.
- Worst failure: replacing working assets with broken geometry or pivots. Retain existing public files until replacement checks pass.
- Outside scope: live website animations, deployment, issue comments and purchases.
- CPU launch approved by Anuda. GPU remains unused.
- Scenarios: test first; capture errors; do not repeat a failing method three times.
- Build: Python syntax checked; actual Blender node/export compatibility needs render. Web build/routing/hooks/API/database: N/A, no app changes.
- UI: inspect original-size and ~400px stills, palette and shadows. Accessibility: runtime fallback integration outside this task.
- Security/communications: no secrets, purchases, messages, deployments or issue posts.
- Performance: enforce file and texture budgets; preserve animation handles.
- Observability: per-build logs in ignored blender/raw; check exit result and outputs.
- Ship readiness: source still, baked preview, compressed glTF validation, pivots and budget before replacement.
- Docs/integration: README and vault state must match final evidence; owner review remains required.

## Errors
Prior session CUDA error/crash is why first test used CPU. CPU/hybrid bake too slow; fresh GPU-only builds work. Runner key/ROOT global collisions fixed. Three gear UV repair attempts stopped, then plug/table/keys exposed the unsolicited hard UV gate as premature. All mapping experiments and the gate reverted; original warning check retained, exported textures inspected directly. Pending gear-rebuild question withdrawn in commentary; no new mesh construction is needed for this step.

Final QA fixes: body-colour casing seams survive the plug atlas; frame unions remove internal corner artefacts; actual vertices place the floor; applying shaft rotation preserves the key's documented turn axis; seating the enlarged shaft closes its visible gap without changing the handle. Key-axis and contact regressions were reproduced before fixes and pass after them.
