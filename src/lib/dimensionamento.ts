import { geocodeCep } from "./geocode";
import { buscarIrradiacao } from "./irradiacao";
import {
  CUSTO_DISPONIBILIDADE_KWH,
  FATOR_SIMULTANEIDADE_PADRAO,
  LIMITE_MICROGERACAO_KWP,
  PERFORMANCE_RATIO_PADRAO,
  POTENCIA_PAINEL_PADRAO_W,
  TARIFA_MEDIA_FALLBACK,
  TUSD_PARTICIPACAO_NA_TARIFA,
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
    `Fio B calculado sobre ${(TUSD_PARTICIPACAO_NA_TARIFA * 100).toFixed(0)}% da tarifa (participação média da TUSD) — o valor exato depende da tarifa homologada da concessionária.`
  );

  const energiaInjetadaMensalKwh = geracaoMensalKwh * (1 - fatorSimultaneidade);
  const custoFioBMensal =
    energiaInjetadaMensalKwh * tarifaKwh * TUSD_PARTICIPACAO_NA_TARIFA * percentualFioBAno;

  const custoDisponibilidadeMensal = entrada.tipoLigacao
    ? CUSTO_DISPONIBILIDADE_KWH[entrada.tipoLigacao] * tarifaKwh
    : 0;
  if (!entrada.tipoLigacao) {
    premissas.push(
      "Tipo de ligação não informado — o custo de disponibilidade mínimo não foi descontado da economia estimada."
    );
  }

  // 4) Indicadores financeiros ---------------------------------------------
  const energiaCompensadaMensalKwh = Math.min(geracaoMensalKwh, entrada.consumoMedioKwh) +
    Math.max(0, geracaoMensalKwh - entrada.consumoMedioKwh); // excedente também compensa via créditos
  const economiaMensalEstimada = Math.max(
    0,
    energiaCompensadaMensalKwh * tarifaKwh - custoFioBMensal - custoDisponibilidadeMensal
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
