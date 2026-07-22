"use client";

import { useEffect, useState, type FormEvent } from "react";

interface Chamado {
  id: string;
  tipo: string;
  descricao: string;
  status: string;
  createdAt: string;
}

const TIPOS = [
  { valor: "LIMPEZA", rotulo: "Limpeza dos painéis" },
  { valor: "MANUTENCAO", rotulo: "Manutenção" },
  { valor: "REVISAO_TECNICA", rotulo: "Revisão técnica" },
  { valor: "OUTRO", rotulo: "Outro assunto" },
] as const;

const ROTULOS_STATUS: Record<string, string> = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

const CORES_STATUS: Record<string, string> = {
  ABERTO: "bg-sun/15 text-sun",
  EM_ANDAMENTO: "bg-sky/15 text-sky",
  CONCLUIDO: "bg-[#2F7D46]/15 text-[#2F7D46]",
  CANCELADO: "bg-graphite/10 text-graphite/50",
};

export function PainelPosVenda() {
  const [chamados, setChamados] = useState<Chamado[] | null>(null);
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]["valor"]>("LIMPEZA");
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function carregar() {
    fetch("/api/cliente/chamados")
      .then((res) => res.json())
      .then((data) => setChamados(data.chamados ?? []))
      .catch(() => setChamados([]));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch("/api/cliente/chamados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, descricao }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível abrir o chamado.");
        return;
      }
      setDescricao("");
      setAberto(false);
      carregar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-borderlight p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-base font-semibold text-graphite">
            Limpeza, manutenção ou suporte
          </p>
          <p className="mt-1 text-sm text-graphitesoft">
            Precisa de uma visita técnica? Abra um chamado por aqui.
          </p>
        </div>
        {!aberto && (
          <button
            onClick={() => setAberto(true)}
            className="rounded-full bg-sun px-5 py-2.5 text-sm font-semibold text-graphite transition hover:bg-sunlight"
          >
            Abrir chamado
          </button>
        )}
      </div>

      {aberto && (
        <form onSubmit={enviar} className="mt-5 space-y-4 border-t border-borderlight pt-5">
          <div>
            <p className="mb-2 text-sm text-graphitesoft">O que você precisa?</p>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map((t) => (
                <button
                  type="button"
                  key={t.valor}
                  onClick={() => setTipo(t.valor)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    tipo === t.valor
                      ? "border-sun bg-sun/10 text-graphite"
                      : "border-borderlight text-graphitesoft hover:border-graphite/30"
                  }`}
                >
                  {t.rotulo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="descricao-chamado" className="mb-1 block text-sm text-graphitesoft">
              Conte um pouco mais
            </label>
            <textarea
              id="descricao-chamado"
              required
              minLength={5}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              placeholder="Ex: os painéis estão com bastante poeira acumulada..."
              className="w-full rounded-lg border border-borderlight bg-cloud px-3 py-2 text-sm text-graphite outline-none focus:border-sun"
            />
          </div>

          {erro && <p className="text-sm text-ember">{erro}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={enviando}
              className="rounded-full bg-sun px-5 py-2.5 text-sm font-semibold text-graphite transition hover:bg-sunlight disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Enviar chamado"}
            </button>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="text-sm text-graphitesoft hover:text-graphite"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {chamados && chamados.length > 0 && (
        <div className="mt-6 space-y-2 border-t border-borderlight pt-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-graphite/40">
            Seus chamados
          </p>
          {chamados.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-borderlight px-3 py-2.5 text-sm"
            >
              <div>
                <p className="text-graphite">
                  {TIPOS.find((t) => t.valor === c.tipo)?.rotulo ?? c.tipo}
                </p>
                <p className="text-xs text-graphitesoft">
                  {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  CORES_STATUS[c.status] ?? "bg-cloud text-graphitesoft"
                }`}
              >
                {ROTULOS_STATUS[c.status] ?? c.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
