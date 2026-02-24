"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import Image from "next/image";

// ─── Figma canvas: 1728 × 1117 ───────────────────────────────────────────────
const EYES = {
  left:  { vcx: 707.5  / 1728, vcy: 392.3 / 1117, pathW: 71.5877, pathH: 73.8855, imgW: 72, imgH: 74 },
  right: { vcx: 1010.3 / 1728, vcy: 391.4 / 1117, pathW: 70.0345, pathH: 71.3383, imgW: 70, imgH: 71 },
} as const;

const SVG_MASK = {
  canvasX: 634.141, canvasY: 355.36,
  svgW:    411.144, svgH:    522.737,
  canvasW: 1728,    canvasH: 1117,
} as const;

type Side = "left" | "right";

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
function applyEyeMask(el: HTMLDivElement, side: Side, scale: number) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const eye = EYES[side];
  const cx = eye.vcx * w;
  const cy = eye.vcy * h;
  const sw = eye.pathW * scale;
  const sh = eye.pathH * scale;
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
  const w = window.innerWidth;
  const h = window.innerHeight;
  const scaleX = w / SVG_MASK.canvasW;
  const scaleY = h / SVG_MASK.canvasH;
  const x  = SVG_MASK.canvasX * scaleX + 20;
  const y  = SVG_MASK.canvasY * scaleY + 20;
  const sw = SVG_MASK.svgW * scaleX;
  const sh = SVG_MASK.svgH * scaleY;
  setMask(
    el,
    "url('/mask-cutouts.svg')",
    `${x.toFixed(1)}px ${y.toFixed(1)}px`,
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

  // ── Scroll-linked animation ───────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const clipScale = useTransform(scrollYProgress, (p) => {
    return 1 + p * (maxScaleRef.current - 1);
  });

  const layerAOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // ── Mouse parallax ──────────────────────────────────────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springCfg = { stiffness: 120, damping: 25, mass: 0.5 };
  const smoothX = useSpring(mouseX, springCfg);
  const smoothY = useSpring(mouseY, springCfg);

  // Layer A (mask features): subtle shift, fades out on scroll
  const maskParallaxX = useTransform([smoothX, scrollYProgress] as const, ([mx, sp]: number[]) =>
    mx * 14 * Math.max(0, 1 - sp * 4)
  );
  const maskParallaxY = useTransform([smoothY, scrollYProgress] as const, ([my, sp]: number[]) =>
    my * 10 * Math.max(0, 1 - sp * 4)
  );

  // Eye decos: more movement (closer to viewer)
  const decoParallaxX = useTransform([smoothX, scrollYProgress] as const, ([mx, sp]: number[]) =>
    mx * 22 * Math.max(0, 1 - sp * 4)
  );
  const decoParallaxY = useTransform([smoothY, scrollYProgress] as const, ([my, sp]: number[]) =>
    my * 16 * Math.max(0, 1 - sp * 4)
  );

  // Background image: slow scroll parallax, stops once fully scrolled in
  const bgParallaxY = useTransform(scrollYProgress, [0, 0.5, 1], [0, -80, -80]);

  useMotionValueEvent(clipScale, "change", (s) => {
    if (layerBRef.current) {
      applyEyeMask(layerBRef.current, activeSideRef.current, s);
    }
  });

  function computeMaxScale() {
    const diag = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
    const minHalf = Math.min(EYES.left.pathW, EYES.left.pathH) / 2;
    maxScaleRef.current = Math.ceil((diag * 1.5) / minHalf);
  }

  useEffect(() => {
    computeMaxScale();

    if (layerARef.current) applyFeaturesMask(layerARef.current);
    if (layerBRef.current) applyEyeMask(layerBRef.current, "left", 1);
    setMasksReady(true);

    const onMouseMove = (e: MouseEvent) => {
      // Parallax: normalized -1 to 1 from viewport centre
      const nx = (e.clientX / window.innerWidth)  * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(nx);
      mouseY.set(ny);

      // Eye side switching
      const side: Side = e.clientX < window.innerWidth / 2 ? "left" : "right";
      if (side === activeSideRef.current) return;
      activeSideRef.current = side;
      setActiveSide(side);
      const s = clipScale.get();
      if (layerBRef.current) applyEyeMask(layerBRef.current, side, s);
    };

    const onResize = () => {
      computeMaxScale();
      if (layerARef.current) applyFeaturesMask(layerARef.current);
      const s = clipScale.get();
      if (layerBRef.current) applyEyeMask(layerBRef.current, activeSideRef.current, s);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, [clipScale]);

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
              src="/hero.png"
              alt="Baranjske buše mask"
              fill
              style={{ objectFit: "cover", objectPosition: "center 40%" }}
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
            src="/hero.png"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center 40%" }}
            aria-hidden
          />
        </motion.div>

        {/* ── Eye glow highlights ─────────────────────────────────────────── */}
        <motion.div style={{ position: "absolute", inset: "-20px", opacity: layerAOpacity, mixBlendMode: "screen", x: decoParallaxX, y: decoParallaxY }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src="/eye-left.svg" alt=""
            width={EYES.left.imgW} height={EYES.left.imgH}
            animate={{
              opacity: activeSide === "left" ? 0.22 : 0.04,
              filter: activeSide === "left"
                ? "drop-shadow(0 0 18px rgba(255,255,255,0.7)) blur(1px)"
                : "drop-shadow(0 0 0px rgba(255,255,255,0)) blur(0px)",
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: `calc(${EYES.left.vcx * 100}vw + 20px)`,
              top:  `calc(${EYES.left.vcy * 100}vh + 20px)`,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src="/eye-right.svg" alt=""
            width={EYES.right.imgW} height={EYES.right.imgH}
            animate={{
              opacity: activeSide === "right" ? 0.22 : 0.04,
              filter: activeSide === "right"
                ? "drop-shadow(0 0 18px rgba(255,255,255,0.7)) blur(1px)"
                : "drop-shadow(0 0 0px rgba(255,255,255,0)) blur(0px)",
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: `calc(${EYES.right.vcx * 100}vw + 20px)`,
              top:  `calc(${EYES.right.vcy * 100}vh + 20px)`,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />
        </motion.div>

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
