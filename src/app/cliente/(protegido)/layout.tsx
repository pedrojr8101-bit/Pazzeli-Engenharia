import { cookies } from "next/headers";
import { COOKIE_SESSAO_CLIENTE, verificarTokenSessaoCliente } from "@/lib/auth-cliente";
import { LogoutClienteButton } from "@/components/cliente/LogoutClienteButton";
import { empresaConfig } from "@/lib/empresa-config";

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(COOKIE_SESSAO_CLIENTE.nome)?.value;
  const sessao = token ? await verificarTokenSessaoCliente(token) : null;

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-borderlight bg-ivory">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <div>
            <p className="font-display text-base font-semibold text-graphite">
              {empresaConfig.nome}
            </p>
            {sessao && <p className="text-xs text-graphitesoft">Olá, {sessao.nome.split(" ")[0]}</p>}
          </div>
          <LogoutClienteButton />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
