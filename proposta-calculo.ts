/**
 * lib/proposta-calculo.ts
 * ------------------------------------------------------------------
 * Motor de cálculo da proposta comercial — Pazelli Energia Solar
 *
 * Metodologia alinhada à proposta oficial (ferramenta P262053):
 *  - Fator de simultaneidade (padrão 30%): só essa fração da geração
 *    abate a tarifa CHEIA (autoconsumo instantâneo). O restante é
 *    injetado na rede e compensado com desconto do Fio B.
 *  - Fio B conforme cronograma da Lei 14.300/2022, mantendo 90%
 *    após 2028 (mesma premissa da proposta oficial).
 *  - Primeiro ano PRO-RATA (sistema não gera 12 meses no ano da venda)
 *    e último ano parcial, fechando exatamente 25 anos de operação.
 *  - Degradação dos módulos: até 20% em 25 anos (~0,89% a.a.).
 *  - Custo de disponibilidade (consumo mínimo) nunca é compensável.
 *  - Benchmarks de renda fixa com desconto de IR no CDB.
 *
 * Todos os parâmetros ficam em PARAMETROS_PADRAO — ajuste lá, não
 * dentro das funções.
 * ------------------------------------------------------------------
 */

// =============================== TIPOS ===============================

export interface EntradaProposta {
  /** Consumo médio mensal da(s) conta(s), em kWh */
  consumoMedioMensal: number;
  /** Consumo mínimo faturável (custo de disponibilidade), em kWh/mês.
   *  Monofásico 30 · Bifásico 50 · Trifásico 100 */
  consumoMinimoMensal: number;
  /** Tarifa atual, em R$/kWh (com impostos) */
  tarifa: number;
  /** Potência do sistema, em kWp */
  potenciaSistema: number;
  /** Geração média mensal estimada, em kWh/mês (média anual) */
  geracaoMediaMensal: number;
  /** Valor total do sistema, em R$ */
  valorSistema: number;
  /** Ano da proposta (ex.: 2026) */
  anoInicial: number;
  /** Meses de geração no PRIMEIRO ano (pro-rata).
   *  Ex.: proposta em maio + entrega/homologação ⇒ ~8 meses */
  mesesGeracaoPrimeiroAno: number;
}

export interface ParametrosCalculo {
  /** Inflação anual da tarifa (proposta oficial: 4%) */
  inflacaoTarifa: number;
  /** Degradação anual dos módulos (~20% em 25 anos ⇒ 0,0089) */
  degradacaoAnual: number;
  /** Fator de simultaneidade (proposta oficial: 30%) */
  simultaneidade: number;
  /** Desconto efetivo sobre a energia compensada, em R$/kWh (base ano
   *  inicial). CALIBRADO na ferramenta oficial da Pazelli (P262053):
   *  na prática ela desconta a TUSD inteira, não só o Fio B "de livro"
   *  (Equatorial PA ≈ 0,25–0,30). Manter 0,62 para bater com as
   *  propostas oficiais; reduzir deixa a proposta MAIS atrativa. */
  fioB: number;
  /** Correção anual do Fio B (calibrado: 3,5% a.a., abaixo da tarifa) */
  inflacaoFioB: number;
  /** Percentual do Fio B pago após 2028 (proposta oficial: 90%) */
  fioBApos2028: number;
  /** Taxa DI anual usada no benchmark (proposta oficial: 4,40%) */
  taxaDI: number;
  /** Percentual do CDI do CDB (proposta oficial: 130%) */
  percentualCDI: number;
  /** Alíquota de IR sobre o rendimento do CDB (longo prazo: 15%) */
  aliquotaIRCDB: number;
  /** Rendimento anual da poupança (proposta oficial: 3,15%) */
  rendimentoPoupanca: number;
  /** Horizonte da análise, em anos de operação */
  horizonteAnos: number;
  /** TMA para o VPL (proposta oficial: 4%) */
  tma: number;
}

export const PARAMETROS_PADRAO: ParametrosCalculo = {
  inflacaoTarifa: 0.04,
  degradacaoAnual: 0.0079,
  simultaneidade: 0.3,
  fioB: 0.62,
  inflacaoFioB: 0.035,
  fioBApos2028: 0.9,
  taxaDI: 0.044,
  percentualCDI: 1.3,
  aliquotaIRCDB: 0.15,
  rendimentoPoupanca: 0.0315,
  horizonteAnos: 25,
  tma: 0.04,
};

