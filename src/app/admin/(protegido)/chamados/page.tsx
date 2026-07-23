import { prisma } from "@/lib/prisma";
import { GerenciarChamados } from "@/components/admin/GerenciarChamados";

export const dynamic = "force-dynamic";

export default async function ChamadosPage() {
  const chamados = await prisma.chamado.findMany({
    orderBy: { createdAt: "desc" },
    include: { lead: { select: { id: true, nome: true, email: true, telefone: true } } },
  });

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-semibold text-paper">
        Chamados de pós-venda
      </h1>
      <p className="mb-8 text-sm text-paper/50">
        Limpeza, manutenção e revisões abertas pelos clientes na área deles. Preencha o valor
        cobrado ao concluir — isso alimenta o faturamento de pós-venda no dashboard.
      </p>

      <GerenciarChamados
        chamados={chamados.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))}
      />
    </div>
  );
}
