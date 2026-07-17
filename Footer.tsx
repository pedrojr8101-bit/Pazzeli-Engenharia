const RÓTULOS: Record<string, string> = {
  NOVO: "Novo",
  CONTATADO: "Contatado",
  PROPOSTA_ENVIADA: "Proposta enviada",
  CONVERTIDO: "Convertido",
  PERDIDO: "Perdido",
};

const CORES: Record<string, string> = {
  NOVO: "bg-sky",
  CONTATADO: "bg-sun",
  PROPOSTA_ENVIADA: "bg-ember",
  CONVERTIDO: "bg-sun",
  PERDIDO: "bg-duskline",
};

export function StatusBarChart({ contagem }: { contagem: Record<string, number> }) {
  const maximo = Math.max(1, ...Object.values(contagem));

  return (
    <div className="space-y-3 rounded-2xl border border-duskline p-5">
      {Object.entries(RÓTULOS).map(([status, rotulo]) => {
        const total = contagem[status] ?? 0;
        const largura = Math.max(4, (total / maximo) * 100);
        return (
          <div key={status} className="flex items-center gap-3 text-sm">
            <span className="w-32 shrink-0 text-paper/60">{rotulo}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-night">
              <div
                className={`h-full rounded-full ${CORES[status]}`}
                style={{ width: `${largura}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right font-mono text-paper/70">{total}</span>
          </div>
        );
      })}
    </div>
  );
}
