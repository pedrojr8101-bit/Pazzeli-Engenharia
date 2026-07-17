import Link from "next/link";
import { empresaConfig } from "@/lib/empresa-config";

export function Footer() {
  const nomeEmpresa = empresaConfig.nome;
  const telefone = empresaConfig.telefone;
  const email = empresaConfig.email;
  const instagram = process.env.NEXT_PUBLIC_EMPRESA_INSTAGRAM;

  return (
    <footer className="border-t border-borderlight bg-cloud">
      <div className="mx-auto max-w-6xl px-6 py-12 text-sm text-graphitesoft">
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div>
            <p className="font-display text-base font-semibold text-graphite">{nomeEmpresa}</p>
            <div className="mt-3 space-y-1">
              {telefone && <p>{telefone}</p>}
              {email && <p>{email}</p>}
              {instagram && <p>@{instagram}</p>}
            </div>
          </div>
          <div>
            <Link href="/cliente/login" className="text-sm text-graphitesoft hover:text-sun">
              Já é cliente? Acompanhe sua usina →
            </Link>
          </div>
        </div>
        <p className="mt-10 border-t border-borderlight pt-6 text-xs text-graphite/40">
          © {new Date().getFullYear()} {nomeEmpresa}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
