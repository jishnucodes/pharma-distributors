/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F4EF",
        ink: {
          DEFAULT: "#13221F",
          soft: "#3E4D4A",
          mute: "#66736F",
        },
        line: "#E2DED4",
        lakshmi: { DEFAULT: "#0E7C70", deep: "#095A51", soft: "#DCF0EB" },
        kothittil: { DEFAULT: "#2450C8", deep: "#173A9A", soft: "#E1E8FB" },
        // Per-company accent, driven by [data-company] CSS variables
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          deep: "rgb(var(--accent-deep) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(19,34,31,0.04), 0 8px 24px -12px rgba(19,34,31,0.12)",
        lift: "0 2px 4px rgba(19,34,31,0.05), 0 24px 48px -20px rgba(19,34,31,0.25)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        nudge: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        nudge: "nudge 1.6s ease-in-out infinite",
        rise: "rise 0.6s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};
