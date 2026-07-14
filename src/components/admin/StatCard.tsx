export function StatCard({
  valor,
  rotulo,
  cor = "text-paper",
}: {
  valor: string;
  rotulo: string;
  cor?: string;
}) {
  return (
    <div className="rounded-2xl border border-duskline p-5">
      <p className={`font-mono text-2xl ${cor}`}>{valor}</p>
      <p className="mt-1 text-xs text-paper/50">{rotulo}</p>
    </div>
  );
}
