// Depoimentos de exemplo — troque pelos depoimentos reais de clientes da
// empresa assim que estiverem disponíveis.
const DEPOIMENTOS = [
  {
    nome: "Cliente residencial",
    texto:
      "A simulação já mostrou o tamanho certo do sistema antes de qualquer visita — deu segurança pra fechar.",
  },
  {
    nome: "Cliente comercial",
    texto:
      "Todo o processo de homologação foi acompanhado de perto, sem eu precisar correr atrás de nada.",
  },
  {
    nome: "Cliente residencial",
    texto: "A conta de luz caiu bem mais do que eu esperava já no primeiro mês de sistema ligado.",
  },
];

export function Depoimentos() {
  return (
    <section className="border-y border-borderlight bg-cloud">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-2xl font-semibold text-graphite sm:text-3xl">
          O que dizem nossos clientes
        </h2>
        <p className="mt-2 text-xs text-graphite/40">
          (depoimentos de exemplo — serão substituídos por depoimentos reais)
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {DEPOIMENTOS.map((depoimento, i) => (
            <div key={i} className="rounded-xl border border-borderlight bg-ivory p-6">
              <p className="text-sm leading-relaxed text-graphite">"{depoimento.texto}"</p>
              <p className="mt-4 text-xs text-graphitesoft">{depoimento.nome}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
