import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";
import { ClientesGrid } from "@/components/admin/ClientesGrid";

export const dynamic = "force-dynamic";

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ClientesPage() {
  const leads = await prisma.lead.findMany({
    where: { status: "CONVERTIDO" },
    orderBy: { updatedAt: "desc" },
    include: { simulacoes: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  const clientes = leads.map((lead) => ({
    leadId: lead.id,
    nome: lead.nome,
    email: lead.email,
    telefone: lead.telefone,
    cidade: lead.cidade,
    uf: lead.uf,
    fechadoEm: lead.updatedAt,
    simulacao: lead.simulacoes[0]
      ? {
          id: lead.simulacoes[0].id,
          potenciaInstaladaKwp: lead.simulacoes[0].potenciaInstaladaKwp,
          numeroPaineis: lead.simulacoes[0].numeroPaineis,
          economiaMensalEstimada: lead.simulacoes[0].economiaMensalEstimada,
          investimentoEstimado: lead.simulacoes[0].investimentoEstimado,
          investimentoFinal: lead.simulacoes[0].investimentoFinal,
        }
      : null,
  }));

  const faturamentoTotal = clientes.reduce(
    (soma, c) => soma + (c.simulacao ? c.simulacao.investimentoFinal ?? c.simulacao.investimentoEstimado : 0),
    0
  );
  const economiaTotalGerada = clientes.reduce(
    (soma, c) => soma + (c.simulacao?.economiaMensalEstimada ?? 0),
    0
  );

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-semibold text-paper">Clientes fechados</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard valor={String(clientes.length)} rotulo="Clientes fechados" />
        <StatCard valor={moeda(faturamentoTotal)} rotulo="Faturamento fechado" cor="text-sun" />
        <StatCard
          valor={`${moeda(economiaTotalGerada)}/mês`}
          rotulo="Economia gerada aos clientes"
          cor="text-sky"
        />
      </div>

      <div className="mt-8">
        {clientes.length === 0 ? (
          <p className="text-paper/50">
            Nenhum cliente fechado ainda — quando um lead virar "Convertido" no dashboard, ele
            aparece aqui.
          </p>
        ) : (
          <ClientesGrid clientes={clientes} />
        )}
      </div>
    </div>
  );
}
