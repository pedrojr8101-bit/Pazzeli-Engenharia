interface PontoProducao {
  date: string;
  total: number;
  totalExpected: number;
}

export function GraficoProducaoDiaria({ dados }: { dados: PontoProducao[] }) {
  if (dados.length === 0) return null;

  const largura = 600;
  const altura = 180;
  const maximo = Math.max(1, ...dados.flatMap((d) => [d.total, d.totalExpected]));
  const larguraBarra = largura / dados.length;

  return (
    <div>
      <svg viewBox={`0 0 ${largura} ${altura + 10}`} className="w-full" style={{ height: 160 }}>
        <line x1={0} y1={altura} x2={largura} y2={altura} stroke="#E5E1D6" strokeWidth={1} />
        {dados.map((d, i) => {
          const x = i * larguraBarra;
          const alturaReal = (d.total / maximo) * (altura - 10);
          const alturaEsperada = (d.totalExpected / maximo) * (altura - 10);
          return (
            <g key={d.date}>
              <rect
                x={x + larguraBarra * 0.15}
                y={altura - alturaEsperada}
                width={larguraBarra * 0.7}
                height={alturaEsperada}
                fill="#E5E1D6"
              />
              <rect
                x={x + larguraBarra * 0.25}
                y={altura - alturaReal}
                width={larguraBarra * 0.5}
                height={alturaReal}
                fill="#F5A623"
              />
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center justify-between text-xs text-graphitesoft">
        <span>{new Date(dados[0].date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-sun" /> Gerado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-borderlight" /> Esperado
          </span>
        </div>
        <span>
          {new Date(dados[dados.length - 1].date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      </div>
    </div>
  );
}
