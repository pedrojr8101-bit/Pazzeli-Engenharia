import type { Localizacao } from "./types";

// Coordenadas das capitais — usadas apenas como fallback quando a BrasilAPI
// não retorna geolocalização precisa para o CEP consultado. Suficiente para
// estimar irradiação solar, já que ela varia pouco dentro de uma mesma região.
const CAPITAIS_POR_UF: Record<string, { lat: number; lon: number; cidade: string }> = {
  AC: { lat: -9.9754, lon: -67.8249, cidade: "Rio Branco" },
  AL: { lat: -9.6658, lon: -35.735, cidade: "Maceió" },
  AP: { lat: 0.0349, lon: -51.0694, cidade: "Macapá" },
  AM: { lat: -3.119, lon: -60.0217, cidade: "Manaus" },
  BA: { lat: -12.9777, lon: -38.5016, cidade: "Salvador" },
  CE: { lat: -3.7172, lon: -38.5433, cidade: "Fortaleza" },
  DF: { lat: -15.7939, lon: -47.8828, cidade: "Brasília" },
  ES: { lat: -20.3155, lon: -40.3128, cidade: "Vitória" },
  GO: { lat: -16.6864, lon: -49.2643, cidade: "Goiânia" },
  MA: { lat: -2.5307, lon: -44.3068, cidade: "São Luís" },
  MT: { lat: -15.601, lon: -56.0974, cidade: "Cuiabá" },
  MS: { lat: -20.4697, lon: -54.6201, cidade: "Campo Grande" },
  MG: { lat: -19.9167, lon: -43.9345, cidade: "Belo Horizonte" },
  PA: { lat: -1.4558, lon: -48.4902, cidade: "Belém" },
  PB: { lat: -7.1195, lon: -34.845, cidade: "João Pessoa" },
  PR: { lat: -25.4284, lon: -49.2733, cidade: "Curitiba" },
  PE: { lat: -8.0476, lon: -34.877, cidade: "Recife" },
  PI: { lat: -5.0892, lon: -42.8016, cidade: "Teresina" },
  RJ: { lat: -22.9068, lon: -43.1729, cidade: "Rio de Janeiro" },
  RN: { lat: -5.7945, lon: -35.211, cidade: "Natal" },
  RS: { lat: -30.0346, lon: -51.2177, cidade: "Porto Alegre" },
  RO: { lat: -8.7619, lon: -63.9039, cidade: "Porto Velho" },
  RR: { lat: 2.8235, lon: -60.6758, cidade: "Boa Vista" },
  SC: { lat: -27.5954, lon: -48.548, cidade: "Florianópolis" },
  SP: { lat: -23.5505, lon: -46.6333, cidade: "São Paulo" },
  SE: { lat: -10.9472, lon: -37.0731, cidade: "Aracaju" },
  TO: { lat: -10.1753, lon: -48.2982, cidade: "Palmas" },
};

interface BrasilApiCepV2 {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  location?: {
    type: string;
    coordinates?: {
      longitude?: string | number;
      latitude?: string | number;
    };
  };
}

export async function geocodeCep(cepBruto: string): Promise<Localizacao> {
  const cep = cepBruto.replace(/\D/g, "");
  if (cep.length !== 8) {
    throw new Error("CEP inválido — informe 8 dígitos.");
  }

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
      // CEP não muda de coordenadas; cache generoso evita bater na API à toa
      next: { revalidate: 60 * 60 * 24 * 30 },
    });

    if (res.ok) {
      const data: BrasilApiCepV2 = await res.json();
      const coords = data.location?.coordinates;
      const lat = coords?.latitude !== undefined ? Number(coords.latitude) : undefined;
      const lon = coords?.longitude !== undefined ? Number(coords.longitude) : undefined;

      if (lat && lon && !Number.isNaN(lat) && !Number.isNaN(lon)) {
        return {
          latitude: lat,
          longitude: lon,
          cidade: data.city,
          uf: data.state,
          fonte: "brasilapi",
        };
      }

      // BrasilAPI achou o endereço mas não a geolocalização exata: usa a
      // capital do estado como aproximação razoável.
      const capital = CAPITAIS_POR_UF[data.state];
      if (capital) {
        return {
          latitude: capital.lat,
          longitude: capital.lon,
          cidade: data.city || capital.cidade,
          uf: data.state,
          fonte: "aproximado-por-capital",
        };
      }
    }
  } catch {
    // segue para o fallback abaixo
  }

  throw new Error(
    "Não foi possível localizar esse CEP. Confira o número e tente novamente."
  );
}
