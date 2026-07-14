const ITENS = [
  {
    titulo: "Irradiação do seu endereço",
    texto: "Não usamos uma média nacional — buscamos o índice de sol pleno real da sua região.",
  },
  {
    titulo: "Grupo A e Grupo B",
    texto: "Dimensionamento adaptado para ligação residencial, comercial ou de alta tensão.",
  },
  {
    titulo: "Lei 14.300 já embutida",
    texto: "O cálculo já desconta o Fio B e considera o fator de simultaneidade — sem surpresa na proposta.",
  },
];

export function Diferenciais() {
  return (
    <section className="border-y border-duskline bg-dusk/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="max-w-lg font-display text-2xl font-semibold text-paper sm:text-3xl">
          Um simulador com rigor de engenharia, não de propaganda.
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {ITENS.map((item) => (
            <div key={item.titulo}>
              <h3 className="font-display text-base font-semibold text-sky">{item.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/60">{item.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
