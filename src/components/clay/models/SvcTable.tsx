"use client";

import { useCallback, useMemo } from "react";
import type { Object3D } from "three";
import { easeOut, restOf, useClayGlb, usePose, win, type ModelProps } from "../glb";

const FIGURES = 8;
const START = 0.14;
const STEP = 0.1; // one figure after another, seat by seat
const WINDOW = 0.16;

function findParts(node: (n: string) => Object3D) {
  const figs = Array.from({ length: FIGURES }, (_, i) => ({ o: node(`Figure_${i + 1}`), rest: restOf(node(`Figure_${i + 1}`)) }));
  // seat order: 1,5,2,6,3,7,4,8
  const order = [0, 4, 1, 5, 2, 6, 3, 7];
  return { figs, order, board: node("Board"), boardRest: restOf(node("Board")) };
}

type Parts = ReturnType<typeof findParts>;

function pose(parts: Parts, reduced: boolean, p0: number) {
  const { figs, order, board, boardRest } = parts;
  const p = reduced ? 1 : p0;
  const b = easeOut(win(p, 0, 0.12));
  board.visible = b > 0;
  board.scale.set(boardRest.scale.x * (0.4 + 0.6 * b), boardRest.scale.y * b, boardRest.scale.z * (0.4 + 0.6 * b));
  order.forEach((fi, seat) => {
    const { o, rest } = figs[fi];
    const t = win(p, START + seat * STEP, START + seat * STEP + WINDOW);
    const e = easeOut(t);
    o.visible = t > 0;
    o.position.set(rest.pos.x, rest.pos.y - 0.5 * (1 - e), rest.pos.z);
    o.scale.set(e, 0.3 + 0.7 * e, e);
  });
}

/**
 * public/models/table.glb (AI teaching): a table and a board with one mint line, and eight faceless figures.
 * The board pops up first, then the figures rise one by one (1-4 along the near side, 5-8 along the far side,
 * alternating so both sides fill together). Finished (and reduced motion): all seated.
 */
export function SvcTable({ progress, reduced, progressRef }: ModelProps) {
  const { root, node } = useClayGlb("table");
  const parts = useMemo(() => findParts(node), [node]);
  const apply = useCallback((p0: number) => pose(parts, reduced, p0), [parts, reduced]);
  usePose(apply, progress, progressRef);
  return <primitive object={root} />;
}
