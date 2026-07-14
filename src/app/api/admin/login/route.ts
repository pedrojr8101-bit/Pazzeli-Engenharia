import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { COOKIE_SESSAO, criarTokenSessao } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().email(),
  senha: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ erro: "Informe e-mail e senha." }, { status: 400 });
  }

  const { email, senha } = parsed.data;

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  const senhaValida = admin ? await bcrypt.compare(senha, admin.senhaHash) : false;

  // Mensagem genérica de propósito — não revela se o e-mail existe ou não.
  if (!admin || !senhaValida) {
    return NextResponse.json({ erro: "E-mail ou senha incorretos." }, { status: 401 });
  }

  const token = await criarTokenSessao({ adminId: admin.id, email: admin.email, nome: admin.nome });

  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(COOKIE_SESSAO.nome, token, {
    httpOnly: COOKIE_SESSAO.httpOnly,
    sameSite: COOKIE_SESSAO.sameSite,
    secure: COOKIE_SESSAO.secure,
    path: COOKIE_SESSAO.path,
    maxAge: COOKIE_SESSAO.maxAge,
  });
  return resposta;
}
