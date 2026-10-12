"use client";

import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";

export type SceneRender = (p: { reduced: boolean }) => ReactNode;

/** The actual WebGL canvas. Loaded by ClayStage with next/dynamic (ssr:false) after first paint. */
export default function ClayCanvas({
  scene,
  reduced,
  isPhone,
  onReady,
}: {
  scene: SceneRender;
  reduced: boolean;
  isPhone: boolean;
  onReady: () => void;
}) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, isPhone ? 1.5 : 2]}
      frameloop={reduced ? "demand" : "always"}
      camera={{ position: [0, 0, 7.6], fov: 35 }}
      gl={{ antialias: !isPhone, alpha: true, powerPreference: "high-performance" }}
      performance={{ min: 0.6 }}
      onCreated={onReady}
    >
      {/* one soft key light plus fill; no shadows, no post effects */}
      <hemisphereLight args={["#f4efe3", "#6b655d", 1.5]} />
      <directionalLight position={[3, 4, 6]} intensity={2.4} color="#fff4e2" />
      {scene({ reduced })}
      <AdaptiveDpr />
    </Canvas>
  );
}
