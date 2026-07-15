export interface OpcaoFinanciamento {
  banco: string;
  parcelas: number;
  taxaJurosMensal: number;
  percentualEntrada: number;
}

export interface ResultadoFinanciamento {
  banco: string;
  parcelas: number;
  valorEntrada: number;
  primeiraParcela: number;
  ultimaParcela: number;
}

/**
 * Calcula uma tabela SAC (amortização constante) e devolve só o resumo
 * necessário para a proposta: entrada, primeira e última parcela.
 * SAC: a amortização é fixa a cada mês; os juros incidem sobre o saldo
 * devedor restante, então a parcela começa maior e vai diminuindo.
 */
export function calcularFinanciamentoSAC(
  valorTotal: number,
  opcao: OpcaoFinanciamento
): ResultadoFinanciamento {
  const valorEntrada = valorTotal * opcao.percentualEntrada;
  const valorFinanciado = valorTotal - valorEntrada;
  const amortizacao = valorFinanciado / opcao.parcelas;

  let saldoDevedor = valorFinanciado;
  let primeiraParcela = 0;
  let ultimaParcela = 0;

  for (let i = 1; i <= opcao.parcelas; i++) {
    const juros = saldoDevedor * opcao.taxaJurosMensal;
    const parcela = amortizacao + juros;
    if (i === 1) primeiraParcela = parcela;
    if (i === opcao.parcelas) ultimaParcela = parcela;
    saldoDevedor -= amortizacao;
  }

  return {
    banco: opcao.banco,
    parcelas: opcao.parcelas,
    valorEntrada,
    primeiraParcela,
    ultimaParcela,
  };
}
