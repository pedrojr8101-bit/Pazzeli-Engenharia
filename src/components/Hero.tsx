import { MiniSimulador } from "./MiniSimulador";
import { SunArc } from "./SunArc";
import { empresaConfig } from "@/lib/empresa-config";

const BENEFICIOS = [
  "Até 85% de economia na conta",
  "Energia limpa e renovável",
  "Baixa manutenção",
  "Independência elétrica",
];

export function Hero() {
  const nomeEmpresa = empresaConfig.nome;

  return (
    <section className="relative overflow-hidden bg-ivory">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-16 sm:pt-20 lg:grid-cols-2 lg:items-center lg:pb-24">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-sun">
            {nomeEmpresa}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.08] text-graphite sm:text-5xl lg:text-[3.2rem]">
            Energia solar com engenharia própria e entrega sem surpresas.
          </h1>
          <p className="mt-5 max-w-md text-balance text-graphitesoft">
            Reduza sua conta de energia com um sistema fotovoltaico dimensionado de verdade —
            não uma média genérica de propaganda.
          </p>

          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-graphitesoft">
            {BENEFICIOS.map((beneficio) => (
              <li key={beneficio} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sun" aria-hidden />
                {beneficio}
              </li>
            ))}
          </ul>
        </div>

        <MiniSimulador />
      </div>

      <SunArc className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 w-full text-borderlight opacity-70 [mask-image:linear-gradient(to_top,white,transparent)]" />
    </section>
  );
}
