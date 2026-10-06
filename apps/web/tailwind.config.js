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
    },
  },
  plugins: [],
};
