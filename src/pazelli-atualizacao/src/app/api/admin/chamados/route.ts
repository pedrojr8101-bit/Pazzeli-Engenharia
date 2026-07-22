import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const chamados = await prisma.chamado.findMany({
    orderBy: { createdAt: "desc" },
    include: { lead: { select: { id: true, nome: true, email: true, telefone: true } } },
  });
  return NextResponse.json({ chamados });
}
