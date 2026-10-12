import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkModels } from "../scripts/model-budget-core.mjs";

const KB = 1024;

function withDir(fn: (dir: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), "model-budget-"));
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function fakeFile(dir: string, name: string, kb: number) {
  const full = join(dir, name);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, Buffer.alloc(kb * KB));
}

// Minimal PNG: signature plus an IHDR chunk. Only the header bytes are real.
function pngHeader(width: number, height: number): Buffer {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "ascii");
  b.writeUInt32BE(width, 16);
  b.writeUInt32BE(height, 20);
  b.set([8, 2, 0, 0, 0], 24);
  return b;
}

// Minimal JPEG: SOI then an SOF0 segment carrying the frame size.
function jpegHeader(width: number, height: number): Buffer {
  const b = Buffer.alloc(20);
  b.set([0xff, 0xd8, 0xff, 0xc0], 0);
  b.writeUInt16BE(17, 4);
  b[6] = 8;
  b.writeUInt16BE(height, 7);
  b.writeUInt16BE(width, 9);
  return b;
}

// Minimal lossless-free WebP with a VP8X canvas (24-bit width-1 and height-1).
function webpVp8xHeader(width: number, height: number): Buffer {
  const b = Buffer.alloc(30);
  b.write("RIFF", 0, "ascii");
  b.writeUInt32LE(22, 4);
  b.write("WEBP", 8, "ascii");
  b.write("VP8X", 12, "ascii");
  b.writeUInt32LE(10, 16);
  b.writeUIntLE(width - 1, 24, 3);
  b.writeUIntLE(height - 1, 27, 3);
  return b;
}

// Builds a GLB with one embedded image in its BIN chunk.
function glbWithImage(mimeType: string, image: Buffer): Buffer {
  const json = {
    asset: { version: "2.0" },
    buffers: [{ byteLength: image.length }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: image.length }],
    images: [{ mimeType, bufferView: 0 }],
  };
  let jsonBytes = Buffer.from(JSON.stringify(json), "utf8");
  jsonBytes = Buffer.concat([jsonBytes, Buffer.alloc((4 - (jsonBytes.length % 4)) % 4, 0x20)]);
  const binBytes = Buffer.concat([image, Buffer.alloc((4 - (image.length % 4)) % 4, 0)]);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  const jsonHead = Buffer.alloc(8);
  jsonHead.writeUInt32LE(jsonBytes.length, 0);
  jsonHead.writeUInt32LE(0x4e4f534a, 4);
  const binHead = Buffer.alloc(8);
  binHead.writeUInt32LE(binBytes.length, 0);
  binHead.writeUInt32LE(0x004e4942, 4);
  const all = Buffer.concat([header, jsonHead, jsonBytes, binHead, binBytes]);
  all.writeUInt32LE(all.length, 8);
  return all;
}

test("empty folder passes", () => {
  withDir((dir) => {
    const r = checkModels(dir);
    assert.equal(r.ok, true);
    assert.deepEqual(r.errors, []);
    assert.deepEqual(r.files, []);
  });
});

test("missing folder passes", () => {
  withDir((dir) => {
    const r = checkModels(join(dir, "does-not-exist"));
    assert.equal(r.ok, true);
    assert.equal(r.files.length, 0);
  });
});

test("one 500 KB file fails the per-file limit and names the file", () => {
  withDir((dir) => {
    fakeFile(dir, "big.glb", 500);
    const r = checkModels(dir);
    assert.equal(r.ok, false);
    assert.equal(r.errors.length, 1);
    assert.match(r.errors[0], /big\.glb is 500\.0 KB/);
  });
});

test("three 390 KB files pass (1170 KB total is under 1.5 MB)", () => {
  withDir((dir) => {
    fakeFile(dir, "a.glb", 390);
    fakeFile(dir, "b.glb", 390);
    fakeFile(dir, "c.glb", 390);
    const r = checkModels(dir);
    assert.equal(r.ok, true, r.errors.join("\n"));
    assert.equal(r.files.length, 3);
  });
});

test("four 390 KB files fail the 1.5 MB total", () => {
  withDir((dir) => {
    for (const n of ["a", "b", "c", "d"]) fakeFile(dir, `${n}.glb`, 390);
    const r = checkModels(dir);
    assert.equal(r.ok, false);
    assert.equal(r.errors.length, 1);
    assert.match(r.errors[0], /total limit/);
  });
});

test("subfolders are scanned and counted", () => {
  withDir((dir) => {
    for (const n of ["a", "b", "c"]) fakeFile(dir, `props/${n}.glb`, 390);
    fakeFile(dir, "props/deep/d.glb", 390);
    const r = checkModels(dir);
    assert.equal(r.ok, false);
    assert.deepEqual(r.files.map((f) => f.path).sort(), [
      "props/a.glb",
      "props/b.glb",
      "props/c.glb",
      "props/deep/d.glb",
    ]);
  });
});

test("a 2048x16 embedded PNG fails the texture check", () => {
  withDir((dir) => {
    writeFileSync(join(dir, "wide.glb"), glbWithImage("image/png", pngHeader(2048, 16)));
    const r = checkModels(dir);
    assert.equal(r.ok, false);
    assert.equal(r.errors.length, 1);
    assert.match(r.errors[0], /2048x16 px/);
  });
});

test("a 1024x1024 embedded PNG passes the texture check", () => {
  withDir((dir) => {
    writeFileSync(join(dir, "ok.glb"), glbWithImage("image/png", pngHeader(1024, 1024)));
    const r = checkModels(dir);
    assert.equal(r.ok, true, r.errors.join("\n"));
    assert.deepEqual(r.warnings, []);
  });
});

test("JPEG and WebP textures are measured too", () => {
  withDir((dir) => {
    writeFileSync(join(dir, "jpg-ok.glb"), glbWithImage("image/jpeg", jpegHeader(1024, 1024)));
    writeFileSync(join(dir, "webp-big.glb"), glbWithImage("image/webp", webpVp8xHeader(2000, 100)));
    const r = checkModels(dir);
    assert.equal(r.ok, false);
    assert.equal(r.errors.length, 1);
    assert.match(r.errors[0], /webp-big\.glb image #0: texture is 2000x100 px/);
  });
});

test("unknown image format warns but does not fail", () => {
  withDir((dir) => {
    writeFileSync(join(dir, "ktx.glb"), glbWithImage("image/ktx2", Buffer.alloc(64, 1)));
    const r = checkModels(dir);
    assert.equal(r.ok, true);
    assert.equal(r.warnings.length, 1);
    assert.match(r.warnings[0], /unknown image format/);
  });
});
