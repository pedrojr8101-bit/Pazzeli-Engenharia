import Image from "next/image";

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

const CONFIANCA = [
  "Engenharia própria e equipe técnica especializada",
  "Acompanhamento completo do projeto até a homologação",
  "Equipamentos de alto padrão, com fornecedores confiáveis",
  "Atendimento direto, sem terceirização ou atravessadores",
];

export function Diferenciais() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="max-w-lg font-display text-2xl font-semibold text-graphite sm:text-3xl">
        Um simulador com rigor de engenharia, não de propaganda.
      </h2>
      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {ITENS.map((item) => (
          <div key={item.titulo}>
            <h3 className="font-display text-base font-semibold text-ember">{item.titulo}</h3>
            <p className="mt-2 text-sm leading-relaxed text-graphitesoft">{item.texto}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-0 overflow-hidden rounded-2xl border border-borderlight bg-cloud sm:grid-cols-2">
        <div className="p-8 sm:p-10">
          <h3 className="font-display text-xl font-semibold text-graphite">
            Por que confiar seu investimento a nós?
          </h3>
          <p className="mt-2 max-w-xl text-sm text-graphitesoft">
            Muitas empresas prometem economia rápida e desaparecem no meio do caminho, deixando
            projetos sem instalação ou sem homologação. Seguimos o caminho oposto.
          </p>
          <ul className="mt-6 grid gap-3">
            {CONFIANCA.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-graphite">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sun" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative min-h-[220px]">
          <Image
            src="https://images.unsplash.com/photo-1668097613572-40b7c11c8727?fm=jpg&q=80&w=1200&auto=format&fit=crop"
            alt="Técnico instalando painel solar"
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
