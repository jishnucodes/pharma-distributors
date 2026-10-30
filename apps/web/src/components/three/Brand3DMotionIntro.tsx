"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowDown } from "lucide-react";

interface Props {
  isReady: boolean;
  onSkip?: () => void;
}

export function Brand3DMotionIntro({ isReady, onSkip }: Props) {
  // Synchronous initial check to avoid flash on return visits
  const [alreadySeen] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !!sessionStorage.getItem("lk_brand_intro_seen");
    } catch {
      return false;
    }
  });

  const [phase, setPhase] = useState<"enter" | "active" | "flythrough" | "hidden">(
    alreadySeen ? "hidden" : "enter"
  );
  const [smoothedMouse, setSmoothedMouse] = useState({ x: 0, y: 0 });
  const mousePosRef = useRef({ x: 0, y: 0 });

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem("lk_brand_intro_seen", "1");
    } catch {
      // ignore
    }
    setPhase("flythrough");
    setTimeout(() => {
      setPhase("hidden");
    }, 400);
  }, []);

  // Parallax tracking (pointermove supports both mouse and stylus)
  useEffect(() => {
    if (phase === "hidden") return;

    const onPointer = (e: PointerEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mousePosRef.current = {
        x: (e.clientX - cx) / cx,
        y: (e.clientY - cy) / cy,
      };
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  }, [phase]);

  // Smooth lerp
  useEffect(() => {
    if (phase === "hidden") return;

    let raf = 0;
    const lerp = () => {
      setSmoothedMouse((prev) => ({
        x: prev.x + (mousePosRef.current.x - prev.x) * 0.1,
        y: prev.y + (mousePosRef.current.y - prev.y) * 0.1,
      }));
      raf = requestAnimationFrame(lerp);
    };
    raf = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // Entrance timeline
  useEffect(() => {
    if (phase === "hidden") return;
    const t = setTimeout(() => setPhase("active"), 60);
    return () => clearTimeout(t);
  }, [phase]);

  // When WebGL is ready, transition out quickly
  useEffect(() => {
    if (phase === "hidden") return;

    if (isReady) {
      const t = setTimeout(() => {
        dismiss();
      }, 700);
      return () => clearTimeout(t);
    }
  }, [isReady, phase, dismiss]);

  // Fail-safe auto-dismiss: regardless of WebGL status, intro NEVER blocks the UI longer than 1.8s
  useEffect(() => {
    if (phase === "hidden") return;
    const maxTimer = setTimeout(() => {
      dismiss();
    }, 1800);
    return () => clearTimeout(maxTimer);
  }, [phase, dismiss]);

  // Auto-dismiss on wheel / touch scroll so scrolling is never locked
  useEffect(() => {
    if (phase === "hidden") return;
    const onScrollOrTouch = () => dismiss();
    window.addEventListener("wheel", onScrollOrTouch, { passive: true, once: true });
    window.addEventListener("touchmove", onScrollOrTouch, { passive: true, once: true });
    return () => {
      window.removeEventListener("wheel", onScrollOrTouch);
      window.removeEventListener("touchmove", onScrollOrTouch);
    };
  }, [phase, dismiss]);

  if (phase === "hidden") return null;

  const rotX = smoothedMouse.y * -10;
  const rotY = smoothedMouse.x * 12;

  return (
    <div
      onClick={dismiss}
      role="banner"
      aria-label="L & K Pharma Network presentation"
      className={`fixed inset-0 z-30 flex items-center justify-center overflow-hidden bg-paper/95 backdrop-blur-sm transition-all duration-500 ease-out cursor-pointer ${
        phase === "flythrough"
          ? "pointer-events-none opacity-0 scale-105"
          : "opacity-100 scale-100"
      }`}
      style={{ perspective: "1000px" }}
    >
      {/* Ambient background light */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(246,244,239,0.85) 50%, rgba(236,232,222,0.95) 100%)",
        }}
      />

      {/* Dual ambient brand auras (responsive sizes) */}
      <div
        className="pointer-events-none absolute h-64 w-64 sm:h-96 sm:w-96 rounded-full blur-[80px] opacity-25"
        style={{
          left: "15%",
          top: "25%",
          background: "#E11D48",
          transform: `translate3d(${smoothedMouse.x * 25}px, ${smoothedMouse.y * 25}px, 0)`,
        }}
      />
      <div
        className="pointer-events-none absolute h-64 w-64 sm:h-96 sm:w-96 rounded-full blur-[80px] opacity-25"
        style={{
          right: "15%",
          bottom: "25%",
          background: "#2450C8",
          transform: `translate3d(${smoothedMouse.x * -25}px, ${smoothedMouse.y * -25}px, 0)`,
        }}
      />

      {/* 3D Motion Stage */}
      <div
        className="relative flex w-full max-w-md flex-col items-center justify-center px-4 text-center will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        }}
      >
        {/* Floating Red & Blue Pill */}
        <div
          className="relative mb-4 flex items-center justify-center transition-all duration-700 ease-out"
          style={{
            transform: `translateZ(50px) ${
              phase === "enter" ? "scale(0.8) opacity-0" : "scale(1) opacity-100"
            }`,
          }}
        >
          <div className="relative flex items-center -rotate-[24deg] shadow-[0_12px_30px_rgba(19,34,31,0.15)]">
            <div className="h-9 w-14 sm:h-12 sm:w-18 rounded-l-full bg-gradient-to-br from-lakshmi to-lakshmi-deep" />
            <div className="h-7 w-1.5 sm:h-10 sm:w-2 bg-white shadow-[0_0_12px_#ffffff]" />
            <div className="h-9 w-14 sm:h-12 sm:w-18 rounded-r-full bg-gradient-to-br from-kothittil to-kothittil-deep" />
          </div>
        </div>

        {/* Monogram with 3D Depth */}
        <div
          className="relative transition-all duration-700 ease-out"
          style={{
            transform: `translateZ(80px) ${
              phase === "enter" ? "translateY(20px) opacity-0" : "translateY(0) opacity-100"
            }`,
          }}
        >
          <h1 className="font-display text-6xl font-bold tracking-tight text-ink sm:text-7xl md:text-8xl">
            <span>L</span>
            <span className="mx-2 font-sans font-light italic text-ink/30 sm:mx-3">&amp;</span>
            <span>K</span>
          </h1>
        </div>

        {/* Subtitle Badge */}
        <div
          className="mt-3 px-2 transition-all duration-700 delay-100 ease-out"
          style={{
            transform: `translateZ(60px) ${
              phase === "enter" ? "translateY(15px) opacity-0" : "translateY(0) opacity-100"
            }`,
          }}
        >
          <p className="font-mono text-[0.7rem] sm:text-xs font-semibold tracking-[0.12em] sm:tracking-[0.22em] text-ink-soft uppercase leading-snug">
            Pharmaceutical Distribution Network
          </p>
        </div>

        {/* Dual Partner Tags */}
        <div
          className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3 transition-all duration-700 delay-200 ease-out"
          style={{
            transform: `translateZ(40px) ${
              phase === "enter" ? "translateY(15px) opacity-0" : "translateY(0) opacity-100"
            }`,
          }}
        >
          <div className="flex items-center gap-1.5 rounded-full border border-lakshmi/30 bg-white/90 px-3 py-1 shadow-sm text-xs font-bold uppercase tracking-wider text-ink">
            <span className="h-2 w-2 rounded-full bg-lakshmi" />
            <span>Lakshmi</span>
          </div>

          <span className="text-xs font-semibold text-ink-mute">✕</span>

          <div className="flex items-center gap-1.5 rounded-full border border-kothittil/30 bg-white/90 px-3 py-1 shadow-sm text-xs font-bold uppercase tracking-wider text-ink">
            <span className="h-2 w-2 rounded-full bg-kothittil" />
            <span>Kothittil</span>
          </div>
        </div>

        {/* Quick tap indicator */}
        <p
          className="mt-6 text-[0.75rem] font-medium text-ink-mute sm:text-xs"
          style={{ transform: "translateZ(30px)" }}
        >
          Tap anywhere or scroll to explore ↓
        </p>
      </div>
    </div>
  );
}