export interface LinhaRetorno {
  ano: number;
  status: 'Investimento' | 'Lucro';
  tarifa: number;              // R$/kWh no ano
  producaoKWh: number;         // kWh gerados no ano
  contaSemSolar: number;       // R$ — o que pagaria sem o sistema
  contaComSolar: number;       // R$ — o que paga com o sistema
  economia: number;            // R$ economizados no ano
  resultadoAcumulado: number;  // R$ — fluxo de caixa acumulado
  cdbAcumulado: number;        // R$ — mesmo capital em CDB (bruto)
  poupancaAcumulada: number;   // R$ — mesmo capital na poupança
}

export interface ResultadoProposta {
  linhas: LinhaRetorno[];
  paybackAnos: number;
  paybackMeses: number;          // resto em meses
  paybackTotalMeses: number;
  tir: number;                   // a.a. (ex.: 0.3581 = 35,81%)
  vpl: number;                   // à TMA definida
  resultadoLiquidoSolar: number;    // fluxo acumulado (líquido do investimento)
  resultadoLiquidoCDB: number;      // SALDO total líquido de IR (como na proposta oficial)
  resultadoLiquidoPoupanca: number; // SALDO total (poupança é isenta de IR)
  co2EvitadoToneladas: number;
  arvoresEquivalentes: number;
}

// ====================== CRONOGRAMA LEI 14.300 ======================

/** Percentual do Fio B PAGO pelo consumidor sobre energia compensada. */
export function percentualFioB(ano: number, apos2028 = 0.9): number {
  if (ano <= 2022) return 0;
  const tabela: Record<number, number> = {
    2023: 0.15,
    2024: 0.3,
    2025: 0.45,
    2026: 0.6,
    2027: 0.75,
    2028: 0.9,
  };
  return tabela[ano] ?? apos2028;
}

// ========================= CÁLCULO ANUAL ==========================

interface AnoOperacao {
  ano: number;
  producaoKWh: number;
  tarifa: number;
  economia: number;
  contaSemSolar: number;
  contaComSolar: number;
}

function calcularAno(
  entrada: EntradaProposta,
  p: ParametrosCalculo,
  indiceAno: number,
  fracaoAno: number, // 1 = ano cheio; primeiro/último ano são parciais
): AnoOperacao {
  const ano = entrada.anoInicial + indiceAno;

  const tarifaAno = entrada.tarifa * Math.pow(1 + p.inflacaoTarifa, indiceAno);
  const fioBAno =
    p.fioB *
    Math.pow(1 + p.inflacaoFioB, indiceAno) *
    percentualFioB(ano, p.fioBApos2028);

  // Geração do ano, com degradação e pro-rata
  const geracaoAnualCheia =
    entrada.geracaoMediaMensal * 12 * Math.pow(1 - p.degradacaoAnual, indiceAno);
  const producaoKWh = geracaoAnualCheia * fracaoAno;

  // Consumo do período (mesma fração do ano)
  const consumoPeriodo = entrada.consumoMedioMensal * 12 * fracaoAno;
  const minimoPeriodo = entrada.consumoMinimoMensal * 12 * fracaoAno;

  // 1) Autoconsumo instantâneo (simultaneidade) — abate tarifa cheia
  const autoconsumo = Math.min(p.simultaneidade * producaoKWh, consumoPeriodo);

  // 2) Energia injetada na rede
  const injetada = producaoKWh - autoconsumo;

  // 3) Consumo restante puxado da rede
  const consumoRede = consumoPeriodo - autoconsumo;

  // 4) Compensável: limitado ao consumo da rede acima do mínimo
  const compensada = Math.min(injetada, Math.max(consumoRede - minimoPeriodo, 0));

  // 5) Economia = autoconsumo a tarifa cheia + compensada (tarifa − Fio B)
  const economia =
    autoconsumo * tarifaAno +
    compensada * Math.max(tarifaAno - fioBAno, 0);

  const contaSemSolar = consumoPeriodo * tarifaAno;
  const contaComSolar = Math.max(contaSemSolar - economia, minimoPeriodo * tarifaAno);

  return { ano, producaoKWh, tarifa: tarifaAno, economia, contaSemSolar, contaComSolar };
}

// ==================== INDICADORES FINANCEIROS =====================

