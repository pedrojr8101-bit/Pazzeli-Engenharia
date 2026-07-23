"use client";

import { useEffect, useState } from "react";
import { GraficoProducaoDiaria } from "./GraficoProducaoDiaria";

interface DadosProducao {
  potencia: {
    plantName: string;
    status: string;
    installedPower: number;
    instantPower: number;
    totalGenerated: number;
    generation365Days: number;
  };
  performance: {
    total1D: number;
    expected1D: number;
    total30D: number;
    expected30D: number;
    total365D: number;
    expected365D: number;
  };
  ultimosDias: { date: string; total: number; totalExpected: number }[];
}

function numero(valor: number, casas = 0) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

export function DashboardProducao() {
  const [dados, setDados] = useState<DadosProducao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("/api/cliente/producao")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.erro ?? "Erro ao carregar os dados.");
        setDados(json);
      })
      .catch((e) => setErro(e instanceof Error ? e.message : "Erro ao carregar os dados."))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return <p className="text-graphitesoft">Carregando dados da sua usina...</p>;
  }

  if (erro) {
    return (
      <div className="rounded-2xl border border-borderlight bg-cloud p-6 text-graphitesoft">
        {erro}
      </div>
    );
  }

  if (!dados) return null;

  const online = dados.potencia.status?.toLowerCase().includes("online") ?? false;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-borderlight bg-cloud p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-semibold text-graphite">
              {dados.potencia.plantName}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-graphitesoft">
              <span
                className={`h-2 w-2 rounded-full ${online ? "bg-[#2F7D46]" : "bg-graphite/30"}`}
              />
              {online ? "Sistema online" : dados.potencia.status || "Status indisponível"}
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
            gerado hoje {dados.performance.expected1D > 0 && `· esperado ${numero(dados.performance.expected1D, 1)} kWh`}
          </p>
        </div>
        <div className="rounded-2xl border border-borderlight p-5">
          <p className="font-mono text-xl text-sun">{numero(dados.performance.total30D)} kWh</p>
          <p className="mt-1 text-xs text-graphitesoft">
            últimos 30 dias {dados.performance.expected30D > 0 && `· esperado ${numero(dados.performance.expected30D)} kWh`}
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
        <p className="font-mono text-xl text-graphite">{numero(dados.potencia.installedPower, 2)} kWp</p>
      </div>
    </div>
  );
}
