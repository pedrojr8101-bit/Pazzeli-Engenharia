import { percentualFioB, TUSD_PARTICIPACAO_NA_TARIFA } from "./tarifas";
import { premissasFinanceiras as P } from "./empresa-config";

export interface LinhaProjecao {
  ano: number;
  status: "Investimento" | "Lucro";
  tarifa: number;
  producaoKwh: number;
  semSolar: number;
  comSolar: number;
  economiaGerada: number;
  resultadoFinanceiro: number;
  cdb: number;
  poupanca: number;
}

export interface ProjecaoFinanceira {
  linhas: LinhaProjecao[];
  tir: number | null;
  vpl: number;
  paybackMeses: number | null;
  resultadoLiquidoSistema: number;
  resultadoLiquidoCdb: number;
  resultadoLiquidoPoupanca: number;
}

export interface ImpactoAmbiental {
  co2ToneladasEvitadas: number;
  arvoresEquivalentes: number;
  custoPlantioArvores: number;
}

interface ParametrosProjecao {
  investimento: number;
  consumoMedioMensalKwh: number;
  geracaoMensalKwhBase: number;
  tarifaBase: number;
  fatorSimultaneidade: number;
  custoDisponibilidadeMensalBase: number;
  anoInstalacao: number;
}

function calcularLinhas(params: ParametrosProjecao): LinhaProjecao[] {
  const {
    investimento,
    consumoMedioMensalKwh,
    geracaoMensalKwhBase,
    tarifaBase,
    fatorSimultaneidade,
    custoDisponibilidadeMensalBase,
    anoInstalacao,
  } = params;

  const linhas: LinhaProjecao[] = [];
  let resultadoAcumulado = -investimento;
  let cdbSaldo = investimento;
  let poupancaSaldo = investimento;
  const taxaCdbAnual = P.taxaCdiAnual * P.percentualCdb;

  for (let i = 1; i <= P.horizonteAnos; i++) {
    const ano = anoInstalacao + i - 1;
    const tarifa = tarifaBase * Math.pow(1 + P.inflacaoAnualTarifa, i - 1);
    const fatorDegradacao = 1 - (P.degradacaoTotal25Anos * (i - 1)) / (P.horizonteAnos - 1);
    const producaoKwh = geracaoMensalKwhBase * 12 * fatorDegradacao;

    const percentualFioBAno = percentualFioB(ano);
    const energiaInjetadaAnual = producaoKwh * (1 - fatorSimultaneidade);
    const custoFioBAnual = energiaInjetadaAnual * tarifa * TUSD_PARTICIPACAO_NA_TARIFA * percentualFioBAno;
    const custoDisponibilidadeAnual = custoDisponibilidadeMensalBase * (tarifa / tarifaBase) * 12;

    const semSolar = consumoMedioMensalKwh * 12 * tarifa;
    const comSolar = custoFioBAnual + custoDisponibilidadeAnual;
    const economiaGerada = Math.max(0, semSolar - comSolar);

    resultadoAcumulado += economiaGerada;
    cdbSaldo *= 1 + taxaCdbAnual;
    poupancaSaldo *= 1 + P.rendimentoPoupancaAnual;

    linhas.push({
      ano,
      status: resultadoAcumulado < 0 ? "Investimento" : "Lucro",
      tarifa,
      producaoKwh,
      semSolar,
      comSolar,
      economiaGerada,
      resultadoFinanceiro: resultadoAcumulado,
      cdb: cdbSaldo,
      poupanca: poupancaSaldo,
    });
  }

  return linhas;
}

function calcularVPL(fluxoCaixa: number[], taxaDesconto: number): number {
  return fluxoCaixa.reduce((soma, valor, indice) => {
    if (indice === 0) return soma + valor; // investimento inicial, ano 0
    return soma + valor / Math.pow(1 + taxaDesconto, indice);
  }, 0);
}

function calcularTIR(fluxoCaixa: number[]): number | null {
  const npv = (taxa: number) => calcularVPL(fluxoCaixa, taxa);

  let baixo = -0.5;
  let alto = 3;
  const npvBaixo = npv(baixo);
  const npvAlto = npv(alto);

  // Sem troca de sinal no intervalo — não há raiz confiável para achar.
  if (npvBaixo * npvAlto > 0) return null;

  for (let iteracao = 0; iteracao < 100; iteracao++) {
    const meio = (baixo + alto) / 2;
    const npvMeio = npv(meio);
    if (Math.abs(npvMeio) < 0.01) return meio;
    if (npvBaixo * npvMeio < 0) {
      alto = meio;
    } else {
      baixo = meio;
    }
  }

  return (baixo + alto) / 2;
}

function calcularPaybackMeses(linhas: LinhaProjecao[], investimento: number): number | null {
  let anterior = -investimento;
  for (let i = 0; i < linhas.length; i++) {
    const atual = linhas[i].resultadoFinanceiro;
    if (atual >= 0) {
      const fracaoDoAno = linhas[i].economiaGerada > 0 ? Math.abs(anterior) / linhas[i].economiaGerada : 0;
      return Math.round(i * 12 + Math.min(1, fracaoDoAno) * 12);
    }
    anterior = atual;
  }
  return null;
}

export function calcularProjecaoFinanceira(params: ParametrosProjecao): ProjecaoFinanceira {
  const linhas = calcularLinhas(params);
  const fluxoCaixa = [-params.investimento, ...linhas.map((l) => l.economiaGerada)];

  const tir = calcularTIR(fluxoCaixa);
  const vpl = calcularVPL(fluxoCaixa, P.tma);
  const paybackMeses = calcularPaybackMeses(linhas, params.investimento);

  const ultimaLinha = linhas[linhas.length - 1];
  const ganhoCdbBruto = ultimaLinha.cdb - params.investimento;
  const resultadoLiquidoCdb = ganhoCdbBruto * (1 - P.aliquotaIrRendaFixa);
  const resultadoLiquidoPoupanca = ultimaLinha.poupanca - params.investimento;

  return {
    linhas,
    tir,
    vpl,
    paybackMeses,
    resultadoLiquidoSistema: ultimaLinha.resultadoFinanceiro,
    resultadoLiquidoCdb,
    resultadoLiquidoPoupanca,
  };
}

export function calcularImpactoAmbiental(
  geracaoMensalKwhBase: number,
  anos: number = P.horizonteAnos
): ImpactoAmbiental {
  // Aproximação: usa a geração-base (sem descontar degradação) × anos, já
  // que o efeito da degradação é pequeno para essa estimativa ilustrativa.
  const geracaoTotalKwh = geracaoMensalKwhBase * 12 * anos;
  const co2KgEvitados = geracaoTotalKwh * P.co2KgPorKwh;
  const co2ToneladasEvitadas = co2KgEvitados / 1000;
  const arvoresEquivalentes = Math.round(
    co2KgEvitados / (P.co2KgAbsorvidoPorArvorePorAno * anos)
  );
  const custoPlantioArvores = arvoresEquivalentes * P.custoPorArvorePlantada;

  return { co2ToneladasEvitadas, arvoresEquivalentes, custoPlantioArvores };
}

export function formatarPayback(meses: number | null): string {
  if (meses === null) return "—";
  const anos = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  if (anos === 0) return `${mesesRestantes} meses`;
  if (mesesRestantes === 0) return `${anos} anos`;
  return `${anos} anos e ${mesesRestantes} meses`;
}
