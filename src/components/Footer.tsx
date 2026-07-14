export function Footer() {
  const nomeEmpresa = process.env.NEXT_PUBLIC_EMPRESA_NOME || "Sua Empresa Solar";
  const telefone = process.env.NEXT_PUBLIC_EMPRESA_TELEFONE;
  const email = process.env.NEXT_PUBLIC_EMPRESA_EMAIL;

  return (
    <footer className="mx-auto max-w-6xl px-6 py-12 text-sm text-paper/40">
      <div className="flex flex-col gap-2 border-t border-duskline pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {nomeEmpresa}. Todos os direitos reservados.</p>
        <div className="flex gap-4">
          {telefone && <span>{telefone}</span>}
          {email && <span>{email}</span>}
        </div>
      </div>
    </footer>
  );
}
