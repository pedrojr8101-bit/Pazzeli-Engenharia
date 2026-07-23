import Image from "next/image";
import { MiniSimulador } from "./MiniSimulador";
import { empresaConfig } from "@/lib/empresa-config";

const SELOS = [
  "Engenharia própria",
  "Cálculo pela Lei 14.300",
  "Atendimento no Pará",
];

export function Hero() {
  const nomeEmpresa = empresaConfig.nome;

  return (
    <section className="relative overflow-hidden bg-graphite">
      <Image
        src="https://images.unsplash.com/photo-1770567764570-ebe9b5d0c02b?fm=jpg&q=80&w=2400&auto=format&fit=crop"
        alt="Casa com painéis solares instalados no telhado"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-graphite via-graphite/80 to-graphite/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-transparent" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-16 sm:pt-20 lg:grid-cols-2 lg:items-center lg:pb-24">
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            {SELOS.map((selo) => (
              <span
                key={selo}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur-sm"
              >
                {selo}
              </span>
            ))}
          </div>

          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-sun">
            {nomeEmpresa}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-[3.2rem]">
            Menos conta de luz. Mais liberdade.
          </h1>
          <p className="mt-5 max-w-md text-balance text-white/70">
            Reduza sua conta de energia com um sistema fotovoltaico dimensionado de verdade para
            o seu consumo — não uma média genérica de propaganda.
          </p>
        </div>

        <MiniSimulador />
      </div>
    </section>
  );
}