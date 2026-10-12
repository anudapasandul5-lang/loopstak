"use client";

import { useCallback, useMemo } from "react";
import type { Object3D } from "three";
import { easeInOut, easeOut, lerp, restOf, spin, useClayGlb, usePose, win, type ModelProps } from "../glb";

const GEARS = 6;
const TURN = 2.4; // radians the gears turn across the whole scroll (12 teeth each; neighbours counter-rotate)
/** Pass `progress={REST}` to show the GLB as modelled: both bubbles in place, gears still. */
export const REST = -1;

function findParts(node: (n: string) => Object3D) {
  const gears = Array.from({ length: GEARS }, (_, i) => ({ o: node(`Gear_${i}`), rest: restOf(node(`Gear_${i}`)) }));
  return { gears, msg: node("Message"), reply: node("Reply"), msgRest: restOf(node("Message")), replyRest: restOf(node("Reply")) };
}

type Parts = ReturnType<typeof findParts>;

function pose(parts: Parts, reduced: boolean, p0: number) {
  const { gears, msg, reply, msgRest, replyRest } = parts;
  if (p0 === REST) {
    gears.forEach(({ o, rest }) => o.quaternion.copy(rest.quat));
    msg.visible = reply.visible = true;
    msg.position.copy(msgRest.pos);
    msg.scale.copy(msgRest.scale);
    reply.position.copy(replyRest.pos);
    reply.scale.copy(replyRest.scale);
    return;
  }
  const p = reduced ? 1 : p0;
  const a = easeInOut(p) * TURN;
  gears.forEach(({ o, rest }, i) => spin(o, rest.quat, "y", (i % 2 ? -1 : 1) * a));

  // Message: in from the left, up over the ring, shrinks away
  const m = easeInOut(win(p, 0.04, 0.42));
  msg.visible = p < 0.44;
  msg.position.set(lerp(msgRest.pos.x, 0, m), msgRest.pos.y + 0.6 * Math.sin(Math.PI * Math.min(1, m * 1.1)), msgRest.pos.z);
  msg.scale.setScalar(lerp(1, 0.001, easeOut(win(p, 0.3, 0.44))));
  // Reply: out of the ring, to the right
  const r = easeInOut(win(p, 0.5, 0.9));
  reply.visible = p > 0.48;
  reply.position.set(lerp(0, replyRest.pos.x, r), replyRest.pos.y + 0.6 * Math.sin(Math.PI * Math.min(1, (1 - r) * 1.1)), replyRest.pos.z);
  reply.scale.setScalar(lerp(0.001, 1, easeOut(win(p, 0.48, 0.64))));
}

/**
 * public/models/gears.glb (AI agents and automation): six meshing gears and two bubbles. The cream Message
 * slides in from the left, shrinks into the ring and is gone by 0.45; the gears turn throughout; the mint Reply
 * grows out of the ring from 0.5 and slides to the right. Finished (and reduced motion): only the Reply.
 */
export function SvcGears({ progress, reduced, progressRef }: ModelProps) {
  const { root, node } = useClayGlb("gears");
  const parts = useMemo(() => findParts(node), [node]);
  const apply = useCallback((p0: number) => pose(parts, reduced, p0), [parts, reduced]);
  usePose(apply, progress, progressRef);
  return <primitive object={root} />;
}
