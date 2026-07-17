"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OPCOES = [
  { valor: "NOVO", rotulo: "Novo" },
  { valor: "CONTATADO", rotulo: "Contatado" },
  { valor: "PROPOSTA_ENVIADA", rotulo: "Proposta enviada" },
  { valor: "CONVERTIDO", rotulo: "Convertido" },
  { valor: "PERDIDO", rotulo: "Perdido" },
] as const;

export function StatusSelect({ leadId, statusAtual }: { leadId: string; statusAtual: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(statusAtual);
  const [salvando, setSalvando] = useState(false);

  async function alterar(novoStatus: string) {
    setStatus(novoStatus);
    setSalvando(true);
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <select
      value={status}
      disabled={salvando}
      onChange={(e) => alterar(e.target.value)}
      className="rounded-full border border-duskline bg-dusk px-3 py-1.5 text-xs text-paper outline-none focus:border-sun disabled:opacity-50"
    >
      {OPCOES.map((opcao) => (
        <option key={opcao.valor} value={opcao.valor}>
          {opcao.rotulo}
        </option>
      ))}
    </select>
  );
}
