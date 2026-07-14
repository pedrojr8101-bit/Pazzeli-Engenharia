import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusSelect } from "@/components/admin/StatusSelect";

export const dynamic = "force-dynamic";

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function DetalheLeadPage({ params }: { params: { id: string } }) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: { simulacoes: { orderBy: { createdAt: "desc" } } },
  });

  if (!lead) notFound();

  return (
    <div>
      <Link href="/admin" className="text-sm text-paper/50 hover:text-paper">
        ← Voltar
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-paper">{lead.nome}</h1>
          <p className="mt-1 text-sm text-paper/50">
            {lead.email} · {lead.telefone}
          </p>
          <p className="text-sm text-paper/50">
            {lead.cidade ? `${lead.cidade}/${lead.uf}` : "—"} · CEP {lead.cep}
          </p>
        </div>
        <StatusSelect leadId={lead.id} statusAtual={lead.status} />
      </div>

      <h2 className="mb-4 mt-10 font-display text-lg font-semibold text-paper">
        Simulações ({lead.simulacoes.length})
      </h2>

      <div className="space-y-4">
        {lead.simulacoes.map((sim) => (
          <div key={sim.id} className="rounded-2xl border border-duskline p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xl text-paper">{sim.potenciaInstaladaKwp.toFixed(2)} kWp</p>
                <p className="text-xs text-paper/40">
                  {sim.numeroPaineis} painéis · {sim.classificacaoGD} ·{" "}
                  {new Date(sim.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <a
                href={`/api/admin/simulacoes/${sim.id}/proposta`}
                className="rounded-full border border-duskline px-4 py-2 text-xs text-paper/80 hover:border-sun hover:text-sun"
              >
                Baixar proposta em PDF
              </a>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-sky">{Math.round(sim.geracaoMensalKwh)} kWh/mês</p>
                <p className="text-xs text-paper/40">Geração estimada</p>
              </div>
              <div>
                <p className="text-sun">{moeda(sim.economiaMensalEstimada)}/mês</p>
                <p className="text-xs text-paper/40">Economia estimada</p>
              </div>
              <div>
                <p className="text-paper">
                  {sim.paybackAnos ? `${sim.paybackAnos.toFixed(1)} anos` : "—"}
                </p>
                <p className="text-xs text-paper/40">Retorno do investimento</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
