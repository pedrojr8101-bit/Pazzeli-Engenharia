export type GrupoTarifario = "A" | "B";
export type TipoLigacao = "MONOFASICO" | "BIFASICO" | "TRIFASICO";

export interface EntradaSimulacao {
  cep: string;
  grupoTarifario: GrupoTarifario;
  tipoLigacao?: TipoLigacao; // obrigatório na prática para o Grupo B
  consumoMedioKwh: number;
  tarifaKwh?: number; // se não informado, usamos uma média nacional como fallback
  anoInstalacao?: number; // default: ano atual
  custoMedioPorKwp?: number; // R$/kWp — se não informado, usa default do .env
}

export interface Localizacao {
  latitude: number;
  longitude: number;
  cidade: string;
  uf: string;
  fonte: "brasilapi" | "aproximado-por-capital";
}

export interface Irradiacao {
  hspMensal: number[]; // 12 valores, jan..dez, em kWh/m²/dia
  hspMedioAnual: number;
}

export interface ResultadoSimulacao {
  localizacao: Localizacao;
  irradiacao: Irradiacao;

  potenciaNecessariaKwp: number;
  potenciaInstaladaKwp: number;
  numeroPaineis: number;
  potenciaPainelW: number;
  geracaoMensalKwh: number;
  geracaoAnualKwh: number;
  classificacaoGD: "Microgeração" | "Minigeração";

  percentualFioBAno: number;
  fatorSimultaneidade: number;
  custoFioBMensal: number;
  custoDisponibilidadeMensal: number;

  economiaMensalEstimada: number;
  economiaAnualEstimada: number;
  investimentoEstimado: number;
  paybackAnos: number;

  tarifaKwhUtilizada: number;
  premissas: string[]; // texto explicando as premissas assumidas, para transparência
}
