#!/usr/bin/env node
// Checks that compression kept every named part's pivot: each named node in public/models/<key>.glb
// must have the same parent and the same translation/rotation/scale as in blender/raw/<key>.glb.
// Usage: node scripts/check-model-pivots.mjs   (needs the raw exports from the Blender session)
import { readdirSync, readFileSync, existsSync } from "node:fs";

const json = (p) => {
  const b = readFileSync(p);
  return JSON.parse(b.toString("utf8", 20, 20 + b.readUInt32LE(12)));
};
const named = (j) => {
  const parent = {};
  j.nodes.forEach((n, i) => (n.children ?? []).forEach((c) => (parent[c] = i)));
  const out = {};
  j.nodes.forEach((n, i) => {
    if (!n.name || n.name.endsWith("_mesh")) return;
    out[n.name] = {
      parent: parent[i] !== undefined ? j.nodes[parent[i]].name : null,
      t: n.translation ?? [0, 0, 0], r: n.rotation ?? [0, 0, 0, 1], s: n.scale ?? [1, 1, 1],
    };
  });
  return out;
};
const close = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 1e-4);

let bad = 0;
for (const f of readdirSync("public/models").filter((f) => f.endsWith(".glb"))) {
  const raw = `blender/raw/${f}`;
  if (!existsSync(raw)) { console.log(`${f}: no raw export, skipped`); continue; }
  const a = named(json(raw)), b = named(json(`public/models/${f}`));
  const problems = Object.keys(a).filter((k) => !b[k] || a[k].parent !== b[k].parent ||
    !close(a[k].t, b[k].t) || !close(a[k].r, b[k].r) || !close(a[k].s, b[k].s));
  bad += problems.length;
  console.log(`${f.padEnd(10)} ${Object.keys(a).length} parts ${problems.length ? "MOVED: " + problems.join(", ") : "ok"}`);
}
process.exit(bad ? 1 : 0);
