import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBarChart } from "@/components/admin/StatusBarChart";

export const dynamic = "force-dynamic";

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

  for (const lead of leads) {
    contagemStatus[lead.status] = (contagemStatus[lead.status] ?? 0) + 1;
    const sim = lead.simulacoes[0];
    if (sim) {
      economiaMensalTotal += sim.economiaMensalEstimada;
      somaTicket += sim.investimentoFinal ?? sim.investimentoEstimado;
      quantidadeComSimulacao += 1;
    }
  }

  const convertidos = contagemStatus.CONVERTIDO ?? 0;
  const taxaConversao = leads.length > 0 ? (convertidos / leads.length) * 100 : 0;
  const ticketMedio = quantidadeComSimulacao > 0 ? somaTicket / quantidadeComSimulacao : 0;

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

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <StatusBarChart contagem={contagemStatus} />

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
            {leads.length === 0 && (
              <p className="text-sm text-paper/40">Nenhum lead ainda.</p>
            )}
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
        <div className="overflow-x-auto rounded-2xl border border-duskline">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-duskline text-xs uppercase tracking-wide text-paper/40">
              <tr>
                <th className="px-4 py-3 font-normal">Nome</th>
                <th className="px-4 py-3 font-normal">Cidade</th>
                <th className="px-4 py-3 font-normal">Sistema</th>
                <th className="px-4 py-3 font-normal">Preço</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Proposta</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const simulacao = lead.simulacoes[0];
                const preco = simulacao
                  ? simulacao.investimentoFinal ?? simulacao.investimentoEstimado
                  : null;
                return (
                  <tr key={lead.id} className="border-b border-duskline last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/admin/leads/${lead.id}`} className="text-paper hover:text-sun">
                        {lead.nome}
                      </Link>
                      <p className="text-xs text-paper/40">{lead.email}</p>
                    </td>
                    <td className="px-4 py-3 text-paper/70">
                      {lead.cidade ? `${lead.cidade}/${lead.uf}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-paper/70">
                      {simulacao ? `${simulacao.potenciaInstaladaKwp.toFixed(1)} kWp` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {preco !== null ? (
                        <span className={simulacao?.investimentoFinal ? "text-sun" : "text-paper/70"}>
                          {moeda(preco)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect leadId={lead.id} statusAtual={lead.status} />
                    </td>
                    <td className="px-4 py-3">
                      {simulacao ? (
                        <a
                          href={`/api/admin/simulacoes/${simulacao.id}/proposta`}
                          className="text-sun hover:text-sunlight"
                        >
                          Baixar PDF
                        </a>
                      ) : (
                        <span className="text-paper/30">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
