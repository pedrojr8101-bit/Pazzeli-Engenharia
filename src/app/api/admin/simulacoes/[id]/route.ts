import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  investimentoFinal: z.coerce.number().positive().nullable().optional(),
  observacoesProposta: z.string().max(2000).nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { erro: "Dados inválidos.", detalhes: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const simulacao = await prisma.simulacao.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json({ simulacao });
  } catch {
    return NextResponse.json({ erro: "Simulação não encontrada." }, { status: 404 });
  }
}
