import { geocodeCep } from "./geocode";
import { buscarIrradiacao } from "./irradiacao";
import {
  CUSTO_DISPONIBILIDADE_KWH,
  FATOR_SIMULTANEIDADE_PADRAO,
  FIO_B_EFETIVO_RS_KWH,
  LIMITE_MICROGERACAO_KWP,
  PERFORMANCE_RATIO_PADRAO,
  POTENCIA_PAINEL_PADRAO_W,
  TARIFA_MEDIA_FALLBACK,
  percentualFioB,
} from "./tarifas";
import type { EntradaSimulacao, ResultadoSimulacao } from "./types";

const DIAS_POR_MES = 30;

export async function simular(entrada: EntradaSimulacao): Promise<ResultadoSimulacao> {
  const ano = entrada.anoInstalacao ?? new Date().getFullYear();
  const tarifaKwh = entrada.tarifaKwh && entrada.tarifaKwh > 0 ? entrada.tarifaKwh : TARIFA_MEDIA_FALLBACK;
  const custoMedioPorKwp = entrada.custoMedioPorKwp && entrada.custoMedioPorKwp > 0
    ? entrada.custoMedioPorKwp
    : Number(process.env.NEXT_PUBLIC_CUSTO_MEDIO_KWP ?? 3800);

  const premissas: string[] = [];

  // 1) Localização e irradiação -----------------------------------------
  const localizacao = await geocodeCep(entrada.cep);
  if (localizacao.fonte === "aproximado-por-capital") {
    premissas.push(
      `Não localizamos as coordenadas exatas do CEP informado — usamos a capital de ${localizacao.uf} como aproximação para a irradiação solar.`
    );
  }

  const irradiacao = await buscarIrradiacao(localizacao.latitude, localizacao.longitude);
  const hsp = irradiacao.hspMedioAnual;

  // 2) Dimensionamento do sistema -----------------------------------------
  // Potência (kWp) = consumo mensal / (HSP x dias x Performance Ratio)
  const potenciaNecessariaKwp =
    entrada.consumoMedioKwh / (hsp * DIAS_POR_MES * PERFORMANCE_RATIO_PADRAO);

  const numeroPaineis = Math.max(
    1,
    Math.ceil((potenciaNecessariaKwp * 1000) / POTENCIA_PAINEL_PADRAO_W)
  );
  const potenciaInstaladaKwp = (numeroPaineis * POTENCIA_PAINEL_PADRAO_W) / 1000;

  const geracaoMensalKwh =
    potenciaInstaladaKwp * hsp * DIAS_POR_MES * PERFORMANCE_RATIO_PADRAO;
  const geracaoAnualKwh = irradiacao.hspMensal.reduce(
    (soma, hspMes) =>
      soma + potenciaInstaladaKwp * hspMes * DIAS_POR_MES * PERFORMANCE_RATIO_PADRAO,
    0
  );

  const classificacaoGD: ResultadoSimulacao["classificacaoGD"] =
    potenciaInstaladaKwp <= LIMITE_MICROGERACAO_KWP ? "Microgeração" : "Minigeração";

  // 3) Regras da Lei 14.300 (Fio B) ----------------------------------------
  const percentualFioBAno = percentualFioB(ano);
  const fatorSimultaneidade = FATOR_SIMULTANEIDADE_PADRAO[entrada.grupoTarifario];
  premissas.push(
    `Fator de simultaneidade estimado em ${(fatorSimultaneidade * 100).toFixed(0)}% (sem a curva de carga real do cliente — este número tende a variar caso a caso).`
  );
  premissas.push(
    `Fio B descontado a R$ ${FIO_B_EFETIVO_RS_KWH.toFixed(2)}/kWh sobre a energia compensada (valor efetivo calibrado nas propostas da empresa) — o valor exato depende da tarifa homologada da concessionária.`
  );

  const consumoMinimoKwh = entrada.tipoLigacao
    ? CUSTO_DISPONIBILIDADE_KWH[entrada.tipoLigacao]
    : 0;
  const custoDisponibilidadeMensal = consumoMinimoKwh * tarifaKwh;
  if (!entrada.tipoLigacao) {
    premissas.push(
      "Tipo de ligação não informado — o custo de disponibilidade mínimo não foi descontado da economia estimada."
    );
  }

  // 4) Indicadores financeiros ---------------------------------------------
  // Mesma metodologia da projeção de 25 anos (proposta oficial):
  // autoconsumo instantâneo abate a tarifa cheia; o restante é injetado e
  // compensado com desconto do Fio B, limitado ao consumo da rede acima do
  // mínimo faturável. Excedente além do consumo vira crédito futuro — não
  // conta como economia imediata.
  const autoconsumoMensalKwh = Math.min(
    fatorSimultaneidade * geracaoMensalKwh,
    entrada.consumoMedioKwh
  );
  const energiaInjetadaMensalKwh = geracaoMensalKwh - autoconsumoMensalKwh;
  const consumoRedeMensalKwh = entrada.consumoMedioKwh - autoconsumoMensalKwh;
  const energiaCompensadaMensalKwh = Math.min(
    energiaInjetadaMensalKwh,
    Math.max(consumoRedeMensalKwh - consumoMinimoKwh, 0)
  );
  const custoFioBMensal = energiaCompensadaMensalKwh * FIO_B_EFETIVO_RS_KWH * percentualFioBAno;
  const economiaMensalEstimada = Math.max(
    0,
    autoconsumoMensalKwh * tarifaKwh +
      energiaCompensadaMensalKwh * tarifaKwh -
      custoFioBMensal
  );
  const economiaAnualEstimada = economiaMensalEstimada * 12;

  const investimentoEstimado = potenciaInstaladaKwp * custoMedioPorKwp;
  const paybackAnos =
    economiaAnualEstimada > 0 ? investimentoEstimado / economiaAnualEstimada : Infinity;

  premissas.push(
    `Investimento estimado com base em R$ ${custoMedioPorKwp.toLocaleString("pt-BR")}/kWp — valor de referência de mercado, sujeito a confirmação em proposta formal.`
  );

  return {
    localizacao,
    irradiacao,
    potenciaNecessariaKwp,
    potenciaInstaladaKwp,
    numeroPaineis,
    potenciaPainelW: POTENCIA_PAINEL_PADRAO_W,
    geracaoMensalKwh,
    geracaoAnualKwh,
    classificacaoGD,
    percentualFioBAno,
    fatorSimultaneidade,
    custoFioBMensal,
    custoDisponibilidadeMensal,
    economiaMensalEstimada,
    economiaAnualEstimada,
    investimentoEstimado,
    paybackAnos,
    tarifaKwhUtilizada: tarifaKwh,
    premissas,
  };
}
