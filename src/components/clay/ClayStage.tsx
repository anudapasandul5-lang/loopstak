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
function LiveCanvas(props: { scene: SceneRender; reduced: boolean; isPhone: boolean; onShown: (v: boolean) => void }) {
  const { onShown, ...rest } = props;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // drop the still only after the canvas has faded in over it
    const t = ready ? window.setTimeout(() => onShown(true), 650) : 0;
    return () => clearTimeout(t);
  }, [ready, onShown]);
  useEffect(() => () => onShown(false), [onShown]);
  return (
    <div className="clay-live" data-ready={ready ? "true" : "false"}>
      <ClayCanvas
        {...rest}
        onReady={() => {
          setReady(true);
        }}
      />
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
  priority = false,
}: {
  scene: SceneRender;
  still: string;
  label: string;
  className?: string;
  /** Above the fold: load the still eagerly so it paints with the first frame. */
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false); // first paint is done
  const [near, setNear] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [shown, setShown] = useState(false); // the live canvas has drawn; the still can go
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const isPhone = useMedia("(max-width: 767px)");
  const supported = useSyncExternalStore(
    () => () => {},
    webglSupported,
    () => true,
  );
  const failed = crashed || !supported;

  useEffect(() => {
    // Arm only when the page is idle: after window load AND an idle callback (fallback timer),
    // never in the same task as first paint, so the heavy three/R3F chunk cannot delay LCP.
    let cancelled = false;
    let idle = 0;
    let timer = 0;
    const arm = () => {
      if (cancelled) return;
      const ric = window.requestIdleCallback;
      if (ric) idle = ric(() => !cancelled && setArmed(true), { timeout: 1200 });
      else timer = window.setTimeout(() => setArmed(true), 1200);
    };
    if (document.readyState === "complete") timer = window.setTimeout(arm, 0);
    else window.addEventListener("load", arm, { once: true });

    // "Near the viewport" is checked two ways: an IntersectionObserver, and a plain geometry test
    // on scroll / scrollend / resize / a slow tick. After a jump-scroll onto a pinned stage the
    // observer can miss the change (the box sits in a pin-spacer that ScrollTrigger moves and
    // re-measures), so the geometry test is the safety net.
    const el = ref.current;
    const check = () => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const rendered = r.width > 0 && r.height > 0;
      setNear(rendered && r.bottom > -vh * 0.5 && r.top < vh * 1.5);
    };
    const io = el ? new IntersectionObserver(check, { rootMargin: "50% 0px" }) : null;
    if (el && io) io.observe(el);
    let raf = 0;
    const soon = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", soon, { passive: true });
    window.addEventListener("scrollend", soon);
    window.addEventListener("resize", soon);
    const tick = window.setInterval(check, 800);
    check();
    return () => {
      cancelled = true;
      window.removeEventListener("load", arm);
      window.removeEventListener("scroll", soon);
      window.removeEventListener("scrollend", soon);
      window.removeEventListener("resize", soon);
      cancelAnimationFrame(raf);
      clearInterval(tick);
      clearTimeout(timer);
      if (idle) window.cancelIdleCallback?.(idle);
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
      {(failed || !shown) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="clay-still" src={still} alt="" width={1200} height={900} decoding="async" loading={priority || failed ? undefined : "lazy"} fetchPriority={priority ? "high" : undefined} />
      )}
      {live && (
        <GlBoundary onError={() => setCrashed(true)}>
          <LiveCanvas scene={scene} reduced={reduced} isPhone={isPhone} onShown={setShown} />
        </GlBoundary>
      )}
    </div>
  );
}
