"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatusSelect } from "./StatusSelect";

interface SimulacaoResumo {
  id: string;
  potenciaInstaladaKwp: number;
  investimentoEstimado: number;
  investimentoFinal: number | null;
}

interface LeadResumo {
  id: string;
  nome: string;
  email: string;
  cidade: string | null;
  uf: string | null;
  status: string;
  simulacoes: SimulacaoResumo[];
}

const OPCOES_STATUS = [
  { valor: "TODOS", rotulo: "Todos os status" },
  { valor: "NOVO", rotulo: "Novo" },
  { valor: "CONTATADO", rotulo: "Contatado" },
  { valor: "PROPOSTA_ENVIADA", rotulo: "Proposta enviada" },
  { valor: "CONVERTIDO", rotulo: "Convertido" },
  { valor: "PERDIDO", rotulo: "Perdido" },
] as const;

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function LeadsTable({ leads }: { leads: LeadResumo[] }) {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("TODOS");

  const leadsFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return leads.filter((lead) => {
      const bateStatus = status === "TODOS" || lead.status === status;
      const bateBusca =
        !termo ||
        lead.nome.toLowerCase().includes(termo) ||
        lead.email.toLowerCase().includes(termo) ||
        (lead.cidade ?? "").toLowerCase().includes(termo);
      return bateStatus && bateBusca;
    });
  }, [leads, busca, status]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, e-mail ou cidade..."
          className="flex-1 rounded-lg border border-duskline bg-dusk px-4 py-2.5 text-sm text-paper outline-none focus:border-sun"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-duskline bg-dusk px-4 py-2.5 text-sm text-paper outline-none focus:border-sun"
        >
          {OPCOES_STATUS.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-3 text-xs text-paper/40">
        {leadsFiltrados.length} de {leads.length} leads
      </p>

      {leadsFiltrados.length === 0 ? (
        <p className="rounded-2xl border border-duskline p-6 text-sm text-paper/50">
          Nenhum lead encontrado com esses filtros.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-duskline">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-duskline text-xs uppercase tracking-wide text-paper/40">
              <tr>
                <th className="px-4 py-3 font-normal">Nome</th>
                <th className="px-4 py-3 font-normal">Cidade</th>
                <th className="px-4 py-3 font-normal">Sistema</th>
                <th className="px-4 py-3 font-normal">Preço</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Proposta</th>
              </tr>
            </thead>
            <tbody>
              {leadsFiltrados.map((lead) => {
                const simulacao = lead.simulacoes[0];
                const preco = simulacao
                  ? simulacao.investimentoFinal ?? simulacao.investimentoEstimado
                  : null;
                return (
                  <tr key={lead.id} className="border-b border-duskline last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/admin/leads/${lead.id}`} className="text-paper hover:text-sun">
                        {lead.nome}
                      </Link>
                      <p className="text-xs text-paper/40">{lead.email}</p>
                    </td>
                    <td className="px-4 py-3 text-paper/70">
                      {lead.cidade ? `${lead.cidade}/${lead.uf}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-paper/70">
                      {simulacao ? `${simulacao.potenciaInstaladaKwp.toFixed(1)} kWp` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {preco !== null ? (
                        <span className={simulacao?.investimentoFinal ? "text-sun" : "text-paper/70"}>
                          {moeda(preco)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect leadId={lead.id} statusAtual={lead.status} />
                    </td>
                    <td className="px-4 py-3">
                      {simulacao ? (
                        <a
                          href={`/api/admin/simulacoes/${simulacao.id}/proposta`}
                          className="text-sun hover:text-sunlight"
                        >
                          Baixar PDF
                        </a>
                      ) : (
                        <span className="text-paper/30">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
