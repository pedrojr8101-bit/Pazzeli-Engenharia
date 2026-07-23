import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SimuladorWizard } from "@/components/SimuladorWizard";
import { BotaoWhatsApp } from "@/components/BotaoWhatsApp";

export default function SimuladorPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-8 sm:pt-12">
        <h1 className="font-display text-3xl font-semibold text-graphite sm:text-4xl">
          Simule o seu sistema
        </h1>
        <p className="mt-3 text-graphitesoft">
          Dimensionamento técnico com a irradiação real do seu endereço e as regras
          da Lei 14.300.
        </p>

        <div className="mt-10">
          <SimuladorWizard />
        </div>
      </main>
      <Footer />
      <BotaoWhatsApp />
    </>
  );
}
