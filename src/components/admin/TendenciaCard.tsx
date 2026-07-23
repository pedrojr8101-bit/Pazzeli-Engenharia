export function TendenciaCard({
  rotulo,
  valorAtual,
  valorAnterior,
  sufixo = "",
}: {
  rotulo: string;
  valorAtual: number;
  valorAnterior: number;
  sufixo?: string;
}) {
  const variacao =
    valorAnterior > 0
      ? ((valorAtual - valorAnterior) / valorAnterior) * 100
      : valorAtual > 0
        ? 100
        : 0;
  const subiu = variacao >= 0;

  return (
    <div className="rounded-2xl border border-duskline p-5">
      <p className="text-xs uppercase tracking-wide text-paper/40">{rotulo}</p>
      <div className="mt-2 flex items-end gap-3">
        <p className="font-display text-3xl font-semibold text-paper">
          {valorAtual}
          {sufixo}
        </p>
        <span
          className={`mb-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            subiu ? "bg-[#1D9E75]/15 text-[#1D9E75]" : "bg-ember/15 text-ember"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-3 w-3 ${subiu ? "" : "rotate-180"}`}
            aria-hidden
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          {Math.abs(variacao).toFixed(0)}%
        </span>
      </div>
      <p className="mt-1 text-xs text-paper/40">vs. mês anterior ({valorAnterior}{sufixo})</p>
    </div>
  );
}
