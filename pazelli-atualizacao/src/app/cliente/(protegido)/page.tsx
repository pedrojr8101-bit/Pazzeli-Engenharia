import { cookies } from "next/headers";
import { DashboardProducao } from "@/components/cliente/DashboardProducao";
import { InfoEmpresaCard } from "@/components/cliente/InfoEmpresaCard";
import { ContratoCard } from "@/components/cliente/ContratoCard";
import { PainelPosVenda } from "@/components/cliente/PainelPosVenda";
import { COOKIE_SESSAO_CLIENTE, verificarTokenSessaoCliente } from "@/lib/auth-cliente";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClienteDashboardPage() {
  const token = cookies().get(COOKIE_SESSAO_CLIENTE.nome)?.value;
  const sessao = token ? await verificarTokenSessaoCliente(token) : null;

  const lead = sessao
    ? await prisma.lead.findUnique({
        where: { id: sessao.leadId },
        select: { contratoUrl: true },
      })
    : null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-6 font-display text-2xl font-semibold text-graphite">
          Sua produção de energia
        </h1>
        <DashboardProducao />
      </div>

      <div>
        <h2 className="mb-4 font-display text-xl font-semibold text-graphite">
          Sua conta com a gente
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoEmpresaCard />
          <ContratoCard contratoUrl={lead?.contratoUrl ?? null} />
        </div>
      </div>

      <PainelPosVenda />
    </div>
  );
}
