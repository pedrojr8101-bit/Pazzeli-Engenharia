import { SignJWT, jwtVerify } from "jose";

const NOME_COOKIE = "cliente_session";
const DURACAO_SESSAO_SEGUNDOS = 60 * 60 * 24 * 30; // 30 dias — sessão de cliente pode durar mais

function segredo() {
  const valor = process.env.CLIENTE_JWT_SECRET;
  if (!valor || valor.length < 16) {
    throw new Error(
      "CLIENTE_JWT_SECRET não configurado (ou muito curto) — defina uma string aleatória longa nas variáveis de ambiente."
    );
  }
  return new TextEncoder().encode(valor);
}

export interface SessaoCliente {
  leadId: string;
  nome: string;
  email: string;
}

export async function criarTokenSessaoCliente(sessao: SessaoCliente): Promise<string> {
  return new SignJWT({ ...sessao })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SESSAO_SEGUNDOS}s`)
    .sign(segredo());
}

export async function verificarTokenSessaoCliente(token: string): Promise<SessaoCliente | null> {
  try {
    const { payload } = await jwtVerify(token, segredo());
    if (
      typeof payload.leadId === "string" &&
      typeof payload.nome === "string" &&
      typeof payload.email === "string"
    ) {
      return { leadId: payload.leadId, nome: payload.nome, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}

export const COOKIE_SESSAO_CLIENTE = {
  nome: NOME_COOKIE,
  maxAge: DURACAO_SESSAO_SEGUNDOS,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
