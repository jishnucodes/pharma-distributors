import { doseKind } from "@/lib/dose";

/** Flat illustrations of each dosage form; colour comes from `currentColor`. */
export function DoseIcon({ form, className = "" }: { form: string; className?: string }) {
  const kind = doseKind(form);
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none">
      {kind === "capsule" && (
        <g transform="rotate(-40 32 32)">
          <rect x="10" y="22" width="44" height="20" rx="10" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
          <path d="M32 22h12a10 10 0 0 1 0 20H32z" fill="currentColor" />
        </g>
      )}
      {kind === "tablet" && (
        <>
          <ellipse cx="32" cy="36" rx="22" ry="10" fill="currentColor" opacity="0.25" />
          <ellipse cx="32" cy="31" rx="22" ry="10" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
          <path d="M18 31h28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {kind === "bottle" && (
        <>
          <rect x="25" y="6" width="14" height="8" rx="2" fill="currentColor" />
          <path d="M26 14h12v4l6 6v32a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3V24l6-6z" fill="#fff" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="20" y="32" width="24" height="14" fill="currentColor" opacity="0.2" />
        </>
      )}
      {kind === "vial" && (
        <>
          <rect x="24" y="6" width="16" height="7" rx="2" fill="currentColor" />
          <path d="M27 13h10v5l5 5v33a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3V23l5-5z" fill="#fff" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M22 40h20v16a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3z" fill="currentColor" opacity="0.25" />
        </>
      )}
      {kind === "tube" && (
        <g transform="rotate(-35 32 32)">
          <path d="M14 22h30l6 4v12l-6 4H14z" fill="#fff" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="50" y="27" width="8" height="10" rx="2" fill="currentColor" />
          <path d="M14 20v24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
