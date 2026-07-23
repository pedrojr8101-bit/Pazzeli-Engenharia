import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { COOKIE_SESSAO_CLIENTE, criarTokenSessaoCliente } from "@/lib/auth-cliente";

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

  const lead = await prisma.lead.findFirst({ where: { email } });
  const senhaValida = lead?.senhaHash ? await bcrypt.compare(senha, lead.senhaHash) : false;

  if (!lead || !senhaValida) {
    return NextResponse.json({ erro: "E-mail ou senha incorretos." }, { status: 401 });
  }

  const token = await criarTokenSessaoCliente({ leadId: lead.id, nome: lead.nome, email: lead.email });

  const resposta = NextResponse.json({
    ok: true,
    // Devolvido também no corpo (além do cookie) pensando num futuro app —
    // apps nativos guardam esse token e mandam via header
    // "Authorization: Bearer <token>" em vez de depender de cookie.
    token,
    cliente: { nome: lead.nome, email: lead.email },
  });
  resposta.cookies.set(COOKIE_SESSAO_CLIENTE.nome, token, {
    httpOnly: COOKIE_SESSAO_CLIENTE.httpOnly,
    sameSite: COOKIE_SESSAO_CLIENTE.sameSite,
    secure: COOKIE_SESSAO_CLIENTE.secure,
    path: COOKIE_SESSAO_CLIENTE.path,
    maxAge: COOKIE_SESSAO_CLIENTE.maxAge,
  });
  return resposta;
}
