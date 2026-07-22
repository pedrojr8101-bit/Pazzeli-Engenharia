import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { COOKIE_SESSAO_CLIENTE, verificarTokenSessaoCliente } from "@/lib/auth-cliente";

export const dynamic = "force-dynamic";

async function sessaoAtual() {
  const token = cookies().get(COOKIE_SESSAO_CLIENTE.nome)?.value;
  return token ? verificarTokenSessaoCliente(token) : null;
}

export async function GET() {
  const sessao = await sessaoAtual();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const chamados = await prisma.chamado.findMany({
    where: { leadId: sessao.leadId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ chamados });
}

const schema = z.object({
  tipo: z.enum(["LIMPEZA", "MANUTENCAO", "REVISAO_TECNICA", "OUTRO"]),
  descricao: z.string().trim().min(5, "Descreva com um pouco mais de detalhe.").max(1000),
});

export async function POST(request: Request) {
  const sessao = await sessaoAtual();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { erro: parsed.error.errors[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const chamado = await prisma.chamado.create({
    data: { leadId: sessao.leadId, tipo: parsed.data.tipo, descricao: parsed.data.descricao },
  });

  return NextResponse.json({ chamado });
}
