const PASSOS = [
  {
    numero: "01",
    titulo: "Você informa o consumo",
    texto:
      "CEP, grupo tarifário e o consumo médio da sua conta de luz. Leva menos de dois minutos.",
  },
  {
    numero: "02",
    titulo: "Calculamos o sistema ideal",
    texto:
      "Cruzamos a irradiação solar real do seu endereço com as regras da Lei 14.300 para dimensionar com precisão.",
  },
  {
    numero: "03",
    titulo: "Um especialista entra em contato",
    texto: "Você recebe uma proposta personalizada, sem compromisso.",
  },
];

export function ComoFunciona() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-display text-2xl font-semibold text-paper sm:text-3xl">
        Como funciona
      </h2>
      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {PASSOS.map((passo) => (
          <div key={passo.numero} className="border-t border-duskline pt-5">
            <span className="font-mono text-sm text-sun">{passo.numero}</span>
            <h3 className="mt-3 font-display text-lg font-semibold text-paper">
              {passo.titulo}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-paper/60">{passo.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
