"use client";

import { useMemo, useState } from "react";

interface ChamadoResumo {
  id: string;
  tipo: string;
  descricao: string;
  status: string;
  valorCobrado: number | null;
  createdAt: string;
  lead: { id: string; nome: string; email: string; telefone: string };
}

const OPCOES_STATUS = [
  { valor: "ABERTO", rotulo: "Aberto" },
  { valor: "EM_ANDAMENTO", rotulo: "Em andamento" },
  { valor: "CONCLUIDO", rotulo: "Concluído" },
  { valor: "CANCELADO", rotulo: "Cancelado" },
] as const;

const ROTULOS_TIPO: Record<string, string> = {
  LIMPEZA: "Limpeza",
  MANUTENCAO: "Manutenção",
  REVISAO_TECNICA: "Revisão técnica",
  OUTRO: "Outro",
};

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function LinhaChamado({ chamado }: { chamado: ChamadoResumo }) {
  const [status, setStatus] = useState(chamado.status);
  const [valorCobrado, setValorCobrado] = useState(
    chamado.valorCobrado !== null ? String(chamado.valorCobrado) : ""
  );
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  async function salvar(novoStatus?: string) {
    setSalvando(true);
    setSalvo(false);
    try {
      await fetch(`/api/admin/chamados/${chamado.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: novoStatus ?? status,
          valorCobrado: valorCobrado ? Number(valorCobrado.replace(",", ".")) : null,
        }),
      });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 1500);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <tr className="border-b border-duskline last:border-0">
      <td className="px-4 py-3">
        <p className="text-paper">{chamado.lead.nome}</p>
        <p className="text-xs text-paper/40">
          {chamado.lead.email} · {chamado.lead.telefone}
        </p>
      </td>
      <td className="px-4 py-3 text-paper/70">{ROTULOS_TIPO[chamado.tipo] ?? chamado.tipo}</td>
      <td className="max-w-xs px-4 py-3 text-paper/60">{chamado.descricao}</td>
      <td className="px-4 py-3 text-paper/40">
        {new Date(chamado.createdAt).toLocaleDateString("pt-BR")}
      </td>
      <td className="px-4 py-3">
        <select
          value={status}
          disabled={salvando}
          onChange={(e) => {
            setStatus(e.target.value);
            salvar(e.target.value);
          }}
          className="rounded-full border border-duskline bg-dusk px-3 py-1.5 text-xs text-paper outline-none focus:border-sun disabled:opacity-50"
        >
          {OPCOES_STATUS.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <input
          value={valorCobrado}
          onChange={(e) => setValorCobrado(e.target.value.replace(/[^\d.,]/g, ""))}
          onBlur={() => salvar()}
          placeholder="R$ cobrado"
          className="w-28 rounded-lg border border-duskline bg-dusk px-2 py-1.5 text-xs text-paper outline-none focus:border-sun"
        />
        {salvo && <span className="ml-2 text-xs text-sky">salvo</span>}
      </td>
    </tr>
  );
}

export function GerenciarChamados({ chamados }: { chamados: ChamadoResumo[] }) {
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  const filtrados = useMemo(() => {
    if (filtroStatus === "TODOS") return chamados;
    return chamados.filter((c) => c.status === filtroStatus);
  }, [chamados, filtroStatus]);

  const totalCobrado = chamados.reduce((soma, c) => soma + (c.valorCobrado ?? 0), 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="rounded-lg border border-duskline bg-dusk px-4 py-2.5 text-sm text-paper outline-none focus:border-sun"
        >
          <option value="TODOS">Todos os status</option>
          {OPCOES_STATUS.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
        <p className="text-sm text-paper/50">
          {filtrados.length} de {chamados.length} chamados · faturado até agora:{" "}
          <span className="text-sun">{moeda(totalCobrado)}</span>
        </p>
      </div>

      {filtrados.length === 0 ? (
        <p className="rounded-2xl border border-duskline p-6 text-sm text-paper/50">
          Nenhum chamado encontrado com esse filtro.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-duskline">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-duskline text-xs uppercase tracking-wide text-paper/40">
              <tr>
                <th className="px-4 py-3 font-normal">Cliente</th>
                <th className="px-4 py-3 font-normal">Tipo</th>
                <th className="px-4 py-3 font-normal">Descrição</th>
                <th className="px-4 py-3 font-normal">Aberto em</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Valor cobrado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((chamado) => (
                <LinhaChamado key={chamado.id} chamado={chamado} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
