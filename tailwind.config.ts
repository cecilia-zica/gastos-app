import type { Config } from "tailwindcss";

/**
 * Sistema de design "Herbário" — ver src/index.css para os tokens crus.
 * Aqui expomos os tokens ao Tailwind para uso em classes utilitarias.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        muted: "var(--muted)",
        line: "var(--line)",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        "accent-soft": "var(--accent-soft)",
        straw: "var(--straw)",
        data: "var(--data)",
        "data-soft": "var(--data-soft)",
        good: "var(--good)",
        warn: "var(--warn)",
        "warn-soft": "var(--warn-soft)",
      },
      fontFamily: {
        display: ["Optima", "Futura", "'Century Gothic'", "'Avenir Next'", "sans-serif"],
        sans: ["Athelas", "Georgia", "'Iowan Old Style'", "serif"],
        mono: ["'Fragment Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "4px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,52,43,.05), 0 10px 30px rgba(20,52,43,.07)",
        pop: "0 6px 18px rgba(92,106,160,.30)",
      },
    },
  },
  plugins: [],
} satisfies Config;
