"use client";

/**
 * Landing — Pazelli Energia Solar
 * Estrutura inspirada no site de referência indicado pelo cliente
 * (soliumenergia.com.br), com a identidade visual dos materiais da Pazelli
 * (navy profundo + sol dourado — mesma linguagem dos posts do Instagram).
 *
 * O disco de sol gigante cortado no hero é a assinatura visual da marca.
 * Cores e fontes vêm dos tokens do tailwind.config.ts (night/sun/paper...).
 *
 * FOTOS DOS PROJETOS: troque os placeholders (comentário [FOTO]) pelos
 * caminhos reais em /public quando tiver as imagens.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BotaoWhatsApp } from "@/components/BotaoWhatsApp";
import { empresaConfig } from "@/lib/empresa-config";

const wa = (msg: string) =>
  `https://wa.me/${empresaConfig.whatsapp}?text=${encodeURIComponent(msg)}`;

// ================================ DADOS ================================

const PROCESSO = [
  { t: "Você informa o consumo", d: "CEP, grupo tarifário e o consumo médio da sua conta — leva menos de dois minutos." },
  { t: "Calculamos o sistema ideal", d: "Cruzamos a irradiação solar real do seu endereço com as regras da Lei 14.300." },
  { t: "Avaliação técnica do local", d: "Análise do telhado ou espaço disponível para a instalação." },
  { t: "Proposta e aprovação", d: "Você recebe uma proposta personalizada e, se aprovar, assina o contrato." },
  { t: "Instalação com equipe própria", d: "Sem terceirização — do início ao fim com nossa equipe técnica." },
  { t: "Homologação e economia", d: "Cuidamos da homologação junto à concessionária até tudo estar gerando." },
];

type Categoria = "Todos" | "Residencial" | "Comercial";

// [FOTO] preencha `foto` com o caminho em /public (ex.: "/projetos/lobato.jpg")
// e ajuste kWp/placas/economia com os dados reais de cada instalação.
const PROJETOS: { nome: string; cat: Exclude<Categoria, "Todos">; kwp: string; placas: number; economia: string; foto?: string }[] = [
  { nome: "Comercial em Belém/PA", cat: "Comercial", kwp: "32,4 kWp", placas: 72, economia: "R$ 42.000/ano" },
  { nome: "Residência em Belém/PA", cat: "Residencial", kwp: "8,8 kWp", placas: 20, economia: "R$ 11.500/ano" },
  { nome: "Edifício comercial — Belém/PA", cat: "Comercial", kwp: "19,8 kWp", placas: 44, economia: "R$ 26.000/ano" },
  { nome: "Residência com laje — Belém/PA", cat: "Residencial", kwp: "6,0 kWp", placas: 10, economia: "R$ 7.800/ano" },
  { nome: "Residência em Ananindeua/PA", cat: "Residencial", kwp: "4,4 kWp", placas: 8, economia: "R$ 5.900/ano" },
  { nome: "Galpão comercial — Belém/PA", cat: "Comercial", kwp: "26,4 kWp", placas: 48, economia: "R$ 34.000/ano" },
];

const SERVICOS = [
  { t: "Instalação solar fotovoltaica", d: "Projetos residenciais e comerciais, do dimensionamento à homologação." },
  { t: "Limpeza e manutenção", d: "Manutenção preventiva para o sistema render ao máximo por anos." },
  { t: "Monitoramento remoto", d: "Acompanhe sua geração pelo app, de qualquer lugar." },
  { t: "Usinas e geração compartilhada", d: "Projetos de maior escala, com engenharia dedicada." },
  { t: "Instalação elétrica completa", d: "Residencial e comercial, com laudo técnico e conformidade ABNT." },
  { t: "Homologação na concessionária", d: "Toda a burocracia até o sistema ser aprovado, sem dor de cabeça." },
];

const DIFERENCIAIS = [
  { t: "Engenharia própria", d: "Engenheiros e instaladores especializados, sem atravessadores." },
  { t: "Dimensionamento real", d: "Irradiação do seu endereço + Lei 14.300 no cálculo, não média de propaganda." },
  { t: "Equipamentos de alto padrão", d: "Fronius, Canadian Solar, Deye, Risen e outros fornecedores confiáveis." },
  { t: "Acompanhamento completo", d: "Do projeto à homologação, você fala direto com quem executa." },
  { t: "Financiamento facilitado", d: "Parcerias com Banpará, Santander, Banco da Amazônia e Banco do Brasil." },
  { t: "Suporte pós-venda", d: "Equipe disponível quando você precisar, com monitoramento do sistema." },
];

const DEPOIMENTOS = [
  { n: "Cliente residencial", d: "A simulação já mostrou o tamanho certo do sistema antes de qualquer visita — deu segurança pra fechar." },
  { n: "Cliente comercial", d: "Todo o processo de homologação foi acompanhado de perto, sem eu precisar correr atrás de nada." },
  { n: "Cliente residencial", d: "A conta de luz caiu bem mais do que eu esperava já no primeiro mês de sistema ligado." },
]; // (exemplos — substituir por depoimentos reais)

const FAQ = [
  { q: "Quanto custa instalar energia solar?", a: "Depende do seu consumo. Um sistema residencial típico em Belém fica entre R$ 11 mil e R$ 30 mil. A simulação gratuita já mostra o valor estimado para o seu caso, e o financiamento costuma ter parcela menor que a economia gerada." },
  { q: "Funciona em dia nublado ou quando chove?", a: "Sim. A geração cai, mas não para — e os créditos gerados nos dias de sol compensam o consumo dos dias nublados. O dimensionamento já considera a média real de irradiação da região, chuva incluída." },
  { q: "O que é a Lei 14.300 e como ela afeta minha economia?", a: "É o marco legal da geração própria. Desde 2023, parte da tarifa (o Fio B) passou a ser cobrada sobre a energia injetada na rede. Nosso cálculo já desconta isso — a economia que mostramos na proposta é a real, sem surpresa na primeira fatura." },
  { q: "Quanto tempo dura um sistema solar?", a: "Os módulos têm garantia de performance de 25 anos ou mais, perdendo no máximo 20% de eficiência nesse período. O inversor costuma durar de 10 a 15 anos." },
  { q: "Preciso de manutenção?", a: "Muito pouca: limpeza periódica dos módulos e inspeção preventiva. Oferecemos planos de manutenção e monitoramento remoto para o sistema render sempre o máximo." },
  { q: "E se eu mudar de casa?", a: "O sistema pode ser desmontado e reinstalado no novo endereço, ou valorizar o imóvel na venda. Os créditos de energia ficam vinculados ao seu CPF/CNPJ na mesma distribuidora." },
];

// =============================== HELPERS ===============================

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 * Estimativa PRELIMINAR (médias regionais) — versão simplificada da mesma
 * metodologia de src/lib/dimensionamento.ts, só para o widget da home.
 * O simulador completo (/simulador) usa a irradiação real do CEP.
 */
