"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { empresaConfig } from "@/lib/empresa-config";

const TARIFA_REFERENCIA = 0.85;
const HSP_REFERENCIA = 5.0;
const PERFORMANCE_RATIO = 0.78;
const CUSTO_POR_KWP = 4500; // custo médio estimado por kWp instalado, só para a prévia
const PARCELAS_FINANCIAMENTO = 84;

type TipoImovelValor = "RESIDENCIAL" | "COMERCIAL" | "RURAL";

const TIPOS_IMOVEL: { valor: TipoImovelValor; rotulo: string }[] = [
  { valor: "RESIDENCIAL", rotulo: "Residencial" },
  { valor: "COMERCIAL", rotulo: "Comercial" },
  { valor: "RURAL", rotulo: "Rural" },
];

function moeda(valor: number, casas = 0) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: casas,
  });
}

export function MiniSimulador() {
  const [tipoImovel, setTipoImovel] = useState<TipoImovelValor>("RESIDENCIAL");
  const [valorConta, setValorConta] = useState(350);

  const estimativa = useMemo(() => {
    const valor = valorConta;
    if (!valor || valor <= 0) return null;

    const consumoKwh = valor / TARIFA_REFERENCIA;
    const potenciaKwp = consumoKwh / (HSP_REFERENCIA * 30 * PERFORMANCE_RATIO);
    const economiaMensal = valor * 0.85;
    const economiaAnual = economiaMensal * 12;
    const investimentoEstimado = potenciaKwp * CUSTO_POR_KWP;
    const paybackAnos = investimentoEstimado / economiaAnual;
    const parcela = investimentoEstimado / PARCELAS_FINANCIAMENTO;

    return {
      potenciaKwp: potenciaKwp.toFixed(1),
      economiaMensal,
      economiaAnual,
      paybackAnos,
      parcela,
      cabeNaEconomia: parcela < economiaMensal,
    };
  }, [valorConta]);

  const rotuloTipo = TIPOS_IMOVEL.find((t) => t.valor === tipoImovel)?.rotulo ?? "";
  const mensagemWhatsapp = encodeURIComponent(
    `Olá! Simulei no site: imóvel ${rotuloTipo.toLowerCase()}, conta de aproximadamente ${moeda(
      valorConta
    )}/mês. Gostaria de um orçamento sem compromisso.`
  );

  return (
    <div className="rounded-2xl border border-borderlight bg-cloud p-6 shadow-sm sm:p-8">
      <p className="text-sm text-graphitesoft">Tipo de imóvel</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {TIPOS_IMOVEL.map((tipo) => (
          <button
            key={tipo.valor}
            type="button"
            onClick={() => setTipoImovel(tipo.valor)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              tipoImovel === tipo.valor
                ? "border-sun bg-sun/15 text-graphite"
                : "border-borderlight text-graphitesoft hover:border-sun/50"
            }`}
          >
            {tipo.rotulo}
          </button>
        ))}
      </div>

      <label htmlFor="valor-conta" className="mt-6 block text-sm text-graphitesoft">
        Valor médio da sua conta de luz
      </label>
      <p className="mt-1 font-mono text-3xl text-graphite sm:text-4xl">{moeda(valorConta)}</p>
      <input
        id="valor-conta"
        type="range"
        min={200}
        max={20000}
        step={10}
        value={valorConta}
        onChange={(e) => setValorConta(Number(e.target.value))}
        className="mt-3 w-full accent-sun"
        aria-label="Valor médio da conta de luz em reais"
      />
      <div className="flex justify-between text-xs text-graphite/40">
        <span>R$ 200</span>
        <span>R$ 20.000</span>
      </div>

      {estimativa && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 animate-rise">
            <div>
              <p className="font-mono text-2xl text-[#2F7D46] sm:text-3xl">
                {moeda(estimativa.economiaMensal)}
              </p>
              <p className="text-xs text-graphitesoft">economia estimada/mês</p>
            </div>
            <div>
              <p className="font-mono text-2xl text-graphite sm:text-3xl">
                {moeda(estimativa.economiaAnual)}
              </p>
              <p className="text-xs text-graphitesoft">em 12 meses</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-graphitesoft">
            <span>
              ⏱ Retorno estimado: cerca de {Math.max(1, Math.round(estimativa.paybackAnos))} anos
            </span>
            <span>🏦 Financia em até {PARCELAS_FINANCIAMENTO}x</span>
          </div>

          {estimativa.cabeNaEconomia && (
            <p className="mt-3 rounded-lg bg-sun/10 px-3 py-2 text-xs text-graphite">
              Sua parcela estimada ({moeda(estimativa.parcela)}) é inferior à economia mensal —
              você começa a poupar desde o mês 1.
            </p>
          )}
        </>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Link
          href="/simulador"
          className="inline-flex items-center gap-2 rounded-full bg-sun px-6 py-3 text-sm font-semibold text-graphite transition hover:bg-sunlight"
        >
          Simular com precisão para o meu endereço
          <span aria-hidden>→</span>
        </Link>
        {Boolean(empresaConfig.whatsapp) && (
          <a
            href={`https://wa.me/${empresaConfig.whatsapp}?text=${mensagemWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-borderlight px-6 py-3 text-sm font-semibold text-graphite transition hover:border-sun hover:text-sun"
          >
            Falar no WhatsApp
          </a>
        )}
      </div>
      <p className="mt-3 text-xs text-graphite/40">
        Estimativa preliminar com médias nacionais. O cálculo completo considera a
        irradiação real do seu CEP e a Lei 14.300.
      </p>
    </div>
  );
}
