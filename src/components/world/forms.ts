/*
  Block shapes for the world. Every shape is built from the same small cubes, snapped to a grid,
  so one set of blocks can rebuild itself into each of them. Mint marks the parts that are the
  client's own (the "yours" colour); spin marks parts that turn on their own.

  Shapes are designed in world units (about 7 units wide). The grid unit is picked per device so the
  block count fits the budget: phones get fewer, bigger blocks.
*/

import type { FormName } from "@/lib/services";

export type Shape = {
  /** x, y, z, size + 4*mint + 8*spin, per block, sorted bottom-up */
  data: Float32Array;
  count: number;
  radius: number;
  minY: number;
  maxY: number;
};

export type Pose = {
  /** base rotation of the whole shape */
  rot: [number, number, number];
  /** extra rotation applied across the section as you scroll through it (-0.5..0.5 of this) */
  turn?: [number, number, number];
  /** parts flagged spin rotate around this axis at this speed (rad/s) */
  spin?: [number, number, number, number];
  /** camera distance factor; bigger means the shape sits further away */
  fit: number;
};

const MINT = 1;
const SPIN = 2;

class Grid {
  cells = new Map<number, number>();
  readonly u: number;
  constructor(u: number) {
    this.u = u;
  }
  private key(i: number, j: number, k: number) {
    return (i + 512) * 1048576 + (j + 512) * 1024 + (k + 512);
  }
  set(i: number, j: number, k: number, flags = 0) {
    const key = this.key(i, j, k);
    this.cells.set(key, (this.cells.get(key) ?? 0) | flags | 4);
  }
  has(i: number, j: number, k: number) {
    return this.cells.has(this.key(i, j, k));
  }
  /** half-open box in world units; always at least one cell thick */
  box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, flags = 0) {
    const r = (a: number, b: number) => {
      const lo = Math.round(Math.min(a, b) / this.u);
      return [lo, Math.max(lo, Math.round(Math.max(a, b) / this.u) - 1)];
    };
    const [i0, i1] = r(x0, x1);
    const [j0, j1] = r(y0, y1);
    const [k0, k1] = r(z0, z1);
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) for (let k = k0; k <= k1; k++) this.set(i, j, k, flags);
  }
  /** every cell for which inside(x, y, z) holds, inside a bounding box */
  fill(b: [number, number, number, number, number, number], inside: (x: number, y: number, z: number) => number | false) {
    const u = this.u;
    for (let i = Math.floor(b[0] / u); i <= Math.ceil(b[1] / u); i++)
      for (let j = Math.floor(b[2] / u); j <= Math.ceil(b[3] / u); j++)
        for (let k = Math.floor(b[4] / u); k <= Math.ceil(b[5] / u); k++) {
          const f = inside(i * u, j * u, k * u);
          if (f !== false) this.set(i, j, k, f);
        }
  }
  sphere(cx: number, cy: number, cz: number, r: number, flags = 0) {
    const u = this.u;
    const n = Math.ceil(r / u);
    const ci = Math.round(cx / u), cj = Math.round(cy / u), ck = Math.round(cz / u);
    for (let i = ci - n; i <= ci + n; i++)
      for (let j = cj - n; j <= cj + n; j++)
        for (let k = ck - n; k <= ck + n; k++) {
          const dx = i * u - cx, dy = j * u - cy, dz = k * u - cz;
          if (dx * dx + dy * dy + dz * dz <= r * r) this.set(i, j, k, flags);
        }
  }
  /** add flags to every existing cell for which test(x, y, z) holds */
  tag(flags: number, test: (x: number, y: number, z: number) => boolean) {
    for (const [key, f] of this.cells) {
      const i = Math.floor(key / 1048576) - 512;
      const j = (Math.floor(key / 1024) % 1024) - 512;
      const k = (key % 1024) - 512;
      if (test(i * this.u, j * this.u, k * this.u)) this.cells.set(key, f | flags);
    }
  }
  /** drop blocks nobody can see: those with all six neighbours filled */
  shell() {
    const drop: number[] = [];
    for (const key of this.cells.keys()) {
      const i = Math.floor(key / 1048576) - 512;
      const j = (Math.floor(key / 1024) % 1024) - 512;
      const k = (key % 1024) - 512;
      if (this.has(i + 1, j, k) && this.has(i - 1, j, k) && this.has(i, j + 1, k) && this.has(i, j - 1, k) && this.has(i, j, k + 1) && this.has(i, j, k - 1))
        drop.push(key);
    }
    drop.forEach((k) => this.cells.delete(k));
  }
  list() {
    const out: { x: number; y: number; z: number; f: number }[] = [];
    for (const [key, f] of this.cells) {
      const i = Math.floor(key / 1048576) - 512;
      const j = (Math.floor(key / 1024) % 1024) - 512;
      const k = (key % 1024) - 512;
      out.push({ x: i * this.u, y: j * this.u, z: k * this.u, f });
    }
    return out;
  }
}

