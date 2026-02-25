"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
/* eslint-disable @next/next/no-img-element */

const GOLD = "rgba(201,168,76,0.9)";
const GOLD_DIM = "rgba(201,168,76,0.5)";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE },
  },
};

const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const STATS = [
  { num: "300+",  label: "Years of tradition" },
  { num: "7",     label: "Villages keeping the rite" },
  { num: "100+",  label: "Masked buše" },
];

// w:h → 854:1280 = portrait (2:3), 1280:854 = landscape (3:2)
const GALLERY: { src: string; w: number; h: number }[] = [
  { src: "/gallery/mask-closeup-horns.jpg",       w: 854, h: 1280 },
  { src: "/gallery/troupe-hilltop-group.jpg",      w: 1280, h: 854 },
  { src: "/gallery/tambura-musicians.jpg",         w: 1280, h: 854 },
  { src: "/gallery/bonfire-silhouette.jpg",        w: 854, h: 1280 },
  { src: "/gallery/busa-profile-sheepskin.jpg",    w: 854, h: 1280 },
  { src: "/gallery/carnival-bride-flowers.jpg",    w: 854, h: 1280 },
  { src: "/gallery/busa-noisemaker-dust.jpg",      w: 854, h: 1280 },
  { src: "/gallery/busa-cattle-horns-club.jpg",    w: 854, h: 1280 },
  { src: "/gallery/village-courtyard-group.jpg",   w: 1280, h: 854 },
  { src: "/gallery/folk-costume-detail.jpg",       w: 854, h: 1280 },
  { src: "/gallery/woman-folk-dress-smile.jpg",    w: 854, h: 1280 },
  { src: "/gallery/straw-hood-mask.jpg",           w: 854, h: 1280 },
  { src: "/gallery/group-dusk-path.jpg",           w: 1280, h: 854 },
  { src: "/gallery/coin-sequin-veil.jpg",          w: 854, h: 1280 },
  { src: "/gallery/lace-veil-beadwork.jpg",        w: 1280, h: 854 },
  { src: "/gallery/mask-front-carved.jpg",         w: 854, h: 1280 },
  { src: "/gallery/busa-antler-grin.jpg",          w: 854, h: 1280 },
  { src: "/gallery/improvised-busa-burlap.jpg",    w: 854, h: 1280 },
  { src: "/gallery/langos-fried-dough.jpg",        w: 854, h: 1280 },
  { src: "/gallery/kulen-feast-plate.jpg",         w: 854, h: 1280 },
  { src: "/gallery/busa-doughnut-sky.jpg",         w: 854, h: 1280 },
  { src: "/gallery/rakija-sip.jpg",                w: 854, h: 1280 },
  { src: "/gallery/sequin-headdress-glasses.jpg",  w: 854, h: 1280 },
  { src: "/gallery/man-floral-headscarf.jpg",      w: 854, h: 1280 },
  { src: "/gallery/carnival-jokester.jpg",         w: 854, h: 1280 },
  { src: "/gallery/kulen-charcuterie.jpg",         w: 854, h: 1280 },
];

