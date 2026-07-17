import { DashboardProducao } from "@/components/cliente/DashboardProducao";

export const dynamic = "force-dynamic";

export default function ClienteDashboardPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-graphite">
        Sua produção de energia
      </h1>
      <DashboardProducao />
    </div>
  );
}