/** deterministic random, so shapes look the same on every visit */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Build = (g: Grid, stage: number) => void;

/* ---------- shapes ---------- */

const loop: Build = (g) => {
  // the logo's infinity loop: a lemniscate tube that passes over itself, with thin mint bands along it
  const a = 3.1, r = 0.44;
  const at = (t: number) => {
    const s = Math.sin(t), c = Math.cos(t), d = 1 + s * s;
    return [(a * c) / d, (a * s * c) / d, 0.8 * s] as const;
  };
  const N = 720;
  const pts = Array.from({ length: N }, (_, n) => at((n / N) * Math.PI * 2));
  pts.forEach(([x, y, z]) => g.sphere(x, y, z, r));
  g.shell();
  const bands = [0.3, 1.2, 2.05, 3.45, 4.35, 5.2];
  g.tag(MINT, (x, y, z) => {
    let best = 0, bd = Infinity;
    pts.forEach(([px, py, pz], n) => {
      const d = (px - x) ** 2 + (py - y) ** 2 + (pz - z) ** 2;
      if (d < bd) {
        bd = d;
        best = n;
      }
    });
    const t = (best / N) * Math.PI * 2;
    return bands.some((b) => Math.abs(t - b) < 0.045);
  });
};

const city: Build = (g) => {
  // big companies' towers at the back; one small shop up front, lit: the owner's own
  const rand = rng(7);
  const cols = 8, rows = 5, step = 0.68, foot = 0.36;
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++) {
      const x = (c - (cols - 1) / 2) * step;
      const z = (r - (rows - 1) / 2) * step;
      if (r === rows - 1 && (c === 3 || c === 4)) continue; // a gap in the front row for the shop
      const back = (rows - 1 - r) / (rows - 1);
      const h = 0.35 + rand() * 1.1 + back * back * 2.9;
      g.box(x - foot / 2, x + foot / 2, 0, h, z - foot / 2, z + foot / 2);
    }
  const sz = ((rows - 1) / 2) * step + 0.15;
  g.box(-0.3, 0.3, 0, 0.48, sz - 0.3, sz + 0.3, MINT);
  g.box(-0.36, 0.36, 0.48, 0.6, sz - 0.36, sz + 0.36, MINT); // its roof
  g.shell();
};

