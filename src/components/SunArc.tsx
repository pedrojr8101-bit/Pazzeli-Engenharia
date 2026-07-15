interface SunArcProps {
  /** HSP (horas de sol pleno) da localização — quando informado, o sol é
   * posicionado no arco de acordo com esse valor (modo "dado real"). */
  hsp?: number;
  /** Rótulo pequeno abaixo do arco. */
  label?: string;
  className?: string;
}

// Faixa de referência de HSP no Brasil — usada só para posicionar o sol no
// arco de forma proporcional (não é um limite técnico rígido).
const HSP_MIN_REFERENCIA = 4.0;
const HSP_MAX_REFERENCIA = 6.2;

function posicaoNoArco(t: number) {
  const anguloGraus = 180 - 180 * t;
  const anguloRad = (anguloGraus * Math.PI) / 180;
  const cx = 200 + 180 * Math.cos(anguloRad);
  const cy = 180 - 160 * Math.sin(anguloRad);
  return { cx, cy };
}

export function SunArc({ hsp, label, className }: SunArcProps) {
  const t = hsp
    ? Math.min(
        1,
        Math.max(
          0,
          (hsp - HSP_MIN_REFERENCIA) / (HSP_MAX_REFERENCIA - HSP_MIN_REFERENCIA)
        )
      )
    : 0.5;
  const { cx, cy } = posicaoNoArco(t);

  return (
    <div className={className}>
      <svg viewBox="0 0 400 200" className="w-full" aria-hidden={hsp === undefined}>
        <line x1="10" y1="180" x2="390" y2="180" stroke="currentColor" className="text-borderlight" strokeWidth="1" />

        <path
          d="M 20 180 A 180 160 0 0 1 380 180"
          fill="none"
          stroke="currentColor"
          className="text-borderlight animate-arc-draw"
          strokeWidth="1.5"
          strokeDasharray="220"
          strokeLinecap="round"
        />

        <circle cx={cx} cy={cy} r="10" className="fill-sun" />
        <circle cx={cx} cy={cy} r="18" className="fill-sun/20" />

        {hsp !== undefined && (
          <text
            x={cx}
            y={cy - 26}
            textAnchor="middle"
            className="fill-graphite font-mono text-[13px]"
          >
            {hsp.toFixed(1)} h
          </text>
        )}
      </svg>
      {label && <p className="mt-1 text-center text-xs text-graphitesoft">{label}</p>}
    </div>
  );
}
