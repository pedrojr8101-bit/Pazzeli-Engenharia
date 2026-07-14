import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PropostaPDF } from "@/lib/pdf/proposta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const simulacao = await prisma.simulacao.findUnique({
    where: { id: params.id },
    include: { lead: true },
  });

  if (!simulacao || !simulacao.lead) {
    return NextResponse.json({ erro: "Simulação não encontrada." }, { status: 404 });
  }

  const lead = simulacao.lead;

  const empresa = {
    nome: process.env.NEXT_PUBLIC_EMPRESA_NOME || "Sua Empresa Solar",
    telefone: process.env.NEXT_PUBLIC_EMPRESA_TELEFONE,
    email: process.env.NEXT_PUBLIC_EMPRESA_EMAIL,
  };

  const buffer = await renderToBuffer(PropostaPDF({ simulacao, lead, empresa }));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="proposta-${lead.nome.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
    },
  });
}
