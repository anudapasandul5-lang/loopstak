// File-size and texture budget for GLB models under public/models.
// Plain Node, no dependencies. Used by scripts/check-model-budget.mjs and tests.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export const MAX_FILE_BYTES = 400 * 1024;
export const MAX_TOTAL_BYTES = 1.5 * 1024 * 1024;
export const MAX_TEXTURE_PX = 1024;

const GLB_MAGIC = 0x46546c67; // "glTF"
const CHUNK_JSON = 0x4e4f534a; // "JSON"
const CHUNK_BIN = 0x004e4942; // "BIN\0"

function listGlbs(dir) {
  const out = [];
  const walk = (current) => {
    for (const name of readdirSync(current)) {
      const full = join(current, name);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else if (st.isFile() && name.toLowerCase().endsWith(".glb")) out.push(full);
    }
  };
  walk(dir);
  return out.sort();
}

// Returns { json, bin } or null when the buffer is not a GLB we can read.
function readGlb(buf) {
  if (buf.length < 20 || buf.readUInt32LE(0) !== GLB_MAGIC) return null;
  let json = null;
  let bin = null;
  let offset = 12;
  while (offset + 8 <= buf.length) {
    const length = buf.readUInt32LE(offset);
    const type = buf.readUInt32LE(offset + 4);
    const start = offset + 8;
    const end = start + length;
    if (end > buf.length) return null;
    if (type === CHUNK_JSON && json === null) {
      try {
        json = JSON.parse(buf.subarray(start, end).toString("utf8"));
      } catch {
        return null;
      }
    } else if (type === CHUNK_BIN && bin === null) {
      bin = buf.subarray(start, end);
    }
    offset = end;
  }
  return json ? { json, bin } : null;
}

// Width/height from raw image bytes, or null when the format is not recognised.
export function imageSize(bytes, mimeType) {
  if (mimeType === "image/png") {
    // 8-byte signature, then IHDR: width and height are big-endian at 16 and 20.
    if (bytes.length < 24 || bytes.readUInt32BE(0) !== 0x89504e47) return null;
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (mimeType === "image/jpeg") {
    if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
    let i = 2;
    while (i + 4 <= bytes.length) {
      if (bytes[i] !== 0xff) return null;
      const marker = bytes[i + 1];
      if (marker === 0xff) {
        i += 1; // fill byte
        continue;
      }
      // Standalone markers carry no length: TEM, RSTn.
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2;
        continue;
      }
      if (marker === 0xd9 || marker === 0xda) return null; // EOI or SOS before any frame header
      const segLength = bytes.readUInt16BE(i + 2);
      // SOF0..SOF15, excluding DHT (C4), JPG (C8) and DAC (CC).
      const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSof) {
        if (i + 9 > bytes.length) return null;
        return { height: bytes.readUInt16BE(i + 5), width: bytes.readUInt16BE(i + 7) };
      }
      i += 2 + segLength;
    }
    return null;
  }
  if (mimeType === "image/webp") {
    if (bytes.length < 30 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") return null;
    const fourcc = bytes.toString("ascii", 12, 16);
    if (fourcc === "VP8 ") {
      // Keyframe: 3-byte frame tag, 3-byte start code, then 14-bit width and height (LE).
      return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
    }
    if (fourcc === "VP8L") {
      if (bytes[20] !== 0x2f) return null;
      const bits = bytes.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    if (fourcc === "VP8X") {
      // Canvas width-1 and height-1 are 24-bit little-endian.
      return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
    }
    return null;
  }
  return null;
}

function checkTextures(relPath, glb, errors, warnings) {
  const { json, bin } = glb;
  const images = Array.isArray(json.images) ? json.images : [];
  const views = Array.isArray(json.bufferViews) ? json.bufferViews : [];
  images.forEach((image, index) => {
    const label = `${relPath} image #${index}`;
    if (image.bufferView === undefined) {
      warnings.push(`${label}: external or data URI image not inspected`);
      return;
    }
    const view = views[image.bufferView];
    if (!view || !bin) {
      warnings.push(`${label}: bufferView missing or no BIN chunk, not inspected`);
      return;
    }
    const start = view.byteOffset || 0;
    const bytes = bin.subarray(start, start + view.byteLength);
    const size = imageSize(bytes, image.mimeType);
    if (!size) {
      warnings.push(`${label}: unknown image format (${image.mimeType || "no mimeType"}), size not checked`);
      return;
    }
    if (size.width > MAX_TEXTURE_PX || size.height > MAX_TEXTURE_PX) {
      errors.push(`${label}: texture is ${size.width}x${size.height} px; limit is ${MAX_TEXTURE_PX} px per side`);
    }
  });
}

/**
 * Checks every .glb under `dir` (recursively).
 * @param {string} dir Folder to scan, normally public/models.
 * @returns {{ ok: boolean, errors: string[], warnings: string[], files: { path: string, bytes: number }[] }}
 */
export function checkModels(dir) {
  const errors = [];
  const warnings = [];
  const files = [];
  if (!existsSync(dir)) return { ok: true, errors, warnings, files };

  let total = 0;
  for (const full of listGlbs(dir)) {
    const buf = readFileSync(full);
    const rel = relative(dir, full).split(sep).join("/");
    files.push({ path: rel, bytes: buf.length });
    total += buf.length;

    if (buf.length > MAX_FILE_BYTES) {
      errors.push(`${rel} is ${(buf.length / 1024).toFixed(1)} KB; per-file limit is ${MAX_FILE_BYTES / 1024} KB`);
    }

    const glb = readGlb(buf);
    if (!glb) {
      warnings.push(`${rel}: not a readable GLB (missing header or JSON chunk), texture check skipped`);
    } else {
      checkTextures(rel, glb, errors, warnings);
    }
  }

  if (total > MAX_TOTAL_BYTES) {
    errors.push(
      `models total ${(total / 1024).toFixed(1)} KB across ${files.length} file(s); total limit is ${MAX_TOTAL_BYTES / 1024} KB`,
    );
  }

  return { ok: errors.length === 0, errors, warnings, files };
}
