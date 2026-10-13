/*
  The block world. One instanced mesh of small cubes, drawn in a single call. A data texture holds
  where every block sits in each shape on the page (one row per section). The vertex shader flies
  each block from the current shape to the next as the page scrolls: bottom blocks first, with a lift
  and a tumble in the middle of the trip. Normal page scroll drives it (ADR 0001); nothing here
  touches scrolling itself.
*/

import * as THREE from "three";
import { SHAPES, buildShape, parseForm, type Pose, type Shape } from "./forms";

export type WorldOptions = { phone: boolean; low: boolean; reduced: boolean };

type Row = { shape: Shape; pose: Pose; side: "left" | "right" | "center"; dim: number };

const TEX_W = 128;
const BG = [12 / 255, 13 / 255, 13 / 255];
const STONE = [0.9, 0.88, 0.84];
const MINT = [2 / 255, 195 / 255, 154 / 255];

const vert = /* glsl */ `
uniform sampler2D uData;
uniform float uTexW;
uniform float uRows;
uniform float uFormA;
uniform float uFormB;
uniform float uMix;
uniform float uTime;
uniform float uSpread;
uniform vec4 uSpinA;
uniform vec4 uSpinB;
uniform vec2 uYB;

attribute float aIdx;
attribute float aSeed;

varying vec3 vN;
varying vec3 vView;
varying vec2 vUv;
varying float vMint;
varying float vTone;
varying float vDust;

vec4 fetchForm(float f) {
  float row = floor(aIdx / uTexW) + f * uRows;
  return texelFetch(uData, ivec2(int(mod(aIdx, uTexW)), int(row)), 0);
}

mat3 rotAxis(vec3 a, float ang) {
  float s = sin(ang), c = cos(ang), oc = 1.0 - c;
  return mat3(
    oc * a.x * a.x + c, oc * a.x * a.y + a.z * s, oc * a.z * a.x - a.y * s,
    oc * a.x * a.y - a.z * s, oc * a.y * a.y + c, oc * a.y * a.z + a.x * s,
    oc * a.z * a.x + a.y * s, oc * a.y * a.z - a.x * s, oc * a.z * a.z + c);
}

void decode(float w, out float size, out float mint, out float spin) {
  spin = step(7.5, w);
  w -= spin * 8.0;
  mint = step(3.5, w);
  size = w - mint * 4.0;
}

void main() {
  vec4 A = fetchForm(uFormA);
  vec4 B = fetchForm(uFormB);
  float sa, ma, xa, sb, mb, xb;
  decode(A.w, sa, ma, xa);
  decode(B.w, sb, mb, xb);

  mat3 RA = rotAxis(uSpinA.xyz, uTime * uSpinA.w * xa);
  mat3 RB = rotAxis(uSpinB.xyz, uTime * uSpinB.w * xb);
  vec3 pa = RA * A.xyz;
  vec3 pb = RB * B.xyz;

  // build the next shape bottom-up, with a little noise so it never looks mechanical
  float hb = clamp((B.y - uYB.x) / max(uYB.y - uYB.x, 0.001), 0.0, 1.0);
  float delay = (hb * 0.7 + aSeed * 0.3) * uSpread;
  float t = clamp((uMix - delay) / (1.0 - uSpread), 0.0, 1.0);
  float e = t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  float arc = sin(e * 3.14159265);

  vec3 dir = normalize(vec3(fract(aSeed * 17.31) - 0.5, 0.45 + fract(aSeed * 7.13) * 0.5, fract(aSeed * 29.7) - 0.5));
  vec3 p = mix(pa, pb, e) + dir * arc * (0.5 + aSeed * 1.3);

  float size = mix(sa, sb, e);
  float dust = 1.0 - smoothstep(0.06, 0.09, size);
  p.y += sin(uTime * 0.5 + aSeed * 40.0) * 0.14 * dust;

  vec3 axis = normalize(vec3(fract(aSeed * 13.7) - 0.5, fract(aSeed * 31.1) - 0.5, fract(aSeed * 5.9) - 0.5) + 0.001);
  mat3 tumble = rotAxis(axis, arc * 3.14159265 * (aSeed * 2.0 - 1.0) + dust * uTime * (0.15 + aSeed * 0.4));
  mat3 orient = tumble * (e < 0.5 ? RA : RB);

  vec4 mv = modelViewMatrix * vec4(p + orient * (position * size), 1.0);
  gl_Position = projectionMatrix * mv;

  vN = normalize(normalMatrix * (orient * normal));
  vView = mv.xyz;
  vUv = uv;
  vMint = mix(ma, mb, e);
  vTone = 0.88 + fract(aSeed * 91.7) * 0.12;
  vDust = dust;
}
`;

