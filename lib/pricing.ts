export interface PricingResult {
  totalMaterial: number;
  bdiMaterialValor: number;
  totalMaterialComBDI: number;

  valorServico: number;
  bdiServicoValor: number;
  totalServicoComBDI: number;

  totalFinal: number;
}

export function calcularTotalComBDI(
  totalMaterial: number,
  bdiMaterialPercent: number,
  valorServico: number,
  bdiServicoPercent: number
): PricingResult {
  const bdiMaterialValor = totalMaterial * (bdiMaterialPercent / 100);
  const totalMaterialComBDI = totalMaterial + bdiMaterialValor;

  const bdiServicoValor = valorServico * (bdiServicoPercent / 100);
  const totalServicoComBDI = valorServico + bdiServicoValor;

  return {
    totalMaterial,
    bdiMaterialValor,
    totalMaterialComBDI,
    valorServico,
    bdiServicoValor,
    totalServicoComBDI,
    totalFinal: totalMaterialComBDI + totalServicoComBDI,
  };
}
