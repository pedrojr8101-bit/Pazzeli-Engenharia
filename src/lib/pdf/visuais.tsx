import { Circle, Defs, LinearGradient, Path, Rect, Stop, Svg } from "@react-pdf/renderer";

/**
 * Ilustração original da capa: céu em gradiente + fileiras de painéis solares
 * estilizados. Não reproduz nenhuma foto de terceiros — é vetor desenhado do
 * zero, na mesma linguagem visual (céu azul, painéis, composição horizontal).
 */
export function IlustracaoCapa() {
  const paineis = [];
  for (let linha = 0; linha < 3; linha++) {
    for (let coluna = 0; coluna < 7; coluna++) {
      const x = 20 + coluna * 78 - linha * 14;
      const y = 480 + linha * 34;
      paineis.push(
        <Rect
          key={`${linha}-${coluna}`}
          x={x}
          y={y}
          width={64}
          height={26}
          rx={2}
          fill="#14263B"
          opacity={0.9 - linha * 0.12}
        />
      );
    }
  }

  return (
    <Svg viewBox="0 0 595 620" style={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
      <Defs>
        <LinearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#BEE3F8" />
          <Stop offset="1" stopColor="#FFFFFF" />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={595} height={620} fill="url(#ceu)" />
      <Circle cx={480} cy={90} r={46} fill="#F7C948" opacity={0.8} />
      <Path
        d="M 0 470 Q 150 430 300 465 T 595 450 L 595 620 L 0 620 Z"
        fill="#E4EEF6"
      />
      {paineis}
    </Svg>
  );
}

/** Faixa ondulada decorativa, usada como divisória sutil entre seções. */
export function OndaDecorativa({ cor = "#E5E1D6" }: { cor?: string }) {
  return (
    <Svg viewBox="0 0 500 40" style={{ width: "100%", height: 24 }}>
      <Path
        d="M 0 20 Q 62 0 125 20 T 250 20 T 375 20 T 500 20"
        stroke={cor}
        strokeWidth={1.5}
        fill="none"
      />
    </Svg>
  );
}

export function IconeNuvem({ cor = "#5B5B57" }: { cor?: string }) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
      <Path
        d="M6.5 19a4.5 4.5 0 0 1-.4-8.98A5.5 5.5 0 0 1 16.9 8.1 4 4 0 0 1 17.5 16H6.5Z"
        fill="none"
        stroke={cor}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function IconeArvore({ cor = "#5B5B57" }: { cor?: string }) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
      <Path d="M12 2 L18 12 L15 12 L19.5 19 L4.5 19 L9 12 L6 12 Z" fill={cor} />
      <Rect x={11} y={19} width={2} height={3} fill={cor} />
    </Svg>
  );
}

export function IconeMoeda({ cor = "#5B5B57" }: { cor?: string }) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
      <Circle cx={12} cy={12} r={9} fill="none" stroke={cor} strokeWidth={1.5} />
      <Path d="M12 7 v10 M9.5 9.2 a2.6 2 0 0 1 5 0 c0 1.4 -2.5 1.8 -2.5 1.8 s-2.5 .4 -2.5 1.8 a2.6 2 0 0 0 5 0" stroke={cor} strokeWidth={1.3} fill="none" />
    </Svg>
  );
}
