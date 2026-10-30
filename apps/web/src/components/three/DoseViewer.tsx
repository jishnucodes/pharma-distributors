"use client";

import { useEffect, useRef, useState } from "react";
import type { DoseViewerOptions, DoseViewerScene } from "./DoseViewerScene";
import { DoseIcon } from "@/components/ui/DoseIcon";

type Props = Omit<DoseViewerOptions, "reducedMotion"> & {
  className?: string;
  hint?: boolean;
};

export function DoseViewer({ className = "", hint = true, ...opts }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const key = JSON.stringify(opts);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let scene: DoseViewerScene | null = null;
    let cancelled = false;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;

    (async () => {
      const [{ DoseViewerScene }, { supportsWebGL }] = await Promise.all([
        import("./DoseViewerScene"),
        import("./models"),
      ]);
      if (cancelled) return;
      if (!supportsWebGL()) return setStatus("failed");
      try {
        scene = new DoseViewerScene(canvas, {
          ...opts,
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        });
      } catch {
        return setStatus("failed");
      }
      setStatus("ready");
      io = new IntersectionObserver(([e]) => (e.isIntersecting ? scene?.start() : scene?.stop()));
      io.observe(canvas);
      ro = new ResizeObserver(() => scene?.resize());
      ro.observe(canvas);
    })();

    return () => {
      cancelled = true;
      io?.disconnect();
      ro?.disconnect();
      scene?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className={`h-full w-full cursor-grab touch-pan-y transition-opacity duration-700 active:cursor-grabbing ${
          status === "ready" ? "opacity-100" : "opacity-0"
        }`}
        aria-label="3D medicine illustration"
        role="img"
      />
      {status !== "ready" && (
        <div className="absolute inset-0 grid place-items-center text-accent">
          <DoseIcon
            form="Capsule"
            className={`h-24 w-24 ${status === "loading" ? "animate-pulse opacity-40" : "opacity-80"}`}
          />
        </div>
      )}
      {hint && status === "ready" && (
        <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-3 py-1 text-sm font-medium text-ink-soft shadow-card backdrop-blur">
          Drag sideways to turn
        </p>
      )}
    </div>
  );
}
