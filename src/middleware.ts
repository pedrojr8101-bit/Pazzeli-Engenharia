import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, verificarTokenSessao } from "@/lib/auth";

const ROTAS_PUBLICAS_ADMIN = ["/admin/login", "/api/admin/login", "/api/admin/setup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
