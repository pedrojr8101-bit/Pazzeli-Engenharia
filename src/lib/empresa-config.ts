// Configuração da empresa — dados reais da Pazelli Energia Solar, extraídos
// da proposta de referência enviada pelo cliente (MARIO_650KWH.pdf).
// Ajuste aqui sempre que algo mudar (endereço, parceiros, financiamento etc).

export const empresaConfig = {
  nome: "Pazelli Energia Solar",
  razaoSocial: "Pazelli Energia Solar Eireli",
  cnpj: "34.588.201/0001-73",
  telefone: process.env.NEXT_PUBLIC_EMPRESA_TELEFONE || "(91) 3348-6759",
  telefoneSecundario: "(91) 99129-4123",
  whatsapp: process.env.NEXT_PUBLIC_EMPRESA_WHATSAPP || "5591991294123",
  email: process.env.NEXT_PUBLIC_EMPRESA_EMAIL || "josemario@pazelliengenharia.com.br",
  site: process.env.NEXT_PUBLIC_EMPRESA_SITE || "https://www.pazelliengenharia.com.br/",

  endereco: {
    rua: "Avenida Conselheiro Furtado, 2391, Ed. Belém Metropolitan, Sala 1009",
    bairro: "Batista Campos",
    cidade: "Belém",
    uf: "PA",
    cep: "66035-350",
  },

  sobre:
    "Especializados no desenvolvimento de projetos de energia solar, focados na geração " +
    "distribuída, trazendo uma solução completa com amplo rigor técnico, sempre pensando em " +
    "maximizar a eficiência do desempenho ao longo da vida útil do sistema fotovoltaico, " +
    "garantindo a satisfação do cliente e de investidores.",

  missao:
    "Facilitar o desenvolvimento da energia fotovoltaica no Brasil, incluindo residências e " +
    "empresas na geração de energia própria, limpa e sustentável.",
  visao:
    "Ser modelo nacional em geração sustentável, buscando oferecer soluções de eficiência " +
    "energéticas e projetos transformadores para o desenvolvimento social.",
  valores: ["Relacionamento", "Transparência", "Integridade", "Confiança", "Respeito"],

  // Parceiros/fabricantes — nome + logo (imagem real, ver assets-pazelli.ts)
  parceiros: [
    { nome: "Fronius", logoKey: "logoFronius" as const },
    { nome: "APsystems", logoKey: "logoApsystems" as const },
    { nome: "Canadian Solar", logoKey: "logoCanadianSolar" as const },
    { nome: "Sofar Solar", logoKey: "logoSofar" as const },
    { nome: "Risen", logoKey: "logoRisen" as const },
    { nome: "Deye", logoKey: "logoDeye" as const },
  ],

  // Instituições financeiras aceitas — nome + logo (sem tabela de parcelas
  // detalhada, seguindo o padrão real da empresa: só lista as opções)
  bancos: [
    { nome: "Banpará", logoKey: "logoBanpara" as const },
    { nome: "Santander", logoKey: "logoSantander" as const },
    { nome: "Banco da Amazônia", logoKey: "logoBancoAmazonia" as const },
    { nome: "Banco do Brasil", logoKey: "logoBancoBrasil" as const },
  ],

  suporte:
    "Fornecemos suporte técnico durante os primeiros 12 meses de utilização do sistema, " +
    "incluindo visitas para verificação, limpeza e treinamento. Após esse período, o suporte " +
    "continua disponível através da nossa equipe técnica.",

  garantias: [
    { item: "Instalação", meses: 12 },
    { item: "Inversores", meses: 60 },
    { item: "Módulos", meses: 120 },
    { item: "Estrutura", meses: 120 },
  ],

  fotosProjetos: [] as { url: string; legenda: string }[],

  prazoEntregaDias: 15,
  descontoAVistaPercentual: 0, // a Pazelli não trabalha com desconto à vista destacado
  validadePropostaDias: 15,

  // Mantido apenas como fallback — a Pazelli lista os bancos parceiros sem
  // tabela de parcelas detalhada (ver `bancos` acima).
  financiamento: [] as {
    banco: string;
    parcelas: number;
    taxaJurosMensal: number;
    percentualEntrada: number;
  }[],
};

// Premissas usadas nos cálculos de projeção financeira de 25 anos.
// Valores alinhados com o padrão de proposta já usado pela Pazelli.
export const premissasFinanceiras = {
  horizonteAnos: 25,
  inflacaoAnualTarifa: 0.04,
  degradacaoTotal25Anos: 0.2,
  taxaCdiAnual: 0.085, // média histórica de longo prazo — não usar a Selic do momento aqui.
  percentualCdb: 1.3,
  rendimentoPoupancaAnual: 0.055,
  aliquotaIrRendaFixa: 0.15,
  tma: 0.04,

  co2KgPorKwh: 0.3,
  co2KgAbsorvidoPorArvorePorAno: 20,
  custoPorArvorePlantada: 20,

  areaOcupadaPorPainelM2: 2.6,
};
