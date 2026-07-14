"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

// Constantes de referência nacional — só para a prévia da hero. O cálculo
// preciso (por CEP, com irradiação real e regras da Lei 14.300) acontece na
// página /simulador.
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
    <div className="rounded-2xl border border-duskline bg-dusk/60 p-6 backdrop-blur-sm sm:p-8">
      <label htmlFor="valor-conta" className="block text-sm text-paper/60">
        Quanto você paga de luz por mês, hoje?
      </label>
      <div className="mt-3 flex items-center gap-3">
        <span className="font-mono text-2xl text-paper/40">R$</span>
        <input
          id="valor-conta"
          inputMode="decimal"
          value={valorConta}
          onChange={(e) => setValorConta(e.target.value.replace(/[^\d,]/g, ""))}
          className="w-full border-b-2 border-duskline bg-transparent font-mono text-4xl text-paper outline-none focus:border-sun sm:text-5xl"
          aria-label="Valor médio da conta de luz em reais"
        />
      </div>

      {estimativa && (
        <div className="mt-6 grid grid-cols-2 gap-4 animate-rise">
          <div>
            <p className="font-mono text-2xl text-sun sm:text-3xl">{estimativa.potenciaKwp} kWp</p>
            <p className="text-xs text-paper/50">sistema estimado</p>
          </div>
          <div>
            <p className="font-mono text-2xl text-sky sm:text-3xl">{estimativa.economiaMensal}</p>
            <p className="text-xs text-paper/50">de economia estimada/mês</p>
          </div>
        </div>
      )}

      <Link
        href="/simulador"
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-sun px-6 py-3 text-sm font-semibold text-night transition hover:bg-sunlight"
      >
        Simular com precisão para o meu endereço
        <span aria-hidden>→</span>
      </Link>
      <p className="mt-3 text-xs text-paper/40">
        Estimativa preliminar com médias nacionais. O cálculo completo considera a
        irradiação real do seu CEP e a Lei 14.300.
      </p>
    </div>
  );
}
