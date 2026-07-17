import { DashboardProducaoDemo } from "@/components/cliente/DashboardProducaoDemo";
import { empresaConfig } from "@/lib/empresa-config";

export default function DemoMonitoramentoPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-borderlight bg-ivory">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <p className="font-display text-base font-semibold text-graphite">
            {empresaConfig.nome}
          </p>
          <p className="text-xs text-graphitesoft">Área do cliente — demonstração</p>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-6 font-display text-2xl font-semibold text-graphite">
          Sua produção de energia
        </h1>
        <DashboardProducaoDemo />
      </main>
    </div>
  );
}
