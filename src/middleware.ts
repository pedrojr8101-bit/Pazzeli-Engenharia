import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, verificarTokenSessao } from "@/lib/auth";
import { COOKIE_SESSAO_CLIENTE, verificarTokenSessaoCliente } from "@/lib/auth-cliente";

const ROTAS_PUBLICAS_ADMIN = ["/admin/login", "/api/admin/login", "/api/admin/setup"];
const ROTAS_PUBLICAS_CLIENTE = ["/cliente/login", "/api/cliente/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Área admin
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (ROTAS_PUBLICAS_ADMIN.some((rota) => pathname.startsWith(rota))) {
      return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE_SESSAO.nome)?.value;
    const sessao = token ? await verificarTokenSessao(token) : null;

    if (!sessao) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Área do cliente
  if (pathname.startsWith("/cliente") || pathname.startsWith("/api/cliente")) {
    if (ROTAS_PUBLICAS_CLIENTE.some((rota) => pathname.startsWith(rota))) {
      return NextResponse.next();
    }

    const tokenCookie = request.cookies.get(COOKIE_SESSAO_CLIENTE.nome)?.value;
    const tokenHeader = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const token = tokenCookie ?? tokenHeader;
    const sessao = token ? await verificarTokenSessaoCliente(token) : null;

    if (!sessao) {
      if (pathname.startsWith("/api/cliente")) {
        return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
      }
      const loginUrl = new URL("/cliente/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/cliente/:path*", "/api/cliente/:path*"],
};
