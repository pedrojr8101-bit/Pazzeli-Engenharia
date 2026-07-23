import { SunArc } from "./SunArc";
import type { ResultadoSimulacao } from "@/lib/types";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ResultadoCard({ resultado }: { resultado: ResultadoSimulacao }) {
  return (
    <div className="animate-rise space-y-8">
      <div className="grid gap-8 rounded-2xl border border-borderlight bg-cloud p-6 sm:grid-cols-[1fr_auto] sm:p-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-sun">
            Sistema recomendado — {resultado.localizacao.cidade}/{resultado.localizacao.uf}
          </p>
          <p className="mt-3 font-display text-4xl font-semibold text-graphite sm:text-5xl">
            {resultado.potenciaInstaladaKwp.toFixed(2)} kWp
          </p>
          <p className="mt-1 text-sm text-graphitesoft">
            {resultado.numeroPaineis} painéis de {resultado.potenciaPainelW} W ·{" "}
            {resultado.classificacaoGD}
          </p>
        </div>
        <SunArc
          hsp={resultado.irradiacao.hspMedioAnual}
          label="sol pleno médio/dia"
          className="w-40 sm:w-48"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metrica
          rotulo="Geração estimada"
          valor={`${Math.round(resultado.geracaoMensalKwh)} kWh/mês`}
          cor="text-sky"
        />
        <Metrica
          rotulo="Economia estimada"
          valor={`${formatarMoeda(resultado.economiaMensalEstimada)}/mês`}
          cor="text-sun"
        />
        <Metrica
          rotulo="Retorno do investimento"
          valor={
            Number.isFinite(resultado.paybackAnos)
              ? `${resultado.paybackAnos.toFixed(1)} anos`
              : "a calcular"
          }
          cor="text-graphite"
        />
      </div>

      <div className="rounded-2xl border border-borderlight p-6 sm:p-8">
        <h3 className="font-display text-base font-semibold text-graphite">
          Investimento estimado
        </h3>
        <p className="mt-2 font-mono text-2xl text-graphite">
          {formatarMoeda(resultado.investimentoEstimado)}
        </p>
        <p className="mt-1 text-sm text-graphitesoft">
          Valor de referência — a proposta final considera equipamentos, instalação e
          condições específicas do seu telhado.
        </p>
      </div>

      {resultado.premissas.length > 0 && (
        <details className="rounded-2xl border border-borderlight p-6 text-sm text-graphitesoft sm:p-8">
          <summary className="cursor-pointer font-display text-sm font-semibold text-graphite">
            Premissas consideradas neste cálculo
          </summary>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            {resultado.premissas.map((premissa) => (
              <li key={premissa}>{premissa}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function Metrica({ rotulo, valor, cor }: { rotulo: string; valor: string; cor: string }) {
  return (
    <div className="rounded-2xl border border-borderlight p-5">
      <p className={`font-mono text-2xl ${cor}`}>{valor}</p>
      <p className="mt-1 text-xs text-graphitesoft">{rotulo}</p>
    </div>
  );
}
