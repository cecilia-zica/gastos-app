import type { Config } from "tailwindcss";

/**
 * Sistema de design "Caderno riso" — ver src/index.css para os tokens crus.
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
        good: "var(--good)",
      },
      fontFamily: {
        display: ["'Bricolage Grotesque Variable'", "ui-sans-serif", "sans-serif"],
        sans: ["'Hanken Grotesk Variable'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'Fragment Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "22px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,52,43,.05), 0 10px 30px rgba(20,52,43,.07)",
        pop: "0 6px 18px rgba(207,95,118,.26)",
      },
    },
  },
  plugins: [],
} satisfies Config;
