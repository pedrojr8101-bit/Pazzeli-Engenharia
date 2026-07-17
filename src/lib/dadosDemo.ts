// Gera números realistas de produção solar pra demonstração — mesmo
// formato que a API real devolve, então quando a integração de verdade
// (SolarZ ou Elekeeper) estiver pronta, a troca é só no componente, sem
// mudar layout nenhum.

function aleatorioEntre(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function gerarDadosDemo(potenciaInstaladaKwp = 6.5) {
  const hoje = new Date();
  const horaAtual = hoje.getHours();
  const ehDia = horaAtual >= 6 && horaAtual <= 18;

  // Curva simples: pico de geração perto do meio-dia
  const fatorHorario = ehDia ? Math.sin(((horaAtual - 6) / 12) * Math.PI) : 0;
  const instantPower = Number((potenciaInstaladaKwp * fatorHorario * aleatorioEntre(0.7, 0.95)).toFixed(2));

  const geracaoDiariaMedia = potenciaInstaladaKwp * 4.6; // ~4,6 HSP médio

  const ultimosDias = Array.from({ length: 30 }, (_, i) => {
    const data = new Date(hoje.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
    const variacaoClima = aleatorioEntre(0.75, 1.08); // dias nublados/ensolarados
    const totalExpected = Number(geracaoDiariaMedia.toFixed(1));
    const total = Number((geracaoDiariaMedia * variacaoClima).toFixed(1));
    return { date: data.toISOString().slice(0, 10), total, totalExpected };
  });

  const total1D = ultimosDias[ultimosDias.length - 1].total;
  const expected1D = ultimosDias[ultimosDias.length - 1].totalExpected;
  const total30D = Number(ultimosDias.reduce((soma, d) => soma + d.total, 0).toFixed(1));
  const expected30D = Number(ultimosDias.reduce((soma, d) => soma + d.totalExpected, 0).toFixed(1));
  const total365D = Number((geracaoDiariaMedia * 365 * aleatorioEntre(0.92, 1.02)).toFixed(0));
  const expected365D = Number((geracaoDiariaMedia * 365).toFixed(0));

  const totalGenerated = Number((total365D * 1.4).toFixed(0)); // simula um sistema com +1 ano de histórico

  return {
    potencia: {
      plantName: "Usina de demonstração",
      status: "Online",
      installedPower: potenciaInstaladaKwp,
      instantPower,
      totalGenerated,
      generation365Days: total365D,
    },
    performance: { total1D, expected1D, total30D, expected30D, total365D, expected365D },
    ultimosDias,
  };
}
