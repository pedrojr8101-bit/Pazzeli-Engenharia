import { Suspense } from "react";
import { LoginClienteForm } from "@/components/cliente/LoginClienteForm";
import { empresaConfig } from "@/lib/empresa-config";

export default function LoginClientePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-sm space-y-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-sun">
            {empresaConfig.nome}
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-graphite">
            Acompanhe sua usina
          </h1>
          <p className="mt-1 text-sm text-graphitesoft">
            Acesse pra ver a produção de energia do seu sistema.
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-graphite/40">Carregando...</p>}>
          <LoginClienteForm />
        </Suspense>
      </div>
    </main>
  );
}
