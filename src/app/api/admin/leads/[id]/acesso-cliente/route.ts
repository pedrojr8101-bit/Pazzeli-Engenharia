import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

// POST — define (ou reseta) a senha que o cliente usa para logar em /cliente/login,
// sem depender de nenhuma integração externa (SolarZ ou outra).
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { erro: parsed.error.errors[0]?.message ?? "Senha inválida." },
      { status: 400 }
    );
  }

  const senhaHash = await bcrypt.hash(parsed.data.senha, 12);

  try {
    await prisma.lead.update({ where: { id: params.id }, data: { senhaHash } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ erro: "Lead não encontrado." }, { status: 404 });
  }
}