export default function ContentSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-12%" });

  return (
    <section
      ref={ref}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "8rem 2rem",
        background: "#000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Atmospheric radial glow */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(60,35,10,0.4) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate={isInView ? "animate" : "initial"}
        style={{ maxWidth: "680px", width: "100%", textAlign: "center", position: "relative" }}
      >

        {/* ── Ornamental rule ─────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "3.5rem", justifyContent: "center" }}
        >
          <div style={{ height: 1, width: 56, background: GOLD_DIM }} />
          <span style={{
            color: GOLD_DIM,
            fontSize: "0.6rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            fontFamily: "var(--font-namu-title, sans-serif)",
          }}>
            Est. Antiquity
          </span>
          <div style={{ height: 1, width: 56, background: GOLD_DIM }} />
        </motion.div>

        {/* ── Logo heading ────────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          style={{ marginBottom: "2rem", display: "flex", justifyContent: "center" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-full.svg"
            alt="Baranjske buše"
            role="heading"
            aria-level={1}
            style={{
              width: "min(70vw, 420px)",
              height: "auto",
            }}
          />
        </motion.div>

        {/* ── Subtitle ─────────────────────────────────────────────────────── */}
        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-namu-title, sans-serif)",
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            color: GOLD,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "3rem",
          }}
        >
          The masked rite of Croatian Baranja
        </motion.p>

        {/* ── Body copy ────────────────────────────────────────────────────── */}
        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-namu, sans-serif)",
            fontSize: "clamp(1.1rem, 1.8vw, 1.35rem)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.95,
            marginBottom: "4.5rem",
          }}
        >
          Willow-wood masks, sheepskin cloaks, and the thundering of cowbells
          through the villages of Baranja. Each winter, the buše rise to drive away
          the cold — a Šokci tradition rooted in the Croatian Danube plains,
          passed down through generations as a living act of identity and defiance.
        </motion.p>

        {/* ── Stats row ────────────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingTop: "3rem",
          }}
        >
          {STATS.map(({ num, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "var(--font-namu-title, sans-serif)",
                fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                fontWeight: 400,
                color: GOLD,
                letterSpacing: "0.02em",
                lineHeight: 1,
                marginBottom: "0.6rem",
              }}>
                {num}
              </div>
              <div style={{
                fontFamily: "var(--font-namu, sans-serif)",
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}>
                {label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Pull quote ───────────────────────────────────────────────────── */}
        <motion.blockquote
          variants={fadeUp}
          style={{
            marginTop: "5rem",
            paddingTop: "3.5rem",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            fontFamily: "var(--font-namu-title, sans-serif)",
            fontStyle: "italic",
            fontSize: "clamp(1.3rem, 2.5vw, 1.75rem)",
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.7,
          }}
        >
          &ldquo;The mask does not hide the face — it reveals what winter fears.&rdquo;
        </motion.blockquote>

      </motion.div>

      {/* ── Image Gallery ──────────────────────────────────────────────────── */}
      <GallerySection />
    </section>
  );
}

/* ─── Gallery sub-component ────────────────────────────────────────────────── */

function GallerySection() {
  const labelRef = useRef<HTMLDivElement>(null);
  const labelInView = useInView(labelRef, { once: true, margin: "-8%" });

  return (
    <div
      style={{
        marginTop: "6rem",
        width: "100%",
        maxWidth: "1100px",
        position: "relative",
      }}
    >
      {/* Section label */}
      <motion.div
        ref={labelRef}
        variants={fadeUp}
        initial="initial"
        animate={labelInView ? "animate" : "initial"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          justifyContent: "center",
          marginBottom: "3rem",
        }}
      >
        <div style={{ height: 1, width: 56, background: GOLD_DIM }} />
        <span
          style={{
            color: GOLD_DIM,
            fontSize: "0.6rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            fontFamily: "var(--font-namu-title, sans-serif)",
          }}
        >
          Gallery
        </span>
        <div style={{ height: 1, width: 56, background: GOLD_DIM }} />
      </motion.div>

      {/* Masonry via CSS columns */}
      <div
        className="columns-2 md:columns-3"
        style={{ columnGap: "0.75rem" }}
      >
        {GALLERY.map((item) => (
          <GalleryItem key={item.src} item={item} />
        ))}
      </div>
    </div>
  );
}

/* ─── Individual gallery item (own useInView for staggered reveal) ─────────── */

function GalleryItem({ item }: { item: (typeof GALLERY)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-5%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.97 }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{
        breakInside: "avoid",
        marginBottom: "0.75rem",
        borderRadius: "2px",
        overflow: "hidden",
      }}
    >
      <img
        src={item.src}
        alt=""
        width={item.w}
        height={item.h}
        loading="lazy"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          aspectRatio: `${item.w} / ${item.h}`,
          background: "rgba(255,255,255,0.03)",
          transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLImageElement).style.transform = "scale(1)";
        }}
      />
    </motion.div>
  );
}
