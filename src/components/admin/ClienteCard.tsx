import Link from "next/link";

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface ClienteCardProps {
  leadId: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string | null;
  uf: string | null;
  fechadoEm: Date;
  simulacao: {
    id: string;
    potenciaInstaladaKwp: number;
    numeroPaineis: number;
    economiaMensalEstimada: number;
    investimentoEstimado: number;
    investimentoFinal: number | null;
  } | null;
}

export function ClienteCard({
  leadId,
  nome,
  email,
  telefone,
  cidade,
  uf,
  fechadoEm,
  simulacao,
}: ClienteCardProps) {
  const preco = simulacao ? simulacao.investimentoFinal ?? simulacao.investimentoEstimado : null;

  return (
    <div className="rounded-2xl border border-duskline p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/admin/leads/${leadId}`} className="font-display text-lg font-semibold text-paper hover:text-sun">
            {nome}
          </Link>
          <p className="text-xs text-paper/40">
            {email} · {telefone}
          </p>
          <p className="text-xs text-paper/40">{cidade ? `${cidade}/${uf}` : "—"}</p>
        </div>
        <span className="rounded-full bg-sun/10 px-3 py-1 text-xs text-sun">
          Fechado em {fechadoEm.toLocaleDateString("pt-BR")}
        </span>
      </div>

      {simulacao ? (
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-duskline pt-4 text-sm">
          <div>
            <p className="font-mono text-paper">{simulacao.potenciaInstaladaKwp.toFixed(2)} kWp</p>
            <p className="text-xs text-paper/40">{simulacao.numeroPaineis} painéis</p>
          </div>
          <div>
            <p className="font-mono text-sky">{moeda(simulacao.economiaMensalEstimada)}</p>
            <p className="text-xs text-paper/40">economia/mês</p>
          </div>
          <div>
            <p className="font-mono text-sun">{preco !== null ? moeda(preco) : "—"}</p>
            <p className="text-xs text-paper/40">valor fechado</p>
          </div>
        </div>
      ) : (
        <p className="mt-4 border-t border-duskline pt-4 text-sm text-paper/40">
          Sem simulação registrada.
        </p>
      )}

      {simulacao && (
        <a
          href={`/api/admin/simulacoes/${simulacao.id}/proposta`}
          className="mt-4 inline-block text-xs text-paper/50 hover:text-sun"
        >
          Baixar proposta em PDF →
        </a>
      )}
    </div>
  );
}
