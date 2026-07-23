"use client";

import { useId, useState } from "react";

interface PontoSerie {
  rotulo: string;
  valor: number;
}

const LARGURA = 640;
const ALTURA = 220;
const PADDING_X = 24;
const PADDING_TOPO = 20;
const PADDING_BASE = 32;

function gerarPontos(serie: PontoSerie[], maximo: number) {
  const areaUtil = LARGURA - PADDING_X * 2;
  const passo = serie.length > 1 ? areaUtil / (serie.length - 1) : 0;
  const alturaUtil = ALTURA - PADDING_TOPO - PADDING_BASE;

  return serie.map((ponto, i) => {
    const x = PADDING_X + passo * i;
    const y = PADDING_TOPO + alturaUtil - (maximo > 0 ? (ponto.valor / maximo) * alturaUtil : 0);
    return { ...ponto, x, y };
  });
}

/** Gráfico de linha/área com destaque ao passar o mouse — sem dependência externa. */
export function LinhaTempoChart({
  titulo,
  series,
  vazio = "Sem dados suficientes ainda.",
}: {
  titulo: string;
  series: { nome: string; cor: string; corArea: string; pontos: PontoSerie[] }[];
  vazio?: string;
}) {
  const gradId = useId();
  const [ativo, setAtivo] = useState<number | null>(null);

  const temDados = series.some((s) => s.pontos.length > 0);
  const maximo = Math.max(1, ...series.flatMap((s) => s.pontos.map((p) => p.valor)));
  const rotulos = series[0]?.pontos.map((p) => p.rotulo) ?? [];

  return (
    <div className="rounded-2xl border border-duskline p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-paper">{titulo}</p>
        <div className="flex gap-4">
          {series.map((s) => (
            <span key={s.nome} className="flex items-center gap-1.5 text-xs text-paper/50">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: s.cor }}
                aria-hidden
              />
              {s.nome}
            </span>
          ))}
        </div>
      </div>

      {!temDados ? (
        <p className="text-sm text-paper/40">{vazio}</p>
      ) : (
        <svg
          viewBox={`0 0 ${LARGURA} ${ALTURA}`}
          className="w-full overflow-visible"
          role="img"
          aria-label={titulo}
        >
          <defs>
            {series.map((s) => (
              <linearGradient key={s.nome} id={`${gradId}-${s.nome}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.corArea} stopOpacity="0.35" />
                <stop offset="100%" stopColor={s.corArea} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {[0.25, 0.5, 0.75, 1].map((fracao) => (
            <line
              key={fracao}
              x1={PADDING_X}
              x2={LARGURA - PADDING_X}
              y1={PADDING_TOPO + (ALTURA - PADDING_TOPO - PADDING_BASE) * (1 - fracao)}
              y2={PADDING_TOPO + (ALTURA - PADDING_TOPO - PADDING_BASE) * (1 - fracao)}
              stroke="currentColor"
              className="text-duskline"
              strokeWidth="1"
            />
          ))}

          {series.map((s) => {
            const pontos = gerarPontos(s.pontos, maximo);
            const linha = pontos.map((p) => `${p.x},${p.y}`).join(" ");
            const area = `${PADDING_X},${ALTURA - PADDING_BASE} ${linha} ${
              LARGURA - PADDING_X
            },${ALTURA - PADDING_BASE}`;

            return (
              <g key={s.nome}>
                <polygon points={area} fill={`url(#${gradId}-${s.nome})`} />
                <polyline
                  points={linha}
                  fill="none"
                  stroke={s.cor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {pontos.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={ativo === i ? 5 : 3}
                    fill={s.cor}
                    className="transition-all"
                    onMouseEnter={() => setAtivo(i)}
                    onMouseLeave={() => setAtivo(null)}
                  >
                    <title>
                      {p.rotulo}: {p.valor}
                    </title>
                  </circle>
                ))}
              </g>
            );
          })}

          {rotulos.map((rotulo, i) => {
            const areaUtil = LARGURA - PADDING_X * 2;
            const passo = rotulos.length > 1 ? areaUtil / (rotulos.length - 1) : 0;
            return (
              <text
                key={rotulo}
                x={PADDING_X + passo * i}
                y={ALTURA - 10}
                textAnchor="middle"
                className="fill-current text-[10px] text-paper/40"
              >
                {rotulo}
              </text>
            );
          })}
        </svg>
      )}
    </div>
  );
}
