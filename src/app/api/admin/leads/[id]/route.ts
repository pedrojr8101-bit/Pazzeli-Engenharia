import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: { simulacoes: { orderBy: { createdAt: "desc" } } },
  });

  if (!lead) {
    return NextResponse.json({ erro: "Lead não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ lead });
}

const schemaAtualizacao = z.object({
  status: z.enum(["NOVO", "CONTATADO", "PROPOSTA_ENVIADA", "CONVERTIDO", "PERDIDO"]).optional(),
  tipoImovel: z.enum(["RESIDENCIAL", "COMERCIAL"]).nullable().optional(),
  contratoUrl: z.string().url().max(500).nullable().optional(),
  monitoramentoLink: z.string().url().max(500).nullable().optional(),
  monitoramentoUsuario: z.string().max(200).nullable().optional(),
  monitoramentoSenha: z.string().max(200).nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const parsed = schemaAtualizacao.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { erro: "Dados inválidos.", detalhes: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ erro: "Nenhum dado para atualizar." }, { status: 400 });
  }

  try {
    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json({ lead });
  } catch {
    return NextResponse.json({ erro: "Lead não encontrado." }, { status: 404 });
  }
}
