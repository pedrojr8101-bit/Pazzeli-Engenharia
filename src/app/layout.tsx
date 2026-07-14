import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

const nomeEmpresa = process.env.NEXT_PUBLIC_EMPRESA_NOME || "Sua Empresa Solar";

export const metadata: Metadata = {
  title: `${nomeEmpresa} — Energia solar sob medida`,
  description:
    "Simule em minutos o tamanho do sistema fotovoltaico ideal para o seu consumo, já considerando a Lei 14.300, e receba um contato personalizado.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-night font-body text-paper antialiased">{children}</body>
    </html>
  );
}
