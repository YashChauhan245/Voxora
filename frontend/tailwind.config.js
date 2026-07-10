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
        success: "oklch(var(--su) / <alpha-value>)",
        warning: "oklch(var(--wa) / <alpha-value>)",
        error: "oklch(var(--er) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "2xl": "1.125rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease forwards",
        "slide-up": "slideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-glow": "pulseGlow 2s infinite",
        shimmer: "shimmer 1.5s infinite",
        spin: "spin 0.65s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 oklch(var(--p) / 0.4)" },
          "50%": { boxShadow: "0 0 0 8px oklch(var(--p) / 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        "glow-sm": "0 0 12px oklch(var(--p) / 0.25)",
        glow: "0 0 24px oklch(var(--p) / 0.35)",
        "glow-lg": "0 0 48px oklch(var(--p) / 0.4)",
        card: "0 4px 24px rgba(0,0,0,0.5)",
        "card-hover": "0 12px 40px rgba(0,0,0,0.7)",
        float: "0 20px 60px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-dark": "radial-gradient(at 0% 0%, oklch(var(--p)/0.12) 0px, transparent 60%), radial-gradient(at 100% 0%, oklch(var(--s)/0.08) 0px, transparent 60%), radial-gradient(at 50% 100%, oklch(var(--a)/0.07) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};