"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SOUNDS = [
  { src: "/audio/bells.wav",        vol: 0.55 },
  { src: "/audio/busa_trimmed.mp3", vol: 0.75 },
  { src: "/audio/busa2.mp3",        vol: 0.70 },
] as const;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

// Module-level — survives strict mode
let audioEls: HTMLAudioElement[] = [];
let playing = false;
let scrollStopped = false;
let userMuted = false;
let scheduler: ReturnType<typeof setTimeout> | null = null;
let volScale = 1;
let lastPlayed = -1;
let setMutedFn: ((m: boolean) => void) | null = null;

function ensureAudio() {
  if (audioEls.length === 0) {
    audioEls = SOUNDS.map((s) => { const a = new Audio(s.src); a.preload = "auto"; return a; });
  }
}

function playIndex(idx: number): Promise<void> {
  const audio = audioEls[idx];
  audio.volume = rand(SOUNDS[idx].vol * 0.8, SOUNDS[idx].vol) * volScale;
  audio.playbackRate = rand(0.96, 1.04);
  audio.currentTime = 0;
  lastPlayed = idx;
  return audio.play().catch(() => {});
}

function pickRandom(): number {
  let idx: number;
  do { idx = Math.floor(Math.random() * audioEls.length); } while (idx === lastPlayed);
  return idx;
}

function scheduleNext(step: number) {
  if (userMuted || scrollStopped) return;
  scheduler = setTimeout(() => {
    if (userMuted || scrollStopped || audioEls.length === 0) return;
    const idx = step < SOUNDS.length ? step : pickRandom();
    playIndex(idx).then(() => {
      const audio = audioEls[idx];
      const onEnded = () => {
        audio.removeEventListener("ended", onEnded);
        scheduleNext(step + 1);
      };
      audio.addEventListener("ended", onEnded);
    });
  }, rand(3000, 5000));
}

function doStart(): boolean {
  if (playing || userMuted) return false;
  ensureAudio();
  const bells = audioEls[0];
  bells.volume = SOUNDS[0].vol * volScale;
  bells.playbackRate = rand(0.96, 1.04);
  bells.currentTime = 0;
  lastPlayed = 0;
  bells.play().then(() => {
    playing = true;
    setMutedFn?.(false);
    const onEnded = () => {
      bells.removeEventListener("ended", onEnded);
      scheduleNext(1);
    };
    bells.addEventListener("ended", onEnded);
  }).catch(() => {});
  return true;
}

function stopAll() {
  if (scheduler) { clearTimeout(scheduler); scheduler = null; }
  audioEls.forEach((a) => { a.pause(); a.currentTime = 0; });
}

function resumeSequence() {
  if (!playing || userMuted) return;
  scheduleNext(SOUNDS.length);
}

// Single global listener — set up once, never cleaned up by React
let listenerAttached = false;
function attachGlobalListener() {
  if (listenerAttached) return;
  listenerAttached = true;

  const handler = (e: Event) => {
    if (playing) {
      remove();
      return;
    }
    doStart();
    // Check after a tick if play succeeded
    setTimeout(() => {
      if (playing) remove();
    }, 100);
  };

  const remove = () => {
    ["scroll", "wheel", "click", "touchstart", "touchend", "keydown", "pointerdown"].forEach((e) => {
      window.removeEventListener(e, handler, true);
    });
  };

  ["scroll", "wheel", "click", "touchstart", "touchend", "keydown", "pointerdown"].forEach((e) => {
    window.addEventListener(e, handler, { capture: true, passive: true });
  });
}

export default function AmbientAudio() {
  const [muted, setMuted] = useState(true);
  const [showEnter, setShowEnter] = useState(true);

  const handleEnter = () => {
    doStart();
    setShowEnter(false);
  };

  // Hide enter screen if audio started via global listener
  useEffect(() => {
    if (!muted && showEnter) setShowEnter(false);
  }, [muted, showEnter]);

  useEffect(() => {
    setMutedFn = setMuted;
    ensureAudio();

    // Try autoplay
    doStart();

    // Fallback: global listener (module-level, not affected by strict mode cleanup)
    attachGlobalListener();

    // Scroll fade
    const onScroll = () => {
      if (audioEls.length === 0 || !playing || userMuted) return;
      const vh = window.innerHeight;
      const fadeStart = vh * 0.8;
      const fadeEnd = vh * 1.2;
      const y = window.scrollY;

      if (y <= fadeStart) {
        volScale = 1;
        if (scrollStopped) {
          scrollStopped = false;
          resumeSequence();
          setMuted(false);
        }
        audioEls.forEach((a, i) => { if (!a.paused) a.volume = SOUNDS[i].vol; });
      } else if (y < fadeEnd) {
        const t = 1 - (y - fadeStart) / (fadeEnd - fadeStart);
        volScale = t;
        if (scrollStopped) {
          scrollStopped = false;
          resumeSequence();
          setMuted(false);
        }
        audioEls.forEach((a, i) => { if (!a.paused) a.volume = SOUNDS[i].vol * t; });
      } else if (!scrollStopped) {
        scrollStopped = true;
        stopAll();
        playing = true;
        setMuted(true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggle = () => {
    ensureAudio();
    if (!muted) {
      userMuted = true;
      stopAll();
      playing = true;
      setMuted(true);
    } else {
      userMuted = false;
      scrollStopped = false;
      volScale = 1;
      if (playing) {
        resumeSequence();
        setMuted(false);
      } else {
        doStart();
      }
    }
  };

  const bars = [0, 1, 2, 3];

  return (
    <>
    {/* Enter overlay */}
    <AnimatePresence>
      {showEnter && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleEnter}
          onTouchStart={handleEnter}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 0.5, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "var(--font-namu-title, sans-serif)",
              fontSize: "0.75rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Click to enter
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>

    <button
      onClick={toggle}
      aria-label={muted ? "Unmute ambient audio" : "Mute ambient audio"}
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 100,
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "50%",
        width: 44,
        height: 44,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        transition: "background 0.3s, border-color 0.3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.12)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
      }}
    >
      {bars.map((i) => (
        <motion.span
          key={i}
          animate={
            !muted
              ? { height: [4, 10 + i * 3, 6, 14 - i * 2, 4] }
              : { height: 4 }
          }
          transition={
            !muted
              ? { duration: 0.8 + i * 0.15, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3 }
          }
          style={{
            display: "block",
            width: 2.5,
            borderRadius: 2,
            background: "rgba(255,255,255,0.5)",
          }}
        />
      ))}
    </button>
    </>
  );
}
