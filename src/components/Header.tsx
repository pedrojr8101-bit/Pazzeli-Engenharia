import Link from "next/link";

export function Header() {
  const nomeEmpresa = process.env.NEXT_PUBLIC_EMPRESA_NOME || "Sua Empresa Solar";

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="font-display text-lg font-semibold text-paper">
        {nomeEmpresa}
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
