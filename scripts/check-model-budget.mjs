#!/usr/bin/env node
// Fails (exit 1) when the clay models break the size budget from the PRD:
// each GLB <= 400 KB, all GLBs together <= 1.5 MB, every texture <= 1024 px.
// Usage: node scripts/check-model-budget.mjs [models-dir]
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIR = process.argv[2] ?? "public/models";
const MAX_FILE = 400 * 1024;
const MAX_TOTAL = 1.5 * 1024 * 1024;
const MAX_TEX = 1024;

function glbJson(buf) {
  if (buf.toString("ascii", 0, 4) !== "glTF") throw new Error("not a GLB");
  const len = buf.readUInt32LE(12);
  const json = JSON.parse(buf.toString("utf8", 20, 20 + len));
  const binStart = 20 + len + 8; // skip BIN chunk header
  return { json, bin: buf.subarray(binStart) };
}

// Width and height of a PNG, JPEG or WebP image held in a byte buffer.
function imageSize(b) {
  if (b[0] === 0x89 && b.toString("ascii", 1, 4) === "PNG") return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const kind = b.toString("ascii", 12, 16);
    if (kind === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (kind === "VP8L") {
      const bits = b.readUInt32LE(21);
      return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
    }
    if (kind === "VP8X") return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      const marker = b[i + 1];
      const size = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xc3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + size;
    }
  }
  return null;
}

const files = readdirSync(DIR).filter((f) => f.endsWith(".glb")).sort();
let total = 0;
const problems = [];

for (const f of files) {
  const path = join(DIR, f);
  const size = statSync(path).size;
  total += size;
  if (size > MAX_FILE) problems.push(`${f}: ${(size / 1024).toFixed(0)} KB is over 400 KB`);
  const { json, bin } = glbJson(readFileSync(path));
  const sizes = [];
  for (const img of json.images ?? []) {
    if (img.bufferView === undefined) continue;
    const bv = json.bufferViews[img.bufferView];
    const wh = imageSize(bin.subarray(bv.byteOffset ?? 0, (bv.byteOffset ?? 0) + bv.byteLength));
    if (!wh) continue;
    sizes.push(`${wh[0]}x${wh[1]}`);
    if (Math.max(...wh) > MAX_TEX) problems.push(`${f}: texture ${wh[0]}x${wh[1]} is over ${MAX_TEX} px`);
  }
  console.log(`${f.padEnd(22)} ${(size / 1024).toFixed(1).padStart(7)} KB  textures ${sizes.join(", ") || "none"}`);
}

console.log(`${"total".padEnd(22)} ${(total / 1024).toFixed(1).padStart(7)} KB  (budget ${MAX_TOTAL / 1024} KB)`);
if (total > MAX_TOTAL) problems.push(`total ${(total / 1024).toFixed(0)} KB is over 1.5 MB`);

if (problems.length) {
  console.error("\nModel budget FAILED:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("Model budget OK");
