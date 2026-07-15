import Link from "next/link";
import { empresaConfig } from "@/lib/empresa-config";

export function Header() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="font-display text-lg font-semibold text-paper">
        {empresaConfig.nome}
      </Link>
      <Link
        href="/simulador"
        className="rounded-full border border-duskline px-5 py-2 text-sm text-paper/80 transition hover:border-sun hover:text-sun"
      >
        Simular agora
      </Link>
    </header>
  );
}