const frag = /* glsl */ `
uniform vec3 uBg;
uniform vec3 uStone;
uniform vec3 uMintC;
uniform float uFog;
uniform float uDim;

varying vec3 vN;
varying vec3 vView;
varying vec2 vUv;
varying float vMint;
varying float vTone;
varying float vDust;

void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(-vView);
  vec3 L = normalize(vec3(-0.45, 0.8, 0.5));
  vec3 L2 = normalize(vec3(0.75, -0.15, 0.4));
  float key = max(dot(N, L), 0.0);
  float fill = max(dot(N, L2), 0.0);
  float hemi = 0.5 + 0.5 * N.y;

  // soft chamfer: darken towards each face's edges so cubes read as rounded tiles, not polygons
  vec2 q = min(vUv, 1.0 - vUv);
  float edge = smoothstep(0.0, 0.16, min(q.x, q.y));

  vec3 base = mix(uStone * vTone, uMintC, vMint);
  vec3 col = base * (0.14 + 0.82 * key + 0.16 * fill + 0.2 * hemi);
  vec3 H = normalize(L + V);
  col += pow(max(dot(N, H), 0.0), 40.0) * 0.16 * (1.0 - vDust);
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  col += rim * 0.1 * mix(vec3(0.7, 0.76, 0.8), uMintC, vMint);
  col *= mix(0.66, 1.0, edge);
  col += uMintC * vMint * 0.08;

  float d = length(vView);
  float fog = 1.0 - exp(-pow(d * uFog, 2.0));
  col = mix(col, uBg, clamp(fog + uDim + vDust * 0.35, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
}
`;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function startWorld(canvas: HTMLCanvasElement, opts: WorldOptions) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !opts.phone && !opts.low, powerPreference: "high-performance" });
  const dprCap = opts.low ? 1 : opts.phone ? 1.5 : 1.75;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.setClearColor(new THREE.Color().setRGB(BG[0], BG[1], BG[2], THREE.SRGBColorSpace));

  const count = opts.low ? 1600 : opts.phone ? 2600 : 7000;
  const unit0 = opts.low ? 0.2 : opts.phone ? 0.16 : 0.1;
  const rowsPer = Math.ceil(count / TEX_W);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(opts.phone ? 40 : 30, 1, 0.1, 200);
  camera.position.set(0, 0, 14);

  // per-block data: an index into the texture and a random seed
  const box = new THREE.BoxGeometry(1, 1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = box.index;
  geo.setAttribute("position", box.getAttribute("position"));
  geo.setAttribute("normal", box.getAttribute("normal"));
  geo.setAttribute("uv", box.getAttribute("uv"));
  const idx = new Float32Array(count);
  const seed = new Float32Array(count);
  const rand = mulberry(3);
  for (let i = 0; i < count; i++) {
    idx[i] = i;
    seed[i] = rand();
  }
  geo.setAttribute("aIdx", new THREE.InstancedBufferAttribute(idx, 1));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seed, 1));
  geo.instanceCount = count;

  // stable resting places for spare blocks: a wide, flattened cloud of dust
  const dust = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(rand() * 2 - 1);
    const r = 1.5 + rand() * 1.6;
    const shown = rand() < 0.16;
    dust[i * 4] = Math.sin(ph) * Math.cos(th) * r;
    dust[i * 4 + 1] = Math.cos(ph) * r * 0.55;
    dust[i * 4 + 2] = Math.sin(ph) * Math.sin(th) * r;
    dust[i * 4 + 3] = shown ? 0.022 + rand() * 0.03 : 0;
  }

  const uniforms = {
    uData: { value: null as THREE.DataTexture | null },
    uTexW: { value: TEX_W },
    uRows: { value: rowsPer },
    uFormA: { value: 0 },
    uFormB: { value: 0 },
    uMix: { value: 0 },
    uTime: { value: 0 },
    uSpread: { value: opts.reduced ? 0 : 0.5 },
    uSpinA: { value: new THREE.Vector4(0, 1, 0, 0) },
    uSpinB: { value: new THREE.Vector4(0, 1, 0, 0) },
    uYB: { value: new THREE.Vector2(-1, 1) },
    uBg: { value: new THREE.Vector3(...BG) },
    uStone: { value: new THREE.Vector3(...STONE) },
    uMintC: { value: new THREE.Vector3(...MINT) },
    uFog: { value: 0.05 },
    uDim: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  const group = new THREE.Group();
  group.add(mesh);
  scene.add(group);

  // grounding: a soft pool of light under each shape, so nothing floats on black
  const floorMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uAlpha: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uAlpha;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        float pool = pow(smoothstep(1.0, 0.0, r), 2.2);
        gl_FragColor = vec4(0.93, 0.92, 0.88, pool * 0.09 * uAlpha);
      }`,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.renderOrder = -1;
  scene.add(floor);

  /* ---------- rows: one per section, plus row 0 for what was on screen before ---------- */

  let rows: Row[] = [];
  let sections: HTMLElement[] = [];
  let tex: THREE.DataTexture | null = null;
  const dustShape: Shape = { data: new Float32Array(0), count: 0, radius: 3.4, minY: -2, maxY: 2 };
  const dustRow: Row = { shape: dustShape, pose: { rot: [0.2, 0, 0], fit: 1.1 }, side: "center", dim: 0 };

  function bake() {
    const data = new Float32Array(TEX_W * rowsPer * rows.length * 4);
    rows.forEach((row, f) => {
      const base = f * rowsPer * TEX_W * 4;
      const s = row.shape;
      for (let i = 0; i < count; i++) {
        const o = base + i * 4;
        if (i < s.count) {
          data.set(s.data.subarray(i * 4, i * 4 + 4), o);
        } else {
          const k = s.radius * 1.05;
          data[o] = dust[i * 4] * k;
          data[o + 1] = dust[i * 4 + 1] * k;
          data[o + 2] = dust[i * 4 + 2] * k;
          data[o + 3] = dust[i * 4 + 3];
        }
      }
    });
    tex?.dispose();
    tex = new THREE.DataTexture(data, TEX_W, rowsPer * rows.length, THREE.RGBAFormat, THREE.FloatType);
    tex.minFilter = tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    uniforms.uData.value = tex;
  }

  let sDisp = 0;
  let started = performance.now();

  function setSections(els: HTMLElement[]) {
    // keep whatever is on screen as row 0, so a new page grows out of the last one
    const shown = rows.length ? rows[Math.min(rows.length - 1, Math.round(sDisp))] : dustRow;
    sections = els;
    rows = [
      shown,
      ...els.map((el) => {
        const spec = el.dataset.form || "loop";
        const [name] = parseForm(spec);
        const side = (el.dataset.side as Row["side"]) || "center";
        return { shape: buildShape(spec, count, unit0), pose: SHAPES[name].pose, side, dim: Number(el.dataset.dim) || 0 };
      }),
    ];
    bake();
    sDisp = 0;
    started = performance.now();
  }

  /* ---------- size, pointer, visibility ---------- */

  let W = 0, H = 0;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    // phones resize as the address bar moves; ignore small height changes
    if (w === W && Math.abs(h - H) < 120) return;
    W = w;
    H = h;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
  }
  resize();
  window.addEventListener("resize", resize);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const fine = matchMedia("(pointer: fine)").matches && !opts.reduced;
  const onPointer = (e: PointerEvent) => {
    pointer.tx = (e.clientX / innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / innerHeight - 0.5) * 2;
  };
  if (fine) window.addEventListener("pointermove", onPointer, { passive: true });

  let raf = 0;
  let last = performance.now();
  let time = 0;
  const cur = { rx: 0, ry: 0, rz: 0, dist: 14, sx: 0, sy: 0, dim: 0 };
  let first = true;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    // rAF time can be a little earlier than performance.now() on the first frame; never step backwards
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!opts.reduced) time += dt;
    resize();
    if (!rows.length) return;

    // where the page is: s = 1 on the first section, rising by one at each section boundary
    const vh = innerHeight;
    const cy = vh * 0.5, w = vh * 0.36;
    let sTarget = 1;
    const lp: number[] = [0];
    sections.forEach((el, k) => {
      const r = el.getBoundingClientRect();
      if (k > 0) sTarget += clamp01((cy + w - r.top) / (2 * w));
      lp.push(clamp01((cy - r.top) / Math.max(r.height, 1)) - 0.5);
    });
    sTarget = Math.min(sTarget, rows.length - 1);

    if (opts.reduced) {
      sDisp = Math.round(sTarget);
    } else {
      // slow and soft for the opening assembly, then quick to follow the scroll
      const intro = (now - started) / 1000 < 2.6;
      const k = intro ? 1.5 : 4.2;
      sDisp += (sTarget - sDisp) * (1 - Math.exp(-dt * k));
      if (Math.abs(sTarget - sDisp) < 1e-4) sDisp = sTarget;
    }

    const a = Math.min(Math.floor(sDisp), rows.length - 1);
    const b = Math.min(a + 1, rows.length - 1);
    const m = sDisp - a;
    const e = ease(m);
    const A = rows[a], B = rows[b];

    uniforms.uFormA.value = a;
    uniforms.uFormB.value = b;
    uniforms.uMix.value = m;
    uniforms.uTime.value = time;
    const sa = A.pose.spin ?? [0, 1, 0, 0], sb = B.pose.spin ?? [0, 1, 0, 0];
    uniforms.uSpinA.value.set(sa[0], sa[1], sa[2], sa[3]);
    uniforms.uSpinB.value.set(sb[0], sb[1], sb[2], sb[3]);
    uniforms.uYB.value.set(B.shape.minY, B.shape.maxY);

    // pose: rotation (plus a scroll-linked turn), distance to fit, and which side of the copy
    const tA = A.pose.turn ?? [0, 0, 0], tB = B.pose.turn ?? [0, 0, 0];
    const lA = lp[a] ?? 0, lB = lp[b] ?? 0;
    const rx = lerp(A.pose.rot[0] + tA[0] * lA, B.pose.rot[0] + tB[0] * lB, e);
    const ry = lerp(A.pose.rot[1] + tA[1] * lA, B.pose.rot[1] + tB[1] * lB, e);
    const rz = lerp(A.pose.rot[2] + tA[2] * lA, B.pose.rot[2] + tB[2] * lB, e);

    const fov = (camera.fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(fov / 2) * camera.aspect);
    // camera distance so the shape fits the space it has: beside the copy on desktop (about 40% of
    // the half-width, whatever the screen's shape), the full width on phones
    const tv = Math.tan(fov / 2), th = Math.tan(hfov / 2);
    const fitTo = (row: Row) => {
      const room = opts.phone ? Math.min(Math.tan(fov * 0.42), th) / 1.08 : Math.min(tv * 0.84, th * (row.side === "center" ? 0.8 : 0.4));
      return (row.shape.radius / room) * row.pose.fit;
    };
    const dist = lerp(fitTo(A), fitTo(B), e);
    const sideX = (r: Row) => (opts.phone ? 0 : r.side === "left" ? 0.26 : r.side === "right" ? -0.26 : 0);
    const sideY = () => (opts.phone ? 0.2 : 0);
    const sx = lerp(sideX(A), sideX(B), e);
    const sy = sideY();
    const dim = lerp(A.dim, B.dim, e);

    const follow = first || opts.reduced ? 1 : 1 - Math.exp(-dt * 5);
    first = false;
    cur.rx += (rx - cur.rx) * follow;
    cur.ry += (ry - cur.ry) * follow;
    cur.rz += (rz - cur.rz) * follow;
    cur.dist += (dist - cur.dist) * follow;
    cur.sx += (sx - cur.sx) * follow;
    cur.sy += (sy - cur.sy) * follow;
    cur.dim += (dim - cur.dim) * follow;

    pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 3));
    pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 3));
    const sway = opts.reduced ? 0 : 1;
    group.rotation.set(
      cur.rx + Math.sin(time * 0.19) * 0.04 * sway + pointer.y * 0.1,
      cur.ry + Math.sin(time * 0.23) * 0.12 * sway + pointer.x * 0.16,
      cur.rz,
    );

    camera.position.set(0, cur.dist * 0.14, cur.dist);
    camera.lookAt(0, 0, 0);
    const R = lerp(A.shape.radius, B.shape.radius, e);
    floor.position.y = -R * 0.82;
    floor.scale.setScalar(R * 3.2);
    const solid = (r: Row) => (r.shape.count ? 1 : 0);
    floorMat.uniforms.uAlpha.value = lerp(solid(A), solid(B), e) * (1 - cur.dim);
    camera.setViewOffset(W, H, -cur.sx * W, cur.sy * H, W, H);
    camera.updateProjectionMatrix();
    uniforms.uFog.value = 0.3 / cur.dist;
    uniforms.uDim.value = cur.dim;

    renderer.render(scene, camera);
  }

  const onVis = () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener("visibilitychange", onVis);
  raf = requestAnimationFrame(frame);

  return {
    setSections,
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
      tex?.dispose();
      geo.dispose();
      box.dispose();
      mat.dispose();
      floor.geometry.dispose();
      floorMat.dispose();
      renderer.dispose();
    },
  };
}

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
