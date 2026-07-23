import Image from "next/image";
import { empresaConfig } from "@/lib/empresa-config";

const NUMEROS = [
  { valor: "100%", rotulo: "Engenharia própria" },
  { valor: "Lei 14.300", rotulo: "Já embutida no cálculo" },
  { valor: "Pará", rotulo: "Atendimento local" },
];

export function NossaHistoria() {
  return (
    <section id="nossa-historia" className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="relative order-2 aspect-[4/3] overflow-hidden rounded-2xl lg:order-1">
          <Image
            src="https://images.unsplash.com/photo-1614366502473-e54666693b44?fm=jpg&q=80&w=1600&auto=format&fit=crop"
            alt="Close-up de painel solar fotovoltaico"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="order-1 lg:order-2">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-sun">
            Nossa história
          </p>
          <h2 className="font-display text-2xl font-semibold text-graphite sm:text-3xl">
            Engenharia solar pensada para a nossa região
          </h2>
          <p className="mt-4 text-graphitesoft">
            A {empresaConfig.nome} nasceu para resolver um problema simples de enxergar e difícil
            de aceitar: propostas de energia solar calculadas em cima de médias nacionais, que não
            respeitam a irradiação real do Norte do Brasil nem as regras da Lei 14.300.
          </p>
          <p className="mt-4 text-graphitesoft">
            Por isso dimensionamos cada sistema com dados técnicos de verdade — do CEP à
            homologação — e acompanhamos o cliente do primeiro clique no simulador até o sistema
            ligado e gerando economia.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-borderlight pt-6">
            {NUMEROS.map((numero) => (
              <div key={numero.rotulo}>
                <p className="font-display text-lg font-semibold text-graphite">
                  {numero.valor}
                </p>
                <p className="mt-1 text-xs text-graphitesoft">{numero.rotulo}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}