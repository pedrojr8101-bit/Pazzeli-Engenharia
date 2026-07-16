import type { GrupoTarifario, TipoLigacao } from "./types";

/**
 * Cronograma de cobrança do Fio B, conforme a Lei 14.300/2022 (Marco Legal da
 * Geração Distribuída). Sistemas protocolados a partir de 7/jan/2023 entram
 * nesta regra de transição; sistemas anteriores a essa data são isentos até
 * 2045 (direito adquirido, não tratado aqui).
 *
 * Fonte: cronograma oficial ANEEL — 15% (2023) subindo 15 p.p. ao ano até
 * 90% (2028). A partir de 2029 a regra oficial prevê valoração pela ANEEL;
 * seguimos a MESMA premissa da ferramenta de propostas da Pazelli:
 * continuidade do pagamento de 90% do Fio B após 2028.
 */
const CRONOGRAMA_FIO_B: Record<number, number> = {
  2023: 0.15,
  2024: 0.3,
  2025: 0.45,
  2026: 0.6,
  2027: 0.75,
  2028: 0.9,
};

export const FIO_B_PERCENTUAL_APOS_2028 = 0.9;

export function percentualFioB(ano: number): number {
  if (ano <= 2022) return 0; // direito adquirido — fora do escopo deste MVP
  if (ano >= 2029) return FIO_B_PERCENTUAL_APOS_2028;
  return CRONOGRAMA_FIO_B[ano] ?? FIO_B_PERCENTUAL_APOS_2028;
}

/**
 * Valor efetivo descontado da energia compensada, em R$/kWh (ano-base 2026),
 * ANTES de aplicar o percentual do cronograma acima.
 *
 * CALIBRADO por engenharia reversa da proposta oficial da Pazelli
 * (P262053 / MARIO_650KWH): na prática a ferramenta oficial desconta a TUSD
 * inteira sobre a energia compensada, não só o Fio B "de livro" da
 * Equatorial PA (~R$ 0,25–0,30/kWh). Manter 0,62 reproduz as propostas
 * oficiais com erro < 5%; reduzir o valor deixa a proposta MAIS atrativa.
 */
export const FIO_B_EFETIVO_RS_KWH = 0.62;

/** Correção anual do Fio B efetivo (calibrado: 3,5% a.a., abaixo da tarifa). */
export const INFLACAO_FIO_B = 0.035;

// Mantido apenas para exibição/premissas em telas antigas — o cálculo
// financeiro agora usa FIO_B_EFETIVO_RS_KWH (acima), calibrado na proposta
// oficial. Este percentual não entra mais na conta.
export const TUSD_PARTICIPACAO_NA_TARIFA = 0.4;

// Fator de simultaneidade assumido por padrão, na ausência da curva de carga
// real do cliente (que só é conhecida com medição). É uma estimativa
// conservadora por perfil de consumo — pode divergir bastante caso a caso.
export const FATOR_SIMULTANEIDADE_PADRAO: Record<GrupoTarifario, number> = {
  B: 0.3, // residencial/comercial pequeno: casa vazia durante o dia
  A: 0.45, // média/alta tensão: operação concentrada no horário comercial
};

// Custo mínimo (kWh) cobrado mesmo com geração própria, conforme o tipo de
// ligação — art. 98 da REN 1.000/2021 (substituiu a antiga "taxa mínima").
export const CUSTO_DISPONIBILIDADE_KWH: Record<TipoLigacao, number> = {
  MONOFASICO: 30,
  BIFASICO: 50,
  TRIFASICO: 100,
};

// Tarifa média nacional (R$/kWh, grupo B, com impostos) — usada apenas como
// fallback quando o cliente não informa a tarifa da própria conta de luz.
export const TARIFA_MEDIA_FALLBACK = 0.85;

// Potência padrão de painel comercial (Wp) usada no dimensionamento.
export const POTENCIA_PAINEL_PADRAO_W = 550;

// Performance Ratio — perdas do sistema (inversor, cabeamento, temperatura,
// sujeira). Faixa típica de mercado: 0,75–0,80.
export const PERFORMANCE_RATIO_PADRAO = 0.78;

// Limite de potência que separa micro de minigeração distribuída (art. 2º,
// Lei 14.300/2022).
export const LIMITE_MICROGERACAO_KWP = 75;
