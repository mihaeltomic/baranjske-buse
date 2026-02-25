"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";

// ─── Figma canvas: 1728 × 1117 ───────────────────────────────────────────────
const CANVAS_W = 1728;
const CANVAS_H = 1117;

const EYES = {
  left:  { cx: 707.5,  cy: 392.3, pathW: 71.5877, pathH: 73.8855, imgW: 72, imgH: 74 },
  right: { cx: 1010.3, cy: 391.4, pathW: 70.0345, pathH: 71.3383, imgW: 70, imgH: 71 },
} as const;

const SVG_MASK = {
  canvasX: 634.141, canvasY: 355.36,
  svgW:    411.144, svgH:    522.737,
} as const;

type Side = "left" | "right";

// ─── Map Figma canvas coordinates to viewport using "cover" scaling ──────────
// Maintains aspect ratio so SVG masks don't distort on any viewport shape
function canvasToViewport(canvasX: number, canvasY: number) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const scale = Math.max(w / CANVAS_W, h / CANVAS_H);
  const offsetX = (w - CANVAS_W * scale) / 2;
  const offsetY = (h - CANVAS_H * scale) / 2;
  return {
    x: canvasX * scale + offsetX,
    y: canvasY * scale + offsetY,
    scale,
  };
}

// ─── Shared helper: set CSS mask with explicit pixel values ─────────────────
function setMask(el: HTMLDivElement, img: string, pos: string, size: string) {
  el.style.maskImage    = img;
  el.style.maskPosition = pos;
  el.style.maskSize     = size;
  el.style.maskRepeat   = "no-repeat";
  el.style.setProperty("-webkit-mask-image",    img);
  el.style.setProperty("-webkit-mask-position", pos);
  el.style.setProperty("-webkit-mask-size",     size);
  el.style.setProperty("-webkit-mask-repeat",   "no-repeat");
}

// Layer B: single eye shape, scales on scroll
function applyEyeMask(el: HTMLDivElement, side: Side, scrollScale: number) {
  const eye = EYES[side];
  const { x: cx, y: cy, scale } = canvasToViewport(eye.cx, eye.cy);
  const sw = eye.pathW * scale * scrollScale;
  const sh = eye.pathH * scale * scrollScale;
  setMask(
    el,
    `url('/eye-${side}.svg')`,
    `${(cx - sw / 2).toFixed(1)}px ${(cy - sh / 2).toFixed(1)}px`,
    `${sw.toFixed(1)}px ${sh.toFixed(1)}px`,
  );
}

// Layer A: full face features (both eyes + mouth) via CSS mask-image
// Note: Layer A container has inset: -20px, so add 20px offset to position
function applyFeaturesMask(el: HTMLDivElement) {
  const { x, y, scale } = canvasToViewport(SVG_MASK.canvasX, SVG_MASK.canvasY);
  const sw = SVG_MASK.svgW * scale;
  const sh = SVG_MASK.svgH * scale;
  setMask(
    el,
    "url('/mask-cutouts.svg')",
    `${(x + 20).toFixed(1)}px ${(y + 20).toFixed(1)}px`,
    `${sw.toFixed(1)}px ${sh.toFixed(1)}px`,
  );
}

