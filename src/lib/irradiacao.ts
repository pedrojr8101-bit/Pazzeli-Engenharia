import type { Irradiacao } from "./types";

const MESES_ORDEM = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

// Média nacional aproximada de HSP (horas de sol pleno) — usada apenas se a
// API da NASA estiver indisponível no momento da simulação.
const HSP_FALLBACK_BRASIL = 5.0;

interface NasaPowerClimatologyResponse {
  properties: {
    parameter: {
      ALLSKY_SFC_SW_DWN: Record<string, number>;
    };
  };
}

/**
 * Busca a irradiação solar média (HSP — horas de sol pleno, equivalente a
 * kWh/m²/dia) para uma coordenada, usando a climatologia de 22 anos da NASA
 * POWER (fonte pública, sem necessidade de chave de API).
 */
export async function buscarIrradiacao(
  latitude: number,
  longitude: number
): Promise<Irradiacao> {
  const url = new URL("https://power.larc.nasa.gov/api/temporal/climatology/point");
  url.searchParams.set("parameters", "ALLSKY_SFC_SW_DWN");
  url.searchParams.set("community", "RE");
  url.searchParams.set("latitude", latitude.toFixed(4));
  url.searchParams.set("longitude", longitude.toFixed(4));
  url.searchParams.set("format", "JSON");

  try {
    const res = await fetch(url.toString(), {
      // dados de climatologia não mudam — cache de longa duração
      next: { revalidate: 60 * 60 * 24 * 90 },
    });

    if (!res.ok) throw new Error(`NASA POWER respondeu ${res.status}`);

    const data: NasaPowerClimatologyResponse = await res.json();
    const parametro = data.properties.parameter.ALLSKY_SFC_SW_DWN;

    const hspMensal = MESES_ORDEM.map((mes) => {
      const valor = parametro[mes];
      return typeof valor === "number" && valor > 0 ? valor : HSP_FALLBACK_BRASIL;
    });

    const hspMedioAnual =
      typeof parametro.ANN === "number" && parametro.ANN > 0
        ? parametro.ANN
        : hspMensal.reduce((soma, v) => soma + v, 0) / hspMensal.length;

    return { hspMensal, hspMedioAnual };
  } catch {
    // Fallback: usa a média nacional em todos os meses. O simulador segue
    // funcionando, só perde a granularidade regional/sazonal.
    return {
      hspMensal: new Array(12).fill(HSP_FALLBACK_BRASIL),
      hspMedioAnual: HSP_FALLBACK_BRASIL,
    };
  }
}
