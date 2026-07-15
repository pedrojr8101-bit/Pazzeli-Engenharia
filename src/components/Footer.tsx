import { empresaConfig } from "@/lib/empresa-config";

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 py-12 text-sm text-paper/40">
      <div className="flex flex-col gap-2 border-t border-duskline pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {empresaConfig.nome}. Todos os direitos reservados.</p>
        <div className="flex gap-4">
          {empresaConfig.telefone && <span>{empresaConfig.telefone}</span>}
          {empresaConfig.email && <span>{empresaConfig.email}</span>}
        </div>
      </div>
    </footer>
  );
}
