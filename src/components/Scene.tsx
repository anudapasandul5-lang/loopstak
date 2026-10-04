"use client";

import { useEffect, useRef } from "react";
import type * as T from "three";
import { getWorkHover, setWorkHover } from "@/lib/scene-bus";

/**
 * Loop & Stack: one fixed WebGL canvas behind the page. The camera flies a spline through a
 * chrome infinity loop, a stack of glass layers (the site being built), the keys handed over on
 * day one, and the live work. Scroll position picks where on the spline we are. Decorative:
 * all real content is HTML.
 */

const BG = 0x07070a;
const LIME = 0xd6ff3a;
const WORK = [
  { src: "/work/flost8.jpg", href: "https://flost8.lk" },
  { src: "/work/ramashala.jpg", href: "https://sriramashala.com" },
  { src: "/work/editedwild.jpg", href: "https://editedwild.com" },
  { src: "/work/hyrefi.jpg", href: "https://hyrefi.com" },
];
const KEYS = ["Domain", "Hosting", "Email", "Analytics", "Code"];

// Camera waypoints: [position, lookAt, section anchor]. Anchor N matches the Nth [data-scene] section.
const PATH: Array<[number[], number[], number | null]> = [
  [[0.4, 0.3, 11], [0, 0, 0], 0], // hero
  [[2.1, 0.1, 2.2], [1.2, 0, -5], null], // slide through the loop's right-hand hole
  [[1.6, 0, -3], [0, 0, -12], null],
  [[0, 0.3, -3.8], [0, 0, -17], 1], // steps: into the stack
  [[-5.4, 2.4, -12.5], [0.5, 0, -17.5], 2], // prices: oblique view of the finished stack
  [[-3, 0.6, -22], [3, 0, -32], null],
  [[1.2, 0.4, -30], [3.4, 0, -38.5], 3], // keys
  [[1, 0.3, -39], [3, 0, -46], null],
  [[0, 0.3, -46], [3.5, 0, -60], 4], // work: a 2x2 wall of live sites
  [[-3.5, 1, -56], [0, 0, -70], null],
  [[0.2, 0.15, -70], [0, 0, -80], 5], // contact: the loop returns
];

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function Scene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
      const { animate } = await import("animejs");
      if (disposed) return;

      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const coarse = matchMedia("(pointer: coarse)").matches;
      const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4 || innerWidth < 700 || coarse;

      let renderer: T.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: false });
      } catch {
        document.documentElement.classList.add("no-gl");
        return;
      }
      renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.25 : 1.75));
      renderer.setSize(innerWidth, innerHeight);
      renderer.setClearColor(BG, 1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.appendChild(renderer.domElement);

      const onLost = (e: Event) => {
        e.preventDefault();
        document.documentElement.classList.remove("gl-ready");
        document.documentElement.classList.add("no-gl");
      };
      renderer.domElement.addEventListener("webglcontextlost", onLost);

      // canvas text must use the real (hashed) next/font family, loaded before we draw
      const display =
        getComputedStyle(document.documentElement).getPropertyValue("--font-unbounded").trim() || "system-ui";
      try {
        await document.fonts.load(`800 64px ${display}`);
      } catch {
        /* fall back to system-ui */
      }
      if (disposed) {
        renderer.dispose();
        return;
      }

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(BG, 0.016);
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = 0.9;

      const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 140);
      // portrait screens get a wider field of view so the loop still fits
      const fit = () => {
        const a = innerWidth / innerHeight;
        camera.aspect = a;
        camera.fov = a < 1 ? Math.min(78, 48 / Math.pow(a, 0.72)) : 48;
        camera.updateProjectionMatrix();
      };
      fit();

      // opening push-in, driven by anime.js on a plain object
      const intro = { k: reduce ? 1 : 0 };
      if (!reduce) animate(intro, { k: 1, duration: 2800, delay: 150, ease: "out(4)" });

      const lime = new THREE.PointLight(LIME, 60, 40, 1.6);
      lime.position.set(-4, 2, 4);
      scene.add(lime);
      const cool = new THREE.PointLight(0x7fa6ff, 40, 40, 1.6);
      cool.position.set(5, -3, 6);
      scene.add(cool);

      const disposables: Array<{ dispose: () => void }> = [pmrem];
      const track = <U extends { dispose: () => void }>(o: U) => (disposables.push(o), o);

      // ───────── Chrome infinity loop (the logo's "oo") ─────────
      class Lemniscate extends THREE.Curve<T.Vector3> {
        constructor(private A: number) {
          super();
        }
        getPoint(t: number, target = new THREE.Vector3()) {
          const a = t * Math.PI * 2;
          const s = Math.sin(a);
          const c = Math.cos(a);
          const d = 1 + s * s;
          return target.set((this.A * c) / d, (this.A * s * c) / d, 0.62 * s);
        }
      }
      const chrome = track(
        new THREE.MeshPhysicalMaterial({
          color: 0xdfe3ea,
          metalness: 1,
          roughness: 0.14,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
          iridescence: 0.35,
          iridescenceIOR: 1.6,
        }),
      );
      const loopGeo = track(new THREE.TubeGeometry(new Lemniscate(3.4), 420, 0.36, 56, true));
      const makeLoop = (scale: number, z: number) => {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(loopGeo, chrome));
        g.scale.setScalar(scale);
        g.position.z = z;
        scene.add(g);
        return g;
      };
      const loopA = makeLoop(1, 0);
      const loopB = makeLoop(0.85, -80);

      // lime data packets circling the loop: the follow-up loop, made literal
      const packetGeo = track(new THREE.SphereGeometry(0.24, 24, 24));
      const packetMat = track(new THREE.MeshBasicMaterial({ color: LIME }));
      const lemni = new Lemniscate(3.4);
      const packets = [0, 0.34, 0.67].map((o) => {
        const m = new THREE.Mesh(packetGeo, packetMat);
        m.userData.o = o;
        loopA.add(m);
        return m;
      });

      // ───────── Stack of glass layers (the site being built) ─────────
      const layerTexture = (kind: number) => {
        const w = 1024;
        const h = 640;
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = h;
        const g = cv.getContext("2d")!;
        g.clearRect(0, 0, w, h);
        const dim = "rgba(255,255,255,0.2)";
        g.lineWidth = 2;
        const bar = (x: number, y: number, bw: number, bh: number, a: number) => {
          g.fillStyle = `rgba(255,255,255,${a})`;
          g.fillRect(x, y, bw, bh);
        };
        if (kind === 0) {
          g.fillStyle = "rgba(255,255,255,0.35)"; // 1. blank canvas: a dot grid
          for (let x = 40; x < w; x += 48) for (let y = 40; y < h; y += 48) g.fillRect(x, y, 3, 3);
        } else if (kind === 1) {
          g.strokeStyle = dim; // 2. structure
          g.strokeRect(48, 48, w - 96, 70);
          g.strokeRect(48, 150, 560, 300);
          g.strokeRect(640, 150, 336, 140);
          g.strokeRect(640, 310, 336, 140);
          g.strokeRect(48, 480, w - 96, 110);
        } else if (kind === 2) {
          bar(48, 48, w - 96, 70, 0.12); // 3. content
          bar(48, 170, 420, 34, 0.55);
          bar(48, 220, 520, 34, 0.55);
          for (let i = 0; i < 5; i++) bar(48, 290 + i * 28, 440 + (i % 2) * 60, 10, 0.16);
          bar(640, 150, 336, 300, 0.1);
        } else if (kind === 3) {
          bar(48, 48, w - 96, 70, 0.12); // 4. the action
          bar(48, 170, 460, 34, 0.6);
          bar(48, 220, 560, 34, 0.6);
          g.fillStyle = "#d6ff3a";
          g.beginPath();
          g.roundRect(48, 320, 250, 64, 32);
          g.fill();
          bar(640, 150, 336, 300, 0.1);
        } else if (kind === 4) {
          bar(48, 48, w - 96, 70, 0.12); // 5. follow-up: message bubbles
          for (let i = 0; i < 4; i++) {
            const right = i % 2 === 1;
            g.fillStyle = right ? "rgba(214,255,58,0.85)" : "rgba(255,255,255,0.2)";
            g.beginPath();
            g.roundRect(right ? w - 48 - 420 : 48, 160 + i * 100, 420, 70, 22);
            g.fill();
          }
        } else {
          g.fillStyle = "#0b0b10"; // 6. the finished site: lit, solid, no copy
          g.fillRect(0, 0, w, h);
          bar(48, 40, w - 96, 56, 0.1);
          bar(48, 180, 480, 40, 0.85);
          bar(48, 240, 380, 40, 0.85);
          for (let i = 0; i < 3; i++) bar(48, 320 + i * 26, 520 - i * 70, 10, 0.4);
          g.fillStyle = "#d6ff3a";
          g.beginPath();
          g.roundRect(48, 440, 240, 62, 31);
          g.fill();
          const grad = g.createLinearGradient(620, 120, 980, 520);
          grad.addColorStop(0, "#d6ff3a");
          grad.addColorStop(1, "#4f6bff");
          g.fillStyle = grad;
          g.beginPath();
          g.roundRect(620, 120, 356, 400, 28);
          g.fill();
        }
        const tex = new THREE.CanvasTexture(cv);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        return track(tex);
      };

      const stack = new THREE.Group();
      scene.add(stack);
      const layerGeo = track(new THREE.PlaneGeometry(9.6, 6));
      const frameGeo = track(new THREE.EdgesGeometry(layerGeo));
      const layers: T.Group[] = [];
      const fades: Array<{ m: T.Material; base: number }> = [];
      for (let i = 0; i < 6; i++) {
        const last = i === 5;
        const mat = track(
          new THREE.MeshBasicMaterial({
            map: layerTexture(i),
            transparent: true,
            opacity: last ? 1 : 0.9,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        const glass = track(
          new THREE.MeshBasicMaterial({ color: 0x9fb4ff, transparent: true, opacity: last ? 0 : 0.05, side: THREE.DoubleSide, depthWrite: false }),
        );
        const frameMat = track(
          new THREE.LineBasicMaterial({ color: last ? LIME : 0xffffff, transparent: true, opacity: last ? 1 : 0.35 }),
        );
        fades.push({ m: mat, base: last ? 1 : 0.9 }, { m: glass, base: last ? 0 : 0.05 }, { m: frameMat, base: last ? 1 : 0.35 });
        const panel = new THREE.Group();
        const body = new THREE.Mesh(layerGeo, glass);
        body.position.z = -0.01;
        panel.add(body, new THREE.Mesh(layerGeo, mat), new THREE.LineSegments(frameGeo, frameMat));
        panel.position.set(0, 0, -12.5 - i * 1.75);
        stack.add(panel);
        layers.push(panel);
      }

      // ───────── Keys handed over on day one ─────────
      const keysGroup = new THREE.Group();
      keysGroup.position.set(3.4, 0, -38.5);
      scene.add(keysGroup);
      const limeMetal = track(new THREE.MeshPhysicalMaterial({ color: LIME, metalness: 1, roughness: 0.22, clearcoat: 0.6 }));
      const bowGeo = track(new THREE.TorusGeometry(0.5, 0.15, 28, 72));
      const shaftGeo = track(new THREE.CylinderGeometry(0.09, 0.09, 2.3, 28));
      const toothGeo = track(new THREE.BoxGeometry(0.34, 0.14, 0.12));
      const tagGeo = track(new THREE.PlaneGeometry(1.5, 0.52));
      const keyObjs: T.Group[] = [];
      const buildKey = (label: string, accent: boolean) => {
        const k = new THREE.Group();
        const mat = accent ? limeMetal : chrome;
        const bow = new THREE.Mesh(bowGeo, mat);
        bow.position.y = 1.5;
        const shaft = new THREE.Mesh(shaftGeo, mat);
        shaft.position.y = 0.2;
        k.add(bow, shaft);
        for (let i = 0; i < 3; i++) {
          const t = new THREE.Mesh(toothGeo, mat);
          t.position.set(0.2, -0.65 - i * 0.28, 0);
          k.add(t);
        }
        const cv = document.createElement("canvas");
        cv.width = 512;
        cv.height = 180;
        const g = cv.getContext("2d")!;
        g.fillStyle = "#f4f2ee";
        g.beginPath();
        g.roundRect(0, 0, 512, 180, 36);
        g.fill();
        g.fillStyle = "#07070a";
        g.font = `800 60px ${display}`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(label.toUpperCase(), 256, 96);
        const tex = track(new THREE.CanvasTexture(cv));
        tex.colorSpace = THREE.SRGBColorSpace;
        const tagMat = track(new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: true }));
        const tag = new THREE.Mesh(tagGeo, tagMat);
        tag.position.set(0, 2.55, 0);
        k.add(tag);
        return k;
      };
      KEYS.forEach((label, i) => {
        const k = buildKey(label, i === 0);
        const a = (i / KEYS.length) * Math.PI * 2;
        k.position.set(Math.sin(a) * 2.7, ((i % 2) - 0.5) * 0.9, Math.cos(a) * 2.7 - 1);
        k.userData.base = k.position.y;
        k.userData.phase = i * 1.3;
        keysGroup.add(k);
        keyObjs.push(k);
      });

      // ───────── Work: a 2x2 wall of live sites, each one a link ─────────
      const galleryGroup = new THREE.Group();
      scene.add(galleryGroup);
      const cardGeo = track(new THREE.PlaneGeometry(3.2, 2));
      const edgeGeo = track(new THREE.EdgesGeometry(cardGeo));
      const edgeMat = track(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }));
      const loader = new THREE.TextureLoader();
      const cards: T.Mesh[] = [];
      WORK.forEach((w, i) => {
        const tex = loader.load(w.src);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        track(tex);
        const card = new THREE.Mesh(cardGeo, track(new THREE.MeshBasicMaterial({ map: tex, fog: true })));
        card.position.set(2.2 + (i % 2) * 3.45, i < 2 ? 1.3 : -1.3, -52 - i * 0.3);
        card.rotation.y = -0.25;
        card.userData.base = card.position.clone();
        card.userData.phase = i * 1.7;
        card.add(new THREE.LineSegments(edgeGeo, edgeMat));
        galleryGroup.add(card);
        cards.push(card);
      });

      // ───────── Depth dust: soft round sprites, not squares ─────────
      const sprite = (() => {
        const cv = document.createElement("canvas");
        cv.width = cv.height = 64;
        const g = cv.getContext("2d")!;
        const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.35, "rgba(255,255,255,0.55)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 64, 64);
        return track(new THREE.CanvasTexture(cv));
      })();
      const count = lowPower ? 500 : 1500;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 30;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
        pos[i * 3 + 2] = 14 - Math.random() * 100;
      }
      const dustGeo = track(new THREE.BufferGeometry());
      dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const dustMat = track(
        new THREE.PointsMaterial({ map: sprite, color: 0xffffff, size: 0.12, transparent: true, opacity: 0.55, depthWrite: false, sizeAttenuation: true }),
      );
      const dust = new THREE.Points(dustGeo, dustMat);
      scene.add(dust);

      // ───────── Camera spline + scroll mapping ─────────
      const camCurve = new THREE.CatmullRomCurve3(PATH.map((p) => new THREE.Vector3(...p[0])), false, "centripetal", 0.4);
      const lookCurve = new THREE.CatmullRomCurve3(PATH.map((p) => new THREE.Vector3(...p[1])), false, "centripetal", 0.4);
      const anchorIdx = PATH.map((p, i) => (p[2] === null ? -1 : i)).filter((i) => i >= 0);
      const uOf = (idx: number) => idx / (PATH.length - 1);

      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
      // section centres in document space, measured on resize instead of every frame
      let centers: number[] = [];
      const measure = () => {
        centers = sections.map((s) => {
          const r = s.getBoundingClientRect();
          return r.top + scrollY + r.height / 2;
        });
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(document.body);
      document.fonts.ready.then(measure);

      let target = 0;
      let current = 0;
      let side = 0;
      let sideTarget = 0;
      let shift = 0.17;
      let shiftTarget = 0.17;
      const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
      let canvasHover = -1;

      const computeTarget = () => {
        if (!sections.length || !centers.length) return;
        const mid = scrollY + innerHeight / 2;
        let i = 0;
        while (i < centers.length - 1 && centers[i + 1] < mid) i++;
        const a = Math.min(i, anchorIdx.length - 1);
        const b = Math.min(a + 1, anchorIdx.length - 1);
        const span = centers[b] - centers[a] || 1;
        const t = a === b ? 0 : smooth(clamp01((mid - centers[a]) / span));
        const ua = uOf(anchorIdx[a]);
        const ub = uOf(anchorIdx[b]);
        target = ua + (ub - ua) * t;
        const sd = (s: HTMLElement) => (s.dataset.side === "right" ? 1 : s.dataset.side === "left" ? -1 : 0);
        sideTarget = sd(sections[a]) + (sd(sections[b]) - sd(sections[a])) * t;
        const ha = parseFloat(sections[a].dataset.shift ?? "0.17");
        const hb = parseFloat(sections[b].dataset.shift ?? "0.17");
        shiftTarget = ha + (hb - ha) * t;
      };

      // pointer: parallax, plus hit-testing the work cards so they behave as links
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const onMove = (e: PointerEvent) => {
        pointer.x = (e.clientX / innerWidth) * 2 - 1;
        pointer.y = (e.clientY / innerHeight) * 2 - 1;
        if (galleryGroup.visible && camera.position.z < -40 && !(e.target as HTMLElement).closest?.("a,button,input,select,textarea,.panel")) {
          ndc.set(pointer.x, -pointer.y);
          ray.setFromCamera(ndc, camera);
          const hit = ray.intersectObjects(cards, false)[0];
          canvasHover = hit ? cards.indexOf(hit.object as T.Mesh) : -1;
        } else {
          canvasHover = -1;
        }
        document.documentElement.style.cursor = canvasHover >= 0 ? "pointer" : "";
      };
      const onClick = (e: MouseEvent) => {
        if (canvasHover < 0 || (e.target as HTMLElement).closest?.("a,button,input,select,textarea,.panel")) return;
        window.open(WORK[canvasHover].href, "_blank", "noopener,noreferrer");
      };
      let lastW = innerWidth;
      const onResize = () => {
        // mobile URL-bar show/hide changes only the height: don't reallocate the canvas for it
        if (innerWidth === lastW && coarse) return;
        lastW = innerWidth;
        renderer.setSize(innerWidth, innerHeight);
        fit();
        measure();
      };
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("click", onClick);
      addEventListener("resize", onResize);

      const tmpP = new THREE.Vector3();
      const tmpL = new THREE.Vector3();
      const clock = new THREE.Clock();
      let raf = 0;
      let running = true;

      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!running) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;

        computeTarget();
        const k = reduce ? 1 : 1 - Math.pow(0.0008, dt); // frame-rate independent ease
        current += (target - current) * k;
        const ease2 = reduce ? 1 : 1 - Math.pow(0.002, dt);
        side += (sideTarget - side) * ease2;
        shift += (shiftTarget - shift) * ease2;
        pointer.sx += (pointer.x - pointer.sx) * (1 - Math.pow(0.01, dt));
        pointer.sy += (pointer.y - pointer.sy) * (1 - Math.pow(0.01, dt));

        camCurve.getPoint(clamp01(current), tmpP);
        lookCurve.getPoint(clamp01(current), tmpL);
        camera.position.copy(tmpP);
        if (!reduce) {
          camera.position.x += pointer.sx * 0.35;
          camera.position.y += -pointer.sy * 0.22 + Math.sin(t * 0.4) * 0.05;
        }
        camera.position.z += (1 - intro.k) * 7;
        camera.lookAt(tmpL);
        loopA.scale.setScalar(0.55 + 0.45 * intro.k);
        dustMat.opacity = 0.55 * intro.k;

        if (innerWidth >= 900) {
          // push the subject opposite the text column
          camera.setViewOffset(innerWidth, innerHeight, side * innerWidth * shift, 0, innerWidth, innerHeight);
        } else {
          // phones: lift the scene into the space above the text block
          camera.setViewOffset(innerWidth, innerHeight, 0, innerHeight * 0.2, innerWidth, innerHeight);
        }

        // only draw what the camera can reach: keeps scenes from bleeding into each other
        const z = camera.position.z;
        const fade = clamp01((4 - z) / 6);
        stack.visible = fade > 0.01 && z > -34;
        fades.forEach((f) => (f.m.opacity = f.base * fade));
        keysGroup.visible = z < -22 && z > -52;
        galleryGroup.visible = z < -38;
        loopB.visible = z < -52;
        loopA.visible = z > -20;

        if (!reduce) {
          loopA.rotation.y = Math.sin(t * 0.25) * 0.35 + pointer.sx * 0.4;
          loopA.rotation.x = pointer.sy * 0.25;
          loopB.rotation.y = Math.sin(t * 0.22 + 1) * 0.3;
          packets.forEach((p) => lemni.getPoint((t * 0.07 + p.userData.o) % 1, p.position));
          layers.forEach((l, i) => (l.position.y = Math.sin(t * 0.5 + i) * 0.06));
          keyObjs.forEach((kObj) => {
            kObj.rotation.y = t * 0.5 + kObj.userData.phase;
            kObj.position.y = kObj.userData.base + Math.sin(t * 0.8 + kObj.userData.phase) * 0.18;
          });
          keysGroup.rotation.y = t * 0.08;
        }
        const hov = canvasHover >= 0 ? canvasHover : getWorkHover();
        cards.forEach((c, i) => {
          const want = hov === i ? 1.1 : 1;
          c.scale.setScalar(c.scale.x + (want - c.scale.x) * 0.15);
          const b = c.userData.base as T.Vector3;
          c.position.y = b.y + (reduce ? 0 : Math.sin(t * 0.7 + c.userData.phase) * 0.12);
        });
        dust.rotation.z = reduce ? 0 : t * 0.01;

        renderer.render(scene, camera);
      };
      tick();

      const onVis = () => {
        running = !document.hidden;
        if (running) clock.getDelta();
      };
      document.addEventListener("visibilitychange", onVis);
      document.documentElement.classList.add("gl-ready");

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        removeEventListener("pointermove", onMove);
        removeEventListener("click", onClick);
        removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVis);
        renderer.domElement.removeEventListener("webglcontextlost", onLost);
        document.documentElement.style.cursor = "";
        setWorkHover(-1);
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
        renderer.domElement.remove();
        document.documentElement.classList.remove("gl-ready");
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={host} className="scene" aria-hidden="true" />;
}
