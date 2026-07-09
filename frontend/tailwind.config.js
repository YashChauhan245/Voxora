/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "oklch(var(--p) / <alpha-value>)",
        "primary-content": "oklch(var(--pc) / <alpha-value>)",
        secondary: "oklch(var(--s) / <alpha-value>)",
        "secondary-content": "oklch(var(--sc) / <alpha-value>)",
        accent: "oklch(var(--a) / <alpha-value>)",
        "accent-content": "oklch(var(--ac) / <alpha-value>)",
        neutral: "oklch(var(--n) / <alpha-value>)",
        "neutral-content": "oklch(var(--nc) / <alpha-value>)",
        "base-100": "oklch(var(--b1) / <alpha-value>)",
        "base-200": "oklch(var(--b2) / <alpha-value>)",
        "base-300": "oklch(var(--b3) / <alpha-value>)",
        "base-content": "oklch(var(--bc) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Outfit", "Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};