const site: Build = (g, stage) => {
  // a website, layer by layer: frame, photo, words, then the parts that are yours (address, button)
  const u = g.u;
  g.box(-3.2, 3.2, -2.0, 2.0, 0, u);
  g.box(-3.2, 3.2, 1.55, 2.0, u, 2 * u);
  for (const x of [-2.95, -2.7, -2.45]) g.box(x - 0.08, x + 0.08, 1.7, 1.86, 2 * u, 3 * u);
  if (stage >= 2) g.box(-2.9, 0.2, -0.4, 1.3, u, 5 * u);
  if (stage >= 3) {
    g.box(0.6, 2.9, 1.0, 1.25, u, 3 * u);
    g.box(0.6, 2.3, 0.65, 0.9, u, 3 * u);
    for (const [y, w] of [[0.3, 2.9], [0.1, 2.55], [-0.1, 2.75]] as const) g.box(0.6, w, y - 0.06, y + 0.06, u, 2 * u);
    for (const [x0, x1] of [[-2.9, -1.05], [-0.85, 1.0], [1.2, 2.9]] as const) g.box(x0, x1, -1.8, -0.75, u, 3 * u);
  }
  if (stage >= 4) {
    g.box(-1.6, 1.8, 1.66, 1.9, 2 * u, 4 * u, MINT);
    g.box(0.6, 1.95, -0.45, -0.1, u, 5 * u, MINT);
  }
  g.shell();
};

const bubble = (g: Grid, cx: number, cy: number, tail: 1 | -1, flags: number) => {
  const u = g.u;
  g.box(cx - 0.6, cx + 0.6, cy - 0.38, cy + 0.38, -u, u, flags);
  g.box(cx - 0.45, cx + 0.45, cy - 0.5, cy + 0.5, -u, u, flags);
  g.box(cx + tail * 0.2, cx + tail * 0.42, cy - 0.72, cy - 0.45, -u / 2, u / 2, flags);
};

const agents: Build = (g, stage) => {
  // a loop of gears that a message passes through and comes out answered (the gear is there from stage 1)
  const R = 1.85, teeth = 14;
  g.fill([-2.5, 2.5, -2.5, 2.5, -0.3, 0.3], (x, y, z) => {
    const r = Math.hypot(x, y);
    if (Math.abs(z) > 0.26) return false;
    if (Math.abs(r - R) < 0.22) return SPIN;
    const th = (Math.atan2(y, x) / (Math.PI * 2)) * teeth;
    if (r > R && r < R + 0.52 && th - Math.floor(th) < 0.42 && Math.abs(z) < 0.2) return SPIN;
    // spokes (three lines through the hub) and the hub
    const a = Math.atan2(y, x);
    const spoke = Math.min(...[0, 1, 2].map((s) => Math.abs(Math.sin(a - (s * Math.PI) / 3)))) * r;
    if (r < R && (spoke < 0.09 || r < 0.32) && Math.abs(z) < 0.14) return SPIN;
    return false;
  });
  if (stage === 1 || stage >= 4) bubble(g, -2.75, 1.7, 1, 0);
  if (stage === 2) bubble(g, -1.95, 1.0, 1, 0);
  if (stage === 3) bubble(g, 0, 0, 1, 0);
  if (stage >= 4) bubble(g, 2.75, -1.7, -1, MINT);
  g.shell();
};

const plug: Build = (g, stage) => {
  // two of your tools, not talking; a cable runs across; they plug in and light up as yours
  const lit = stage >= 4 ? MINT : 0;
  g.box(-3.3, -1.7, -0.95, 0.95, -0.8, 0.8, lit);
  g.box(1.8, 3.3, -0.75, 0.75, -0.75, 0.75, lit);
  // socket rim on the left tool
  g.box(-1.7, -1.55, -0.35, 0.35, -0.35, 0.35);
  if (stage >= 2) {
    const head = stage >= 3 ? -1.25 : -0.2;
    g.box(head + 0.5, 1.8, -0.12, 0.12, -0.12, 0.12);
    g.box(head, head + 0.55, -0.3, 0.3, -0.3, 0.3);
    if (stage < 3) for (const y of [-0.15, 0.15]) g.box(head - 0.3, head, y - 0.05, y + 0.05, -0.05, 0.05);
  }
  g.shell();
};

