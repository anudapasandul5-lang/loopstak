"use client";

import { useCallback, useMemo } from "react";
import { clamp01, easeInOut, easeOut, restOf, spin, useClayGlb, usePose, type ModelProps } from "../glb";

const OPEN = 1.26; // radians the door swings toward the viewer (about 72 degrees)
const SLIDE = 0.7; // how far the key starts out of the lock (door-local Z)

/** Pose for a given progress. Pure: 0..0.25 the key slides in, 0.25..0.5 it turns, 0.5..1 the door opens. */
export function keyDoorPose(progress: number) {
  const slide = easeOut(clamp01(progress / 0.25));
  const turn = easeInOut(clamp01((progress - 0.25) / 0.25));
  const open = easeInOut(clamp01((progress - 0.5) / 0.5));
  return { keyOut: (1 - slide) * SLIDE, keyRoll: -turn * (Math.PI / 2), doorAngle: -open * OPEN };
}

/**
 * public/models/keys.glb: a charcoal frame, a stone door hinged on its left edge, a mint key (the door's child)
 * and a mint floor tile behind the door. The key slides in and turns 90 degrees about its own Z, then the door
 * swings open about Y and the key rides along. Reduced motion: key turned, door open.
 */
export function KeyDoor({ progress, reduced, progressRef }: ModelProps) {
  const { root, node } = useClayGlb("keys");
  const parts = useMemo(() => {
    const door = node("Door");
    const key = node("Key");
    return { door, key, doorRest: restOf(door), keyRest: restOf(key) };
  }, [node]);
  const apply = useCallback(
    (p0: number) => {
      const { door, key, doorRest, keyRest } = parts;
      const s = keyDoorPose(reduced ? 1 : p0);
      key.position.set(keyRest.pos.x, keyRest.pos.y, keyRest.pos.z + s.keyOut);
      spin(key, keyRest.quat, "z", s.keyRoll);
      spin(door, doorRest.quat, "y", s.doorAngle); // hinge pivot: the door's own Y axis
    },
    [parts, reduced],
  );
  usePose(apply, progress, progressRef);
  return <primitive object={root} />;
}
