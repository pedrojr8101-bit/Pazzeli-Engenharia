import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Lead, Simulacao } from "@prisma/client";
import { empresaConfig, premissasFinanceiras as PREMISSAS } from "../empresa-config";
import { CUSTO_DISPONIBILIDADE_KWH, PERFORMANCE_RATIO_PADRAO } from "../tarifas";
import {
  calcularImpactoAmbiental,
  calcularProjecaoFinanceira,
  formatarPayback,
} from "../projecaoFinanceira";
import { GraficoBarrasMensal, GraficoLinhasFluxoCaixa } from "./charts";
import { IconeArvore, IconeMoeda, IconeNuvem, OndaDecorativa } from "./visuais";
import { capaPazelli, logoPazelli } from "./assets-pazelli";
import { logoMap } from "./logo-map";

const cores = {
  texto: "#1C1C1A",
  suave: "#5B5B57",
  sun: "#C9791A",
  linha: "#E5E1D6",
  fundoClaro: "#F7F5F0",
};

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const estilos = StyleSheet.create({
  pagina: { padding: 40, fontSize: 9, color: cores.texto, fontFamily: "Helvetica" },
  tituloGrande: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitulo: { fontSize: 10, color: cores.suave, marginBottom: 14 },
  secaoTitulo: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: cores.sun,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 14,
  },
  linhaDivisoria: { borderBottomWidth: 1, borderBottomColor: cores.linha, marginVertical: 10 },
  rodapePagina: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 7,
    color: cores.suave,
    textAlign: "center",
  },
  tabela: { borderWidth: 1, borderColor: cores.linha, borderRadius: 3 },
  tabelaHeader: {
    flexDirection: "row",
    backgroundColor: cores.fundoClaro,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
  },
  tabelaLinha: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
  },
  celulaHeader: {
    flex: 1,
    padding: 4,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  celula: { flex: 1, padding: 4, fontSize: 7, textAlign: "center" },
  cartao: {
    flex: 1,
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: 4,
    padding: 12,
  },
  cartaoValor: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  cartaoRotulo: { fontSize: 7, color: cores.suave, marginTop: 3 },
  grid3: { flexDirection: "row", gap: 10, marginBottom: 10 },
});

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function numeroProposta(simulacaoId: string) {
  return `P${simulacaoId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase()}`;
}

function RodapePagina({ numero, pagina, totalPaginas }: { numero: string; pagina: number; totalPaginas: number }) {
  return (
    <Text style={estilos.rodapePagina} fixed>
      {numero} — {empresaConfig.nome} · página {pagina} de {totalPaginas}
    </Text>
  );
}

function CampoDados({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  return (
    <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: cores.linha, paddingVertical: 6 }}>
      <Text style={{ flex: 1, fontSize: 8, color: cores.suave }}>{rotulo}</Text>
      <Text style={{ flex: 2, fontSize: 9 }}>{valor || ""}</Text>
    </View>
  );
}

interface ItemProposta {
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
}

function itensPadrao(simulacao: Simulacao): ItemProposta[] {
  return [
    {
      descricao: `Kit Fotovoltaico ${simulacao.potenciaInstaladaKwp.toFixed(2)} kWp`,
      unidade: "kit",
      quantidade: 1,
      valorUnitario: simulacao.investimentoFinal ?? simulacao.investimentoEstimado,
    },
  ];
}

interface PropostaPDFProps {
  simulacao: Simulacao;
  lead: Lead;
}

