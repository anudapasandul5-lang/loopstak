"use client";

import { Component, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { SceneRender } from "./ClayCanvas";

// Code-split and client-only: nothing of three.js is in the first load.
const ClayCanvas = dynamic(() => import("./ClayCanvas"), { ssr: false });

/** A WebGL context failure throws during render; catch it and fall back to the still. */
class GlBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

let glOk: boolean | undefined;
function webglSupported() {
  if (glOk === undefined) {
    try {
      const c = document.createElement("canvas");
      glOk = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      glOk = false;
    }
  }
  return glOk;
}

function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}

/** Owns the fade-in: mounts and unmounts with the canvas, so every mount starts hidden. */
function LiveCanvas(props: { scene: SceneRender; reduced: boolean; isPhone: boolean }) {
  const [ready, setReady] = useState(false);
  return (
    <div className="clay-live" data-ready={ready ? "true" : "false"}>
      <ClayCanvas {...props} onReady={() => setReady(true)} />
    </div>
  );
}

/**
 * A DOM slot for one 3D scene. Reserves its size with CSS (no layout shift), loads the canvas
 * after first paint, mounts it only while near the viewport, and falls back to a still image
 * when WebGL is missing or fails. `reduced` is passed to the scene for a finished, motionless pose.
 */
export function ClayStage({
  scene,
  still,
  label,
  className = "",
}: {
  scene: SceneRender;
  still: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false); // first paint is done
  const [near, setNear] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const isPhone = useMedia("(max-width: 767px)");
  const supported = useSyncExternalStore(
    () => () => {},
    webglSupported,
    () => true,
  );
  const failed = crashed || !supported;

  useEffect(() => {
    // after first paint: next frame, then a macrotask
    let id = 0;
    const raf = requestAnimationFrame(() => {
      id = window.setTimeout(() => setArmed(true), 0);
    });
    const el = ref.current;
    const io = el ? new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "50% 0px" }) : null;
    if (el && io) io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(id);
      io?.disconnect();
    };
  }, []);

  const live = armed && near && !failed;

  return (
    <div
      ref={ref}
      className={`clay-stage ${className}`}
      role="img"
      aria-label={label}
    >
      {failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="clay-still" src={still} alt="" width={1200} height={900} decoding="async" />
      ) : (
        live && (
          <GlBoundary onError={() => setCrashed(true)}>
            <LiveCanvas scene={scene} reduced={reduced} isPhone={isPhone} />
          </GlBoundary>
        )
      )}
    </div>
  );
}