const team: Build = (g, stage) => {
  // a table that fills up with people, facing a board
  g.box(-2.2, 2.2, 0.0, 0.18, -0.85, 0.85);
  for (const x of [-1.95, 1.95]) for (const z of [-0.6, 0.6]) g.box(x - 0.08, x + 0.08, -0.9, 0, z - 0.08, z + 0.08);
  g.box(-3.35, -3.2, 0.2, 1.9, -1.0, 1.0);
  g.box(-3.32, -3.24, -0.9, 0.2, -0.05, 0.05);
  if (stage >= 4) g.box(-3.2, -3.08, 1.15, 1.35, -0.7, 0.7, MINT);
  const seats: [number, number][] = [[-1.3, 1.25], [0, -1.25], [1.3, 1.25], [-1.3, -1.25], [0, 1.25], [1.3, -1.25]];
  const people = stage >= 4 ? 6 : stage === 3 ? 4 : stage === 2 ? 2 : 0;
  for (const [x, z] of seats.slice(0, people)) {
    g.box(x - 0.2, x + 0.2, -0.3, 0.3, z - 0.15, z + 0.15);
    g.box(x - 0.27, x + 0.27, 0.3, 0.52, z - 0.17, z + 0.17);
    g.box(x - 0.15, x + 0.15, 0.66, 0.96, z - 0.15, z + 0.15);
  }
  g.shell();
};

const drift: Build = () => {
  // nothing: every block drifts as dust, a quiet backdrop for reading
};

const stack: Build = (g, stage) => {
  // the stack: four layers, one per step, the last one yours
  const offs: [number, number][] = [[0, 0], [0.22, -0.18], [-0.18, 0.22], [0.12, 0.12]];
  const t = g.u * 2, gap = 0.34, half = 1.55;
  for (let s = 0; s < Math.min(4, stage); s++) {
    const [dx, dz] = offs[s];
    const y = s * (t + gap);
    g.box(-half + dx, half + dx, y, y + t, -half + dz, half + dz, s === 3 ? MINT : 0);
  }
  g.shell();
};

const key: Build = (g) => {
  // the key, in mint: every account and login is yours
  g.fill([-3.2, -0.8, -1.2, 1.2, -0.25, 0.25], (x, y, z) => {
    const r = Math.hypot(x + 2.0, y);
    return r < 1.1 && r > 0.55 && Math.abs(z) < 0.22 ? MINT | SPIN : false;
  });
  g.box(-1.05, -0.75, -0.32, 0.32, -0.26, 0.26, MINT | SPIN);
  g.box(-0.9, 2.7, -0.17, 0.17, -0.17, 0.17, MINT | SPIN);
  g.box(1.55, 1.85, -0.8, -0.17, -0.12, 0.12, MINT | SPIN);
  g.box(2.0, 2.3, -0.6, -0.17, -0.12, 0.12, MINT | SPIN);
  g.box(2.35, 2.7, -0.95, -0.17, -0.12, 0.12, MINT | SPIN);
  g.shell();
};

const person: Build = (g) => {
  // one person, and the stack of work beside them
  const x = -1.0;
  for (const dx of [-0.17, 0.17]) g.box(x + dx - 0.11, x + dx + 0.11, -2.0, -0.95, -0.12, 0.12);
  g.box(x - 0.36, x + 0.36, -0.95, 0.35, -0.2, 0.2);
  for (const dx of [-0.5, 0.5]) g.box(x + dx - 0.1, x + dx + 0.1, -0.75, 0.3, -0.1, 0.1);
  g.box(x - 0.24, x + 0.24, 0.45, 0.93, -0.24, 0.24);
  for (let s = 0; s < 4; s++) {
    const y = -2.0 + s * 0.42;
    const w = 0.85 - s * 0.06;
    g.box(1.0 - w, 1.0 + w, y, y + 0.24, -w, w, s === 3 ? MINT : 0);
  }
  g.shell();
};

