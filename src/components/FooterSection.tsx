"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const GOLD_DIM = "rgba(201,168,76,0.5)";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function FooterSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <footer
      ref={ref}
      style={{
        position: "relative",
        padding: "4rem 2rem 2.5rem",
        background: "#000",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: EASE }}
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2.5rem",
        }}
      >
        {/* Logo icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-icon.svg"
          alt=""
          style={{ width: 36, height: "auto", opacity: 0.4 }}
        />

        {/* Nav links */}
        <nav
          style={{
            display: "flex",
            gap: "2.5rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["Tradition", "Gallery", "Contact"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              style={{
                fontFamily: "var(--font-namu-title, sans-serif)",
                fontSize: "0.65rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                textDecoration: "none",
                transition: "color 0.3s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = GOLD_DIM;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.35)";
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Divider */}
        <div style={{ height: 1, width: 56, background: "rgba(255,255,255,0.06)" }} />

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-namu, sans-serif)",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.2)",
              textAlign: "center",
            }}
          >
            Baranjske buše &mdash; Croatian Baranja
          </p>
          <p
            style={{
              fontFamily: "var(--font-namu, sans-serif)",
              fontSize: "0.55rem",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.12)",
            }}
          >
            &copy; {new Date().getFullYear()}
          </p>
          <p
            style={{
              fontFamily: "var(--font-namu, sans-serif)",
              fontSize: "0.55rem",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.12)",
              marginTop: "0.25rem",
            }}
          >
            Made by{" "}
            <a
              href="https://foodara.net"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "rgba(255,255,255,0.25)",
                textDecoration: "none",
                transition: "color 0.3s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = GOLD_DIM;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.25)";
              }}
            >
              Foodara
            </a>
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
