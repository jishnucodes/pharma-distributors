"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Phone, MapPin, Clock } from "lucide-react";
import { Company } from "@/types";
import { companyColor, telHref } from "@/lib/companies";
import { usePrefersReducedMotion } from "@/lib/hooks";
import type { CapsuleHeroScene } from "@/components/three/CapsuleHeroScene";

const STAGE_ANCHORS = [0.03, 0.25, 0.48, 0.72, 0.96];
const STEP_LABELS = ["Start", "Open", "Lakshmi", "Kothittil", "Together"];

/** Mirrors stageFromProgress() in the scene so text and 3D stay in step without loading three.js first. */
function stepFromProgress(p: number) {
  if (p < 0.14) return 0;
  if (p < 0.36) return 1;
  if (p < 0.6) return 2;
  if (p < 0.84) return 3;
  return 4;
}

export function CapsuleStory({ lakshmi, kothittil }: { lakshmi: Company; kothittil: Company }) {
  const trackRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<CapsuleHeroScene | null>(null);
  const progressRef = useRef(0);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = usePrefersReducedMotion();

  // Scroll → progress
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(range, 1)));
      progressRef.current = p;
      sceneRef.current?.setProgress(p);
      setStep(stepFromProgress(p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Lazy-load the WebGL scene so text paints first on slow phones
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    const onVisibility = () => (document.hidden ? sceneRef.current?.stop() : sceneRef.current?.start());

    (async () => {
      const [{ CapsuleHeroScene }, { supportsWebGL }] = await Promise.all([
        import("@/components/three/CapsuleHeroScene"),
        import("@/components/three/models"),
        document.fonts?.ready,
      ]);
      if (cancelled) return;
      if (!supportsWebGL()) return setFailed(true);
      try {
        sceneRef.current = new CapsuleHeroScene(canvas, {
          capColor: companyColor(lakshmi.slug).main,
          bodyColor: companyColor(kothittil.slug).main,
          capLabel: "LAKSHMI",
          bodyLabel: "KOTHITTIL",
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        });
      } catch {
        return setFailed(true);
      }
      sceneRef.current.setProgress(progressRef.current);
      setReady(true);
      io = new IntersectionObserver(([e]) =>
        e.isIntersecting && !document.hidden ? sceneRef.current?.start() : sceneRef.current?.stop()
      );
      io.observe(canvas);
      ro = new ResizeObserver(() => sceneRef.current?.resize());
      ro.observe(canvas);
      document.addEventListener("visibilitychange", onVisibility);
    })();

    return () => {
      cancelled = true;
      io?.disconnect();
      ro?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [lakshmi.slug, kothittil.slug]);

  const jumpTo = useCallback(
    (i: number) => {
      const el = trackRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const range = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + STAGE_ANCHORS[i] * range, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced]
  );

  return (
    <section ref={trackRef} className="relative h-[560svh]" aria-label="Introduction to L&K Pharma">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,#ffffff_0%,#F6F4EF_55%,#ECE8DE_100%)]" />
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: step === 2 ? 1 : 0,
            background: "radial-gradient(ellipse at 70% 45%, rgba(14,124,112,0.16), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: step === 3 ? 1 : 0,
            background: "radial-gradient(ellipse at 70% 45%, rgba(36,80,200,0.16), transparent 60%)",
          }}
        />

        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        />
        {!ready && <CssCapsule failed={failed} step={step} />}

        {/* Story text */}
        <Panel show={step === 0} place="intro">
          <p className="eyebrow !text-ink-soft">Wholesale medicine distribution · Kerala</p>
          <h1 className="mt-3 font-display text-[2.6rem] font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Two trusted distributors.
            <br />
            <span className="italic text-ink-soft">One easy enquiry.</span>
          </h1>
          <p className="mt-4 hidden max-w-md text-lg leading-relaxed text-ink-soft sm:block">
            Browse the catalogues of {lakshmi.name} and {kothittil.name}, pick everything you need, and send it
            in one go.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => jumpTo(1)} className="btn-ink">
              Open the capsule <ArrowDown className="h-5 w-5" />
            </button>
            <a href="#choose" className="btn-outline">
              Skip to catalogues
            </a>
          </div>
        </Panel>

        <Panel show={step === 1} place="bottom">
          <h2 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-5xl">
            Inside, two specialists.
          </h2>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink-soft">
            Each half is its own distributor — with its own catalogue, its own manufacturers, and its own team who
            calls you back.
          </p>
        </Panel>

        <Panel show={step === 2} place="side">
          <CompanyCard company={lakshmi} />
        </Panel>
        <Panel show={step === 3} place="side">
          <CompanyCard company={kothittil} />
        </Panel>

        <Panel show={step === 4} place="bottom">
          <h2 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-5xl">
            Two halves. One network.
          </h2>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink-soft">
            Choose a distributor, add as many products as you like to your enquiry list, and send it once.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href={`/${lakshmi.slug}`} className="btn bg-lakshmi text-white hover:bg-lakshmi-deep">
              {lakshmi.shortName}
            </Link>
            <Link href={`/${kothittil.slug}`} className="btn bg-kothittil text-white hover:bg-kothittil-deep">
              {kothittil.shortName}
            </Link>
          </div>
        </Panel>

        {/* Step rail */}
        <nav
          aria-label="Story steps"
          className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 sm:flex lg:right-6"
        >
          {STEP_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => jumpTo(i)}
              className="group flex items-center justify-end gap-2"
              aria-current={step === i ? "step" : undefined}
            >
              <span
                className={`text-sm font-semibold transition-opacity ${
                  step === i ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                }`}
              >
                {label}
              </span>
              <span
                className={`block h-3 w-3 rounded-full border-2 border-ink transition-colors ${
                  step === i ? "bg-ink" : "bg-transparent"
                }`}
              />
            </button>
          ))}
        </nav>

        {/* Mobile step dots */}
        <div className="absolute left-1/2 top-[76px] z-20 flex -translate-x-1/2 gap-1.5 sm:hidden" aria-hidden="true">
          {STEP_LABELS.map((l, i) => (
            <span
              key={l}
              className={`h-1.5 rounded-full transition-all ${step === i ? "w-6 bg-ink" : "w-1.5 bg-ink/25"}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-sm font-semibold text-ink-soft sm:flex">
            Scroll to open
            <ArrowDown className="h-5 w-5 animate-nudge" />
          </div>
        )}
      </div>
    </section>
  );
}

function Panel({
  show,
  place,
  children,
}: {
  show: boolean;
  place: "intro" | "bottom" | "side";
  children: React.ReactNode;
}) {
  const position = {
    // Portrait: intro text at the top, model below. Desktop: text on the left, model on the right.
    intro: "inset-x-0 top-[96px] px-5 sm:top-1/2 sm:-translate-y-1/2 sm:px-10 lg:px-16 sm:max-w-[34rem] lg:max-w-[40rem]",
    bottom:
      "inset-x-0 bottom-0 flex flex-col items-center bg-gradient-to-t from-paper via-paper/90 to-transparent px-5 pb-8 pt-16 text-center sm:pb-14",
    side: "inset-x-0 bottom-0 p-3 sm:inset-x-auto sm:left-6 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:p-0 lg:left-16 sm:w-[26rem]",
  }[place];
  return (
    <div
      aria-hidden={!show}
      className={`absolute z-10 ${position} transition-[opacity,visibility] duration-500 ${
        show ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <div className={`transition-transform duration-500 ${show ? "translate-y-0" : "translate-y-4"}`}>
        {children}
      </div>
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  const color = companyColor(company.slug);
  const products = company.totalProducts ?? company.stats?.totalProducts;
  const makers = company.totalManufacturers ?? company.stats?.totalManufacturers;
  return (
    <article className="rounded-4xl border border-line bg-white/95 p-5 shadow-lift backdrop-blur sm:p-7">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full" style={{ background: color.main }} />
        <span className="text-sm font-semibold uppercase tracking-[0.14em]" style={{ color: color.main }}>
          Distributor
        </span>
      </div>
      <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">{company.name}</h2>
      {company.tagline && <p className="mt-1.5 text-base leading-snug text-ink-soft">{company.tagline}</p>}

      {(products !== undefined || makers !== undefined) && (
        <dl className="mt-4 grid grid-cols-2 gap-2">
          {products !== undefined && (
            <div className="rounded-2xl p-3" style={{ background: color.soft }}>
              <dt className="text-sm text-ink-soft">Products</dt>
              <dd className="font-display text-2xl font-semibold" style={{ color: color.deep }}>
                {products}
              </dd>
            </div>
          )}
          {makers !== undefined && (
            <div className="rounded-2xl p-3" style={{ background: color.soft }}>
              <dt className="text-sm text-ink-soft">Manufacturers</dt>
              <dd className="font-display text-2xl font-semibold" style={{ color: color.deep }}>
                {makers}
              </dd>
            </div>
          )}
        </dl>
      )}

      <ul className="mt-4 hidden space-y-1.5 text-base text-ink-soft sm:block">
        <li className="flex gap-2">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0" /> {company.address}
        </li>
        <li className="flex gap-2">
          <Clock className="mt-0.5 h-5 w-5 shrink-0" /> {company.businessHours}
        </li>
      </ul>

      <div className="mt-5 flex gap-2">
        <Link
          href={`/${company.slug}/products`}
          className="btn flex-1 px-4 text-white"
          style={{ background: color.main }}
        >
          Browse products <ArrowRight className="h-5 w-5" />
        </Link>
        <a href={telHref(company.phone)} className="btn-outline px-4" aria-label={`Call ${company.name}`}>
          <Phone className="h-5 w-5" />
          <span className="hidden sm:inline">Call</span>
        </a>
      </div>
    </article>
  );
}

/** Shown while three.js loads, or permanently if WebGL is unavailable. */
function CssCapsule({ failed, step }: { failed: boolean; step: number }) {
  const open = step > 0;
  return (
    <div
      className={`absolute inset-x-0 top-[44%] flex justify-center sm:left-auto sm:right-[12%] sm:top-1/2 sm:-translate-y-1/2 ${
        failed ? "" : "animate-pulse"
      }`}
      aria-hidden="true"
    >
      <div className="flex -rotate-[35deg] items-center">
        <span
          className="block h-24 w-36 rounded-l-full bg-lakshmi shadow-lift transition-transform duration-700"
          style={{ transform: open ? "translateX(-24px)" : undefined }}
        />
        <span
          className="block h-24 w-36 rounded-r-full bg-kothittil shadow-lift transition-transform duration-700"
          style={{ transform: open ? "translateX(24px)" : undefined }}
        />
      </div>
    </div>
  );
}
