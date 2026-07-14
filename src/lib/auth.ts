import { SignJWT, jwtVerify } from "jose";

const NOME_COOKIE = "admin_session";
const DURACAO_SESSAO_SEGUNDOS = 60 * 60 * 24 * 7; // 7 dias

function segredo() {
  const valor = process.env.ADMIN_JWT_SECRET;
  if (!valor || valor.length < 16) {
    throw new Error(
      "ADMIN_JWT_SECRET não configurado (ou muito curto) — defina uma string aleatória longa nas variáveis de ambiente."
    );
  }
  return new TextEncoder().encode(valor);
}

export interface SessaoAdmin {
  adminId: string;
  email: string;
  nome: string;
}

export async function criarTokenSessao(sessao: SessaoAdmin): Promise<string> {
  return new SignJWT({ ...sessao })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SESSAO_SEGUNDOS}s`)
    .sign(segredo());
}

export async function verificarTokenSessao(token: string): Promise<SessaoAdmin | null> {
  try {
    const { payload } = await jwtVerify(token, segredo());
    if (
      typeof payload.adminId === "string" &&
      typeof payload.email === "string" &&
      typeof payload.nome === "string"
    ) {
      return { adminId: payload.adminId, email: payload.email, nome: payload.nome };
    }
    return null;
  } catch {
    return null;
  }
}

export const COOKIE_SESSAO = {
  nome: NOME_COOKIE,
  maxAge: DURACAO_SESSAO_SEGUNDOS,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