export const SHAPES: Record<FormName, { build: Build; pose: Pose; staged?: boolean }> = {
  loop: { build: loop, pose: { rot: [0.32, -0.42, 0.06], fit: 1.08 } },
  city: { build: city, pose: { rot: [0.42, -0.6, 0], fit: 1.05 } },
  site: { build: site, staged: true, pose: { rot: [-0.18, -0.5, -0.03], turn: [0, 0.35, 0], fit: 1.0 } },
  agents: { build: agents, staged: true, pose: { rot: [0.05, -0.35, 0], spin: [0, 0, 1, 0.35], fit: 1.12 } },
  plug: { build: plug, staged: true, pose: { rot: [0.35, -0.5, 0.05], turn: [0, 0.3, 0], fit: 1.0 } },
  team: { build: team, staged: true, pose: { rot: [0.5, -0.7, 0], turn: [0, 0.4, 0], fit: 1.0 } },
  drift: { build: drift, pose: { rot: [0.25, 0, 0], fit: 0.9 } },
  stack: { build: stack, staged: true, pose: { rot: [0.5, -0.65, 0], turn: [0, 0.5, 0], fit: 1.15 } },
  key: { build: key, pose: { rot: [0.1, -0.45, 0.2], turn: [1.6, 0, 0], fit: 1.0 } },
  person: { build: person, pose: { rot: [0.12, -0.55, 0], turn: [0, 0.4, 0], fit: 1.05 } },
};

/** "site:2" -> ["site", 2]; no stage means the finished shape */
export function parseForm(spec: string): [FormName, number] {
  const [name, s] = spec.split(":");
  const stage = Number(s) || 4;
  return [(name in SHAPES ? name : "loop") as FormName, Math.max(1, Math.min(4, stage))];
}

const cache = new Map<string, Shape>();

/**
 * Build a shape so it fits `budget` blocks. All stages of a shape share the finished shape's
 * grid unit and centre, so a staged story stays in one place while it builds.
 */
export function buildShape(spec: string, budget: number, unit0: number): Shape {
  const [name, stage] = parseForm(spec);
  const id = `${name}:${stage}:${budget}`;
  const hit = cache.get(id);
  if (hit) return hit;

  // find the unit from the finished shape
  let u = unit0;
  let full = new Grid(u);
  for (let tries = 0; tries < 12; tries++) {
    full = new Grid(u);
    SHAPES[name].build(full, 4);
    if (full.cells.size <= budget) break;
    u *= 1.08;
  }
  const fullList = full.list();
  let cx = 0, cy = 0, cz = 0;
  fullList.forEach((p) => ((cx += p.x), (cy += p.y), (cz += p.z)));
  cx /= fullList.length || 1;
  cy /= fullList.length || 1;
  cz /= fullList.length || 1;
  let radius = 0;
  fullList.forEach((p) => (radius = Math.max(radius, Math.hypot(p.x - cx, p.y - cy, p.z - cz))));

  let g = full;
  if (stage < 4) {
    g = new Grid(u);
    SHAPES[name].build(g, stage);
  }
  const list = g.list().slice(0, budget);
  // bottom-up order keeps the morph coherent: low blocks go to low places
  list.sort((a, b) => a.y - b.y || a.x - b.x || a.z - b.z);

  const size = u * 0.86;
  const data = new Float32Array(list.length * 4);
  let minY = Infinity, maxY = -Infinity;
  list.forEach((p, i) => {
    const y = p.y - cy;
    data[i * 4] = p.x - cx;
    data[i * 4 + 1] = y;
    data[i * 4 + 2] = p.z - cz;
    data[i * 4 + 3] = size + (p.f & MINT ? 4 : 0) + (p.f & SPIN ? 8 : 0);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });
  const shape = {
    data,
    count: list.length,
    radius: fullList.length ? Math.max(radius, 1) : 3.4,
    minY: list.length ? minY : -1,
    maxY: list.length ? maxY : 1,
  };
  cache.set(id, shape);
  return shape;
}
