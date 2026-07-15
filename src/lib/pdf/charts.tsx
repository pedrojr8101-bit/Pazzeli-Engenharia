import { G, Line, Polyline, Rect, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";

const estilos = StyleSheet.create({
  legendaLinha: { flexDirection: "row", gap: 14, marginTop: 6, justifyContent: "center" },
  legendaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendaTexto: { fontSize: 7, color: "#5B5B57" },
  rotuloEixo: { fontSize: 6, color: "#5B5B57" },
  linhaRotulos: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 },
});

interface DadoMensal {
  mes: string;
  consumo: number;
  geracao: number;
}

export function GraficoBarrasMensal({ dados }: { dados: DadoMensal[] }) {
  const largura = 500;
  const altura = 130;
  const maximo = Math.max(1, ...dados.flatMap((d) => [d.consumo, d.geracao]));
  const larguraGrupo = largura / dados.length;
  const larguraBarra = larguraGrupo * 0.32;

  return (
    <View>
      <Svg viewBox={`0 0 ${largura} ${altura + 10}`} style={{ width: "100%", height: 110 }}>
        <Line x1={0} y1={altura} x2={largura} y2={altura} stroke="#E5E1D6" strokeWidth={1} />
        {dados.map((d, i) => {
          const xGrupo = i * larguraGrupo + larguraGrupo * 0.15;
          const alturaConsumo = (d.consumo / maximo) * (altura - 10);
          const alturaGeracao = (d.geracao / maximo) * (altura - 10);
          return (
            <G key={d.mes}>
              <Rect
                x={xGrupo}
                y={altura - alturaConsumo}
                width={larguraBarra}
                height={alturaConsumo}
                fill="#14263B"
              />
              <Rect
                x={xGrupo + larguraBarra + 3}
                y={altura - alturaGeracao}
                width={larguraBarra}
                height={alturaGeracao}
                fill="#67D8C4"
              />
            </G>
          );
        })}
      </Svg>
      <View style={estilos.linhaRotulos}>
        {dados.map((d) => (
          <Text key={d.mes} style={estilos.rotuloEixo}>
            {d.mes}
          </Text>
        ))}
      </View>
      <View style={estilos.legendaLinha}>
        <View style={estilos.legendaItem}>
          <Svg width={8} height={8}>
            <Rect x={0} y={0} width={8} height={8} fill="#14263B" />
          </Svg>
          <Text style={estilos.legendaTexto}>Consumo</Text>
        </View>
        <View style={estilos.legendaItem}>
          <Svg width={8} height={8}>
            <Rect x={0} y={0} width={8} height={8} fill="#67D8C4" />
          </Svg>
          <Text style={estilos.legendaTexto}>Geração</Text>
        </View>
      </View>
    </View>
  );
}

interface SerieLinha {
  rotulo: string;
  cor: string;
  valores: number[];
}

export function GraficoLinhasFluxoCaixa({ series, anos }: { series: SerieLinha[]; anos: number[] }) {
  const largura = 500;
  const altura = 150;
  const todosValores = series.flatMap((s) => s.valores);
  const maximo = Math.max(...todosValores, 0);
  const minimo = Math.min(...todosValores, 0);
  const amplitude = maximo - minimo || 1;

  const escalaY = (valor: number) => altura - ((valor - minimo) / amplitude) * altura;
  const escalaX = (indice: number) => (indice / (anos.length - 1)) * largura;
  const yZero = escalaY(0);

  return (
    <View>
      <Svg viewBox={`0 0 ${largura} ${altura}`} style={{ width: "100%", height: 130 }}>
        <Line x1={0} y1={yZero} x2={largura} y2={yZero} stroke="#E5E1D6" strokeWidth={1} />
        {series.map((serie) => (
          <Polyline
            key={serie.rotulo}
            points={serie.valores.map((v, i) => `${escalaX(i)},${escalaY(v)}`).join(" ")}
            fill="none"
            stroke={serie.cor}
            strokeWidth={2}
          />
        ))}
      </Svg>
      <View style={estilos.linhaRotulos}>
        <Text style={estilos.rotuloEixo}>{anos[0]}</Text>
        <Text style={estilos.rotuloEixo}>{anos[Math.floor(anos.length / 2)]}</Text>
        <Text style={estilos.rotuloEixo}>{anos[anos.length - 1]}</Text>
      </View>
      <View style={estilos.legendaLinha}>
        {series.map((serie) => (
          <View key={serie.rotulo} style={estilos.legendaItem}>
            <Svg width={10} height={4}>
              <Line x1={0} y1={2} x2={10} y2={2} stroke={serie.cor} strokeWidth={2} />
            </Svg>
            <Text style={estilos.legendaTexto}>{serie.rotulo}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
