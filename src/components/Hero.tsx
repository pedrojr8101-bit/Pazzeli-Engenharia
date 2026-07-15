import { MiniSimulador } from "./MiniSimulador";
import { SunArc } from "./SunArc";
import { empresaConfig } from "@/lib/empresa-config";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-sun-glow">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 sm:pt-24 lg:grid-cols-2 lg:items-center lg:pb-28">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-sun">
            {empresaConfig.nome}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] text-paper sm:text-5xl lg:text-[3.4rem]">
            Todo dia, o sol paga
            <br />
            uma parte da sua conta.
          </h1>
          <p className="mt-5 max-w-md text-balance text-paper/60">
            Descubra em poucos minutos o sistema fotovoltaico ideal para o seu
            consumo — com um dimensionamento técnico real, não uma média genérica.
          </p>
        </div>

        <MiniSimulador />
      </div>

      <SunArc className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 opacity-40 [mask-image:linear-gradient(to_top,black,transparent)]" />
    </section>
  );
}
