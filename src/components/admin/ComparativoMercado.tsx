export function ComparativoMercado({
  suaTaxa,
  referenciaMercado,
}: {
  suaTaxa: number;
  referenciaMercado: number;
}) {
  const maximo = Math.max(suaTaxa, referenciaMercado, 1);

  return (
    <div className="rounded-2xl border border-duskline p-5">
      <p className="mb-1 text-sm font-semibold text-paper">Sua conversão x mercado</p>
      <p className="mb-4 text-xs text-paper/40">
        Referência geral do setor de energia solar B2C no Brasil — não é um dado exclusivo seu,
        serve só de régua aproximada.
      </p>

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-paper/70">Pazelli</span>
            <span className="font-mono text-paper">{suaTaxa.toFixed(0)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-night">
            <div
              className="h-full rounded-full bg-sun"
              style={{ width: `${Math.max(4, (suaTaxa / maximo) * 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-paper/70">Referência de mercado</span>
            <span className="font-mono text-paper">{referenciaMercado.toFixed(0)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-night">
            <div
              className="h-full rounded-full bg-paper/30"
              style={{ width: `${Math.max(4, (referenciaMercado / maximo) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-paper/50">
        {suaTaxa >= referenciaMercado
          ? "Você está acima da referência de mercado."
          : "Você está abaixo da referência de mercado — pode valer revisar o funil de contato."}
      </p>
    </div>
  );
}