export function PropostaPDF({ simulacao, lead }: PropostaPDFProps) {
  const hoje = new Date();
  const validade = new Date(hoje.getTime() + empresaConfig.validadePropostaDias * 24 * 60 * 60 * 1000);
  const numero = numeroProposta(simulacao.id);
  const valorTotal = simulacao.investimentoFinal ?? simulacao.investimentoEstimado;
  const tipoEstrutura = simulacao.tipoEstrutura ?? "Cerâmico";
  const anoAtual = hoje.getFullYear();

  const itensExistentes = simulacao.itensProposta as unknown as ItemProposta[] | null;
  const itens: ItemProposta[] =
    itensExistentes && itensExistentes.length > 0 ? itensExistentes : itensPadrao(simulacao);
  const totalItens = itens.reduce((soma, item) => soma + item.quantidade * item.valorUnitario, 0);
  const valorPorWp = simulacao.potenciaInstaladaKwp > 0
    ? (totalItens > 0 ? totalItens : valorTotal) / (simulacao.potenciaInstaladaKwp * 1000)
    : 0;

  const hspMensal = (simulacao.hspMensal as number[] | null) ?? new Array(12).fill(simulacao.hspMedioAnual);
  const dadosMensais = MESES.map((mes, i) => ({
    mes,
    consumo: simulacao.consumoMedioKwh,
    geracao: simulacao.potenciaInstaladaKwp * hspMensal[i] * 30 * PERFORMANCE_RATIO_PADRAO,
  }));

  const projecao = calcularProjecaoFinanceira({
    investimento: valorTotal,
    consumoMedioMensalKwh: simulacao.consumoMedioKwh,
    geracaoMensalKwhBase: simulacao.geracaoMensalKwh,
    tarifaBase: simulacao.tarifaKwh,
    fatorSimultaneidade: simulacao.fatorSimultaneidade,
    custoDisponibilidadeMensalBase: simulacao.custoDisponibilidadeMensal,
    anoInstalacao: anoAtual,
  });

  const impacto = calcularImpactoAmbiental(simulacao.geracaoMensalKwh);
  const consumoMinimo = simulacao.tipoLigacao ? CUSTO_DISPONIBILIDADE_KWH[simulacao.tipoLigacao] : 30;

  const totalPaginas = 10;

  return (
    <Document title={`Proposta — ${lead.nome}`}>
      {/* Página 1 — Capa (foto real da Pazelli) */}
      <Page size="A4" style={{ fontFamily: "Helvetica" }}>
        <Image
          src={capaPazelli}
          fixed
          style={{ position: "absolute", top: 0, left: 0, width: 595, height: 842 }}
        />
        <View style={{ padding: 40, position: "relative" }}>
          <Text style={{ fontSize: 30, fontFamily: "Helvetica-Bold", marginTop: 130, color: "#FFFFFF" }}>
            Proposta
          </Text>
          <Text style={{ fontSize: 30, fontFamily: "Helvetica-Bold", color: "#F5A623", marginTop: -4 }}>
            Comercial
          </Text>
          <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 40, color: "#FFFFFF" }}>
            {lead.nome}
          </Text>
        </View>
        <View style={{ position: "absolute", bottom: 36, left: 40 }}>
          <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#FFFFFF" }}>{empresaConfig.nome}</Text>
          {empresaConfig.site && <Text style={{ fontSize: 8, color: "#E5E1D6" }}>{empresaConfig.site}</Text>}
          {Boolean(empresaConfig.telefone) && (
            <Text style={{ fontSize: 8, color: "#E5E1D6" }}>
              Tel: {empresaConfig.telefone}
              {empresaConfig.telefoneSecundario ? ` - ${empresaConfig.telefoneSecundario}` : ""}
            </Text>
          )}
        </View>
      </Page>

      {/* Página 2 — Sobre a empresa */}
      <Page size="A4" style={estilos.pagina}>
        <Text style={estilos.tituloGrande}>{empresaConfig.nome}</Text>
        <Text style={estilos.subtitulo}>Conheça mais sobre a {empresaConfig.nome}</Text>
        <Text style={{ lineHeight: 1.35, marginBottom: 20 }}>{empresaConfig.sobre}</Text>

        <Image src={logoPazelli} style={{ width: 70, marginBottom: 16 }} />

        <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>{empresaConfig.razaoSocial}</Text>
        <Text style={{ color: cores.suave }}>CNPJ: {empresaConfig.cnpj}</Text>
        <Text style={{ color: cores.suave }}>
          {empresaConfig.endereco.rua}, {empresaConfig.endereco.bairro}
        </Text>
        <Text style={{ color: cores.suave }}>
          {empresaConfig.endereco.cidade}, {empresaConfig.endereco.uf}, {empresaConfig.endereco.cep}
        </Text>
        {Boolean(empresaConfig.telefone) && (
          <Text style={{ color: cores.suave }}>
            Telefone: {empresaConfig.telefone}
            {empresaConfig.telefoneSecundario ? ` - ${empresaConfig.telefoneSecundario}` : ""}
          </Text>
        )}
        {Boolean(empresaConfig.email) && <Text style={{ color: cores.suave }}>Email: {empresaConfig.email}</Text>}
        {Boolean(empresaConfig.site) && <Text style={{ color: cores.suave }}>Site: {empresaConfig.site}</Text>}

        <View style={{ position: "absolute", bottom: 50, left: 40, right: 40 }}>
          <OndaDecorativa />
        </View>

        <RodapePagina numero={numero} pagina={2} totalPaginas={totalPaginas} />
      </Page>

      {/* Página 3 — O que nos move + parceiros */}
      <Page size="A4" style={estilos.pagina}>
        <Text style={estilos.tituloGrande}>O que nos move?</Text>
        <Text style={estilos.subtitulo}>Acreditamos em nossa missão e respeitamos os nossos valores.</Text>

        <View style={{ backgroundColor: cores.fundoClaro, borderRadius: 4, padding: 14, gap: 10 }}>
          <View>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 3 }}>Visão</Text>
            <Text style={{ color: cores.suave, lineHeight: 1.5 }}>{empresaConfig.visao}</Text>
          </View>
          <View style={estilos.linhaDivisoria} />
          <View>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 3 }}>Missão</Text>
            <Text style={{ color: cores.suave, lineHeight: 1.5 }}>{empresaConfig.missao}</Text>
          </View>
          <View style={estilos.linhaDivisoria} />
          <View>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 3 }}>Valores</Text>
            <Text style={{ color: cores.suave, lineHeight: 1.35 }}>
              Temos como pilares da nossa empresa:{"\n"}
              {empresaConfig.valores.map((v) => `- ${v};`).join("\n")}
            </Text>
          </View>
        </View>

        <Text style={[estilos.tituloGrande, { fontSize: 16, marginTop: 24 }]}>Nossos parceiros</Text>
        <Text style={estilos.subtitulo}>
          O sucesso é resultado da escolha de produtos de alta qualidade.
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
          {empresaConfig.parceiros.map((parceiro) => (
            <Image
              key={parceiro.nome}
              src={logoMap[parceiro.logoKey]}
              style={{ height: 26, objectFit: "contain" }}
            />
          ))}
        </View>

        <RodapePagina numero={numero} pagina={3} totalPaginas={totalPaginas} />
      </Page>

      {/* Página 4 — Usina fotovoltaica */}
      <Page size="A4" style={estilos.pagina}>
        <Text style={estilos.tituloGrande}>Detalhes da proposta</Text>
        <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 10 }}>Usina fotovoltaica</Text>

        <Text style={estilos.secaoTitulo}>Contas de energia consideradas</Text>
        <View style={estilos.tabela}>
          <View style={estilos.tabelaHeader}>
            <Text style={estilos.celulaHeader}>Unidade</Text>
            <Text style={estilos.celulaHeader}>Consumo médio (kWh)</Text>
            <Text style={estilos.celulaHeader}>Consumo mínimo (kWh)</Text>
            <Text style={estilos.celulaHeader}>Preço do kWh (R$)</Text>
          </View>
          <View style={estilos.tabelaLinha}>
            <Text style={estilos.celula}>
              Grupo {simulacao.grupoTarifario} —{" "}
              {simulacao.tipoLigacao === "MONOFASICO"
                ? "Monofásico"
                : simulacao.tipoLigacao === "BIFASICO"
                ? "Bifásico"
                : simulacao.tipoLigacao === "TRIFASICO"
                ? "Trifásico"
                : "—"}
            </Text>
            <Text style={estilos.celula}>{simulacao.consumoMedioKwh}</Text>
            <Text style={estilos.celula}>{consumoMinimo}</Text>
            <Text style={estilos.celula}>{simulacao.tarifaKwh.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={estilos.secaoTitulo}>Dimensionamento</Text>
        <View style={estilos.tabela}>
          {[
            ["Localidade da usina", `${simulacao.cidade}/${simulacao.uf}`],
            ["Tipo de estrutura", tipoEstrutura],
            ["Irradiação solar diária média anual", `${simulacao.hspMedioAnual.toFixed(2)} kWh/m²`],
            ["Potência do sistema dimensionado", `${simulacao.potenciaInstaladaKwp.toFixed(2)} kWp`],
            ["Energia estimada gerada (média mensal)", `${Math.round(simulacao.geracaoMensalKwh)} kWh/mês`],
            [
              "Área útil necessária (estimada)",
              `${(simulacao.numeroPaineis * PREMISSAS.areaOcupadaPorPainelM2).toFixed(1)} m²`,
            ],
          ].map(([rotulo, valor], i, arr) => (
            <View key={rotulo} style={i === arr.length - 1 ? { flexDirection: "row" } : estilos.tabelaLinha}>
              <Text style={{ flex: 1.4, padding: 6, color: cores.suave }}>{rotulo}</Text>
              <Text style={{ flex: 1, padding: 6, textAlign: "right", fontFamily: "Helvetica-Bold" }}>
                {valor}
              </Text>
            </View>
          ))}
        </View>

        <RodapePagina numero={numero} pagina={4} totalPaginas={totalPaginas} />
      </Page>

      {/* Página 5 — Geração de energia */}
      <Page size="A4" style={estilos.pagina}>
        <Text style={estilos.tituloGrande}>Geração de energia</Text>
        <Text style={estilos.subtitulo}>Estimativa de geração mensal comparada ao consumo.</Text>
        <GraficoBarrasMensal dados={dadosMensais} />

        <Text style={{ marginTop: 20, color: cores.suave, lineHeight: 1.35 }}>
          A geração estimada considera a irradiação solar real da localização informada e um
          fator de performance de {(PERFORMANCE_RATIO_PADRAO * 100).toFixed(0)}%, que reflete perdas
          típicas do sistema (inversor, cabeamento, temperatura e sujeira).
        </Text>

        <RodapePagina numero={numero} pagina={5} totalPaginas={totalPaginas} />
      </Page>

      {/* Página 6 — Os produtos */}
      <Page size="A4" style={estilos.pagina}>
        <Text style={estilos.tituloGrande}>Os produtos</Text>
        <Text style={estilos.subtitulo}>Lista de produtos orçados nesta proposta comercial.</Text>

        <View style={estilos.tabela}>
          <View style={estilos.tabelaHeader}>
            <Text style={[estilos.celulaHeader, { flex: 2.4, textAlign: "left" }]}>Produto</Text>
            <Text style={estilos.celulaHeader}>Unid.</Text>
            <Text style={estilos.celulaHeader}>Qtde</Text>
            <Text style={estilos.celulaHeader}>Valor unitário</Text>
            <Text style={estilos.celulaHeader}>Valor total</Text>
          </View>
          {itens.map((item, i) => (
            <View key={i} style={estilos.tabelaLinha}>
              <Text style={[estilos.celula, { flex: 2.4, textAlign: "left" }]}>{item.descricao}</Text>
              <Text style={estilos.celula}>{item.unidade}</Text>
              <Text style={estilos.celula}>{item.quantidade}</Text>
              <Text style={estilos.celula}>{moeda(item.valorUnitario)}</Text>
              <Text style={estilos.celula}>{moeda(item.quantidade * item.valorUnitario)}</Text>
            </View>
          ))}
        </View>

        <View
          style={{
            marginTop: 14,
            borderWidth: 1,
            borderColor: cores.linha,
            borderRadius: 4,
            padding: 12,
            alignItems: "flex-end",
          }}
        >
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11 }}>
            Valor total da proposta: {moeda(totalItens > 0 ? totalItens : valorTotal)}
          </Text>
          {valorPorWp > 0 && (
            <Text style={{ fontSize: 7, color: cores.suave, marginTop: 2 }}>
              * {moeda(valorPorWp)} por Wp
            </Text>
          )}
        </View>

        {Boolean(simulacao.observacoesProposta) && (
          <>
            <Text style={estilos.secaoTitulo}>Observações</Text>
            <Text style={{ color: cores.suave, lineHeight: 1.5 }}>{simulacao.observacoesProposta}</Text>
          </>
        )}

        <RodapePagina numero={numero} pagina={6} totalPaginas={totalPaginas} />
      </Page>

      {/* Página 7 — Pagamento e entrega */}
      <Page size="A4" style={estilos.pagina}>
        <Text style={estilos.tituloGrande}>Pagamento e Entrega</Text>
        <Text style={estilos.subtitulo}>Conheça as opções de pagamento disponíveis.</Text>

        <View style={[estilos.cartao, { alignSelf: "flex-start", paddingHorizontal: 20 }]}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>{empresaConfig.prazoEntregaDias} dias</Text>
          <Text style={estilos.cartaoRotulo}>Prazo de entrega</Text>
        </View>

        <Text style={estilos.secaoTitulo}>Pagamento a prazo</Text>
        <View style={{ borderWidth: 1, borderColor: cores.linha, borderRadius: 4, padding: 16 }}>
          <Text style={{ color: cores.suave, marginBottom: 10 }}>
            Financiamento disponível através dos parceiros:
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            {empresaConfig.bancos.map((banco) => (
              <Image
                key={banco.nome}
                src={logoMap[banco.logoKey]}
                style={{ height: 24, objectFit: "contain" }}
              />
            ))}
          </View>
        </View>
        <Text style={{ fontSize: 7, color: cores.suave, marginTop: 6 }}>
          * Sujeito a aprovação de crédito e às condições vigentes de cada instituição.
        </Text>

        <RodapePagina numero={numero} pagina={7} totalPaginas={totalPaginas} />
      </Page>

      {/* Página 8 — Retorno do investimento (tabela de 25 anos) */}
      <Page size="A4" style={estilos.pagina}>
        <Text style={estilos.tituloGrande}>Retorno do investimento</Text>
        <Text style={estilos.subtitulo}>
          Projeção de {PREMISSAS.horizonteAnos} anos, comparada a alternativas de renda fixa.
        </Text>

        <View style={estilos.tabela}>
          <View style={estilos.tabelaHeader} fixed>
            <Text style={[estilos.celulaHeader, { flex: 0.9 }]}>Status</Text>
            <Text style={[estilos.celulaHeader, { flex: 0.6 }]}>Ano</Text>
            <Text style={estilos.celulaHeader}>Tarifa (R$)</Text>
            <Text style={estilos.celulaHeader}>Economia (R$)</Text>
            <Text style={estilos.celulaHeader}>Resultado (R$)</Text>
            <Text style={estilos.celulaHeader}>CDB {(PREMISSAS.percentualCdb * 100).toFixed(0)}% CDI</Text>
            <Text style={estilos.celulaHeader}>Poupança</Text>
          </View>
          {projecao.linhas.map((linha) => (
            <View key={linha.ano} style={estilos.tabelaLinha} wrap={false}>
              <View style={{ flex: 0.9, padding: 3, alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 6.5,
                    paddingVertical: 1,
                    paddingHorizontal: 5,
                    borderRadius: 8,
                    color: linha.status === "Lucro" ? "#2F7D46" : "#1E6FA8",
                    backgroundColor: linha.status === "Lucro" ? "#E1F5E5" : "#DCEEFB",
                  }}
                >
                  {linha.status}
                </Text>
              </View>
              <Text style={[estilos.celula, { flex: 0.6 }]}>{linha.ano}</Text>
              <Text style={estilos.celula}>{linha.tarifa.toFixed(2)}</Text>
              <Text style={estilos.celula}>{moeda(linha.economiaGerada)}</Text>
              <Text
                style={[
                  estilos.celula,
                  { color: linha.resultadoFinanceiro < 0 ? cores.suave : "#3F7D4F" },
                ]}
              >
                {moeda(linha.resultadoFinanceiro)}
              </Text>
              <Text style={estilos.celula}>{moeda(linha.cdb)}</Text>
              <Text style={estilos.celula}>{moeda(linha.poupanca)}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 7, color: cores.suave, marginTop: 8, lineHeight: 1.5 }}>
          * Inflação anual da tarifa: {(PREMISSAS.inflacaoAnualTarifa * 100).toFixed(0)}%. Degradação
          dos módulos: até {(PREMISSAS.degradacaoTotal25Anos * 100).toFixed(0)}% em {PREMISSAS.horizonteAnos}{" "}
          anos. CDB simulado a {(PREMISSAS.taxaCdiAnual * PREMISSAS.percentualCdb * 100).toFixed(1)}% a.a.,
          poupança a {(PREMISSAS.rendimentoPoupancaAnual * 100).toFixed(1)}% a.a. Fio B conforme
          cronograma da Lei 14.300.
        </Text>

        <RodapePagina numero={numero} pagina={8} totalPaginas={totalPaginas} />
      </Page>

      {/* Página 9 — Análise do investimento */}
      <Page size="A4" style={estilos.pagina}>
        <Text style={estilos.tituloGrande}>Análise do investimento</Text>
        <Text style={estilos.subtitulo}>Indicadores financeiros do sistema fotovoltaico.</Text>

        <View style={estilos.grid3}>
          <View style={estilos.cartao}>
            <Text style={estilos.cartaoRotulo}>TIR</Text>
            <Text style={estilos.cartaoValor}>
              {projecao.tir !== null ? `${(projecao.tir * 100).toFixed(2)}%` : "—"}
            </Text>
          </View>
          <View style={estilos.cartao}>
            <Text style={estilos.cartaoRotulo}>VPL (TMA {(PREMISSAS.tma * 100).toFixed(0)}%)</Text>
            <Text style={estilos.cartaoValor}>{moeda(projecao.vpl)}</Text>
          </View>
          <View style={estilos.cartao}>
            <Text style={estilos.cartaoRotulo}>Payback</Text>
            <Text style={estilos.cartaoValor}>{formatarPayback(projecao.paybackMeses)}</Text>
          </View>
        </View>

        <Text style={estilos.secaoTitulo}>Fluxo de caixa acumulado (R$ vs. ano)</Text>
        <GraficoLinhasFluxoCaixa
          anos={projecao.linhas.map((l) => l.ano)}
          series={[
            { rotulo: "Sistema fotovoltaico", cor: "#C9791A", valores: projecao.linhas.map((l) => l.resultadoFinanceiro) },
            { rotulo: `CDB ${(PREMISSAS.percentualCdb * 100).toFixed(0)}% CDI`, cor: "#B33B3B", valores: projecao.linhas.map((l) => l.cdb - valorTotal) },
            { rotulo: "Poupança", cor: "#B8901F", valores: projecao.linhas.map((l) => l.poupanca - valorTotal) },
          ]}
        />

        <Text style={estilos.secaoTitulo}>Retorno ambiental em {PREMISSAS.horizonteAnos} anos</Text>
        <View style={estilos.grid3}>
          <View style={[estilos.cartao, { alignItems: "center" }]}>
            <IconeNuvem cor={cores.suave} />
            <Text style={[estilos.cartaoValor, { marginTop: 6 }]}>
              {impacto.co2ToneladasEvitadas.toFixed(2)} t
            </Text>
            <Text style={[estilos.cartaoRotulo, { textAlign: "center" }]}>
              de CO2 que não serão emitidos na atmosfera
            </Text>
          </View>
          <View style={[estilos.cartao, { alignItems: "center" }]}>
            <IconeArvore cor={cores.suave} />
            <Text style={[estilos.cartaoValor, { marginTop: 6 }]}>{impacto.arvoresEquivalentes}</Text>
            <Text style={[estilos.cartaoRotulo, { textAlign: "center" }]}>
              árvores equivalentes para absorver esse CO2
            </Text>
          </View>
          <View style={[estilos.cartao, { alignItems: "center" }]}>
            <IconeMoeda cor={cores.suave} />
            <Text style={[estilos.cartaoValor, { marginTop: 6 }]}>{moeda(impacto.custoPlantioArvores)}</Text>
            <Text style={[estilos.cartaoRotulo, { textAlign: "center" }]}>
              custo aproximado para plantar essas árvores
            </Text>
          </View>
        </View>

        <RodapePagina numero={numero} pagina={9} totalPaginas={totalPaginas} />
      </Page>

      {/* Página 10 — Aceite da Proposta */}
      <Page size="A4" style={estilos.pagina}>
        <Text style={estilos.tituloGrande}>Aceite da Proposta</Text>
        <Text style={{ lineHeight: 1.35, marginTop: 6, marginBottom: 20 }}>
          Estando de acordo com os produtos, valores e termos relatados nesta proposta e por
          estarem assim justos e contratados, {empresaConfig.nome} e {lead.nome} firmam a
          presente proposta.
        </Text>

        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12, marginBottom: 8 }}>Dados do cliente</Text>
        <CampoDados rotulo="Nome do cliente:" valor={lead.nome} />
        <CampoDados rotulo="CPF / CNPJ:" valor={simulacao.clienteCpf} />
        <CampoDados rotulo="RG:" />
        <CampoDados rotulo="Endereço:" valor={simulacao.clienteEnderecoCompleto} />
        <CampoDados rotulo="Cidade:" valor={simulacao.cidade} />
        <CampoDados rotulo="UF:" valor={simulacao.uf} />
        <CampoDados rotulo="Email:" valor={lead.email} />
        <CampoDados rotulo="Telefone:" valor={lead.telefone} />

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 70 }}>
          <View style={{ width: "42%" }}>
            <View style={{ borderTopWidth: 1, borderTopColor: cores.texto, marginBottom: 6 }} />
            <Text style={{ textAlign: "center" }}>{empresaConfig.razaoSocial}</Text>
            <Text style={{ textAlign: "center", fontSize: 8, color: cores.suave }}>{empresaConfig.cnpj}</Text>
          </View>
          <View style={{ width: "42%" }}>
            <View style={{ borderTopWidth: 1, borderTopColor: cores.texto, marginBottom: 6 }} />
            <Text style={{ textAlign: "center" }}>{lead.nome}</Text>
          </View>
        </View>

        <RodapePagina numero={numero} pagina={10} totalPaginas={totalPaginas} />
      </Page>
    </Document>
  );
}
