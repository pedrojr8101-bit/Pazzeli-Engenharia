const SERVICOS = [
  {
    titulo: "Energia solar residencial",
    texto: "Sistemas dimensionados para o consumo real da sua casa.",
    icone: <path d="M3 11.5 12 4l9 7.5M5 10v10h14V10M9 20v-6h6v6" />,
  },
  {
    titulo: "Energia solar comercial",
    texto: "Redução de custo operacional para empresas de todo porte.",
    icone: <path d="M4 21V7l8-4 8 4v14M9 21v-6h6v6M9 11h.01M15 11h.01M9 7h.01M15 7h.01" />,
  },
  {
    titulo: "Energia solar rural",
    texto: "Soluções para produtores rurais e propriedades fora da rede.",
    icone: <path d="M3 20h18M5 20V10l7-5 7 5v10M9 20v-5h6v5" />,
  },
  {
    titulo: "Usinas e geração compartilhada",
    texto: "Projetos de maior escala, com engenharia dedicada.",
    icone: <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />,
  },
  {
    titulo: "Manutenção e monitoramento",
    texto: "Acompanhamento contínuo da performance do seu sistema.",
    icone: <path d="M3 12h4l2-7 4 14 2-7h6" />,
  },
  {
    titulo: "Homologação junto à concessionária",
    texto: "Cuidamos de toda a burocracia até o sistema entrar em operação.",
    icone: <path d="M9 12l2 2 4-4M5 5h14v14H5z" />,
  },
];

export function Servicos() {
  return (
    <section id="servicos" className="border-y border-borderlight bg-cloud">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-sun">
          O que oferecemos
        </p>
        <h2 className="font-display text-2xl font-semibold text-graphite sm:text-3xl">
          Nossos serviços
        </h2>
        <p className="mt-3 max-w-xl text-graphitesoft">
          Atendemos projetos com análise técnica individual, sempre respeitando o perfil do
          cliente e do imóvel.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICOS.map((servico) => (
            <div
              key={servico.titulo}
              className="rounded-xl border border-borderlight bg-ivory p-6 transition hover:border-sun"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-sun/10">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-sun"
                  aria-hidden
                >
                  {servico.icone}
                </svg>
              </div>
              <h3 className="font-display text-base font-semibold text-graphite">
                {servico.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-graphitesoft">{servico.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}