export default function HeroSection() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const layerARef     = useRef<HTMLDivElement>(null);
  const layerBRef     = useRef<HTMLDivElement>(null);
  const activeSideRef = useRef<Side>("left");
  const maxScaleRef   = useRef(120);
  const [activeSide, setActiveSide] = useState<Side>("left");
  const [masksReady, setMasksReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ── Scroll-linked animation ───────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const clipScale = useTransform(scrollYProgress, (p) => {
    return 1 + p * (maxScaleRef.current - 1);
  });

  const layerAOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // ── Mouse/touch parallax ──────────────────────────────────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springCfg = { stiffness: 120, damping: 25, mass: 0.5 };
  const smoothX = useSpring(mouseX, springCfg);
  const smoothY = useSpring(mouseY, springCfg);

  // Parallax intensity scales down on mobile
  const pScale = isMobile ? 0.5 : 1;

  // Layer A (mask features): subtle shift, fades out on scroll
  const maskParallaxX = useTransform([smoothX, scrollYProgress] as const, ([mx, sp]: number[]) =>
    mx * 14 * pScale * Math.max(0, 1 - sp * 4)
  );
  const maskParallaxY = useTransform([smoothY, scrollYProgress] as const, ([my, sp]: number[]) =>
    my * 10 * pScale * Math.max(0, 1 - sp * 4)
  );

  // Eye decos: more movement (closer to viewer)
  const decoParallaxX = useTransform([smoothX, scrollYProgress] as const, ([mx, sp]: number[]) =>
    mx * 22 * pScale * Math.max(0, 1 - sp * 4)
  );
  const decoParallaxY = useTransform([smoothY, scrollYProgress] as const, ([my, sp]: number[]) =>
    my * 16 * pScale * Math.max(0, 1 - sp * 4)
  );

  // Background image: slow scroll parallax, stops once fully scrolled in
  const bgParallaxY = useTransform(scrollYProgress, [0, 0.5, 1], [0, -80, -80]);

  useMotionValueEvent(clipScale, "change", (s) => {
    if (layerBRef.current) {
      applyEyeMask(layerBRef.current, activeSideRef.current, s);
    }
  });

  const computeMaxScale = useCallback(() => {
    const diag = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
    const { scale } = canvasToViewport(0, 0);
    const minHalf = Math.min(EYES.left.pathW, EYES.left.pathH) * scale / 2;
    maxScaleRef.current = Math.ceil((diag * 1.5) / minHalf);
  }, []);

  useEffect(() => {
    const mobile = window.innerWidth < 768 || "ontouchstart" in window;
    setIsMobile(mobile);
    computeMaxScale();

    if (layerARef.current) applyFeaturesMask(layerARef.current);
    if (layerBRef.current) applyEyeMask(layerBRef.current, "left", 1);
    setMasksReady(true);

    // ── Pointer handler (works for both mouse and touch) ──────────────────
    const handlePointer = (clientX: number, clientY: number) => {
      const nx = (clientX / window.innerWidth)  * 2 - 1;
      const ny = (clientY / window.innerHeight) * 2 - 1;
      mouseX.set(nx);
      mouseY.set(ny);

      const side: Side = clientX < window.innerWidth / 2 ? "left" : "right";
      if (side === activeSideRef.current) return;
      activeSideRef.current = side;
      setActiveSide(side);
      const s = clipScale.get();
      if (layerBRef.current) applyEyeMask(layerBRef.current, side, s);
    };

    const onMouseMove = (e: MouseEvent) => handlePointer(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) handlePointer(t.clientX, t.clientY);
    };

    const onResize = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
      computeMaxScale();
      if (layerARef.current) applyFeaturesMask(layerARef.current);
      const s = clipScale.get();
      if (layerBRef.current) applyEyeMask(layerBRef.current, activeSideRef.current, s);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
    };
  }, [clipScale, computeMaxScale]);

  return (
    <section ref={containerRef} style={{ height: "200vh", position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

        {/* Dark background */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 80% at 50% 40%, #1a1a1a 0%, #000 100%)",
        }} />

        {/* ── Layer B: eye-shaped mask that expands on scroll ─────────────── */}
        <div ref={layerBRef} style={{ position: "absolute", inset: 0, visibility: masksReady ? "visible" : "hidden" }}>
          <motion.div style={{ position: "absolute", inset: "-60px 0", y: bgParallaxY }}>
            <Image
              src="/hero.webp"
              alt="Baranjske buše mask"
              fill
              style={{
                objectFit: "cover", objectPosition: "center 40%",
                opacity: activeSide === "right" ? 1 : 0,
                transition: "opacity 0.6s ease",
              }}
              priority
            />
            <Image
              src="/hero-left.webp"
              alt="Baranjske buše mask"
              fill
              style={{
                objectFit: "cover", objectPosition: "center 40%",
                opacity: activeSide === "left" ? 1 : 0,
                transition: "opacity 0.6s ease",
              }}
              priority
            />
          </motion.div>
        </div>

        {/* ── Layer A: full features mask (eyes + mouth) via CSS mask-image ── */}
        <motion.div
          ref={layerARef}
          style={{
            position: "absolute",
            inset: "-20px",
            opacity: layerAOpacity,
            visibility: masksReady ? "visible" : "hidden",
            x: maskParallaxX,
            y: maskParallaxY,
          }}
        >
          <Image
            src="/hero.webp"
            alt=""
            fill
            style={{
              objectFit: "cover", objectPosition: "center 40%",
              opacity: activeSide === "right" ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
            aria-hidden
          />
          <Image
            src="/hero-left-mask.webp"
            alt=""
            fill
            style={{
              objectFit: "cover", objectPosition: "center 40%",
              opacity: activeSide === "left" ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
            aria-hidden
          />
        </motion.div>

        {/* ── Eye glow highlights ─────────────────────────────────────────── */}
        <EyeGlowLayer
          activeSide={activeSide}
          layerAOpacity={layerAOpacity}
          decoParallaxX={decoParallaxX}
          decoParallaxY={decoParallaxY}
        />

        {/* ── Bottom gradient vignette ─────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: "30%",
            background: "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* ── Scroll hint ───────────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute", bottom: "2.5rem",
            width: "100%", textAlign: "center",
            fontSize: "0.7rem", letterSpacing: "0.25em",
            textTransform: "uppercase", whiteSpace: "nowrap",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-namu-title, sans-serif)",
          }}
        >
          Scroll to reveal
        </motion.p>

      </div>
    </section>
  );
}

// ─── Eye glow decorations — uses canvasToViewport for consistent positioning ─
function EyeGlowLayer({
  activeSide,
  layerAOpacity,
  decoParallaxX,
  decoParallaxY,
}: {
  activeSide: Side;
  layerAOpacity: MotionValue<number>;
  decoParallaxX: MotionValue<number>;
  decoParallaxY: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState({ leftX: 0, leftY: 0, rightX: 0, rightY: 0, leftW: 72, leftH: 74, rightW: 70, rightH: 71 });

  useEffect(() => {
    function update() {
      const left = canvasToViewport(EYES.left.cx, EYES.left.cy);
      const right = canvasToViewport(EYES.right.cx, EYES.right.cy);
      setPositions({
        leftX: left.x + 20,
        leftY: left.y + 20,
        rightX: right.x + 20,
        rightY: right.y + 20,
        leftW: EYES.left.imgW * left.scale,
        leftH: EYES.left.imgH * left.scale,
        rightW: EYES.right.imgW * right.scale,
        rightH: EYES.right.imgH * right.scale,
      });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <motion.div ref={ref} style={{ position: "absolute", inset: "-20px", opacity: layerAOpacity, mixBlendMode: "screen", x: decoParallaxX, y: decoParallaxY }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src="/eye-left.svg" alt=""
        animate={{
          opacity: activeSide === "left" ? 0.22 : 0.04,
          filter: activeSide === "left"
            ? "drop-shadow(0 0 18px rgba(255,255,255,0.7)) blur(1px)"
            : "drop-shadow(0 0 0px rgba(255,255,255,0)) blur(0px)",
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          position: "absolute",
          left: positions.leftX,
          top: positions.leftY,
          width: positions.leftW,
          height: positions.leftH,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src="/eye-right.svg" alt=""
        animate={{
          opacity: activeSide === "right" ? 0.22 : 0.04,
          filter: activeSide === "right"
            ? "drop-shadow(0 0 18px rgba(255,255,255,0.7)) blur(1px)"
            : "drop-shadow(0 0 0px rgba(255,255,255,0)) blur(0px)",
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          position: "absolute",
          left: positions.rightX,
          top: positions.rightY,
          width: positions.rightW,
          height: positions.rightH,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}
