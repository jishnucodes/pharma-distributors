import { Pill } from "lucide-react";

interface AppLoadingProps {
  message?: string;
  subtext?: string;
  fullScreen?: boolean;
  className?: string;
}

export function AppLoading({
  message = "Loading Pharmaceutical Formulations...",
  subtext,
  fullScreen = false,
  className = "",
}: AppLoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center space-y-4 p-8 transition-opacity duration-300 ${
        fullScreen ? "min-h-screen" : "min-h-[70vh]"
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center">
        {/* Outer spinning ring */}
        <div className="h-16 w-16 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
        {/* Centered badge with pulsing icon */}
        <div className="absolute h-9 w-9 rounded-full bg-accent-soft border border-accent/25 shadow-sm flex items-center justify-center text-accent">
          <Pill className="h-4.5 w-4.5 animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs font-bold tracking-widest uppercase text-accent">
          {message}
        </p>
        {subtext && (
          <p className="text-xs text-ink-mute tracking-normal font-medium">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

