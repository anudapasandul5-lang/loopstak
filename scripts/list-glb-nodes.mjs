#!/usr/bin/env node
// Prints each GLB's node tree: names, children, mesh/material names, textures. Usage: node scripts/list-glb-nodes.mjs [file...]
import { readdirSync, readFileSync } from "node:fs";
const json = (p) => { const b = readFileSync(p); return JSON.parse(b.toString("utf8", 20, 20 + b.readUInt32LE(12))); };
const files = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync("public/models").filter((f) => f.endsWith(".glb")).map((f) => `public/models/${f}`);
for (const f of files) {
  const j = json(f);
  console.log(`\n== ${f}  (extensions: ${(j.extensionsUsed ?? []).join(", ")})  textures: ${(j.images ?? []).length}`);
  const isChild = new Set(j.nodes.flatMap((n) => n.children ?? []));
  const walk = (i, d) => {
    const n = j.nodes[i];
    const m = n.mesh !== undefined ? j.meshes[n.mesh] : null;
    const mats = m ? m.primitives.map((p) => { const mt = j.materials?.[p.material]; return mt ? `${mt.name}${mt.pbrMetallicRoughness?.baseColorTexture ? "[tex]" : ""}` : "-"; }).join("|") : "";
    const t = n.translation ? ` t=${n.translation.map((v) => +v.toFixed(2))}` : "";
    const extras = n.extras ? ` extras=${JSON.stringify(n.extras)}` : "";
    console.log(`${"  ".repeat(d)}${n.name}${m ? ` <mesh ${m.name} mat:${mats}>` : ""}${t}${extras}`);
    (n.children ?? []).forEach((c) => walk(c, d + 1));
  };
  j.nodes.forEach((_, i) => { if (!isChild.has(i)) walk(i, 0); });
}
