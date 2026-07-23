// Depoimentos de exemplo — troque pelos depoimentos reais de clientes da
// empresa assim que estiverem disponíveis.
const DEPOIMENTOS = [
  {
    nome: "Cliente residencial",
    papel: "Residencial",
    texto:
      "A simulação já mostrou o tamanho certo do sistema antes de qualquer visita — deu segurança pra fechar.",
  },
  {
    nome: "Cliente comercial",
    papel: "Comercial",
    texto:
      "Todo o processo de homologação foi acompanhado de perto, sem eu precisar correr atrás de nada.",
  },
  {
    nome: "Cliente residencial",
    papel: "Residencial",
    texto: "A conta de luz caiu bem mais do que eu esperava já no primeiro mês de sistema ligado.",
  },
];

function Iniciais(nome: string) {
  return nome
    .split(" ")
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Depoimentos() {
  return (
    <section id="depoimentos" className="border-y border-borderlight bg-cloud">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-sun">Depoimentos</p>
        <h2 className="font-display text-2xl font-semibold text-graphite sm:text-3xl">
          Clientes reais economizando na conta de luz
        </h2>
        <p className="mt-2 text-xs text-graphite/40">
          (depoimentos de exemplo — serão substituídos por depoimentos reais)
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {DEPOIMENTOS.map((depoimento, i) => (
            <div key={i} className="rounded-xl border border-borderlight bg-ivory p-6">
              <div className="mb-4 flex gap-0.5 text-sun" aria-label="5 de 5 estrelas">
                {Array.from({ length: 5 }).map((_, estrela) => (
                  <svg
                    key={estrela}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              <p className="text-sm leading-relaxed text-graphite">"{depoimento.texto}"</p>

              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sun/15 text-xs font-semibold text-sun">
                  {Iniciais(depoimento.nome)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-graphite">{depoimento.nome}</p>
                  <p className="text-xs text-graphitesoft">{depoimento.papel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}