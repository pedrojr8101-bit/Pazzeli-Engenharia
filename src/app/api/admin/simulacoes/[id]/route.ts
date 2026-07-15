import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const itemSchema = z.object({
  descricao: z.string().min(1),
  unidade: z.string().min(1),
  quantidade: z.coerce.number().positive(),
  valorUnitario: z.coerce.number().nonnegative(),
});

const schema = z.object({
  investimentoFinal: z.coerce.number().positive().nullable().optional(),
  observacoesProposta: z.string().max(2000).nullable().optional(),
  itensProposta: z.array(itemSchema).nullable().optional(),
  tipoEstrutura: z.string().max(60).nullable().optional(),
  clienteCpf: z.string().max(20).nullable().optional(),
  clienteEnderecoCompleto: z.string().max(300).nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { erro: "Dados inválidos.", detalhes: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Campos Json? do Prisma não aceitam `null` puro para limpar o valor —
  // é preciso usar o marcador Prisma.JsonNull. Tratamos isso à parte.
  const { itensProposta, ...resto } = parsed.data;

  try {
    const simulacao = await prisma.simulacao.update({
      where: { id: params.id },
      data: {
        ...resto,
        ...(itensProposta !== undefined
          ? { itensProposta: itensProposta === null ? Prisma.JsonNull : itensProposta }
          : {}),
      },
    });
    return NextResponse.json({ simulacao });
  } catch {
    return NextResponse.json({ erro: "Simulação não encontrada." }, { status: 404 });
  }
}
