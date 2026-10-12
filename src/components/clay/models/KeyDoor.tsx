import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { CapsuleGeometry, MeshStandardMaterial } from "three";
import { clayMaterial } from "../clayMaterial";
import type { ModelProps } from "./Loop";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const DOOR_W = 2.2;
const DOOR_H = 3.3;
const DOOR_T = 0.18;
const OPEN = 1.5; // radians the door swings toward the viewer
const LOCK = { x: 0.78, y: -0.1 }; // lock position on the door, door-local

/** Pose for a given progress. Pure: 0..0.5 the key slides in and turns, 0.5..1 the door opens. */
export function keyDoorPose(progress: number) {
  const slide = easeOut(clamp01(progress / 0.25));
  const turn = easeInOut(clamp01((progress - 0.25) / 0.25));
  const open = easeInOut(clamp01((progress - 0.5) / 0.5));
  return { keyZ: (1 - slide) * 1.6, keyRoll: -turn * (Math.PI / 2), doorAngle: open * OPEN };
}

/**
 * PLACEHOLDER for public/models/key-door.glb. A cream door in a stone frame with a lock, and a
 * mint key (the "yours" part). The door is hinged on its left edge and swings toward the viewer,
 * revealing a lighter interior. Reduced motion: key turned, door open.
 */
export function KeyDoor({ progress, reduced }: ModelProps) {
  const m = useMemo(() => {
    const interior = clayMaterial("cream");
    interior.emissive.set("#e8e2d0");
    interior.emissiveIntensity = 0.28;
    return {
      frame: clayMaterial("stone"),
      door: clayMaterial("cream"),
      plate: clayMaterial("warmGrey"),
      hole: new MeshStandardMaterial({ color: "#3a3631", roughness: 1, metalness: 0 }),
      key: clayMaterial("mint"),
      interior,
      shaft: new CapsuleGeometry(0.075, 0.62, 8, 16).rotateX(Math.PI / 2),
    };
  }, []);

  const { keyZ, keyRoll, doorAngle } = keyDoorPose(reduced ? 1 : progress);
  const hx = DOOR_W / 2;
  const fx = hx + 0.05 + 0.25; // frame bar centre, sides
  const fy = DOOR_H / 2 + 0.05 + 0.25; // frame bar centre, top and bottom

  return (
    <group>
      {/* stone frame, four soft bars */}
      <RoundedBox args={[0.5, DOOR_H + 1.1, 0.55]} radius={0.12} smoothness={5} position={[-fx, 0, 0]} material={m.frame} />
      <RoundedBox args={[0.5, DOOR_H + 1.1, 0.55]} radius={0.12} smoothness={5} position={[fx, 0, 0]} material={m.frame} />
      <RoundedBox args={[DOOR_W + 1.1, 0.5, 0.55]} radius={0.12} smoothness={5} position={[0, fy, 0]} material={m.frame} />
      <RoundedBox args={[DOOR_W + 1.1, 0.5, 0.55]} radius={0.12} smoothness={5} position={[0, -fy, 0]} material={m.frame} />
      {/* the lighter interior behind the door */}
      <RoundedBox args={[DOOR_W + 0.2, DOOR_H + 0.2, 0.1]} radius={0.04} smoothness={4} position={[0, 0, -0.25]} material={m.interior} />

      {/* door, hinged on its left edge */}
      <group position={[-hx, 0, 0]} rotation={[0, -doorAngle, 0]}>
        <group position={[hx, 0, 0]}>
          <RoundedBox args={[DOOR_W, DOOR_H, DOOR_T]} radius={0.07} smoothness={5} material={m.door} />
          {/* lock: plate, dark keyhole, then the key, which rides with the door */}
          <group position={[LOCK.x, LOCK.y, DOOR_T / 2]}>
            <RoundedBox args={[0.5, 0.78, 0.1]} radius={0.05} smoothness={4} position={[0, 0, 0.03]} material={m.plate} />
            <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]} material={m.hole}>
              <cylinderGeometry args={[0.105, 0.105, 0.03, 24]} />
            </mesh>
            <group position={[0, 0, 0.11 + 0.31 + keyZ]} rotation={[0, 0, keyRoll]}>
              <mesh geometry={m.shaft} material={m.key} />
              <mesh position={[0, 0, 0.62]} material={m.key}>
                <torusGeometry args={[0.27, 0.095, 16, 36]} />
              </mesh>
              <RoundedBox args={[0.2, 0.1, 0.1]} radius={0.04} smoothness={3} position={[0.12, 0, -0.12]} material={m.key} />
              <RoundedBox args={[0.17, 0.1, 0.1]} radius={0.04} smoothness={3} position={[0.1, 0, 0.06]} material={m.key} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
