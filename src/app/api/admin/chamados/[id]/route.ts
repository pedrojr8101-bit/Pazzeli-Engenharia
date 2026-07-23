import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["ABERTO", "EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"]).optional(),
  valorCobrado: z.coerce.number().nonnegative().nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  try {
    const chamado = await prisma.chamado.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json({ chamado });
  } catch {
    return NextResponse.json({ erro: "Chamado não encontrado." }, { status: 404 });
  }
}
