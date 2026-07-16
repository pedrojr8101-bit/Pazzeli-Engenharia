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
import { IconeArvore, IconeMoeda, IconeNuvem } from "./visuais";
import { capaPazelli, logoPazelli } from "./assets-pazelli";
import { logoMap } from "./logo-map";
import { registrarFontesPazelli } from "./fonts-pazelli";

registrarFontesPazelli();

/* ============================ DESIGN SYSTEM ============================
 * Identidade Pazelli: navy profundo + dourado (mesma linguagem da capa e
 * dos posts do Instagram). Poppins nos títulos/valores, Helvetica no corpo.
 * ====================================================================== */

const cores = {
  navy: "#052137",
  navyElev: "#0C2E4A",
  gold: "#F7C948",
  goldTexto: "#B07A14", // dourado legível sobre fundo branco
  texto: "#16222E",
  suave: "#5E6B78",
  linha: "#E3E7ED",
  zebra: "#F6F8FA",
  cloud: "#F2F5F8",
  verde: "#2F7D46",
  verdeFundo: "#E1F5E5",
  azulStatus: "#1E6FA8",
  azulFundo: "#DCEEFB",
};

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const estilos = StyleSheet.create({
  pagina: { paddingTop: 34, paddingHorizontal: 40, paddingBottom: 56, fontSize: 9, color: cores.texto, fontFamily: "Helvetica" },

  // Cabeçalho padrão de página
  kicker: {
    fontSize: 7,
    fontFamily: "Poppins",
    fontWeight: 600,
    color: cores.goldTexto,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  tituloGrande: { fontSize: 21, fontFamily: "Poppins", fontWeight: 700, color: cores.navy },
  barraTitulo: { width: 34, height: 3, backgroundColor: cores.gold, borderRadius: 2, marginTop: 6, marginBottom: 6 },
  subtitulo: { fontSize: 9, color: cores.suave, marginBottom: 14 },

  secaoTitulo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 8,
    marginTop: 16,
  },
  secaoTituloTexto: {
    fontSize: 8,
    fontFamily: "Poppins",
    fontWeight: 600,
    color: cores.navy,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  secaoTituloMarcador: { width: 5, height: 5, backgroundColor: cores.gold, transform: "rotate(45deg)" },

  rodapeLinha: {
    position: "absolute",
    bottom: 34,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  rodapeEsq: { position: "absolute", bottom: 22, left: 40, fontSize: 6.5, color: cores.suave },
  rodapeDir: { position: "absolute", bottom: 22, right: 40, fontSize: 6.5, color: cores.suave },

  // Tabelas
  tabela: { borderWidth: 1, borderColor: cores.linha, borderRadius: 4, overflow: "hidden" },
  tabelaHeader: { flexDirection: "row", backgroundColor: cores.navy },
  tabelaLinha: { flexDirection: "row", borderTopWidth: 1, borderTopColor: cores.linha },
  tabelaLinhaZebra: { flexDirection: "row", borderTopWidth: 1, borderTopColor: cores.linha, backgroundColor: cores.zebra },
  celulaHeader: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontSize: 6.5,
    fontFamily: "Poppins",
    fontWeight: 600,
    color: "#FFFFFF",
    textAlign: "center",
  },
  celula: { flex: 1, paddingVertical: 4, paddingHorizontal: 4, fontSize: 7, textAlign: "center" },
  celulaNum: { flex: 1, paddingVertical: 4, paddingHorizontal: 6, fontSize: 7, textAlign: "right" },

  // Cartões
  cartaoNavy: { flex: 1, backgroundColor: cores.navy, borderRadius: 6, padding: 14 },
  cartaoNavyValor: { fontSize: 17, fontFamily: "Poppins", fontWeight: 700, color: cores.gold },
  cartaoNavyRotulo: { fontSize: 6.5, color: "#C9D4DE", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 },
  cartaoClaro: { flex: 1, backgroundColor: cores.cloud, borderRadius: 6, padding: 14 },
  grid3: { flexDirection: "row", gap: 10, marginBottom: 10 },
});

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function numeroProposta(simulacaoId: string) {
  return `P${simulacaoId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase()}`;
}

/* =========================== COMPONENTES BASE =========================== */

function CabecalhoPagina({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={estilos.kicker}>Pazelli Energia Solar</Text>
      <Text style={estilos.tituloGrande}>{titulo}</Text>
      <View style={estilos.barraTitulo} />
      {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : <View style={{ marginBottom: 8 }} />}
    </View>
  );
}

function SecaoTitulo({ children }: { children: React.ReactNode }) {
  return (
    <View style={estilos.secaoTitulo}>
      <View style={estilos.secaoTituloMarcador} />
      <Text style={estilos.secaoTituloTexto}>{children}</Text>
    </View>
  );
}

function RodapePagina({ numero, pagina, totalPaginas }: { numero: string; pagina: number; totalPaginas: number }) {
  return (
    <>
      <View style={estilos.rodapeLinha} fixed />
      <Text style={estilos.rodapeEsq} fixed>
        {empresaConfig.nome} · proposta {numero}
      </Text>
      <Text style={estilos.rodapeDir} fixed>
        página {pagina} de {totalPaginas}
      </Text>
    </>
  );
}

function CampoDados({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  return (
    <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: cores.linha, paddingVertical: 7 }}>
      <Text style={{ flex: 1, fontSize: 8, fontFamily: "Poppins", fontWeight: 600, color: cores.suave }}>{rotulo}</Text>
      <Text style={{ flex: 2, fontSize: 9, color: cores.texto }}>{valor || ""}</Text>
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

/* ================================ DOCUMENTO ================================ */

export function PropostaPDF({ simulacao, lead }: PropostaPDFProps) {
  const hoje = new Date();
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
    // Pro-rata do 1º ano, como na proposta oficial: gera só nos meses
    // restantes do ano da proposta (mínimo 1).
    mesesGeracaoPrimeiroAno: Math.max(12 - hoje.getMonth(), 1),
  });

  const impacto = calcularImpactoAmbiental(simulacao.geracaoMensalKwh);
  const consumoMinimo = simulacao.tipoLigacao ? CUSTO_DISPONIBILIDADE_KWH[simulacao.tipoLigacao] : 30;

  const totalPaginas = 10;
  const ligacao =
    simulacao.tipoLigacao === "MONOFASICO"
      ? "Monofásico"
      : simulacao.tipoLigacao === "BIFASICO"
      ? "Bifásico"
      : simulacao.tipoLigacao === "TRIFASICO"
      ? "Trifásico"
      : "—";

  return (
    <Document title={`Proposta — ${lead.nome}`}>
      {/* ================= Página 1 — Capa (arte real da Pazelli) ================= */}
      <Page size="A4" style={{ fontFamily: "Helvetica" }}>
        <Image
          src={capaPazelli}
          fixed
          style={{ position: "absolute", top: 0, left: 0, width: 595, height: 842 }}
        />
        {/* A arte já traz o título "PROPOSTA COMERCIAL" e o rodapé de contato —
            aqui entram só o nome do cliente e a referência da proposta. */}
        <View style={{ padding: 40, position: "relative" }}>
          <Text style={{ fontSize: 14, fontFamily: "Poppins", fontWeight: 700, marginTop: 244, color: "#FFFFFF" }}>
            {lead.nome}
          </Text>
          <Text style={{ fontSize: 8, fontFamily: "Poppins", fontWeight: 600, marginTop: 4, color: cores.gold, letterSpacing: 1.5 }}>
            PROPOSTA {numero} · {hoje.toLocaleDateString("pt-BR")}
          </Text>
        </View>
      </Page>

      {/* ================= Página 2 — Sobre a empresa ================= */}
      <Page size="A4" style={estilos.pagina}>
        <CabecalhoPagina titulo={empresaConfig.nome} subtitulo="Conheça mais sobre a Pazelli Energia Solar" />

        <Text style={{ color: cores.suave, lineHeight: 1.6, fontSize: 9.5 }}>{empresaConfig.sobre}</Text>

        <Image src={logoPazelli} style={{ width: 92, marginTop: 26, marginBottom: 22 }} />

        <View style={{ backgroundColor: cores.navy, borderRadius: 6, padding: 18 }}>
          <Text style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 11, color: "#FFFFFF", marginBottom: 2 }}>
            {empresaConfig.razaoSocial}
          </Text>
          <Text style={{ fontSize: 8, color: cores.gold, marginBottom: 10 }}>CNPJ: {empresaConfig.cnpj}</Text>
          <Text style={{ fontSize: 8.5, color: "#C9D4DE", lineHeight: 1.6 }}>
            {empresaConfig.endereco.rua}, {empresaConfig.endereco.bairro}{"\n"}
            {empresaConfig.endereco.cidade}, {empresaConfig.endereco.uf}, {empresaConfig.endereco.cep}
            {empresaConfig.telefone
              ? `\nTelefone: ${empresaConfig.telefone}${empresaConfig.telefoneSecundario ? ` - ${empresaConfig.telefoneSecundario}` : ""}`
              : ""}
            {empresaConfig.email ? `\nEmail: ${empresaConfig.email}` : ""}
            {empresaConfig.site ? `\nSite: ${empresaConfig.site}` : ""}
          </Text>
        </View>

        <RodapePagina numero={numero} pagina={2} totalPaginas={totalPaginas} />
      </Page>

      {/* ================= Página 3 — O que nos move + parceiros ================= */}
      <Page size="A4" style={estilos.pagina}>
        <CabecalhoPagina titulo="O que nos move?" subtitulo="Acreditamos em nossa missão e respeitamos os nossos valores." />

        {[
          { t: "Visão", d: empresaConfig.visao },
          { t: "Missão", d: empresaConfig.missao },
          {
            t: "Valores",
            d: `Temos como pilares da nossa empresa: ${empresaConfig.valores.join(" · ")}.`,
          },
        ].map((bloco) => (
          <View
            key={bloco.t}
            style={{
              backgroundColor: cores.cloud,
              borderLeftWidth: 3,
              borderLeftColor: cores.gold,
              borderRadius: 4,
              padding: 13,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 10, color: cores.navy, marginBottom: 3 }}>
              {bloco.t}
            </Text>
            <Text style={{ color: cores.suave, lineHeight: 1.55, fontSize: 9 }}>{bloco.d}</Text>
          </View>
        ))}

        <SecaoTitulo>Nossos parceiros</SecaoTitulo>
        <Text style={[estilos.subtitulo, { marginBottom: 10 }]}>
          O sucesso é resultado da escolha de produtos de alta qualidade.
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: cores.linha,
            borderRadius: 6,
            padding: 16,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 20,
            alignItems: "center",
          }}
        >
          {empresaConfig.parceiros.map((parceiro) => (
            <Image key={parceiro.nome} src={logoMap[parceiro.logoKey]} style={{ height: 24, objectFit: "contain" }} />
          ))}
        </View>

        <RodapePagina numero={numero} pagina={3} totalPaginas={totalPaginas} />
      </Page>

      {/* ================= Página 4 — Detalhes da proposta ================= */}
      <Page size="A4" style={estilos.pagina}>
        <CabecalhoPagina titulo="Detalhes da proposta" subtitulo="Usina fotovoltaica dimensionada para o seu consumo." />

        <SecaoTitulo>Contas de energia consideradas</SecaoTitulo>
        <View style={estilos.tabela}>
          <View style={estilos.tabelaHeader}>
            <Text style={[estilos.celulaHeader, { flex: 1.4, textAlign: "left", paddingLeft: 8 }]}>Unidade</Text>
            <Text style={estilos.celulaHeader}>Consumo médio (kWh)</Text>
            <Text style={estilos.celulaHeader}>Consumo mínimo (kWh)</Text>
            <Text style={estilos.celulaHeader}>Preço do kWh (R$)</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={[estilos.celula, { flex: 1.4, textAlign: "left", paddingLeft: 8 }]}>
              Grupo {simulacao.grupoTarifario} — {ligacao}
            </Text>
            <Text style={estilos.celula}>{simulacao.consumoMedioKwh}</Text>
            <Text style={estilos.celula}>{consumoMinimo}</Text>
            <Text style={estilos.celula}>{simulacao.tarifaKwh.toFixed(2)}</Text>
          </View>
        </View>

        <SecaoTitulo>Dimensionamento</SecaoTitulo>
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
          ].map(([rotulo, valor], i) => (
            <View key={rotulo} style={i % 2 === 1 ? estilos.tabelaLinhaZebra : i === 0 ? { flexDirection: "row" } : estilos.tabelaLinha}>
              <Text style={{ flex: 1.5, paddingVertical: 6, paddingHorizontal: 8, color: cores.suave, fontSize: 8 }}>{rotulo}</Text>
              <Text style={{ flex: 1, paddingVertical: 6, paddingHorizontal: 8, textAlign: "right", fontFamily: "Poppins", fontWeight: 600, fontSize: 8.5, color: cores.navy }}>
                {valor}
              </Text>
            </View>
          ))}
        </View>

        {/* Destaques do dimensionamento */}
        <View style={[estilos.grid3, { marginTop: 18 }]}>
          <View style={estilos.cartaoNavy}>
            <Text style={estilos.cartaoNavyRotulo}>Potência</Text>
            <Text style={estilos.cartaoNavyValor}>{simulacao.potenciaInstaladaKwp.toFixed(2)} kWp</Text>
          </View>
          <View style={estilos.cartaoNavy}>
            <Text style={estilos.cartaoNavyRotulo}>Geração média</Text>
            <Text style={estilos.cartaoNavyValor}>{Math.round(simulacao.geracaoMensalKwh)} kWh/mês</Text>
          </View>
          <View style={estilos.cartaoNavy}>
            <Text style={estilos.cartaoNavyRotulo}>Módulos</Text>
            <Text style={estilos.cartaoNavyValor}>{simulacao.numeroPaineis} placas</Text>
          </View>
        </View>

        <RodapePagina numero={numero} pagina={4} totalPaginas={totalPaginas} />
      </Page>

      {/* ================= Página 5 — Geração de energia ================= */}
      <Page size="A4" style={estilos.pagina}>
        <CabecalhoPagina titulo="Geração de energia" subtitulo="Estimativa de geração mensal comparada ao consumo." />
        <GraficoBarrasMensal dados={dadosMensais} />

        <SecaoTitulo>Projeção de economia ano a ano</SecaoTitulo>
        <View style={estilos.tabela}>
          <View style={estilos.tabelaHeader}>
            <Text style={[estilos.celulaHeader, { flex: 0.6 }]}>Ano</Text>
            <Text style={estilos.celulaHeader}>Produção (kWh/ano) ***</Text>
            <Text style={estilos.celulaHeader}>Sem Solar (R$)</Text>
            <Text style={estilos.celulaHeader}>Com Solar (R$)</Text>
            <Text style={estilos.celulaHeader}>Economia (R$)</Text>
          </View>
          {projecao.linhas.slice(0, 14).map((linha, i) => (
            <View key={linha.ano} style={i % 2 === 1 ? estilos.tabelaLinhaZebra : estilos.tabelaLinha} wrap={false}>
              <Text style={[estilos.celula, { flex: 0.6, fontFamily: "Poppins", fontWeight: 600, color: cores.navy }]}>{linha.ano}</Text>
              <Text style={estilos.celulaNum}>{Math.round(linha.producaoKwh).toLocaleString("pt-BR")}</Text>
              <Text style={estilos.celulaNum}>{moeda(linha.semSolar)}</Text>
              <Text style={estilos.celulaNum}>{moeda(linha.comSolar)}</Text>
              <Text style={[estilos.celulaNum, { fontFamily: "Poppins", fontWeight: 600, color: cores.verde }]}>{moeda(linha.economiaGerada)}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 6.5, color: cores.suave, marginTop: 8, lineHeight: 1.5 }}>
          Importante: os valores da tabela acima são estimados. * Inflação anual da tarifa:{" "}
          {(PREMISSAS.inflacaoAnualTarifa * 100).toFixed(2)}%. ** Simultaneidade de{" "}
          {(simulacao.fatorSimultaneidade * 100).toFixed(2)}%. *** Conforme especificação dos
          fabricantes, os módulos podem perder até {(PREMISSAS.degradacaoTotal25Anos * 100).toFixed(0)}%
          de eficiência em {PREMISSAS.horizonteAnos} anos. Após 2028, está sendo considerada a
          continuidade do pagamento de 90% do Fio B (Lei 14.300). A geração considera a irradiação
          solar real da localização e um fator de performance de{" "}
          {(PERFORMANCE_RATIO_PADRAO * 100).toFixed(0)}%.
        </Text>

        <RodapePagina numero={numero} pagina={5} totalPaginas={totalPaginas} />
      </Page>

      {/* ================= Página 6 — Os produtos ================= */}
      <Page size="A4" style={estilos.pagina}>
        <CabecalhoPagina titulo="Os produtos" subtitulo="Lista de produtos orçados nesta proposta comercial." />

        <View style={estilos.tabela}>
          <View style={estilos.tabelaHeader}>
            <Text style={[estilos.celulaHeader, { flex: 2.6, textAlign: "left", paddingLeft: 8 }]}>Produto</Text>
            <Text style={estilos.celulaHeader}>Unid.</Text>
            <Text style={estilos.celulaHeader}>Qtde</Text>
            <Text style={estilos.celulaHeader}>Valor unitário</Text>
            <Text style={estilos.celulaHeader}>Valor total</Text>
          </View>
          {itens.map((item, i) => (
            <View key={i} style={i % 2 === 1 ? estilos.tabelaLinhaZebra : { flexDirection: "row" }}>
              <Text style={[estilos.celula, { flex: 2.6, textAlign: "left", paddingLeft: 8, lineHeight: 1.4 }]}>{item.descricao}</Text>
              <Text style={estilos.celula}>{item.unidade}</Text>
              <Text style={estilos.celula}>{item.quantidade}</Text>
              <Text style={estilos.celulaNum}>{moeda(item.valorUnitario)}</Text>
              <Text style={estilos.celulaNum}>{moeda(item.quantidade * item.valorUnitario)}</Text>
            </View>
          ))}
        </View>

        <View
          style={{
            marginTop: 16,
            backgroundColor: cores.navy,
            borderRadius: 6,
            paddingVertical: 14,
            paddingHorizontal: 18,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ fontSize: 7, color: "#C9D4DE", textTransform: "uppercase", letterSpacing: 1 }}>
              Valor total da proposta
            </Text>
            {valorPorWp > 0 && (
              <Text style={{ fontSize: 6.5, color: "#8FA3B5", marginTop: 3 }}>* {moeda(valorPorWp)} por Wp</Text>
            )}
          </View>
          <Text style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 18, color: cores.gold }}>
            {moeda(totalItens > 0 ? totalItens : valorTotal)}
          </Text>
        </View>

        {Boolean(simulacao.observacoesProposta) && (
          <>
            <SecaoTitulo>Observações</SecaoTitulo>
            <Text style={{ color: cores.suave, lineHeight: 1.5 }}>{simulacao.observacoesProposta}</Text>
          </>
        )}

        <RodapePagina numero={numero} pagina={6} totalPaginas={totalPaginas} />
      </Page>

      {/* ================= Página 7 — Pagamento e entrega ================= */}
      <Page size="A4" style={estilos.pagina}>
        <CabecalhoPagina titulo="Pagamento e Entrega" subtitulo="Conheça as opções de pagamento disponíveis." />

        <View style={[estilos.grid3, { marginBottom: 4 }]}>
          <View style={estilos.cartaoNavy}>
            <Text style={estilos.cartaoNavyRotulo}>Prazo de entrega</Text>
            <Text style={estilos.cartaoNavyValor}>{empresaConfig.prazoEntregaDias} dias</Text>
          </View>
          <View style={estilos.cartaoNavy}>
            <Text style={estilos.cartaoNavyRotulo}>Validade da proposta</Text>
            <Text style={estilos.cartaoNavyValor}>{empresaConfig.validadePropostaDias} dias</Text>
          </View>
          <View style={estilos.cartaoNavy}>
            <Text style={estilos.cartaoNavyRotulo}>Investimento</Text>
            <Text style={estilos.cartaoNavyValor}>{moeda(totalItens > 0 ? totalItens : valorTotal)}</Text>
          </View>
        </View>

        <SecaoTitulo>Pagamento a prazo</SecaoTitulo>
        <View style={{ borderWidth: 1, borderColor: cores.linha, borderRadius: 6, padding: 16 }}>
          <Text style={{ color: cores.suave, marginBottom: 12, fontSize: 9 }}>
            Financiamento disponível através dos parceiros:
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 18, alignItems: "center" }}>
            {empresaConfig.bancos.map((banco) => (
              <Image key={banco.nome} src={logoMap[banco.logoKey]} style={{ height: 22, objectFit: "contain" }} />
            ))}
          </View>
        </View>
        <Text style={{ fontSize: 6.5, color: cores.suave, marginTop: 6 }}>
          * Sujeito a aprovação de crédito e às condições vigentes de cada instituição.
        </Text>

        <SecaoTitulo>Garantias</SecaoTitulo>
        <View style={estilos.tabela}>
          <View style={estilos.tabelaHeader}>
            <Text style={[estilos.celulaHeader, { textAlign: "left", paddingLeft: 8 }]}>Item</Text>
            <Text style={estilos.celulaHeader}>Garantia</Text>
          </View>
          {empresaConfig.garantias.map((g, i) => (
            <View key={g.item} style={i % 2 === 1 ? estilos.tabelaLinhaZebra : estilos.tabelaLinha}>
              <Text style={[estilos.celula, { textAlign: "left", paddingLeft: 8 }]}>{g.item}</Text>
              <Text style={[estilos.celula, { fontFamily: "Poppins", fontWeight: 600, color: cores.navy }]}>
                {g.meses >= 12 ? `${Math.round(g.meses / 12)} ${g.meses >= 24 ? "anos" : "ano"}` : `${g.meses} meses`}
              </Text>
            </View>
          ))}
        </View>

        <RodapePagina numero={numero} pagina={7} totalPaginas={totalPaginas} />
      </Page>

      {/* ================= Página 8 — Retorno do investimento ================= */}
      <Page size="A4" style={estilos.pagina}>
        <CabecalhoPagina
          titulo="Retorno do investimento"
          subtitulo={`Projeção de ${PREMISSAS.horizonteAnos} anos, comparada a alternativas de renda fixa.`}
        />

        <View style={estilos.tabela}>
          <View style={estilos.tabelaHeader} fixed>
            <Text style={[estilos.celulaHeader, { flex: 0.9 }]}>Status</Text>
            <Text style={[estilos.celulaHeader, { flex: 0.55 }]}>Ano</Text>
            <Text style={[estilos.celulaHeader, { flex: 0.7 }]}>Tarifa (R$)</Text>
            <Text style={estilos.celulaHeader}>Economia (R$)</Text>
            <Text style={estilos.celulaHeader}>Resultado (R$)</Text>
            <Text style={estilos.celulaHeader}>CDB {(PREMISSAS.percentualCdb * 100).toFixed(0)}% CDI</Text>
            <Text style={estilos.celulaHeader}>Poupança</Text>
          </View>
          {projecao.linhas.map((linha, i) => (
            <View key={linha.ano} style={i % 2 === 1 ? estilos.tabelaLinhaZebra : estilos.tabelaLinha} wrap={false}>
              <View style={{ flex: 0.9, paddingVertical: 2.5, alignItems: "center", justifyContent: "center" }}>
                <Text
                  style={{
                    fontSize: 6,
                    fontFamily: "Poppins",
                    fontWeight: 600,
                    paddingVertical: 1.5,
                    paddingHorizontal: 6,
                    borderRadius: 8,
                    color: linha.status === "Lucro" ? cores.verde : cores.azulStatus,
                    backgroundColor: linha.status === "Lucro" ? cores.verdeFundo : cores.azulFundo,
                  }}
                >
                  {linha.status}
                </Text>
              </View>
              <Text style={[estilos.celula, { flex: 0.55, fontFamily: "Poppins", fontWeight: 600, color: cores.navy, fontSize: 6.5 }]}>{linha.ano}</Text>
              <Text style={[estilos.celula, { flex: 0.7, fontSize: 6.5 }]}>{linha.tarifa.toFixed(2)}</Text>
              <Text style={[estilos.celulaNum, { fontSize: 6.5 }]}>{moeda(linha.economiaGerada)}</Text>
              <Text
                style={[
                  estilos.celulaNum,
                  { fontSize: 6.5, fontFamily: "Poppins", fontWeight: 600, color: linha.resultadoFinanceiro < 0 ? cores.suave : cores.verde },
                ]}
              >
                {moeda(linha.resultadoFinanceiro)}
              </Text>
              <Text style={[estilos.celulaNum, { fontSize: 6.5 }]}>{moeda(linha.cdb)}</Text>
              <Text style={[estilos.celulaNum, { fontSize: 6.5 }]}>{moeda(linha.poupanca)}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 6.5, color: cores.suave, marginTop: 8, lineHeight: 1.5 }}>
          * Inflação anual da tarifa: {(PREMISSAS.inflacaoAnualTarifa * 100).toFixed(0)}%. Degradação
          dos módulos: até {(PREMISSAS.degradacaoTotal25Anos * 100).toFixed(0)}% em {PREMISSAS.horizonteAnos}{" "}
          anos. CDB simulado a {(PREMISSAS.taxaCdiAnual * PREMISSAS.percentualCdb * 100).toFixed(1)}% a.a.,
          poupança a {(PREMISSAS.rendimentoPoupancaAnual * 100).toFixed(2)}% a.a. Fio B conforme
          cronograma da Lei 14.300, com continuidade de 90% após 2028. Fator de simultaneidade
          de {(simulacao.fatorSimultaneidade * 100).toFixed(2)}%. Resultado do CDB descontando
          imposto de renda ({(PREMISSAS.aliquotaIrRendaFixa * 100).toFixed(0)}% sobre o rendimento).
        </Text>

        <RodapePagina numero={numero} pagina={8} totalPaginas={totalPaginas} />
      </Page>

      {/* ================= Página 9 — Análise do investimento ================= */}
      <Page size="A4" style={estilos.pagina}>
        <CabecalhoPagina titulo="Análise do investimento" subtitulo="Indicadores financeiros do sistema fotovoltaico." />

        <View style={estilos.grid3}>
          <View style={estilos.cartaoNavy}>
            <Text style={estilos.cartaoNavyRotulo}>TIR</Text>
            <Text style={estilos.cartaoNavyValor}>
              {projecao.tir !== null ? `${(projecao.tir * 100).toFixed(2)}%` : "—"}
            </Text>
          </View>
          <View style={estilos.cartaoNavy}>
            <Text style={estilos.cartaoNavyRotulo}>VPL (TMA {(PREMISSAS.tma * 100).toFixed(0)}%)</Text>
            <Text style={estilos.cartaoNavyValor}>{moeda(projecao.vpl)}</Text>
          </View>
          <View style={estilos.cartaoNavy}>
            <Text style={estilos.cartaoNavyRotulo}>Payback</Text>
            <Text style={estilos.cartaoNavyValor}>{formatarPayback(projecao.paybackMeses)}</Text>
          </View>
        </View>

        <SecaoTitulo>Fluxo de caixa acumulado (R$ vs. ano)</SecaoTitulo>
        <GraficoLinhasFluxoCaixa
          anos={projecao.linhas.map((l) => l.ano)}
          series={[
            { rotulo: "Sistema fotovoltaico", cor: "#D99A00", valores: projecao.linhas.map((l) => l.resultadoFinanceiro) },
            { rotulo: `CDB ${(PREMISSAS.percentualCdb * 100).toFixed(0)}% CDI`, cor: "#052137", valores: projecao.linhas.map((l) => l.cdb - valorTotal) },
            { rotulo: "Poupança", cor: "#9AA7B4", valores: projecao.linhas.map((l) => l.poupanca - valorTotal) },
          ]}
        />

        <SecaoTitulo>Retorno ambiental em {PREMISSAS.horizonteAnos} anos</SecaoTitulo>
        <View style={estilos.grid3}>
          <View style={[estilos.cartaoClaro, { alignItems: "center" }]}>
            <IconeNuvem cor={cores.navy} />
            <Text style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 15, color: cores.navy, marginTop: 8 }}>
              {impacto.co2ToneladasEvitadas.toFixed(2)} t
            </Text>
            <Text style={{ fontSize: 6.5, color: cores.suave, marginTop: 3, textAlign: "center", lineHeight: 1.4 }}>
              de CO2 que não serão emitidos na atmosfera
            </Text>
          </View>
          <View style={[estilos.cartaoClaro, { alignItems: "center" }]}>
            <IconeArvore cor={cores.navy} />
            <Text style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 15, color: cores.navy, marginTop: 8 }}>
              {impacto.arvoresEquivalentes}
            </Text>
            <Text style={{ fontSize: 6.5, color: cores.suave, marginTop: 3, textAlign: "center", lineHeight: 1.4 }}>
              árvores equivalentes para absorver esse CO2
            </Text>
          </View>
          <View style={[estilos.cartaoClaro, { alignItems: "center" }]}>
            <IconeMoeda cor={cores.navy} />
            <Text style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 15, color: cores.navy, marginTop: 8 }}>
              {moeda(impacto.custoPlantioArvores)}
            </Text>
            <Text style={{ fontSize: 6.5, color: cores.suave, marginTop: 3, textAlign: "center", lineHeight: 1.4 }}>
              custo aproximado para plantar essas árvores
            </Text>
          </View>
        </View>

        <RodapePagina numero={numero} pagina={9} totalPaginas={totalPaginas} />
      </Page>

      {/* ================= Página 10 — Aceite da Proposta ================= */}
      <Page size="A4" style={estilos.pagina}>
        <CabecalhoPagina titulo="Aceite da Proposta" />
        <Text style={{ lineHeight: 1.5, marginBottom: 20, color: cores.suave, fontSize: 9.5 }}>
          Estando de acordo com os produtos, valores e termos relatados nesta proposta e por
          estarem assim justos e contratados, {empresaConfig.nome} e {lead.nome} firmam a
          presente proposta.
        </Text>

        <SecaoTitulo>Dados do cliente</SecaoTitulo>
        <CampoDados rotulo="Nome do cliente:" valor={lead.nome} />
        <CampoDados rotulo="CPF / CNPJ:" valor={simulacao.clienteCpf} />
        <CampoDados rotulo="RG:" />
        <CampoDados rotulo="Endereço:" valor={simulacao.clienteEnderecoCompleto} />
        <CampoDados rotulo="Cidade:" valor={simulacao.cidade} />
        <CampoDados rotulo="UF:" valor={simulacao.uf} />
        <CampoDados rotulo="Email:" valor={lead.email} />
        <CampoDados rotulo="Telefone:" valor={lead.telefone} />

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 80 }}>
          <View style={{ width: "42%" }}>
            <View style={{ borderTopWidth: 1.5, borderTopColor: cores.navy, marginBottom: 8 }} />
            <Text style={{ textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 9, color: cores.navy }}>
              {empresaConfig.razaoSocial}
            </Text>
            <Text style={{ textAlign: "center", fontSize: 7.5, color: cores.suave, marginTop: 2 }}>{empresaConfig.cnpj}</Text>
          </View>
          <View style={{ width: "42%" }}>
            <View style={{ borderTopWidth: 1.5, borderTopColor: cores.navy, marginBottom: 8 }} />
            <Text style={{ textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 9, color: cores.navy }}>
              {lead.nome}
            </Text>
          </View>
        </View>

        <RodapePagina numero={numero} pagina={10} totalPaginas={totalPaginas} />
      </Page>
    </Document>
  );
}
