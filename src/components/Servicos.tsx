const SERVICOS = [
  { titulo: "Energia solar residencial", texto: "Sistemas dimensionados para o consumo real da sua casa." },
  { titulo: "Energia solar comercial", texto: "Redução de custo operacional para empresas de todo porte." },
  { titulo: "Energia solar rural", texto: "Soluções para produtores rurais e propriedades fora da rede." },
  { titulo: "Usinas e geração compartilhada", texto: "Projetos de maior escala, com engenharia dedicada." },
  { titulo: "Manutenção e monitoramento", texto: "Acompanhamento contínuo da performance do seu sistema." },
  { titulo: "Homologação junto à concessionária", texto: "Cuidamos de toda a burocracia até o sistema entrar em operação." },
];

export function Servicos() {
  return (
    <section className="border-y border-borderlight bg-cloud">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-2xl font-semibold text-graphite sm:text-3xl">
          Soluções para diferentes necessidades
        </h2>
        <p className="mt-3 max-w-xl text-graphitesoft">
          Atendemos projetos com análise técnica individual, sempre respeitando o perfil do
          cliente e do imóvel.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICOS.map((servico) => (
            <div key={servico.titulo} className="rounded-xl border border-borderlight bg-ivory p-6">
              <h3 className="font-display text-base font-semibold text-graphite">{servico.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-graphitesoft">{servico.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
