import { NextResponse } from "next/server";
import { COOKIE_SESSAO_CLIENTE } from "@/lib/auth-cliente";

export async function POST() {
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(COOKIE_SESSAO_CLIENTE.nome, "", { path: "/", maxAge: 0 });
  return resposta;
}
