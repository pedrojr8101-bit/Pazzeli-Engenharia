"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { empresaConfig } from "@/lib/empresa-config";

const TARIFA_REFERENCIA = 0.85;
const HSP_REFERENCIA = 5.0;
const PERFORMANCE_RATIO = 0.78;

export function MiniSimulador() {
  const [valorConta, setValorConta] = useState("350");

  const estimativa = useMemo(() => {
    const valor = Number(valorConta.replace(",", "."));
    if (!valor || valor <= 0) return null;

    const consumoKwh = valor / TARIFA_REFERENCIA;
    const potenciaKwp = consumoKwh / (HSP_REFERENCIA * 30 * PERFORMANCE_RATIO);
    const economiaMensal = valor * 0.85;

    return {
      potenciaKwp: potenciaKwp.toFixed(1),
      economiaMensal: economiaMensal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }),
    };
  }, [valorConta]);

  return (
    <div className="rounded-2xl border border-borderlight bg-cloud p-6 shadow-sm sm:p-8">
      <label htmlFor="valor-conta" className="block text-sm text-graphitesoft">
        Quanto você paga de luz por mês, hoje?
      </label>
      <div className="mt-3 flex items-center gap-3">
        <span className="font-mono text-2xl text-graphite/30">R$</span>
        <input
          id="valor-conta"
          inputMode="decimal"
          value={valorConta}
          onChange={(e) => setValorConta(e.target.value.replace(/[^\d,]/g, ""))}
          className="w-full border-b-2 border-borderlight bg-transparent font-mono text-4xl text-graphite outline-none focus:border-sun sm:text-5xl"
          aria-label="Valor médio da conta de luz em reais"
        />
      </div>

      {estimativa && (
        <div className="mt-6 grid grid-cols-2 gap-4 animate-rise">
          <div>
            <p className="font-mono text-2xl text-ember sm:text-3xl">{estimativa.potenciaKwp} kWp</p>
            <p className="text-xs text-graphitesoft">sistema estimado</p>
          </div>
          <div>
            <p className="font-mono text-2xl text-[#2F7D46] sm:text-3xl">{estimativa.economiaMensal}</p>
            <p className="text-xs text-graphitesoft">de economia estimada/mês</p>
          </div>
        </div>
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
            href={`https://wa.me/${empresaConfig.whatsapp}?text=${encodeURIComponent(
              "Olá! Vim pelo site e gostaria de solicitar um orçamento. Qual o próximo passo?"
            )}`}
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
