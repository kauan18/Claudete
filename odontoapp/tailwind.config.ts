import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Marca do tenant (tripla RGB → suporta opacidade: bg-primary/10)
        primary: "rgb(var(--brand) / <alpha-value>)",
        accent: "rgb(var(--brand-2) / <alpha-value>)",
        // Derivados de marca (color-mix) — uso direto, sem alpha
        "brand-ink": "var(--brand-ink)",
        "brand-tint": "var(--brand-tint)",
        "brand-tint-2": "var(--brand-tint-2)",
        // Superfícies / texto / linhas — semânticos, auto-adaptam ao dark
        page: "var(--bg-page)",
        surface: "var(--bg-surface)",
        subtle: "var(--bg-subtle)",
        ink: {
          DEFAULT: "var(--fg-page)",
          muted: "var(--fg-muted)",
        },
        line: "var(--line)",
        // Estados
        success: "rgb(var(--success) / <alpha-value>)",
        danger: "rgb(var(--error) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        info: "rgb(var(--info) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,27,45,.04), 0 4px 16px rgba(15,27,45,.06)",
        card: "0 2px 8px rgba(15,27,45,.05), 0 16px 40px -18px rgba(15,27,45,.16)",
        lift: "0 10px 30px -10px rgba(15,27,45,.22)",
        focus: "0 0 0 3px color-mix(in srgb, rgb(var(--brand)) 35%, transparent)",
      },
      maxWidth: {
        content: "72rem", // 1152px — container padrão
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
