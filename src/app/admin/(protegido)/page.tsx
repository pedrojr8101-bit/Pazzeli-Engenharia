import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusSelect } from "@/components/admin/StatusSelect";

export const dynamic = "force-dynamic";

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminDashboardPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { simulacoes: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-semibold text-paper">
        {leads.length} lead{leads.length === 1 ? "" : "s"}
      </h1>

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
                <th className="px-4 py-3 font-normal">Economia/mês</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Proposta</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const simulacao = lead.simulacoes[0];
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
                    <td className="px-4 py-3 text-sun">
                      {simulacao ? moeda(simulacao.economiaMensalEstimada) : "—"}
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
