import type { GrupoTarifario, TipoLigacao } from "./types";

/**
 * Cronograma de cobrança do Fio B, conforme a Lei 14.300/2022 (Marco Legal da
 * Geração Distribuída). Sistemas protocolados a partir de 7/jan/2023 entram
 * nesta regra de transição; sistemas anteriores a essa data são isentos até
 * 2045 (direito adquirido, não tratado aqui).
 *
 * Fonte: cronograma oficial ANEEL — 15% (2023) subindo 15 p.p. ao ano até
 * 90% (2028) e 100% a partir de 2029.
 */
const CRONOGRAMA_FIO_B: Record<number, number> = {
  2023: 0.15,
  2024: 0.3,
  2025: 0.45,
  2026: 0.6,
  2027: 0.75,
  2028: 0.9,
};

export function percentualFioB(ano: number): number {
  if (ano <= 2022) return 0; // direito adquirido — fora do escopo deste MVP
  if (ano >= 2029) return 1;
  return CRONOGRAMA_FIO_B[ano] ?? 1;
}

// O Fio B é um componente da TUSD. Este percentual (quanto a TUSD representa
// da tarifa total) é uma média de mercado — o valor real varia por
// concessionária e deveria ser configurado por empresa numa fase futura
// (área admin), com a tarifa homologada real de cada distribuidora.
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
