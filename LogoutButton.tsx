"use client";

import { useMemo } from "react";
import { GraficoProducaoDiaria } from "./GraficoProducaoDiaria";
import { gerarDadosDemo } from "@/lib/dadosDemo";

function numero(valor: number, casas = 0) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

export function DashboardProducaoDemo() {
  // gerado uma vez por carregamento de página — estável durante a apresentação
  const dados = useMemo(() => gerarDadosDemo(), []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-sun/30 bg-sun/10 px-4 py-3 text-sm text-graphite">
        ⚠️ Dados de demonstração — números ilustrativos, não são de uma usina real.
      </div>

      <div className="rounded-2xl border border-borderlight bg-cloud p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-semibold text-graphite">
              {dados.potencia.plantName}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-graphitesoft">
              <span className="h-2 w-2 rounded-full bg-[#2F7D46]" />
              Sistema online
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl text-graphite">
              {numero(dados.potencia.instantPower, 2)} kW
            </p>
            <p className="text-xs text-graphitesoft">potência agora</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-borderlight p-5">
          <p className="font-mono text-xl text-sun">{numero(dados.performance.total1D, 1)} kWh</p>
          <p className="mt-1 text-xs text-graphitesoft">
            gerado hoje · esperado {numero(dados.performance.expected1D, 1)} kWh
          </p>
        </div>
        <div className="rounded-2xl border border-borderlight p-5">
          <p className="font-mono text-xl text-sun">{numero(dados.performance.total30D)} kWh</p>
          <p className="mt-1 text-xs text-graphitesoft">
            últimos 30 dias · esperado {numero(dados.performance.expected30D)} kWh
          </p>
        </div>
        <div className="rounded-2xl border border-borderlight p-5">
          <p className="font-mono text-xl text-graphite">{numero(dados.potencia.totalGenerated)} kWh</p>
          <p className="mt-1 text-xs text-graphitesoft">gerado desde a instalação</p>
        </div>
      </div>

      <div className="rounded-2xl border border-borderlight p-6">
        <p className="mb-4 font-display text-base font-semibold text-graphite">
          Produção diária — últimos 30 dias
        </p>
        <GraficoProducaoDiaria dados={dados.ultimosDias} />
      </div>

      <div className="rounded-2xl border border-borderlight p-5">
        <p className="text-sm text-graphitesoft">Potência instalada</p>
        <p className="font-mono text-xl text-graphite">
          {numero(dados.potencia.installedPower, 2)} kWp
        </p>
      </div>
    </div>
  );
}
