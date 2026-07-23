import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBarChart } from "@/components/admin/StatusBarChart";
import { BarraComparativa } from "@/components/admin/BarraComparativa";
import { LinhaTempoChart } from "@/components/admin/LinhaTempoChart";
import { TendenciaCard } from "@/components/admin/TendenciaCard";
import { ComparativoMercado } from "@/components/admin/ComparativoMercado";
import { LeadsTable } from "@/components/admin/LeadsTable";

// Referência geral de taxa de conversão do setor solar B2C no Brasil — é uma
// régua aproximada de mercado, não um dado exclusivo da Pazelli. Ajuste se
// tiver um benchmark melhor.
const REFERENCIA_MERCADO_CONVERSAO = 15;

export const dynamic = "force-dynamic";

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface ItemPropostaJson {
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
}

function totalMaterial(itens: unknown): number {
  const lista = (itens as ItemPropostaJson[] | null) ?? [];
  return lista.reduce((soma, item) => soma + item.quantidade * item.valorUnitario, 0);
}

export default async function AdminDashboardPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { simulacoes: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  const contagemStatus: Record<string, number> = {};
  let economiaMensalTotal = 0;
  let somaTicket = 0;
  let quantidadeComSimulacao = 0;

  // Só negócios fechados entram nos comparativos de "o que mais vende" —
  // um lead que só rodou o simulador ainda não é uma venda.
  let materialVendidoTotal = 0;
  let servicoVendidoTotal = 0;
  const contagemTelhado: Record<string, number> = {};
  const contagemImovel: Record<string, number> = { RESIDENCIAL: 0, COMERCIAL: 0 };

  for (const lead of leads) {
    contagemStatus[lead.status] = (contagemStatus[lead.status] ?? 0) + 1;
    const sim = lead.simulacoes[0];
    if (sim) {
      economiaMensalTotal += sim.economiaMensalEstimada;
      somaTicket += sim.investimentoFinal ?? sim.investimentoEstimado;
      quantidadeComSimulacao += 1;
    }

    if (lead.status === "CONVERTIDO" && sim) {
      materialVendidoTotal += totalMaterial(sim.itensProposta);
      servicoVendidoTotal += sim.valorServico ?? 0;

      const telhado = sim.tipoEstrutura ?? "Não informado";
      contagemTelhado[telhado] = (contagemTelhado[telhado] ?? 0) + 1;

      const imovel = lead.tipoImovel ?? null;
      if (imovel) contagemImovel[imovel] = (contagemImovel[imovel] ?? 0) + 1;
    }
  }

  const convertidos = contagemStatus.CONVERTIDO ?? 0;
  const taxaConversao = leads.length > 0 ? (convertidos / leads.length) * 100 : 0;
  const ticketMedio = quantidadeComSimulacao > 0 ? somaTicket / quantidadeComSimulacao : 0;

  const chamados = await prisma.chamado.findMany({ select: { status: true, valorCobrado: true } });
  const faturamentoPosVenda = chamados.reduce((soma, c) => soma + (c.valorCobrado ?? 0), 0);
  const chamadosEmAberto = chamados.filter(
    (c) => c.status === "ABERTO" || c.status === "EM_ANDAMENTO"
  ).length;

  // Série dos últimos 6 meses — leads captados x negócios fechados por mês,
  // calculada em cima das datas reais dos leads (createdAt).
  const NOMES_MES = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];
  const hoje = new Date();
  const chavesMeses: string[] = [];
  const rotulosMeses: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    chavesMeses.push(`${data.getFullYear()}-${data.getMonth()}`);
    rotulosMeses.push(NOMES_MES[data.getMonth()]);
  }

  const leadsPorMes: Record<string, number> = Object.fromEntries(chavesMeses.map((c) => [c, 0]));
  const convertidosPorMes: Record<string, number> = Object.fromEntries(
    chavesMeses.map((c) => [c, 0])
  );

  for (const lead of leads) {
    const data = new Date(lead.createdAt);
    const chave = `${data.getFullYear()}-${data.getMonth()}`;
    if (chave in leadsPorMes) {
      leadsPorMes[chave] += 1;
      if (lead.status === "CONVERTIDO") convertidosPorMes[chave] += 1;
    }
  }

  const serieLeads = chavesMeses.map((chave, i) => ({
    rotulo: rotulosMeses[i],
    valor: leadsPorMes[chave],
  }));
  const serieConvertidos = chavesMeses.map((chave, i) => ({
    rotulo: rotulosMeses[i],
    valor: convertidosPorMes[chave],
  }));

  const leadsMesAtual = leadsPorMes[chavesMeses[5]];
  const leadsMesAnterior = leadsPorMes[chavesMeses[4]];
  const convertidosMesAtual = convertidosPorMes[chavesMeses[5]];
  const convertidosMesAnterior = convertidosPorMes[chavesMeses[4]];

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-semibold text-paper">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard valor={String(leads.length)} rotulo="Leads no total" />
        <StatCard
          valor={`${taxaConversao.toFixed(0)}%`}
          rotulo="Taxa de conversão"
          cor="text-sun"
        />
        <StatCard
          valor={moeda(economiaMensalTotal)}
          rotulo="Economia/mês somada"
          cor="text-sky"
        />
        <StatCard valor={moeda(ticketMedio)} rotulo="Ticket médio" cor="text-ember" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard valor={moeda(materialVendidoTotal)} rotulo="Material vendido" cor="text-sky" />
        <StatCard
          valor={moeda(servicoVendidoTotal)}
          rotulo="Taxa de serviço vendida"
          cor="text-sun"
        />
        <StatCard
          valor={moeda(faturamentoPosVenda)}
          rotulo="Faturamento pós-venda"
          cor="text-ember"
        />
        <Link href="/admin/chamados">
          <StatCard valor={String(chamadosEmAberto)} rotulo="Chamados em aberto →" />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <TendenciaCard
          rotulo="Leads captados este mês"
          valorAtual={leadsMesAtual}
          valorAnterior={leadsMesAnterior}
        />
        <TendenciaCard
          rotulo="Negócios fechados este mês"
          valorAtual={convertidosMesAtual}
          valorAnterior={convertidosMesAnterior}
        />
      </div>

      <div className="mt-6">
        <LinhaTempoChart
          titulo="Evolução dos últimos 6 meses"
          series={[
            { nome: "Leads captados", cor: "#F5C24B", corArea: "#F5C24B", pontos: serieLeads },
            {
              nome: "Negócios fechados",
              cor: "#5DCAA5",
              corArea: "#5DCAA5",
              pontos: serieConvertidos,
            },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ComparativoMercado
          suaTaxa={taxaConversao}
          referenciaMercado={REFERENCIA_MERCADO_CONVERSAO}
        />
        <BarraComparativa
          titulo="Tipo de telhado mais vendido (negócios fechados)"
          itens={Object.entries(contagemTelhado)
            .map(([rotulo, valor]) => ({ rotulo, valor }))
            .sort((a, b) => b.valor - a.valor)}
          vazio="Nenhum negócio fechado ainda."
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BarraComparativa
          titulo="Residencial x Comercial (negócios fechados)"
          itens={[
            { rotulo: "Residencial", valor: contagemImovel.RESIDENCIAL, destaque: true },
            { rotulo: "Comercial", valor: contagemImovel.COMERCIAL },
          ]}
          vazio="Nenhum negócio fechado com tipo de imóvel informado."
        />
        <StatusBarChart contagem={contagemStatus} />
      </div>

      <div className="mt-6">
        <div className="rounded-2xl border border-duskline p-5">
          <p className="mb-3 text-sm font-semibold text-paper">Leads mais recentes</p>
          <div className="space-y-2">
            {leads.slice(0, 5).map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-dusk"
              >
                <span className="text-paper">{lead.nome}</span>
                <span className="text-paper/40">
                  {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </Link>
            ))}
            {leads.length === 0 && <p className="text-sm text-paper/40">Nenhum lead ainda.</p>}
          </div>
        </div>
      </div>

      <h2 className="mb-4 mt-10 font-display text-lg font-semibold text-paper">
        Todos os leads
      </h2>

      {leads.length === 0 ? (
        <p className="text-paper/50">
          Nenhum lead ainda — assim que alguém completar o simulador, ele aparece aqui.
        </p>
      ) : (
        <LeadsTable leads={leads} />
      )}
    </div>
  );
}
