import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buscarUsinas } from "@/lib/solarz";

export const dynamic = "force-dynamic";

// GET ?documento=CPF ou ?email=... — busca usinas na SolarZ pra vincular ao lead
export async function GET(request: Request) {
  const url = new URL(request.url);
  const documento = url.searchParams.get("documento") ?? undefined;
  const email = url.searchParams.get("email") ?? undefined;

  if (!documento && !email) {
    return NextResponse.json({ erro: "Informe um CPF ou e-mail para buscar." }, { status: 400 });
  }

  try {
    const resultado = await buscarUsinas({ ownerDocument: documento, ownerEmail: email });
    return NextResponse.json(resultado);
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro ao buscar na SolarZ.";
    return NextResponse.json({ erro: mensagem }, { status: 502 });
  }
}

const schemaVinculo = z.object({
  solarzPlantId: z.coerce.number().int().positive(),
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres.").optional(),
});

// POST — vincula o plantId ao lead e, se enviada, define a senha de acesso do cliente
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const parsed = schemaVinculo.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { erro: "Dados inválidos.", detalhes: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const dados: { solarzPlantId: number; senhaHash?: string } = {
    solarzPlantId: parsed.data.solarzPlantId,
  };

  if (parsed.data.senha) {
    dados.senhaHash = await bcrypt.hash(parsed.data.senha, 12);
  }

  try {
    const lead = await prisma.lead.update({ where: { id: params.id }, data: dados });
    return NextResponse.json({ lead: { id: lead.id, solarzPlantId: lead.solarzPlantId } });
  } catch {
    return NextResponse.json({ erro: "Lead não encontrado." }, { status: 404 });
  }
}
