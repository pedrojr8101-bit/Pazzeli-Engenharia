import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Lead, Simulacao } from "@prisma/client";

const cores = {
  texto: "#1C1C1A",
  suave: "#5B5B57",
  sun: "#C9791A",
  linha: "#E5E1D6",
};

const estilos = StyleSheet.create({
  pagina: { padding: 40, fontSize: 10, color: cores.texto, fontFamily: "Helvetica" },
  cabecalho: { marginBottom: 24 },
  empresa: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  tituloDoc: { fontSize: 11, color: cores.suave, marginTop: 2 },
  linhaDivisoria: { borderBottomWidth: 1, borderBottomColor: cores.linha, marginVertical: 16 },
  secaoTitulo: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: cores.sun,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  linhaCampo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  rotuloCampo: { color: cores.suave },
  valorCampo: { fontFamily: "Helvetica-Bold" },
  grid3: { flexDirection: "row", gap: 12, marginBottom: 16 },
  cartao: {
    flex: 1,
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: 4,
    padding: 10,
  },
  cartaoValor: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  cartaoRotulo: { fontSize: 8, color: cores.suave, marginTop: 2 },
  destaque: {
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: 4,
    padding: 14,
    marginBottom: 16,
  },
  destaqueValor: { fontSize: 22, fontFamily: "Helvetica-Bold" },
  premissas: { fontSize: 8, color: cores.suave, lineHeight: 1.5 },
  rodape: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: cores.suave,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface PropostaPDFProps {
  simulacao: Simulacao;
  lead: Lead;
  empresa: {
    nome: string;
    telefone?: string | null;
    email?: string | null;
  };
}

export function PropostaPDF({ simulacao, lead, empresa }: PropostaPDFProps) {
  const dataGeracao = new Date().toLocaleDateString("pt-BR");

  return (
    <Document title={`Proposta — ${lead.nome}`}>
      <Page size="A4" style={estilos.pagina}>
        <View style={estilos.cabecalho}>
          <Text style={estilos.empresa}>{empresa.nome}</Text>
          <Text style={estilos.tituloDoc}>Proposta de Sistema Fotovoltaico — {dataGeracao}</Text>
        </View>

        <View style={estilos.secaoTitulo}><Text>Cliente</Text></View>
        <View style={estilos.linhaCampo}>
          <Text style={estilos.rotuloCampo}>Nome</Text>
          <Text style={estilos.valorCampo}>{lead.nome}</Text>
        </View>
        <View style={estilos.linhaCampo}>
          <Text style={estilos.rotuloCampo}>Endereço</Text>
          <Text style={estilos.valorCampo}>
            CEP {simulacao.cep} — {simulacao.cidade}/{simulacao.uf}
          </Text>
        </View>
        <View style={estilos.linhaCampo}>
          <Text style={estilos.rotuloCampo}>Contato</Text>
          <Text style={estilos.valorCampo}>{lead.email} · {lead.telefone}</Text>
        </View>

        <View style={estilos.linhaDivisoria} />

        <View style={estilos.secaoTitulo}><Text>Sistema recomendado</Text></View>
        <View style={estilos.destaque}>
          <Text style={estilos.destaqueValor}>{simulacao.potenciaInstaladaKwp.toFixed(2)} kWp</Text>
          <Text style={estilos.cartaoRotulo}>
            {simulacao.numeroPaineis} painéis de {simulacao.potenciaPainelW} W · {simulacao.classificacaoGD}
          </Text>
        </View>

        <View style={estilos.grid3}>
          <View style={estilos.cartao}>
            <Text style={estilos.cartaoValor}>{Math.round(simulacao.geracaoMensalKwh)} kWh</Text>
            <Text style={estilos.cartaoRotulo}>Geração estimada/mês</Text>
          </View>
          <View style={estilos.cartao}>
            <Text style={estilos.cartaoValor}>{moeda(simulacao.economiaMensalEstimada)}</Text>
            <Text style={estilos.cartaoRotulo}>Economia estimada/mês</Text>
          </View>
          <View style={estilos.cartao}>
            <Text style={estilos.cartaoValor}>
              {simulacao.paybackAnos ? `${simulacao.paybackAnos.toFixed(1)} anos` : "—"}
            </Text>
            <Text style={estilos.cartaoRotulo}>Retorno do investimento</Text>
          </View>
        </View>

        <View style={estilos.secaoTitulo}><Text>Investimento estimado</Text></View>
        <View style={estilos.destaque}>
          <Text style={estilos.destaqueValor}>{moeda(simulacao.investimentoEstimado)}</Text>
          <Text style={estilos.cartaoRotulo}>
            Valor de referência — sujeito a confirmação após vistoria técnica.
          </Text>
        </View>

        <View style={estilos.secaoTitulo}><Text>Premissas técnicas consideradas</Text></View>
        <View style={estilos.premissas}>
          <Text>
            • Irradiação solar média de {simulacao.hspMedioAnual.toFixed(2)} horas de sol pleno/dia,
            referente à localização informada.
          </Text>
          <Text>
            • Cálculo já considera o Fio B da Lei 14.300, com {(simulacao.percentualFioBAno * 100).toFixed(0)}%
            de incidência sobre a energia injetada e fator de simultaneidade estimado em{" "}
            {(simulacao.fatorSimultaneidade * 100).toFixed(0)}%.
          </Text>
          <Text>
            • Tarifa de energia considerada: {moeda(simulacao.tarifaKwh)}/kWh.
          </Text>
          <Text>
            • Este documento é uma estimativa para fins de qualificação comercial — os valores finais
            serão confirmados após vistoria técnica no local.
          </Text>
        </View>

        <View style={estilos.rodape} fixed>
          <Text>{empresa.nome}</Text>
          <Text>
            {[empresa.telefone, empresa.email].filter(Boolean).join(" · ")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
