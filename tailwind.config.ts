import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        night: "#052137", // fundo real da marca — azul-marinho profundo
        dusk: "#0C2E4A", // fundo elevado — cards, painéis
        duskline: "#1F3F5C", // bordas sutis sobre o fundo escuro
        sun: "#F7C948", // dourado real da marca — CTAs, destaques
        sunlight: "#FFE18C", // dourado claro — hover, glow
        ember: "#E4632F", // acento secundário — calor
        sky: "#67D8C4", // dados positivos — economia, geração
        paper: "#F5F3EC", // texto claro sobre fundo escuro
        graphite: "#1C1C1A", // texto escuro sobre fundo claro (usado no PDF)

        // Tema claro — mantido para a proposta em PDF (documento impresso
        // precisa de fundo branco), não usado no site.
        ivory: "#FFFFFF",
        cloud: "#F6F4EF",
        borderlight: "#E5E1D6",
        graphitesoft: "#5B5B57",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "sun-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(247,201,72,0.18) 0%, rgba(5,33,55,0) 70%)",
      },
      keyframes: {
        rise: {
          "0%": { transform: "translateY(6px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "arc-draw": {
          "0%": { strokeDashoffset: "220" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        rise: "rise 0.6s ease-out forwards",
        "arc-draw": "arc-draw 1.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
