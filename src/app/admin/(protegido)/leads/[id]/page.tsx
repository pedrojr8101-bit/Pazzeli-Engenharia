import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { EditarProposta } from "@/components/admin/EditarProposta";
import { VincularSolarZ } from "@/components/admin/VincularSolarZ";

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

      <div className="mt-6">
        <VincularSolarZ leadId={lead.id} emailLead={lead.email} plantIdAtual={lead.solarzPlantId} />
      </div>

      <h2 className="mb-4 mt-10 font-display text-lg font-semibold text-paper">
        Simulações ({lead.simulacoes.length})
      </h2>

      <div className="space-y-4">
        {lead.simulacoes.map((sim) => {
          const precoFinal = sim.investimentoFinal ?? sim.investimentoEstimado;
          const negociado = sim.investimentoFinal !== null;

          return (
            <div key={sim.id} className="rounded-2xl border border-duskline p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xl text-paper">
                    {sim.potenciaInstaladaKwp.toFixed(2)} kWp
                  </p>
                  <p className="text-xs text-paper/40">
                    {sim.numeroPaineis} painéis · {sim.classificacaoGD} ·{" "}
                    {new Date(sim.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <a
                  href={`/api/admin/simulacoes/${sim.id}/proposta`}
                  className="rounded-full bg-sun px-4 py-2 text-xs font-semibold text-night transition hover:bg-sunlight"
                >
                  Baixar proposta em PDF
                </a>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
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
                <div>
                  <p className={negociado ? "text-sun" : "text-paper"}>
                    {moeda(precoFinal)}
                    {negociado && <span className="ml-1 text-xs text-paper/40">(negociado)</span>}
                  </p>
                  <p className="text-xs text-paper/40">
                    {negociado ? "Preço final" : "Investimento estimado"}
                  </p>
                </div>
              </div>

              {sim.observacoesProposta && (
                <p className="mt-4 rounded-lg bg-night/60 p-3 text-sm text-paper/60">
                  {sim.observacoesProposta}
                </p>
              )}

              <div className="mt-4">
                <EditarProposta
                  simulacaoId={sim.id}
                  investimentoEstimado={sim.investimentoEstimado}
                  investimentoFinalAtual={sim.investimentoFinal}
                  observacoesAtuais={sim.observacoesProposta}
                  itensAtuais={
                    (sim.itensProposta as unknown as {
                      descricao: string;
                      unidade: string;
                      quantidade: number;
                      valorUnitario: number;
                    }[] | null) ?? null
                  }
                  tipoEstruturaAtual={sim.tipoEstrutura}
                  clienteCpfAtual={sim.clienteCpf}
                  clienteEnderecoAtual={sim.clienteEnderecoCompleto}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