function estimar(contaMes: number) {
  const tarifa = 0.92; // média Equatorial PA com impostos
  const custoDisponibilidade = 50 * tarifa; // ligação bifásica
  const consumoKwh = contaMes / tarifa;
  const kwp = consumoKwh / (4.87 * 30 * 0.78); // HSP médio de Belém × PR 78%
  const economiaMes = Math.max((contaMes - custoDisponibilidade) * 0.8, 0); // já desconta Fio B/simultaneidade
  const investimento = kwp * 1830; // R$/kWp de referência
  const paybackAnos = economiaMes > 0 ? investimento / (economiaMes * 12) : 0;
  return { kwp, economiaMes, economiaAno: economiaMes * 12, paybackAnos };
}

/** Faísca do logo Pazelli — marcador de seção */
function Spark({ className = "h-4 w-4 text-sun" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0l1.8 8.2L22 12l-8.2 1.8L12 24l-1.8-10.2L2 12l8.2-3.8L12 0z" />
    </svg>
  );
}

function Eyebrow({ children, escuro = false }: { children: React.ReactNode; escuro?: boolean }) {
  return (
    <p className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${escuro ? "text-sun" : "text-graphitesoft"}`}>
      <Spark className="h-3.5 w-3.5 text-sun" /> {children}
    </p>
  );
}

function IconeWhats({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5a.5.5 0 0 0 0-.5c-.1-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4.1 15.6 15.6 0 0 0 1.5.6 3.7 3.7 0 0 0 1.7.1 2.8 2.8 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

// ================================ PÁGINA ================================

export default function HomePage() {
  const [conta, setConta] = useState(600);
  const [tipo, setTipo] = useState<"Residencial" | "Comercial" | "Rural">("Residencial");
  const [filtro, setFiltro] = useState<Categoria>("Todos");
  const [faqAberta, setFaqAberta] = useState<number | null>(0);

  const est = useMemo(() => estimar(conta), [conta]);
  const projetos = filtro === "Todos" ? PROJETOS : PROJETOS.filter((p) => p.cat === filtro);

  return (
    <>
      <Header />
      <main>
        {/* ============================== HERO ============================== */}
        <section className="relative overflow-hidden bg-night text-paper">
          {/* Disco de sol — assinatura visual da marca (posts do Instagram) */}
          <div aria-hidden className="pointer-events-none absolute -right-44 -top-44 h-[560px] w-[560px] rounded-full bg-sun md:-right-24 md:-top-28" />
          <div aria-hidden className="pointer-events-none absolute -right-44 -top-44 h-[560px] w-[560px] rounded-full bg-gradient-to-br from-white/40 to-transparent md:-right-24 md:-top-28" />

          <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-duskline bg-dusk/60 px-4 py-1.5 text-sm font-medium text-paper/90">
                ☀️ Engenharia própria · Belém/PA
              </p>
              <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
                Menos conta de luz.
                <br />
                <span className="text-sun">Mais liberdade.</span>
              </h1>
              <p className="mt-5 max-w-md text-lg text-paper/75">
                Até 85% de economia com um sistema dimensionado de verdade — irradiação real do seu endereço e Lei 14.300 já no cálculo.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#simulador" className="rounded-full bg-sun px-7 py-3.5 font-display font-semibold text-graphite transition hover:bg-sunlight">
                  Simular minha economia
                </a>
                <a href="#como-funciona" className="rounded-full border border-duskline px-7 py-3.5 font-display font-medium text-paper transition hover:border-sun hover:text-sun">
                  Como funciona
                </a>
              </div>
              {/* Pill de contato — mesmo elemento dos posts do Instagram */}
              <a
                href={wa("Olá! Vim pelo site e gostaria de agendar uma visita.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex items-center gap-3 rounded-full bg-sun px-6 py-3 text-graphite shadow-lg shadow-black/30 transition hover:bg-sunlight"
              >
                <IconeWhats className="h-6 w-6" />
                <span className="text-left leading-tight">
                  <span className="block text-[11px] font-bold uppercase tracking-wide">Agende uma visita, agora!</span>
                  <span className="font-display text-lg font-bold">{empresaConfig.telefoneSecundario}</span>
                </span>
              </a>
            </div>

            {/* Painéis inclinados sobre o sol — [FOTO] opcional: troque por imagem real */}
            <div className="relative hidden md:block">
              <div className="absolute right-0 top-6 h-72 w-56 rotate-[14deg] rounded-lg border-4 border-paper/80 bg-[linear-gradient(135deg,#0C2E4A_25%,#16406A_25%,#16406A_50%,#0C2E4A_50%,#0C2E4A_75%,#16406A_75%)] bg-[length:34px_34px] shadow-2xl" />
              <div className="absolute right-24 top-24 h-72 w-56 rotate-[14deg] rounded-lg border-4 border-paper/80 bg-[linear-gradient(135deg,#0A2740_25%,#123A5E_25%,#123A5E_50%,#0A2740_50%,#0A2740_75%,#123A5E_75%)] bg-[length:34px_34px] shadow-2xl" />
              <div className="absolute bottom-2 right-10 rounded-xl bg-dusk/70 px-5 py-4 backdrop-blur">
                <p className="font-display text-3xl font-bold text-sun">Sol amazônico</p>
                <p className="text-sm text-paper/75">trabalhando para a sua conta de luz</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ SIMULADOR ============================ */}
        <section id="simulador" className="bg-cloud py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Eyebrow>Simulador rápido</Eyebrow>
            <h2 className="max-w-2xl font-display text-3xl font-bold text-graphite md:text-4xl">
              Saiba quanto você pode economizar todo mês
            </h2>
            <p className="mt-2 text-graphitesoft">Descubra em segundos. Sem cadastro.</p>

            <div className="mt-10 grid gap-8 rounded-3xl bg-ivory p-8 shadow-sm md:grid-cols-2 md:p-10">
              <div>
                <p className="mb-3 text-sm font-semibold text-graphitesoft">Tipo de imóvel</p>
                <div className="flex flex-wrap gap-2">
                  {(["Residencial", "Comercial", "Rural"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTipo(t)}
                      className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                        tipo === t ? "bg-night text-sun" : "bg-cloud text-graphitesoft hover:bg-borderlight"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <p className="mb-2 mt-8 text-sm font-semibold text-graphitesoft">Valor médio da sua conta de luz</p>
                <p className="font-display text-4xl font-bold text-night">{brl(conta)}</p>
                <input
                  type="range"
                  min={200}
                  max={5000}
                  step={50}
                  value={conta}
                  onChange={(e) => setConta(Number(e.target.value))}
                  aria-label="Valor médio da conta de luz"
                  className="mt-4 w-full accent-sun"
                />
                <div className="flex justify-between text-xs text-graphitesoft">
                  <span>R$ 200</span>
                  <span>R$ 5.000</span>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl bg-night p-7 text-paper">
                <div>
                  <p className="text-sm font-medium text-paper/70">Economia estimada</p>
                  <p className="mt-1 font-display text-5xl font-bold text-sun">
                    {brl(est.economiaMes)}
                    <span className="text-lg font-medium text-paper/70"> /mês</span>
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-xl bg-dusk p-3">
                      <p className="text-paper/70">Em 12 meses</p>
                      <p className="font-display text-xl font-semibold">{brl(est.economiaAno)}</p>
                    </div>
                    <div className="rounded-xl bg-dusk p-3">
                      <p className="text-paper/70">Sistema estimado</p>
                      <p className="font-display text-xl font-semibold">{est.kwp.toFixed(1)} kWp</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-paper/80">
                    ⏱ Retorno estimado: cerca de {Math.max(1, Math.round(est.paybackAnos))} anos · 🏦 Financia com parcela menor que a economia
                  </p>
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/simulador"
                    className="inline-flex items-center justify-center rounded-full bg-sun px-6 py-3.5 font-display font-semibold text-graphite transition hover:bg-sunlight"
                  >
                    Simular com precisão para o meu endereço →
                  </Link>
                  <a
                    href={wa(`Olá! Simulei no site (conta de ${brl(conta)}, imóvel ${tipo.toLowerCase()}) e quero meu orçamento.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-duskline px-6 py-3 text-sm font-semibold text-paper transition hover:border-sun hover:text-sun"
                  >
                    <IconeWhats className="h-4 w-4" /> Quero meu orçamento no WhatsApp
                  </a>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-graphitesoft">
              Estimativa preliminar com médias regionais. O cálculo completo considera a irradiação real do seu CEP, o fator de simultaneidade e o Fio B da Lei 14.300.
            </p>
          </div>
        </section>

        {/* ============================ PROCESSO ============================ */}
        <section id="como-funciona" className="bg-ivory py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Eyebrow>Processo</Eyebrow>
            <h2 className="font-display text-3xl font-bold text-graphite md:text-4xl">Simples do começo ao fim</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PROCESSO.map((p, i) => (
                <div key={p.t} className="rounded-2xl border border-borderlight bg-ivory p-6 shadow-sm">
                  <p className="font-display text-3xl font-bold text-sun">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-graphite">{p.t}</h3>
                  <p className="mt-1 text-sm text-graphitesoft">{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ PROJETOS ============================ */}
        <section id="projetos" className="bg-night py-20 text-paper">
          <div className="mx-auto max-w-6xl px-6">
            <Eyebrow escuro>Projetos</Eyebrow>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Painéis gerando economia <span className="text-sun">todos os dias</span>
            </h2>
            <div className="mt-8 flex gap-2">
              {(["Todos", "Residencial", "Comercial"] as Categoria[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setFiltro(c)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    filtro === c ? "bg-sun text-graphite" : "bg-dusk text-paper/80 hover:bg-duskline"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projetos.map((p) => (
                <article key={p.nome} className="overflow-hidden rounded-2xl bg-dusk ring-1 ring-duskline">
                  {p.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.foto} alt={p.nome} className="h-44 w-full object-cover" />
                  ) : (
                    /* [FOTO] placeholder — preencha `foto` em PROJETOS acima */
                    <div className="flex h-44 items-end bg-[linear-gradient(160deg,#123A5E,#052137)] p-4">
                      <span className="rounded-full bg-sun px-3 py-1 text-xs font-bold text-graphite">{p.cat}</span>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-display font-semibold">{p.nome}</h3>
                    <p className="mt-1 text-sm text-paper/70">Sistema de {p.kwp} · {p.placas} placas</p>
                    <p className="mt-2 font-display font-semibold text-sun">Economia: {p.economia}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ SERVIÇOS ============================ */}
        <section id="servicos" className="bg-ivory py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Eyebrow>O que oferecemos</Eyebrow>
            <h2 className="font-display text-3xl font-bold text-graphite md:text-4xl">Nossos serviços</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICOS.map((s) => (
                <div key={s.t} className="flex flex-col rounded-2xl border border-borderlight bg-ivory p-6 shadow-sm">
                  <Spark className="h-5 w-5 text-sun" />
                  <h3 className="mt-3 font-display text-lg font-semibold text-graphite">{s.t}</h3>
                  <p className="mt-1 flex-1 text-sm text-graphitesoft">{s.d}</p>
                  <a
                    href={wa(`Olá! Gostaria de um orçamento de ${s.t} sem compromisso.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-night transition hover:text-graphitesoft"
                  >
                    <IconeWhats className="h-4 w-4" /> Solicitar orçamento
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================== DIFERENCIAIS ========================== */}
        <section id="diferenciais" className="bg-cloud py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Eyebrow>Diferenciais</Eyebrow>
            <h2 className="font-display text-3xl font-bold text-graphite md:text-4xl">
              Por que confiar seu investimento à Pazelli
            </h2>
            <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {DIFERENCIAIS.map((d) => (
                <div key={d.t}>
                  <h3 className="font-display font-semibold text-graphite">{d.t}</h3>
                  <p className="mt-1 text-sm text-graphitesoft">{d.d}</p>
                </div>
              ))}
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-ivory p-6 shadow-sm">
                <p className="text-sm font-semibold text-graphitesoft">Financiamento com os parceiros</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {empresaConfig.bancos.map((b) => (
                    <span key={b.nome} className="rounded-full bg-night px-4 py-2 font-display text-sm font-semibold text-paper">
                      {b.nome}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-ivory p-6 shadow-sm">
                <p className="text-sm font-semibold text-graphitesoft">Trabalhamos com as melhores marcas</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {empresaConfig.parceiros.map((m) => (
                    <span key={m.nome} className="rounded-full border border-borderlight px-4 py-2 font-display text-sm font-semibold text-graphitesoft">
                      {m.nome}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-6 rounded-3xl bg-night p-8 text-center text-paper md:grid-cols-4">
              {[
                ["+1.000", "painéis instalados"],
                ["+10 anos", "de experiência"],
                ["Belém e região", "atendimento local"],
                ["até 85%", "de economia na conta"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-2xl font-bold text-sun md:text-3xl">{v}</p>
                  <p className="mt-1 text-sm text-paper/70">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================== DEPOIMENTOS ========================== */}
        <section id="depoimentos" className="bg-ivory py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Eyebrow>Depoimentos</Eyebrow>
            <h2 className="font-display text-3xl font-bold text-graphite md:text-4xl">
              Clientes reais economizando na conta de luz
            </h2>
            <p className="mt-1 text-sm text-graphitesoft">(depoimentos de exemplo — serão substituídos por depoimentos reais)</p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {DEPOIMENTOS.map((d) => (
                <figure key={d.d} className="rounded-2xl border border-borderlight bg-ivory p-6 shadow-sm">
                  <p className="text-sun">★★★★★</p>
                  <blockquote className="mt-3 text-graphitesoft">“{d.d}”</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-night">{d.n}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== FAQ ============================== */}
        <section id="faq" className="bg-cloud py-20">
          <div className="mx-auto max-w-3xl px-6">
            <Eyebrow>Dúvidas frequentes</Eyebrow>
            <h2 className="font-display text-3xl font-bold text-graphite md:text-4xl">Tudo o que você precisa saber</h2>
            <div className="mt-8 space-y-3">
              {FAQ.map((f, i) => (
                <div key={f.q} className="overflow-hidden rounded-2xl bg-ivory shadow-sm">
                  <button
                    onClick={() => setFaqAberta(faqAberta === i ? null : i)}
                    aria-expanded={faqAberta === i}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left font-display font-semibold text-graphite"
                  >
                    {f.q}
                    <span className={`text-sun transition-transform ${faqAberta === i ? "rotate-45" : ""}`}>＋</span>
                  </button>
                  {faqAberta === i && <p className="px-6 pb-5 text-sm text-graphitesoft">{f.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ CTA FINAL ============================ */}
        <section id="orcamento" className="relative overflow-hidden bg-night py-20 text-paper">
          <div aria-hidden className="pointer-events-none absolute -bottom-48 -left-48 h-[420px] w-[420px] rounded-full bg-sun/90" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Chega de pagar caro.
                <br />
                <span className="text-sun">Comece a economizar este mês.</span>
              </h2>
              <p className="mt-4 max-w-md text-paper/75">
                Simule com a irradiação real do seu endereço ou fale direto com a nossa equipe. Sem enrolação, sem pressão — só engenharia e economia.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/simulador"
                className="inline-flex items-center justify-center rounded-full bg-sun px-8 py-4 font-display text-lg font-semibold text-graphite transition hover:bg-sunlight"
              >
                Simular agora — leva 2 minutos
              </Link>
              <a
                href={wa("Olá! Estava no site da Pazelli e quero garantir minha economia. Gostaria de um orçamento sem compromisso.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-duskline px-8 py-4 font-display font-medium text-paper transition hover:border-sun hover:text-sun"
              >
                <IconeWhats /> Quero minha proposta no WhatsApp
              </a>
              <p className="text-center text-xs text-paper/50">Nossa equipe responde em horário comercial. Não enviamos spam.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BotaoWhatsApp />
    </>
  );
}
