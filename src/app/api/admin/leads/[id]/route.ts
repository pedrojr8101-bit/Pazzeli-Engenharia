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
  status: z.enum(["NOVO", "CONTATADO", "PROPOSTA_ENVIADA", "CONVERTIDO", "PERDIDO"]),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const parsed = schemaAtualizacao.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ erro: "Status inválido." }, { status: 400 });
  }

  try {
    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json({ lead });
  } catch {
    return NextResponse.json({ erro: "Lead não encontrado." }, { status: 404 });
  }
}
