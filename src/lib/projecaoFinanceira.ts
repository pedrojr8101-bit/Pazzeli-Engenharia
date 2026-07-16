import { FIO_B_EFETIVO_RS_KWH, INFLACAO_FIO_B, percentualFioB } from "./tarifas";
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
  custoDisponibilidadeMensalBase: number; // em R$ (kWh mínimo × tarifa base)
  anoInstalacao: number;
  /**
   * Meses de geração no PRIMEIRO ano (pro-rata) — a proposta oficial da
   * Pazelli considera o ano da instalação parcial (o sistema não gera 12
   * meses no ano em que é vendido) e fecha os 25 anos com um último ano
   * também parcial. Padrão: 12 (ano cheio).
   */
  mesesGeracaoPrimeiroAno?: number;
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

  // kWh do custo de disponibilidade (o parâmetro chega em R$)
  const consumoMinimoMensalKwh =
    tarifaBase > 0 ? custoDisponibilidadeMensalBase / tarifaBase : 0;

  // Pro-rata do primeiro ano + último ano parcial fechando o horizonte exato
  const fracaoPrimeiroAno = Math.min(
    Math.max((params.mesesGeracaoPrimeiroAno ?? 12) / 12, 1 / 12),
    1
  );
  const fracaoUltimoAno = 1 - fracaoPrimeiroAno;
  const totalLinhas = fracaoUltimoAno > 0.001 ? P.horizonteAnos + 1 : P.horizonteAnos;

  const linhas: LinhaProjecao[] = [];
  let resultadoAcumulado = -investimento;
  let cdbSaldo = investimento;
  let poupancaSaldo = investimento;
  const taxaCdbAnual = P.taxaCdiAnual * P.percentualCdb;

  for (let i = 1; i <= totalLinhas; i++) {
    const ano = anoInstalacao + i - 1;
    const fracao =
      i === 1 ? fracaoPrimeiroAno : i === totalLinhas && fracaoUltimoAno > 0.001 ? fracaoUltimoAno : 1;

    const tarifa = tarifaBase * Math.pow(1 + P.inflacaoAnualTarifa, i - 1);
    const fatorDegradacao = 1 - (P.degradacaoTotal25Anos * (i - 1)) / (P.horizonteAnos - 1);
    const producaoKwh = geracaoMensalKwhBase * 12 * fatorDegradacao * fracao;

    const consumoPeriodoKwh = consumoMedioMensalKwh * 12 * fracao;
    const minimoPeriodoKwh = consumoMinimoMensalKwh * 12 * fracao;

    // 1) Autoconsumo instantâneo (simultaneidade) — abate a tarifa CHEIA
    const autoconsumoKwh = Math.min(fatorSimultaneidade * producaoKwh, consumoPeriodoKwh);

    // 2) Energia injetada na rede
    const injetadaKwh = producaoKwh - autoconsumoKwh;

    // 3) Compensável: limitada ao consumo da rede acima do mínimo faturável
    //    (o custo de disponibilidade nunca é compensável — REN 1.000/2021)
    const consumoRedeKwh = consumoPeriodoKwh - autoconsumoKwh;
    const compensadaKwh = Math.min(injetadaKwh, Math.max(consumoRedeKwh - minimoPeriodoKwh, 0));

    // 4) Desconto do Fio B sobre a energia compensada (Lei 14.300, mantendo
    //    90% após 2028 — mesma premissa da proposta oficial da Pazelli)
    const fioBAno =
      FIO_B_EFETIVO_RS_KWH * Math.pow(1 + INFLACAO_FIO_B, i - 1) * percentualFioB(ano);

    const economiaGerada =
      autoconsumoKwh * tarifa + compensadaKwh * Math.max(tarifa - fioBAno, 0);

    const semSolar = consumoPeriodoKwh * tarifa;
    const comSolar = Math.max(semSolar - economiaGerada, minimoPeriodoKwh * tarifa);

    resultadoAcumulado += economiaGerada;

    // Benchmarks: a ferramenta oficial capitaliza ANOS CHEIOS, inclusive
    // nos anos parciais de operação do sistema
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

function calcularPaybackMeses(
  linhas: LinhaProjecao[],
  investimento: number,
  mesesGeracaoPrimeiroAno = 12
): number | null {
  let anterior = -investimento;
  let mesesDecorridos = 0;
  for (let i = 0; i < linhas.length; i++) {
    const mesesDoAno = i === 0 ? Math.min(mesesGeracaoPrimeiroAno, 12) : 12;
    const atual = linhas[i].resultadoFinanceiro;
    if (atual >= 0) {
      const fracaoDoAno =
        linhas[i].economiaGerada > 0 ? Math.abs(anterior) / linhas[i].economiaGerada : 0;
      return Math.round(mesesDecorridos + Math.min(1, fracaoDoAno) * mesesDoAno);
    }
    mesesDecorridos += mesesDoAno;
    anterior = atual;
  }
  return null;
}

export function calcularProjecaoFinanceira(params: ParametrosProjecao): ProjecaoFinanceira {
  const linhas = calcularLinhas(params);
  const fluxoCaixa = [-params.investimento, ...linhas.map((l) => l.economiaGerada)];

  const tir = calcularTIR(fluxoCaixa);
  const vpl = calcularVPL(fluxoCaixa, P.tma);
  const paybackMeses = calcularPaybackMeses(
    linhas,
    params.investimento,
    params.mesesGeracaoPrimeiroAno ?? 12
  );

  // Na proposta oficial, o "resultado líquido" de CDB/poupança é o SALDO
  // total (principal + rendimento), com IR de 15% só sobre o rendimento do
  // CDB. A poupança é isenta de IR.
  const ultimaLinha = linhas[linhas.length - 1];
  const ganhoCdbBruto = ultimaLinha.cdb - params.investimento;
  const resultadoLiquidoCdb = params.investimento + ganhoCdbBruto * (1 - P.aliquotaIrRendaFixa);
  const resultadoLiquidoPoupanca = ultimaLinha.poupanca;

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
