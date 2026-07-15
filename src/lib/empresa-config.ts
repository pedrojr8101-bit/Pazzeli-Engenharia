// Conteúdo institucional e premissas financeiras usadas na proposta em PDF.
// Isso é conteúdo comercial/textual — não precisa estar no banco de dados.
// Edite os valores abaixo com as informações reais da empresa.

export const empresaConfig = {
  nome: process.env.NEXT_PUBLIC_EMPRESA_NOME || "Pazelli Energia Solar",
  cnpj: "34.588.201/0001-73",
  telefone: process.env.NEXT_PUBLIC_EMPRESA_TELEFONE || "(91) 99129-4123",
  whatsapp: process.env.NEXT_PUBLIC_EMPRESA_WHATSAPP || "5591991294123",
  email: process.env.NEXT_PUBLIC_EMPRESA_EMAIL || "josemario@pazelliengenharia.com.br",
  site: process.env.NEXT_PUBLIC_EMPRESA_SITE || "", // pazelliengenharia.com.br retornou 404 na última checagem — confirme antes de usar
  logoUrl: process.env.NEXT_PUBLIC_EMPRESA_LOGO_URL || "", // cole aqui a URL de uma imagem do logo, se tiver uma hospedada

  endereco: {
    rua: "Av. Conselheiro Furtado, 2391 — Edif. Belém Metropolitan, Sala 1009",
    bairro: "Batista Campos",
    cidade: "Belém",
    uf: "PA",
    cep: "66035-350",
  },

  anosExperiencia: 6, // fundada em 20/08/2019, segundo o CNPJ

  // Fonte: descrição usada pela própria empresa no Reclame Aqui.
  sobre:
    "Somos especialistas no desenvolvimento de projetos de energia solar, trazendo sempre " +
    "uma solução completa com amplo rigor técnico para garantir a satisfação do cliente.",

  // TODO — não encontrei esse conteúdo em fontes públicas confiáveis.
  // Copie do Instagram/Facebook da empresa ou escreva algo novo antes de usar em proposta real.
  missao: "Ser referência em energia solar pela excelência técnica e confiança.",
  visao: "Oferecer soluções em energia solar com qualidade, economia e sustentabilidade.",
  valores: ["Ética", "Qualidade", "Compromisso", "Inovação", "Respeito ao cliente"],

  // TODO — substitua pelos fabricantes/parceiros reais que a Pazelli utiliza.
  parceiros: ["WEG", "Fronius", "Growatt"],

  // TODO — confirme os termos reais de suporte/garantia da empresa.
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

  // URLs de fotos de projetos executados — deixe vazio até ter fotos reais.
  fotosProjetos: [] as { url: string; legenda: string }[],

  prazoEntregaDias: 40,
  descontoAVistaPercentual: 0.03,
  validadePropostaDias: 15,

  // TODO — condições de financiamento de exemplo. AJUSTE com taxas reais
  // antes de enviar propostas de verdade, taxas mudam com frequência.
  financiamento: [
    {
      banco: "Banco A",
      parcelas: 60,
      taxaJurosMensal: 0.03,
      percentualEntrada: 0.1,
    },
    {
      banco: "Banco B",
      parcelas: 60,
      taxaJurosMensal: 0.025,
      percentualEntrada: 0.05,
    },
  ],
};

// Premissas usadas nos cálculos de projeção financeira de 25 anos.
// Documentadas para transparência — ajuste se tiver dados mais precisos.
export const premissasFinanceiras = {
  horizonteAnos: 25,
  inflacaoAnualTarifa: 0.05, // reajuste médio anual da tarifa de energia
  degradacaoTotal25Anos: 0.2, // perda de eficiência dos painéis em 25 anos (linear)
  taxaCdiAnual: 0.085, // média histórica de longo prazo — NÃO use a Selic do momento aqui.
  // Compor a taxa atual (que é cíclica e pode estar em pico) por 25 anos seguidos
  // produz valores irreais. 8,5% a.a. reflete melhor a média de longo prazo.
  percentualCdb: 1.4, // 140% do CDI, comparação de investimento alternativo
  rendimentoPoupancaAnual: 0.06, // poupança: ~0,5%/mês quando Selic > 8,5% a.a.
  aliquotaIrRendaFixa: 0.15, // IR sobre renda fixa em prazos longos (>720 dias)
  tma: 0.05, // taxa mínima de atratividade, usada no cálculo do VPL

  // Impacto ambiental — fatores aproximados, úteis para ilustrar o benefício,
  // não para uso em relatórios técnicos formais de carbono.
  co2KgPorKwh: 0.3,
  co2KgAbsorvidoPorArvorePorAno: 20,
  custoPorArvorePlantada: 20,

  areaOcupadaPorPainelM2: 2.6,
};
