import { ComoFunciona } from "@/components/ComoFunciona";
import { Diferenciais } from "@/components/Diferenciais";
import { Dor } from "@/components/Dor";
import { Servicos } from "@/components/Servicos";
import { Depoimentos } from "@/components/Depoimentos";
import { CTAFinal } from "@/components/CTAFinal";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { BotaoWhatsApp } from "@/components/BotaoWhatsApp";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Dor />
        <Diferenciais />
        <Servicos />
        <ComoFunciona />
        <Depoimentos />
        <CTAFinal />
      </main>
      <Footer />
      <BotaoWhatsApp />
    </>
  );
}
