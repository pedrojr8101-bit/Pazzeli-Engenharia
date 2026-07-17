import Link from "next/link";
import { cookies } from "next/headers";
import { COOKIE_SESSAO, verificarTokenSessao } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(COOKIE_SESSAO.nome)?.value;
  const sessao = token ? await verificarTokenSessao(token) : null;

  return (
    <div className="min-h-screen bg-night">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <nav className="flex items-center gap-6">
          <Link href="/admin" className="font-display text-lg font-semibold text-paper">
            Dashboard
          </Link>
          <Link href="/admin/clientes" className="text-sm text-paper/60 hover:text-paper">
            Clientes fechados
          </Link>
        </nav>
        <div className="flex items-center gap-4 text-sm text-paper/60">
          {sessao && <span>{sessao.nome}</span>}
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 pb-20">{children}</main>
    </div>
  );
}
