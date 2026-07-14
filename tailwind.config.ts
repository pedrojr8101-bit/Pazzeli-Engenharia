import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        night: "#0E1B2C", // fundo base — céu antes do amanhecer
        dusk: "#14263B", // fundo elevado — cards, painéis
        duskline: "#233A54", // bordas sutis sobre o fundo escuro
        sun: "#F5A623", // acento primário — sol, CTAs
        sunlight: "#FFD27A", // sol claro — hover, glow
        ember: "#E4632F", // acento secundário — telha, calor
        sky: "#67D8C4", // dados positivos — economia, geração
        paper: "#F7F3EA", // texto claro sobre fundo escuro
        graphite: "#1C1C1A", // texto escuro sobre fundo claro
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "sun-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(245,166,35,0.18) 0%, rgba(14,27,44,0) 70%)",
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
