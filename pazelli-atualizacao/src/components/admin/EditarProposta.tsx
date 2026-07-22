"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface ItemProposta {
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
}

interface EditarPropostaProps {
  simulacaoId: string;
  investimentoEstimado: number;
  investimentoFinalAtual: number | null;
  observacoesAtuais: string | null;
  itensAtuais: ItemProposta[] | null;
  tipoEstruturaAtual: string | null;
  clienteCpfAtual: string | null;
  clienteEnderecoAtual: string | null;
  margemLucroAtual: number | null;
  valorServicoAtual: number | null;
}

const TIPOS_ESTRUTURA = ["Cerâmico", "Metálico", "Fibrocimento", "Laje", "Solo"];

function novoItemVazio(): ItemProposta {
  return { descricao: "", unidade: "un", quantidade: 1, valorUnitario: 0 };
}

export function EditarProposta({
  simulacaoId,
  investimentoEstimado,
  investimentoFinalAtual,
  observacoesAtuais,
  itensAtuais,
  tipoEstruturaAtual,
  clienteCpfAtual,
  clienteEnderecoAtual,
  margemLucroAtual,
  valorServicoAtual,
}: EditarPropostaProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [investimentoFinal, setInvestimentoFinal] = useState(
    investimentoFinalAtual !== null ? String(investimentoFinalAtual) : ""
  );
  const [observacoes, setObservacoes] = useState(observacoesAtuais ?? "");
  const [itens, setItens] = useState<ItemProposta[]>(
    itensAtuais && itensAtuais.length > 0 ? itensAtuais : [novoItemVazio()]
  );
  const [tipoEstrutura, setTipoEstrutura] = useState(tipoEstruturaAtual ?? TIPOS_ESTRUTURA[0]);
  const [clienteCpf, setClienteCpf] = useState(clienteCpfAtual ?? "");
  const [clienteEndereco, setClienteEndereco] = useState(clienteEnderecoAtual ?? "");
  const [margemLucro, setMargemLucro] = useState(
    margemLucroAtual !== null && margemLucroAtual !== undefined ? String(margemLucroAtual) : ""
  );
  const [valorServico, setValorServico] = useState(
    valorServicoAtual !== null && valorServicoAtual !== undefined ? String(valorServicoAtual) : ""
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function atualizarItem(indice: number, campo: keyof ItemProposta, valor: string) {
    setItens((atual) =>
      atual.map((item, i) => {
        if (i !== indice) return item;
        if (campo === "quantidade" || campo === "valorUnitario") {
          return { ...item, [campo]: Number(valor.replace(",", ".")) || 0 };
        }
        return { ...item, [campo]: valor };
      })
    );
  }

  function removerItem(indice: number) {
    setItens((atual) => atual.filter((_, i) => i !== indice));
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    const itensValidos = itens.filter((item) => item.descricao.trim().length > 0);

    try {
      const res = await fetch(`/api/admin/simulacoes/${simulacaoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investimentoFinal: investimentoFinal ? Number(investimentoFinal) : null,
          observacoesProposta: observacoes.trim() || null,
          itensProposta: itensValidos.length > 0 ? itensValidos : null,
          tipoEstrutura,
          clienteCpf: clienteCpf.trim() || null,
          clienteEnderecoCompleto: clienteEndereco.trim() || null,
          margemLucroPercentual: margemLucro ? Number(margemLucro) : null,
          valorServico: valorServico ? Number(valorServico.replace(",", ".")) : null,
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

  const totalItens = itens.reduce((soma, item) => soma + item.quantidade * item.valorUnitario, 0);

  return (
    <form
      onSubmit={salvar}
      className="mt-4 space-y-6 rounded-xl border border-duskline bg-night/60 p-4"
    >
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-paper/40">
          Preço e observações
        </p>
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

        <label htmlFor={`obs-${simulacaoId}`} className="mb-1 mt-3 block text-xs text-paper/50">
          Observações (aparecem na proposta em PDF)
        </label>
        <textarea
          id={`obs-${simulacaoId}`}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={2}
          placeholder="Ex: desconto de 5% para pagamento à vista..."
          className="w-full rounded-lg border border-duskline bg-dusk px-3 py-2 text-sm text-paper outline-none focus:border-sun"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-paper/40">
          Tipo de estrutura do telhado
        </p>
        <div className="flex flex-wrap gap-2">
          {TIPOS_ESTRUTURA.map((tipo) => (
            <button
              type="button"
              key={tipo}
              onClick={() => setTipoEstrutura(tipo)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                tipoEstrutura === tipo
                  ? "border-sun bg-sun/10 text-sun"
                  : "border-duskline text-paper/60 hover:border-paper/30"
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-paper/40">
            Itens do kit (aparecem na página de produtos)
          </p>
          <button
            type="button"
            onClick={() => setItens((atual) => [...atual, novoItemVazio()])}
            className="text-xs text-sun hover:text-sunlight"
          >
            + adicionar item
          </button>
        </div>
        <div className="space-y-2">
          {itens.map((item, indice) => (
            <div key={indice} className="grid grid-cols-[1fr_60px_70px_90px_auto] gap-2">
              <input
                value={item.descricao}
                onChange={(e) => atualizarItem(indice, "descricao", e.target.value)}
                placeholder="Ex: Inversor Modelo X"
                className="rounded-lg border border-duskline bg-dusk px-2 py-1.5 text-xs text-paper outline-none focus:border-sun"
              />
              <input
                value={item.unidade}
                onChange={(e) => atualizarItem(indice, "unidade", e.target.value)}
                placeholder="un"
                className="rounded-lg border border-duskline bg-dusk px-2 py-1.5 text-xs text-paper outline-none focus:border-sun"
              />
              <input
                value={item.quantidade || ""}
                onChange={(e) => atualizarItem(indice, "quantidade", e.target.value)}
                placeholder="Qtde"
                inputMode="decimal"
                className="rounded-lg border border-duskline bg-dusk px-2 py-1.5 text-xs text-paper outline-none focus:border-sun"
              />
              <input
                value={item.valorUnitario || ""}
                onChange={(e) => atualizarItem(indice, "valorUnitario", e.target.value)}
                placeholder="R$ unit."
                inputMode="decimal"
                className="rounded-lg border border-duskline bg-dusk px-2 py-1.5 text-xs text-paper outline-none focus:border-sun"
              />
              <button
                type="button"
                onClick={() => removerItem(indice)}
                className="text-xs text-paper/30 hover:text-ember"
              >
                remover
              </button>
            </div>
          ))}
        </div>
        {totalItens > 0 && (
          <p className="mt-2 text-xs text-paper/40">Total dos itens (custo): {moeda(totalItens)}</p>
        )}

        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-duskline bg-night/40 p-3">
          <div>
            <label htmlFor={`margem-${simulacaoId}`} className="mb-1 block text-xs text-paper/50">
              Margem de lucro (%)
            </label>
            <input
              id={`margem-${simulacaoId}`}
              inputMode="decimal"
              value={margemLucro}
              onChange={(e) => setMargemLucro(e.target.value.replace(/[^\d.,]/g, ""))}
              placeholder="ex: 30"
              className="w-24 rounded-lg border border-duskline bg-dusk px-2 py-1.5 text-sm text-paper outline-none focus:border-sun"
            />
          </div>

          {totalItens > 0 && margemLucro && (
            <>
              <div>
                <p className="text-xs text-paper/50">Preço sugerido</p>
                <p className="font-mono text-sm text-sky">
                  {moeda(totalItens * (1 + Number(margemLucro.replace(",", ".")) / 100))}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setInvestimentoFinal(
                    (totalItens * (1 + Number(margemLucro.replace(",", ".")) / 100)).toFixed(2)
                  )
                }
                className="rounded-full border border-sun/50 px-3 py-1.5 text-xs text-sun hover:bg-sun/10"
              >
                Usar como preço final
              </button>
            </>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-paper/40">
          Taxa de serviço (instalação/mão de obra)
        </p>
        <label htmlFor={`servico-${simulacaoId}`} className="mb-1 block text-xs text-paper/50">
          Valor da taxa de serviço vendida (R$) — separado do custo de material acima, usado no
          dashboard de faturamento
        </label>
        <input
          id={`servico-${simulacaoId}`}
          inputMode="decimal"
          value={valorServico}
          onChange={(e) => setValorServico(e.target.value.replace(/[^\d.,]/g, ""))}
          placeholder="ex: 3500"
          className="w-40 rounded-lg border border-duskline bg-dusk px-3 py-2 text-sm text-paper outline-none focus:border-sun"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-paper/40">
          Dados para o termo de aceite (preencher no fechamento)
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={clienteCpf}
            onChange={(e) => setClienteCpf(e.target.value)}
            placeholder="CPF do cliente"
            className="rounded-lg border border-duskline bg-dusk px-3 py-2 text-sm text-paper outline-none focus:border-sun"
          />
          <input
            value={clienteEndereco}
            onChange={(e) => setClienteEndereco(e.target.value)}
            placeholder="Endereço completo (rua, número, bairro)"
            className="rounded-lg border border-duskline bg-dusk px-3 py-2 text-sm text-paper outline-none focus:border-sun"
          />
        </div>
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
