const PASSOS = [
  { numero: "01", titulo: "Você informa o consumo", texto: "CEP, grupo tarifário e o consumo médio da sua conta de luz — leva menos de dois minutos." },
  { numero: "02", titulo: "Calculamos o sistema ideal", texto: "Cruzamos a irradiação solar real do seu endereço com as regras da Lei 14.300." },
  { numero: "03", titulo: "Avaliação técnica do local", texto: "Análise do telhado ou espaço disponível para a instalação." },
  { numero: "04", titulo: "Proposta e aprovação", texto: "Você recebe uma proposta personalizada e, se aprovar, assina o contrato." },
  { numero: "05", titulo: "Instalação com equipe própria", texto: "Sem terceirização — do início ao fim com nossa equipe técnica." },
  { numero: "06", titulo: "Homologação e sistema funcionando", texto: "Cuidamos da homologação junto à concessionária até tudo estar gerando economia." },
];

export function ComoFunciona() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-display text-2xl font-semibold text-graphite sm:text-3xl">
        Como funciona
      </h2>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {PASSOS.map((passo) => (
          <div key={passo.numero} className="border-t border-borderlight pt-5">
            <span className="font-mono text-sm text-sun">{passo.numero}</span>
            <h3 className="mt-3 font-display text-lg font-semibold text-graphite">
              {passo.titulo}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-graphitesoft">{passo.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
