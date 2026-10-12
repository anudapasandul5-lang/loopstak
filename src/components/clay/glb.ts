"use client";

import { useLayoutEffect, useMemo, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { MathUtils, MeshBasicMaterial, Quaternion, Vector3, type Material, type Mesh, type Object3D } from "three";

export type ModelProps = {
  progress: number;
  reduced: boolean;
  /** Live progress (read every frame). When given it wins over `progress`; the model then re-poses without re-rendering. */
  progressRef?: MutableRefObject<number>;
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** Progress 0..1 across the window [a, b]. */
export const win = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
export const lerp = MathUtils.lerp;

/**
 * The GLBs carry baked lighting (soft sky light and ambient occlusion in one texture), so they are shown
 * with an unlit material: the texture is the clay look. Lights or tone mapping would double the lighting.
 * One unlit material per source material, shared by every clone.
 */
const unlit = new WeakMap<Material, MeshBasicMaterial>();
function toUnlit(src: Material): Material {
  let m = unlit.get(src);
  if (!m) {
    const s = src as Material & { map?: MeshBasicMaterial["map"] };
    m = new MeshBasicMaterial({ map: s.map ?? null, toneMapped: false });
    if (m.map) m.map.anisotropy = 4;
    unlit.set(src, m);
  }
  return m;
}

export type Glb = { root: Object3D; node: (name: string) => Object3D };

/** Loads public/models/<name>.glb (drei sets the meshopt decoder by default) and returns a private clone with unlit baked materials. */
export function useClayGlb(name: string): Glb {
  const { scene } = useGLTF(`/models/${name}.glb`);
  return useMemo(() => {
    const root = scene.clone(true);
    const byName = new Map<string, Object3D>();
    root.traverse((o) => {
      byName.set(o.name, o);
      const mesh = o as Mesh;
      if (mesh.isMesh) {
        mesh.material = toUnlit(mesh.material as Material);
        mesh.frustumCulled = false; // parts move far from their rest bounds
      }
    });
    return {
      root,
      node: (n: string) => {
        const o = byName.get(n);
        if (!o) throw new Error(`${name}.glb has no node "${n}"`);
        return o;
      },
    };
  }, [scene, name]);
}

export const preloadClayGlb = (name: string) => useGLTF.preload(`/models/${name}.glb`);

/**
 * Applies `apply(progress)` to the model: when `progress` changes (or on mount, which also covers
 * reduced motion's on-demand frameloop) and, when a `progressRef` is given, every frame.
 */
export function usePose(apply: (p: number) => void, progress: number, progressRef?: MutableRefObject<number>) {
  const invalidate = useThree((s) => s.invalidate);
  useLayoutEffect(() => {
    apply(progressRef ? progressRef.current : progress);
    invalidate();
  }, [apply, progress, progressRef, invalidate]);
  useFrame(() => {
    if (progressRef) apply(progressRef.current);
  });
}

const X = new Vector3(1, 0, 0);
const Y = new Vector3(0, 1, 0);
const Z = new Vector3(0, 0, 1);
const tmpQ = new Quaternion();
/** Rotate `o` about its own local axis by `angle` from its rest rotation `q0`. */
export function spin(o: Object3D, q0: Quaternion, axis: "x" | "y" | "z", angle: number) {
  o.quaternion.copy(q0).multiply(tmpQ.setFromAxisAngle(axis === "x" ? X : axis === "y" ? Y : Z, angle));
}

export type Rest = { pos: Vector3; quat: Quaternion; scale: Vector3 };
/** Snapshot of a node's rest transform (the GLB's pose). */
export function restOf(o: Object3D): Rest {
  return { pos: o.position.clone(), quat: o.quaternion.clone(), scale: o.scale.clone() };
}

/** Scale that keeps a model whose half-width is `half` (model units, before scaling) inside the canvas: `base`, or less on narrow stages. */
export function useFit(half: number, base: number) {
  const width = useThree((s) => s.viewport.width);
  return Math.min(base, (width * 0.46) / half);
}
