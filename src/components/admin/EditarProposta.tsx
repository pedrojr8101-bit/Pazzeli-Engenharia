"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface EditarPropostaProps {
  simulacaoId: string;
  investimentoEstimado: number;
  investimentoFinalAtual: number | null;
  observacoesAtuais: string | null;
}

export function EditarProposta({
  simulacaoId,
  investimentoEstimado,
  investimentoFinalAtual,
  observacoesAtuais,
}: EditarPropostaProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [investimentoFinal, setInvestimentoFinal] = useState(
    investimentoFinalAtual !== null ? String(investimentoFinalAtual) : ""
  );
  const [observacoes, setObservacoes] = useState(observacoesAtuais ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    try {
      const res = await fetch(`/api/admin/simulacoes/${simulacaoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investimentoFinal: investimentoFinal ? Number(investimentoFinal) : null,
          observacoesProposta: observacoes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErro(data.erro ?? "Não foi possível salvar.");
        return;
      }

      setAberto(false);
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="rounded-full border border-duskline px-4 py-2 text-xs text-paper/80 hover:border-sun hover:text-sun"
      >
        Editar proposta
      </button>
    );
  }

  return (
    <form
      onSubmit={salvar}
      className="mt-4 space-y-4 rounded-xl border border-duskline bg-night/60 p-4"
    >
      <div>
        <label htmlFor={`investimento-${simulacaoId}`} className="mb-1 block text-xs text-paper/50">
          Preço final negociado (R$) — em branco usa a estimativa automática ({moeda(investimentoEstimado)})
        </label>
        <input
          id={`investimento-${simulacaoId}`}
          inputMode="decimal"
          value={investimentoFinal}
          onChange={(e) => setInvestimentoFinal(e.target.value.replace(/[^\d.,]/g, ""))}
          placeholder={String(investimentoEstimado)}
          className="w-full rounded-lg border border-duskline bg-dusk px-3 py-2 text-sm text-paper outline-none focus:border-sun"
        />
      </div>

      <div>
        <label htmlFor={`obs-${simulacaoId}`} className="mb-1 block text-xs text-paper/50">
          Observações (aparecem na proposta em PDF)
        </label>
        <textarea
          id={`obs-${simulacaoId}`}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
          placeholder="Ex: desconto de 5% para pagamento à vista, inclui instalação e vistoria técnica..."
          className="w-full rounded-lg border border-duskline bg-dusk px-3 py-2 text-sm text-paper outline-none focus:border-sun"
        />
      </div>

      {erro && <p className="text-sm text-ember">{erro}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-full bg-sun px-5 py-2 text-xs font-semibold text-night transition hover:bg-sunlight disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="text-xs text-paper/50 hover:text-paper"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
