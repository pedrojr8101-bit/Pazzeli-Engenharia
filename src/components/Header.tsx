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
        <nav className="hidden items-center gap-6 text-sm font-medium text-graphitesoft lg:flex">
          <Link href="/#simulador" className="transition hover:text-graphite">Simulador</Link>
          <Link href="/#como-funciona" className="transition hover:text-graphite">Processo</Link>
          <Link href="/#projetos" className="transition hover:text-graphite">Projetos</Link>
          <Link href="/#servicos" className="transition hover:text-graphite">Serviços</Link>
          <Link href="/#depoimentos" className="transition hover:text-graphite">Depoimentos</Link>
          <Link href="/#faq" className="transition hover:text-graphite">FAQ</Link>
        </nav>
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
