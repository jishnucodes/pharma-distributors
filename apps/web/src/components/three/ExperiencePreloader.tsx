"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowDown } from "lucide-react";

interface Props {
  progress: number; // 0 to 1
  statusText: string;
  isReady: boolean;
  onSkip?: () => void;
}

export function ExperiencePreloader({ progress, statusText, isReady, onSkip }: Props) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [seenBefore, setSeenBefore] = useState(false);
  const targetRef = useRef(progress);
  targetRef.current = progress;

  // Check if user already saw the intro during this browser tab session
  useEffect(() => {
    try {
      if (sessionStorage.getItem("lk_spatial_loaded")) {
        setSeenBefore(true);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  // Smooth lerp of progress display (so progress ticks smoothly across 0..100)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setDisplayProgress((prev) => {
        const target = targetRef.current * 100;
        const diff = target - prev;
        if (Math.abs(diff) < 0.3) return target;
        // Faster catchup when target jumps to 100
        const speed = target >= 100 ? 0.25 : 0.12;
        return prev + diff * speed;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Handle ready state exit transition
  useEffect(() => {
    if (isReady && displayProgress >= 95) {
      try {
        sessionStorage.setItem("lk_spatial_loaded", "1");
      } catch {
        // ignore
      }

      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        const hideTimer = setTimeout(() => {
          setHidden(true);
        }, 700);
        return () => clearTimeout(hideTimer);
      }, seenBefore ? 60 : 250);

      return () => clearTimeout(exitTimer);
    }
  }, [isReady, displayProgress, seenBefore]);

  if (hidden) return null;

  const pct = Math.min(100, Math.max(0, Math.round(displayProgress)));

  return (
    <div
      aria-label="Loading 3D Experience"
      aria-live="polite"
      className={`absolute inset-0 z-40 flex flex-col items-center justify-center bg-paper/95 backdrop-blur-md transition-all duration-700 ease-out ${
        isExiting ? "pointer-events-none opacity-0 scale-[0.98]" : "opacity-100 scale-100"
      }`}
    >
      {/* Background ambient radial glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 48%, rgba(14,124,112,0.12) 0%, rgba(36,80,200,0.10) 40%, transparent 70%)",
        }}
      />

      <div className="flex w-full max-w-sm flex-col items-center px-6 text-center">
        {/* Animated 3D Dual-Capsule Wireframe Graphic */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="relative flex items-center -rotate-[28deg]">
            {/* Left cap - Lakshmi teal */}
            <div className="relative h-14 w-20 overflow-hidden rounded-l-full border border-lakshmi/40 bg-gradient-to-r from-lakshmi to-lakshmi/80 shadow-[0_0_24px_rgba(14,124,112,0.35)] animate-pulse">
              <span className="absolute inset-y-0 right-1 w-2 border-r border-white/20" />
            </div>

            {/* Granule burst seam / core spark */}
            <div className="relative mx-1 h-12 w-2.5 rounded-full bg-white/70 shadow-[0_0_12px_#ffffff] transition-all duration-500">
              <span className="absolute -inset-1 animate-ping rounded-full bg-white/30" />
            </div>

            {/* Right cap - Kothottil blue */}
            <div className="relative h-14 w-20 overflow-hidden rounded-r-full border border-kothottil/40 bg-gradient-to-r from-kothottil/80 to-kothottil shadow-[0_0_24px_rgba(36,80,200,0.35)] animate-pulse">
              <span className="absolute inset-y-0 left-1 w-2 border-l border-white/20" />
            </div>
          </div>
        </div>

        {/* Progress percent counter */}
        <div className="font-mono text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {pct.toString().padStart(3, "0")}
          <span className="text-sm font-semibold text-ink-mute ml-1">%</span>
        </div>

        {/* Dynamic status readout */}
        <p className="mt-2 h-5 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
          {pct === 100 ? "Experience Ready" : statusText || "Initialising Spatial Engine"}
        </p>

        {/* Progress bar line */}
        <div className="relative mt-5 h-1.5 w-full overflow-hidden rounded-full bg-line/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-lakshmi via-teal-400 to-kothottil shadow-sm transition-all duration-150 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Network descriptor */}
        <p className="mt-4 text-xs text-ink-mute">
          Lakshmi Pharma · The Kothottil Distributor
        </p>

        {/* Instant Skip CTA */}
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink transition-colors underline-offset-4 hover:underline"
          >
            <span>Skip 3D intro directly to catalogue</span>
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

