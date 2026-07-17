import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_SESSAO_CLIENTE, verificarTokenSessaoCliente } from "@/lib/auth-cliente";
import { prisma } from "@/lib/prisma";
import {
  obterPerformanceUsina,
  obterPotenciaUsina,
  obterProducaoUltimosDias,
} from "@/lib/solarz";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = cookies().get(COOKIE_SESSAO_CLIENTE.nome)?.value;
  const sessao = token ? await verificarTokenSessaoCliente(token) : null;

  if (!sessao) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const lead = await prisma.lead.findUnique({ where: { id: sessao.leadId } });

  if (!lead?.solarzPlantId) {
    return NextResponse.json(
      { erro: "Sua usina ainda não foi vinculada ao monitoramento. Fale com a nossa equipe." },
      { status: 404 }
    );
  }

  try {
    const [potencia, performance, ultimosDias] = await Promise.all([
      obterPotenciaUsina(lead.solarzPlantId),
      obterPerformanceUsina(lead.solarzPlantId),
      obterProducaoUltimosDias(lead.solarzPlantId, 30),
    ]);

    return NextResponse.json({ potencia, performance, ultimosDias });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro ao consultar o monitoramento.";
    return NextResponse.json({ erro: mensagem }, { status: 502 });
  }
}
