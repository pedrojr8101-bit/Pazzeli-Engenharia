import Link from "next/link";
import { empresaConfig } from "@/lib/empresa-config";

export function Header() {
  const nomeEmpresa = empresaConfig.nome;

  return (
    <header className="sticky top-0 z-40 border-b border-borderlight bg-ivory/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-lg font-semibold text-graphite">
          {nomeEmpresa}
        </Link>
        <Link
          href="/simulador"
          className="rounded-full bg-sun px-5 py-2.5 text-sm font-semibold text-graphite transition hover:bg-sunlight"
        >
          Simular agora
        </Link>
      </div>
    </header>
  );
}
