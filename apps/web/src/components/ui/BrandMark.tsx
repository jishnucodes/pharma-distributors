import Link from "next/link";

/** Two-tone capsule mark: red half for Lakshmi, blue half for Kothittil. */
export function CapsuleMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <g transform="rotate(-45 20 20)">
        <path d="M20 12H11a8 8 0 0 0 0 16h9z" fill="#E11D48" />
        <path d="M20 12h9a8 8 0 0 1 0 16h-9z" fill="#2450C8" />
        <rect x="3" y="12" width="34" height="16" rx="8" fill="none" stroke="#13221F" strokeOpacity="0.12" />
        <ellipse cx="12" cy="16" rx="5" ry="1.6" fill="#fff" opacity="0.35" />
      </g>
    </svg>
  );
}

export function BrandMark({ href = "/", sub }: { href?: string; sub?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-lg" aria-label="L & K Pharma Network home">
      <CapsuleMark className="h-9 w-9 shrink-0" />
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold tracking-tight text-ink">L&amp;K Pharma</span>
        {sub && <span className="block text-xs font-medium text-ink-mute">{sub}</span>}
      </span>
    </Link>
  );
}
