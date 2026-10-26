/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Master brand palette
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        // Lakshmi Pharma theme (Teal/Emerald)
        lakshmi: {
          light: "#f0fdfa",
          primary: "#0d9488",
          hover: "#0f766e",
          accent: "#10b981",
          border: "#99f6e4",
          badge: "#ccfbf1",
          text: "#115e59",
        },
        // The Kothittil Distributor theme (Blue/Indigo)
        kothittil: {
          light: "#eff6ff",
          primary: "#2563eb",
          hover: "#1d4ed8",
          accent: "#3b82f6",
          border: "#bfdbfe",
          badge: "#dbeafe",
          text: "#1e40af",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "float-slow": "float 7s ease-in-out infinite",
        "float-medium": "float 5s ease-in-out infinite",
        "float-fast": "float 3.5s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "marquee": "marquee 28s linear infinite",
        "marquee-reverse": "marqueeReverse 28s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(1deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        marqueeReverse: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(15, 23, 42, 0.08)",
        "glass-hover": "0 14px 40px -4px rgba(15, 23, 42, 0.14)",
        "glow-teal": "0 0 40px -10px rgba(13, 148, 136, 0.35)",
        "glow-blue": "0 0 40px -10px rgba(37, 99, 235, 0.35)",
      },
    },
  },
  plugins: [],
};
