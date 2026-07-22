interface ItemBarra {
  rotulo: string;
  valor: number;
  destaque?: boolean;
}

function formatarValor(valor: number, formato?: "moeda" | "numero") {
  if (formato === "moeda") {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  return valor.toLocaleString("pt-BR");
}

/** Gráfico de barras horizontais simples, sem dependência externa. */
export function BarraComparativa({
  titulo,
  itens,
  formato = "numero",
  vazio = "Sem dados ainda.",
}: {
  titulo: string;
  itens: ItemBarra[];
  formato?: "moeda" | "numero";
  vazio?: string;
}) {
  const maximo = Math.max(1, ...itens.map((item) => item.valor));

  return (
    <div className="rounded-2xl border border-duskline p-5">
      <p className="mb-4 text-sm font-semibold text-paper">{titulo}</p>

      {itens.length === 0 ? (
        <p className="text-sm text-paper/40">{vazio}</p>
      ) : (
        <div className="space-y-3">
          {itens.map((item) => {
            const largura = Math.max(4, (item.valor / maximo) * 100);
            return (
              <div key={item.rotulo} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 truncate text-paper/60">{item.rotulo}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-night">
                  <div
                    className={`h-full rounded-full ${item.destaque ? "bg-sun" : "bg-sky"}`}
                    style={{ width: `${largura}%` }}
                  />
                </div>
                <span className="w-24 shrink-0 text-right font-mono text-xs text-paper/70">
                  {formatarValor(item.valor, formato)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
