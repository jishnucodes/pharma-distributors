"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import type { DistributorHeroScene } from "./DistributorHeroScene";

export interface DistributorHero3DProps {
  accent: string;
  accentDeep?: string;
  accentSoft?: string;
  companyName?: string;
  className?: string;
}

type ViewerStatus = "loading" | "ready" | "failed";

function supportsWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class HeroErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function HeroFallbackEmblem({
  accent,
  accentDeep,
  accentSoft,
  companyName,
  loading,
  reducedMotion,
}: {
  accent: string;
  accentDeep: string;
  accentSoft: string;
  companyName?: string;
  loading: boolean;
  reducedMotion: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const gradId = `hero-serum-${uid}`;
  const ringId = `hero-ring-${uid}`;
  const labelText = companyName ? companyName.toUpperCase() : "PHARMA";
  const shouldPulse = loading && !reducedMotion;

  return (
    <div
      className={`pointer-events-none absolute inset-0 grid place-items-center p-4 ${
        shouldPulse ? "motion-safe:animate-pulse opacity-65" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className="relative flex h-full w-full max-h-[340px] max-w-[340px] items-center justify-center">
        <svg viewBox="0 0 280 280" className="h-full w-full overflow-visible" fill="none">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.88" />
              <stop offset="100%" stopColor={accentDeep} stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id={ringId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
              <stop offset="100%" stopColor={accentDeep} stopOpacity="0.12" />
            </linearGradient>
          </defs>

          {/* Soft ambient halo */}
          <circle cx="140" cy="140" r="108" fill={accentSoft} opacity="0.65" />

          {/* Calibrated orbital rings */}
          <ellipse
            cx="140"
            cy="144"
            rx="116"
            ry="44"
            transform="rotate(-18 140 144)"
            stroke={`url(#${ringId})`}
            strokeWidth="2"
          />
          <ellipse
            cx="140"
            cy="144"
            rx="128"
            ry="54"
            transform="rotate(14 140 144)"
            stroke={accentDeep}
            strokeOpacity="0.16"
            strokeWidth="1.25"
            strokeDasharray="5 6"
          />

          {/* Orbital nodes */}
          <circle cx="42" cy="176" r="5" fill={accent} />
          <circle cx="242" cy="112" r="4.5" fill={accentDeep} />
          <circle cx="208" cy="70" r="3.5" fill="#FFFFFF" stroke={accent} strokeWidth="1.5" />

          {/* Pharmaceutical Glass Vial */}
          <g transform="translate(86 54)">
            {/* Flip-off seal */}
            <rect x="26" y="4" width="44" height="10" rx="4" fill={accentDeep} />
            {/* Aluminum crimp collar */}
            <rect x="24" y="14" width="48" height="14" rx="3" fill="#DDE2E8" stroke="#9AA4AE" strokeWidth="1.2" />
            {/* Vial neck & body */}
            <path
              d="M32 28H64V40L78 54V152C78 161 71 168 62 168H34C25 168 18 161 18 152V54L32 40V28Z"
              fill="#FFFFFF"
              fillOpacity="0.88"
              stroke="#B8C2CC"
              strokeWidth="2"
            />
            {/* Sterile serum core */}
            <path
              d="M22 104C36 108 60 100 74 104V151C74 158 68 164 61 164H35C28 164 22 158 22 151V104Z"
              fill={`url(#${gradId})`}
            />
            {/* Rx Label */}
            <rect x="20" y="66" width="56" height="58" rx="6" fill="#FCFBF8" stroke="#E2DED4" strokeWidth="1.5" />
            <rect x="20" y="66" width="56" height="14" rx="4" fill={accent} />
            <text
              x="48"
              y="98"
              textAnchor="middle"
              fill="#13221F"
              fontSize="8.5"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
            >
              {labelText.slice(0, 10)}
            </text>
            <line x1="28" y1="108" x2="68" y2="108" stroke="#DED9CE" strokeWidth="1.5" />
            <text
              x="48"
              y="118"
              textAnchor="middle"
              fill={accentDeep}
              fontSize="7"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              AUTHORISED
            </text>
          </g>

          {/* Two-tone capsule */}
          <g transform="translate(178 148) rotate(-38)">
            <rect x="0" y="0" width="56" height="24" rx="12" fill="#FAF8F3" stroke="#D5CFC2" strokeWidth="1.5" />
            <path d="M28 0H44C50.6274 0 56 5.37258 56 12C56 18.6274 50.6274 24 44 24H28V0Z" fill={accent} />
            <line x1="28" y1="1" x2="28" y2="23" stroke={accentDeep} strokeWidth="2" />
          </g>

          {/* Scored tablet */}
          <g transform="translate(60 184) rotate(14)">
            <ellipse cx="20" cy="14" rx="18" ry="12" fill="#FAF8F3" stroke="#D5CFC2" strokeWidth="1.5" />
            <line x1="8" y1="14" x2="32" y2="14" stroke="#C5BEB0" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function DistributorHero3DInner({
  accent,
  accentDeep = accent,
  accentSoft = "#F6F4EF",
  companyName,
  className = "",
}: DistributorHero3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<DistributorHeroScene | null>(null);
  const intersectingRef = useRef(true);
  const reducedRef = useRef(false);

  const [status, setStatus] = useState<ViewerStatus>("loading");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [initNonce, setInitNonce] = useState(0);

  // Track dynamic prefers-reduced-motion changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = (matches: boolean) => {
      reducedRef.current = matches;
      setReducedMotion(matches);
      const scene = sceneRef.current;
      if (!scene) return;
      scene.setReducedMotion(matches);
      if (matches) {
        scene.stop();
      } else if (intersectingRef.current && !document.hidden) {
        scene.start();
      }
    };

    apply(mq.matches);
    const onChange = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Dynamically load Three.js scene and manage full lifecycle
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let cancelled = false;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;

    const syncPlayback = () => {
      const scene = sceneRef.current;
      if (!scene || cancelled) return;
      if (intersectingRef.current && !document.hidden && !reducedRef.current) {
        scene.start();
      } else {
        scene.stop();
      }
    };

    const onVisibility = () => syncPlayback();

    const onContextLost = (e: Event) => {
      e.preventDefault();
      sceneRef.current?.stop();
      setStatus("failed");
    };

    const onContextRestored = () => {
      setInitNonce((n) => n + 1);
    };

    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    (async () => {
      if (!supportsWebGL()) {
        if (!cancelled) setStatus("failed");
        return;
      }

      try {
        const { DistributorHeroScene } = await import("./DistributorHeroScene");
        if (cancelled) return;

        const initialReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        reducedRef.current = initialReduced;
        setReducedMotion(initialReduced);

        const scene = new DistributorHeroScene(canvas, {
          accent,
          accentDeep,
          accentSoft,
          companyName,
          reducedMotion: initialReduced,
        });
        sceneRef.current = scene;
        setStatus("ready");

        io = new IntersectionObserver(([entry]) => {
          intersectingRef.current = Boolean(entry?.isIntersecting);
          syncPlayback();
        });
        io.observe(container);

        ro = new ResizeObserver(() => scene.resize());
        ro.observe(container);

        document.addEventListener("visibilitychange", onVisibility);
        syncPlayback();
      } catch {
        if (!cancelled) setStatus("failed");
      }
    })();

    return () => {
      cancelled = true;
      io?.disconnect();
      ro?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [accent, accentDeep, accentSoft, companyName, initNonce]);

  const ariaLabel = companyName
    ? `${companyName} pharmaceutical distribution 3D showcase`
    : "Pharmaceutical distribution 3D showcase";

  return (
    <div ref={containerRef} className={`relative overflow-hidden select-none ${className}`}>
      <canvas
        ref={canvasRef}
        className={`block h-full w-full touch-pan-y ${
          status === "ready"
            ? "cursor-grab opacity-100 active:cursor-grabbing"
            : "pointer-events-none opacity-0"
        } ${reducedMotion ? "" : "transition-opacity duration-500"}`}
        aria-label={ariaLabel}
        role="img"
      />
      {status !== "ready" && (
        <HeroFallbackEmblem
          accent={accent}
          accentDeep={accentDeep}
          accentSoft={accentSoft}
          companyName={companyName}
          loading={status === "loading"}
          reducedMotion={reducedMotion}
        />
      )}
    </div>
  );
}

export function DistributorHero3D(props: DistributorHero3DProps) {
  const {
    accent,
    accentDeep = accent,
    accentSoft = "#F6F4EF",
    companyName,
    className = "",
  } = props;

  return (
    <HeroErrorBoundary
      fallback={
        <div className={`relative overflow-hidden select-none ${className}`} aria-hidden="true">
          <HeroFallbackEmblem
            accent={accent}
            accentDeep={accentDeep}
            accentSoft={accentSoft}
            companyName={companyName}
            loading={false}
            reducedMotion={true}
          />
        </div>
      }
    >
      <DistributorHero3DInner {...props} />
    </HeroErrorBoundary>
  );
}