/** TIR anual por bissecção. Fluxo: [-investimento, eco1, eco2, ...] */
export function calcularTIR(fluxo: number[]): number {
  const vpn = (taxa: number) =>
    fluxo.reduce((acc, v, i) => acc + v / Math.pow(1 + taxa, i), 0);

  let lo = -0.99;
  let hi = 10;
  if (vpn(lo) * vpn(hi) > 0) return NaN;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (vpn(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function calcularVPL(fluxo: number[], tma: number): number {
  return fluxo.reduce((acc, v, i) => acc + v / Math.pow(1 + tma, i), 0);
}

// ========================= FUNÇÃO PRINCIPAL ========================

export function calcularProposta(
  entrada: EntradaProposta,
  parametros: Partial<ParametrosCalculo> = {},
): ResultadoProposta {
  const p: ParametrosCalculo = { ...PARAMETROS_PADRAO, ...parametros };

  const fracaoPrimeiroAno = Math.min(entrada.mesesGeracaoPrimeiroAno / 12, 1);
  // Fecha exatamente `horizonteAnos` anos de operação:
  const fracaoUltimoAno = 1 - fracaoPrimeiroAno;
  const totalLinhas = fracaoUltimoAno > 0 ? p.horizonteAnos + 1 : p.horizonteAnos;

  const linhas: LinhaRetorno[] = [];
  const fluxo: number[] = [-entrada.valorSistema];

  let acumulado = -entrada.valorSistema;
  let cdb = entrada.valorSistema;
  let poupanca = entrada.valorSistema;
  const taxaCDB = p.taxaDI * p.percentualCDI;

  let paybackTotalMeses = -1;
  let mesesDecorridos = 0;

  for (let i = 0; i < totalLinhas; i++) {
    const fracao =
      i === 0 ? fracaoPrimeiroAno : i === totalLinhas - 1 && fracaoUltimoAno > 0 ? fracaoUltimoAno : 1;

    const anoOp = calcularAno(entrada, p, i, fracao);

    const acumuladoAnterior = acumulado;
    acumulado += anoOp.economia;
    fluxo.push(anoOp.economia);

    // Payback interpolado em meses corridos de OPERAÇÃO
    if (paybackTotalMeses < 0 && acumuladoAnterior < 0 && acumulado >= 0) {
      const mesesNoAno = (-acumuladoAnterior / anoOp.economia) * 12 * fracao;
      paybackTotalMeses = Math.round(mesesDecorridos + mesesNoAno);
    }
    mesesDecorridos += 12 * fracao;

    // Benchmarks: a ferramenta oficial capitaliza ANOS CHEIOS,
    // inclusive no primeiro/último ano parcial
    cdb *= 1 + taxaCDB;
    poupanca *= 1 + p.rendimentoPoupanca;

    linhas.push({
      ano: anoOp.ano,
      status: acumulado >= 0 ? 'Lucro' : 'Investimento',
      tarifa: anoOp.tarifa,
      producaoKWh: anoOp.producaoKWh,
      contaSemSolar: anoOp.contaSemSolar,
      contaComSolar: anoOp.contaComSolar,
      economia: anoOp.economia,
      resultadoAcumulado: acumulado,
      cdbAcumulado: cdb,
      poupancaAcumulada: poupanca,
    });
  }

  // IR sobre o RENDIMENTO do CDB (não sobre o principal)
  const rendimentoCDB = cdb - entrada.valorSistema;
  const cdbLiquido = entrada.valorSistema + rendimentoCDB * (1 - p.aliquotaIRCDB);

  const tir = calcularTIR(fluxo);
  const vpl = calcularVPL(fluxo, p.tma);

  // Retorno ambiental (fatores da ferramenta oficial):
  // 0,296 kgCO2/kWh deslocado da rede · 140 kg CO2 absorvidos/árvore
  const geracaoTotalKWh = linhas.reduce((s, l) => s + l.producaoKWh, 0);
  const co2 = Number(((geracaoTotalKWh * 0.296) / 1000).toFixed(2));
  const arvores = Math.round(co2 / 0.14);

  return {
    linhas,
    paybackAnos: Math.floor(paybackTotalMeses / 12),
    paybackMeses: paybackTotalMeses % 12,
    paybackTotalMeses,
    tir,
    vpl,
    resultadoLiquidoSolar: acumulado,
    resultadoLiquidoCDB: cdbLiquido,
    resultadoLiquidoPoupanca: poupanca,
    co2EvitadoToneladas: co2,
    arvoresEquivalentes: arvores,
  };
}

// ========================= EXEMPLO DE USO ==========================
// (mesmos dados da proposta MARIO_650KWH)
//
// const resultado = calcularProposta({
//   consumoMedioMensal: 650,
//   consumoMinimoMensal: 50,
//   tarifa: 0.87,
//   potenciaSistema: 6.0,
//   geracaoMediaMensal: 699,
//   valorSistema: 11000,
//   anoInicial: 2026,
//   mesesGeracaoPrimeiroAno: 8,
// });
//
// resultado.paybackAnos → 2 · resultado.paybackMeses → ~9
// resultado.tir → ~0.35 · resultado.linhas → tabela de 26 linhas
// ===================================================================
