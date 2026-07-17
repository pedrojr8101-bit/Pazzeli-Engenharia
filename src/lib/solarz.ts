// Cliente da Open API da SolarZ (https://app.solarz.com.br).
// Autenticação: Basic Auth com o usuário/senha da conta raiz do integrador
// na SolarZ (variáveis SOLARZ_USUARIO e SOLARZ_SENHA).
// Schema oficial: https://app.solarz.com.br/v3/api-docs/seller-open-api

const BASE_URL = "https://app.solarz.com.br";

function authHeader(): string {
  const usuario = process.env.SOLARZ_USUARIO;
  const senha = process.env.SOLARZ_SENHA;
  if (!usuario || !senha) {
    throw new Error("SOLARZ_USUARIO / SOLARZ_SENHA não configurados.");
  }
  const credenciais = Buffer.from(`${usuario}:${senha}`).toString("base64");
  return `Basic ${credenciais}`;
}

async function solarzFetch<T>(caminho: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${caminho}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`SolarZ API respondeu ${res.status} em ${caminho}`);
  }
  return res.json() as Promise<T>;
}

export interface UsinaSolarZ {
  id: number;
  name: string;
  installedPower: number;
  energyProducedKwh?: number;
  status?: { plantId: number; status: string; at: string };
  dataInstalacao?: string;
  cliente?: {
    nome?: string;
    email?: string;
    cpf?: string;
    telefone?: string;
    concessionaria?: string;
  };
  endereco?: {
    bairro?: string;
    logradouro?: string;
    cidade?: string;
    siglaEstado?: string;
    cep?: string;
  };
}

export interface PotenciaUsina {
  plantId: number;
  plantName: string;
  status: string;
  installedPower: number;
  instantPower: number;
  totalGenerated: number;
  generation365Days: number;
}

export interface PerformanceUsina {
  total1D: number;
  total15D: number;
  total30D: number;
  total365D: number;
  expected1D: number;
  expected15D: number;
  expected30D: number;
  expected365D: number;
  installationDate: string;
}

export interface ProducaoDiaria {
  total: number;
  totalExpected: number;
  date: string;
}

/**
 * Busca usinas do integrador filtrando por e-mail e/ou CPF do proprietário —
 * usado no admin para vincular um lead à usina correspondente na SolarZ.
 */
export async function buscarUsinas(filtro: {
  ownerEmail?: string;
  ownerDocument?: string;
  plantName?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ content: UsinaSolarZ[]; totalElements: number }> {
  const page = filtro.page ?? 1;
  const pageSize = filtro.pageSize ?? 20;
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (filtro.ownerEmail) params.set("ownerEmail", filtro.ownerEmail);
  if (filtro.ownerDocument) params.set("ownerDocument", filtro.ownerDocument);
  if (filtro.plantName) params.set("plantName", filtro.plantName);

  return solarzFetch(`/openApi/seller/plantWithInfos/list?${params.toString()}`, {
    method: "POST",
    body: JSON.stringify({
      page,
      pageSize,
      ownerEmail: filtro.ownerEmail,
      ownerDocument: filtro.ownerDocument,
      plantName: filtro.plantName,
    }),
  });
}

export async function obterPotenciaUsina(plantId: number): Promise<PotenciaUsina> {
  return solarzFetch(`/openApi/seller/plant/power?id=${plantId}`);
}

export async function obterPerformanceUsina(plantId: number): Promise<PerformanceUsina> {
  return solarzFetch(`/openApi/seller/plant/performance/plantId/${plantId}`, { method: "POST" });
}

/** Produção diária (real x esperada) num intervalo de datas — formato yyyy-MM-dd. */
export async function obterProducaoPorIntervalo(
  plantId: number,
  fromLocalDate: string,
  toLocalDate: string
): Promise<ProducaoDiaria[]> {
  const params = new URLSearchParams({ plantId: String(plantId), fromLocalDate, toLocalDate });
  return solarzFetch(`/openApi/seller/plant/energy/dayRange?${params.toString()}`, {
    method: "POST",
    body: JSON.stringify({ plantId: String(plantId), fromLocalDate, toLocalDate }),
  });
}

/** Últimos N dias de produção (padrão 30), já formatando as datas. */
export async function obterProducaoUltimosDias(
  plantId: number,
  dias = 30
): Promise<ProducaoDiaria[]> {
  const hoje = new Date();
  const inicio = new Date(hoje.getTime() - dias * 24 * 60 * 60 * 1000);
  const formatar = (d: Date) => d.toISOString().slice(0, 10);
  return obterProducaoPorIntervalo(plantId, formatar(inicio), formatar(hoje));
}
