'use client';

/**
 * app/page.tsx — Landing Pazelli Energia Solar
 * ------------------------------------------------------------------
 * Estrutura inspirada em soliumenergia.com.br, com a identidade
 * visual da Pazelli (navy profundo + sol amarelo + Poppins), no
 * padrão dos posts do Instagram.
 *
 * Cores:  navy #0A2440 · navy-deep #061A31 · sol #FFC629
 *         âmbar #E8A800 · off-white #F6F8FB · ink #10233A
 *
 * FOTOS: troque os placeholders marcados com [FOTO] pelos caminhos
 * reais em /public (ex.: /projetos/lobato.jpg).
 * ------------------------------------------------------------------
 */

import { useMemo, useState } from 'react';
import { Poppins, Nunito_Sans } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-poppins' });
const nunito = Nunito_Sans({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-nunito' });

const WHATS = '5591991294123';
const wa = (msg: string) => `https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`;

// ============================ DADOS ============================

const NAV = [
  { href: '#simulador', label: 'Simulador' },
  { href: '#como-funciona', label: 'Processo' },
  { href: '#projetos', label: 'Projetos' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#faq', label: 'FAQ' },
];

const PROCESSO = [
  { t: 'Você informa o consumo', d: 'CEP, grupo tarifário e o consumo médio da sua conta — leva menos de dois minutos.' },
  { t: 'Calculamos o sistema ideal', d: 'Cruzamos a irradiação solar real do seu endereço com as regras da Lei 14.300.' },
  { t: 'Avaliação técnica do local', d: 'Análise do telhado ou espaço disponível para a instalação.' },
  { t: 'Proposta e aprovação', d: 'Você recebe uma proposta personalizada e, se aprovar, assina o contrato.' },
  { t: 'Instalação com equipe própria', d: 'Sem terceirização — do início ao fim com nossa equipe técnica.' },
  { t: 'Homologação e economia', d: 'Cuidamos da homologação junto à concessionária até tudo estar gerando.' },
];

type Cat = 'Todos' | 'Residencial' | 'Comercial';
const PROJETOS: { nome: string; cat: Exclude<Cat, 'Todos'>; kwp: string; placas: number; economia: string; foto?: string }[] = [
  { nome: 'Comercial Lobato — Belém/PA', cat: 'Comercial', kwp: '32,4 kWp', placas: 72, economia: 'R$ 42.000/ano' }, // [FOTO]
  { nome: 'Residência em Belém/PA', cat: 'Residencial', kwp: '8,8 kWp', placas: 20, economia: 'R$ 11.500/ano' }, // [FOTO]
  { nome: 'Edifício comercial — Belém/PA', cat: 'Comercial', kwp: '19,8 kWp', placas: 44, economia: 'R$ 26.000/ano' }, // [FOTO]
  { nome: 'Residência com laje — Belém/PA', cat: 'Residencial', kwp: '6,0 kWp', placas: 10, economia: 'R$ 7.800/ano' }, // [FOTO]
  { nome: 'Residência em Ananindeua/PA', cat: 'Residencial', kwp: '4,4 kWp', placas: 8, economia: 'R$ 5.900/ano' }, // [FOTO]
  { nome: 'Galpão comercial — Belém/PA', cat: 'Comercial', kwp: '26,4 kWp', placas: 48, economia: 'R$ 34.000/ano' }, // [FOTO]
];

const SERVICOS = [
  { t: 'Instalação solar fotovoltaica', d: 'Projetos residenciais e comerciais, do dimensionamento à homologação.' },
  { t: 'Limpeza e manutenção', d: 'Manutenção preventiva para o sistema render ao máximo por anos.' },
  { t: 'Monitoramento remoto', d: 'Acompanhe sua geração pelo app, de qualquer lugar.' },
  { t: 'Usinas e geração compartilhada', d: 'Projetos de maior escala, com engenharia dedicada.' },
  { t: 'Instalação elétrica completa', d: 'Residencial e comercial, com laudo técnico e conformidade ABNT.' },
  { t: 'Homologação na concessionária', d: 'Toda a burocracia até o sistema ser aprovado, sem dor de cabeça.' },
];

const DIFERENCIAIS = [
  { t: 'Engenharia própria', d: 'Engenheiros e instaladores especializados, sem atravessadores.' },
  { t: 'Dimensionamento real', d: 'Irradiação do seu endereço + Lei 14.300 no cálculo, não média de propaganda.' },
  { t: 'Equipamentos de alto padrão', d: 'Fronius, Canadian Solar, Deye, Risen e outros fornecedores confiáveis.' },
  { t: 'Acompanhamento completo', d: 'Do projeto à homologação, você fala direto com quem executa.' },
  { t: 'Financiamento facilitado', d: 'Parcerias com Banpará, Santander, Banco da Amazônia e Banco do Brasil.' },
  { t: 'Suporte pós-venda', d: 'Equipe disponível quando você precisar, com monitoramento do sistema.' },
];

const BANCOS = ['Banpará', 'Santander', 'Banco da Amazônia', 'Banco do Brasil'];
const MARCAS = ['Fronius', 'APsystems', 'Canadian Solar', 'Sofar', 'Risen', 'Deye'];

const DEPOIMENTOS = [
  { n: 'Cliente residencial', d: 'A simulação já mostrou o tamanho certo do sistema antes de qualquer visita — deu segurança pra fechar.' },
  { n: 'Cliente comercial', d: 'Todo o processo de homologação foi acompanhado de perto, sem eu precisar correr atrás de nada.' },
  { n: 'Cliente residencial', d: 'A conta de luz caiu bem mais do que eu esperava já no primeiro mês de sistema ligado.' },
]; // (exemplos — substituir por depoimentos reais)

const FAQ = [
  { q: 'Quanto custa instalar energia solar?', a: 'Depende do seu consumo. Um sistema residencial típico em Belém fica entre R$ 11 mil e R$ 30 mil. A simulação gratuita já mostra o valor estimado para o seu caso, e o financiamento costuma ter parcela menor que a economia gerada.' },
  { q: 'Funciona em dia nublado ou quando chove?', a: 'Sim. A geração cai, mas não para — e os créditos gerados nos dias de sol compensam o consumo dos dias nublados. O dimensionamento já considera a média real de irradiação da região, chuva incluída.' },
  { q: 'O que é a Lei 14.300 e como ela afeta minha economia?', a: 'É o marco legal da geração própria. Desde 2023, parte da tarifa (o Fio B) passou a ser cobrada sobre a energia injetada na rede. Nosso cálculo já desconta isso — a economia que mostramos na proposta é a real, sem surpresa na primeira fatura.' },
  { q: 'Quanto tempo dura um sistema solar?', a: 'Os módulos têm garantia de performance de 25 anos ou mais, perdendo no máximo 20% de eficiência nesse período. O inversor costuma durar de 10 a 15 anos.' },
  { q: 'Preciso de manutenção?', a: 'Muito pouca: limpeza periódica dos módulos e inspeção preventiva. Oferecemos planos de manutenção e monitoramento remoto para o sistema render sempre o máximo.' },
  { q: 'E se eu mudar de casa?', a: 'O sistema pode ser desmontado e reinstalado no novo endereço, ou valorizar o imóvel na venda. Os créditos de energia ficam vinculados ao seu CPF/CNPJ na mesma distribuidora.' },
];

// =========================== HELPERS ===========================

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

/** Estimativa preliminar coerente com o motor da proposta (lib/proposta-calculo.ts) */
function estimar(contaMes: number) {
  const tarifa = 0.92;            // média Equatorial PA c/ impostos
  const custoDisp = 50 * tarifa;  // bifásico
  const consumo = contaMes / tarifa;                     // kWh/mês
  const kwp = consumo / (4.87 * 30 * 0.78);              // irradiação Belém × PR 78%
  const economiaMes = Math.max((contaMes - custoDisp) * 0.8, 0); // já desconta Fio B/simultaneidade
  const investimento = kwp * 1830;                       // R$/Wp médio praticado
  const paybackAnos = economiaMes > 0 ? investimento / (economiaMes * 12) : 0;
  return { kwp, economiaMes, economiaAno: economiaMes * 12, paybackAnos };
}

// ============================ ÍCONES ===========================

const IconWhats = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5a.5.5 0 0 0 0-.5c-.1-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4.1 15.6 15.6 0 0 0 1.5.6 3.7 3.7 0 0 0 1.7.1 2.8 2.8 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.2-.2-.4-.3Z" />
  </svg>
);

/** Faísca do logo Pazelli — usada como marcador de seção */
const Spark = ({ className = 'h-4 w-4 text-[#FFC629]' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 0l1.8 8.2L22 12l-8.2 1.8L12 24l-1.8-10.2L2 12l8.2-3.8L12 0z" />
  </svg>
);

const Eyebrow = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <p className={`mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] ${dark ? 'text-[#FFC629]' : 'text-[#B8860B]'}`}>
    <Spark className="h-3.5 w-3.5" /> {children}
  </p>
);

// ============================ PÁGINA ===========================

export default function Home() {
  const [conta, setConta] = useState(600);
  const [tipo, setTipo] = useState<'Residencial' | 'Comercial' | 'Rural'>('Residencial');
  const [filtro, setFiltro] = useState<Cat>('Todos');
  const [faqAberta, setFaqAberta] = useState<number | null>(0);
  const [form, setForm] = useState({ nome: '', fone: '', cidade: '', conta: '' });

  const est = useMemo(() => estimar(conta), [conta]);
  const projetos = filtro === 'Todos' ? PROJETOS : PROJETOS.filter((p) => p.cat === filtro);

  const enviarForm = () => {
    const msg = `Olá! Vim pelo site da Pazelli e quero minha proposta.\nNome: ${form.nome}\nCidade: ${form.cidade}\nConta média: R$ ${form.conta}\nImóvel: ${tipo}`;
    window.open(wa(msg), '_blank');
  };

  return (
    <main className={`${poppins.variable} ${nunito.variable} bg-white font-[family-name:var(--font-nunito)] text-[#10233A] antialiased`}>
      {/* ============================ HEADER ============================ */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A2440]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#" className="flex items-center gap-2 font-[family-name:var(--font-poppins)] text-white">
            <Spark />
            <span className="text-lg font-bold leading-none">
              Pazelli <span className="block text-[11px] font-medium tracking-[0.25em] text-white/70">ENERGIA SOLAR</span>
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-white/80 lg:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="transition hover:text-[#FFC629]">{n.label}</a>
            ))}
          </nav>
          <a href="#simulador" className="rounded-full bg-[#FFC629] px-5 py-2.5 font-[family-name:var(--font-poppins)] text-sm font-bold text-[#0A2440] transition hover:bg-[#ffd45c]">
            Simular economia
          </a>
        </div>
      </header>

      {/* ============================= HERO ============================= */}
      <section className="relative overflow-hidden bg-[#0A2440] text-white">
        {/* Sol — assinatura visual da marca */}
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-[#FFC629] opacity-95 md:-right-24 md:-top-24" />
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-gradient-to-br from-white/40 to-transparent md:-right-24 md:-top-24" />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm font-semibold text-white/90">
              ☀️ Engenharia própria · Belém/PA
            </p>
            <h1 className="font-[family-name:var(--font-poppins)] text-4xl font-extrabold leading-tight md:text-5xl">
              Menos conta de luz.<br />
              <span className="text-[#FFC629]">Mais liberdade.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-white/80">
              Até 85% de economia com um sistema dimensionado de verdade — irradiação real do seu endereço e Lei 14.300 já no cálculo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#simulador" className="rounded-full bg-[#FFC629] px-7 py-3.5 font-[family-name:var(--font-poppins)] font-bold text-[#0A2440] transition hover:bg-[#ffd45c]">
                Simular minha economia
              </a>
              <a href="#como-funciona" className="rounded-full border border-white/30 px-7 py-3.5 font-[family-name:var(--font-poppins)] font-semibold text-white transition hover:border-[#FFC629] hover:text-[#FFC629]">
                Como funciona
              </a>
            </div>
            {/* Pill de contato — mesmo elemento dos posts do Instagram */}
            <a href={wa('Olá! Vim pelo site e gostaria de agendar uma visita.')} target="_blank" rel="noreferrer"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#FFC629] px-6 py-3 text-[#0A2440] shadow-lg shadow-black/20 transition hover:bg-[#ffd45c]">
              <IconWhats className="h-6 w-6" />
              <span className="text-left leading-tight">
                <span className="block text-[11px] font-bold uppercase tracking-wide">Agende uma visita, agora!</span>
                <span className="font-[family-name:var(--font-poppins)] text-lg font-extrabold">91 99129-4123</span>
              </span>
            </a>
          </div>

          {/* Painel inclinado sobre o sol — [FOTO] opcional: troque por imagem real */}
          <div className="relative hidden md:block">
            <div className="absolute right-0 top-6 h-72 w-56 rotate-[14deg] rounded-lg border-4 border-slate-200 bg-[linear-gradient(135deg,#16345c_25%,#1d4275_25%,#1d4275_50%,#16345c_50%,#16345c_75%,#1d4275_75%)] bg-[length:34px_34px] shadow-2xl" />
            <div className="absolute right-24 top-24 h-72 w-56 rotate-[14deg] rounded-lg border-4 border-slate-200 bg-[linear-gradient(135deg,#122c4e_25%,#1a3a68_25%,#1a3a68_50%,#122c4e_50%,#122c4e_75%,#1a3a68_75%)] bg-[length:34px_34px] shadow-2xl" />
            <div className="absolute bottom-2 right-10 rounded-xl bg-white/10 px-5 py-4 backdrop-blur">
              <p className="font-[family-name:var(--font-poppins)] text-3xl font-extrabold text-[#FFC629]">+ de 10 anos</p>
              <p className="text-sm text-white/80">de sol trabalhando para nossos clientes</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================== SIMULADOR =========================== */}
      <section id="simulador" className="bg-[#F6F8FB] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Eyebrow>Simulador rápido</Eyebrow>
          <h2 className="max-w-2xl font-[family-name:var(--font-poppins)] text-3xl font-extrabold md:text-4xl">
            Saiba quanto você pode economizar todo mês
          </h2>
          <p className="mt-2 text-slate-500">Descubra em segundos. Sem cadastro.</p>

          <div className="mt-10 grid gap-8 rounded-3xl bg-white p-8 shadow-sm md:grid-cols-2 md:p-10">
            <div>
              <p className="mb-3 text-sm font-bold text-slate-600">Tipo de imóvel</p>
              <div className="flex flex-wrap gap-2">
                {(['Residencial', 'Comercial', 'Rural'] as const).map((t) => (
                  <button key={t} onClick={() => setTipo(t)}
                    className={`rounded-full px-5 py-2 text-sm font-bold transition ${tipo === t ? 'bg-[#0A2440] text-[#FFC629]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {t}
                  </button>
                ))}
              </div>

              <p className="mb-2 mt-8 text-sm font-bold text-slate-600">Valor médio da sua conta de luz</p>
              <p className="font-[family-name:var(--font-poppins)] text-4xl font-extrabold text-[#0A2440]">{brl(conta)}</p>
              <input type="range" min={200} max={5000} step={50} value={conta}
                onChange={(e) => setConta(Number(e.target.value))}
                aria-label="Valor médio da conta de luz"
                className="mt-4 w-full accent-[#FFC629]" />
              <div className="flex justify-between text-xs text-slate-400"><span>R$ 200</span><span>R$ 5.000</span></div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl bg-[#0A2440] p-7 text-white">
              <div>
                <p className="text-sm font-semibold text-white/70">Economia estimada</p>
                <p className="mt-1 font-[family-name:var(--font-poppins)] text-5xl font-extrabold text-[#FFC629]">{brl(est.economiaMes)}<span className="text-lg text-white/70"> /mês</span></p>
                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-white/70">Em 12 meses</p>
                    <p className="font-[family-name:var(--font-poppins)] text-xl font-bold">{brl(est.economiaAno)}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-white/70">Sistema estimado</p>
                    <p className="font-[family-name:var(--font-poppins)] text-xl font-bold">{est.kwp.toFixed(1)} kWp</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/80">⏱ Retorno estimado: cerca de {Math.max(1, Math.round(est.paybackAnos))} anos · 🏦 Financia com parcela menor que a economia</p>
              </div>
              <a href={wa(`Olá! Simulei no site (conta de ${brl(conta)}, imóvel ${tipo.toLowerCase()}) e quero meu orçamento.`)} target="_blank" rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#FFC629] px-6 py-3.5 font-[family-name:var(--font-poppins)] font-bold text-[#0A2440] transition hover:bg-[#ffd45c]">
                <IconWhats /> Quero meu orçamento no WhatsApp
              </a>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Estimativa preliminar com médias regionais. A proposta completa considera a irradiação real do seu CEP, o fator de simultaneidade e o Fio B da Lei 14.300.
          </p>
        </div>
      </section>

      {/* ============================ PROCESSO ============================ */}
      <section id="como-funciona" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Eyebrow>Processo</Eyebrow>
          <h2 className="font-[family-name:var(--font-poppins)] text-3xl font-extrabold md:text-4xl">Simples do começo ao fim</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROCESSO.map((p, i) => (
              <div key={p.t} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="font-[family-name:var(--font-poppins)] text-3xl font-extrabold text-[#FFC629]">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-2 font-[family-name:var(--font-poppins)] text-lg font-bold">{p.t}</h3>
                <p className="mt-1 text-sm text-slate-500">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ PROJETOS ============================ */}
      <section id="projetos" className="bg-[#0A2440] py-20 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <Eyebrow dark>Projetos</Eyebrow>
          <h2 className="font-[family-name:var(--font-poppins)] text-3xl font-extrabold md:text-4xl">
            Painéis gerando economia <span className="text-[#FFC629]">todos os dias</span>
          </h2>
          <div className="mt-8 flex gap-2">
            {(['Todos', 'Residencial', 'Comercial'] as Cat[]).map((c) => (
              <button key={c} onClick={() => setFiltro(c)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition ${filtro === c ? 'bg-[#FFC629] text-[#0A2440]' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projetos.map((p) => (
              <article key={p.nome} className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
                {/* [FOTO] — substitua o div abaixo por: <img src={p.foto} alt={p.nome} className="h-44 w-full object-cover" /> */}
                <div className="flex h-44 items-end bg-[linear-gradient(160deg,#123055,#0A2440)] p-4">
                  <span className="rounded-full bg-[#FFC629] px-3 py-1 text-xs font-bold text-[#0A2440]">{p.cat}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-[family-name:var(--font-poppins)] font-bold">{p.nome}</h3>
                  <p className="mt-1 text-sm text-white/70">Sistema de {p.kwp} · {p.placas} placas</p>
                  <p className="mt-2 font-[family-name:var(--font-poppins)] font-bold text-[#FFC629]">Economia: {p.economia}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ SERVIÇOS ============================ */}
      <section id="servicos" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Eyebrow>O que oferecemos</Eyebrow>
          <h2 className="font-[family-name:var(--font-poppins)] text-3xl font-extrabold md:text-4xl">Nossos serviços</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICOS.map((s) => (
              <div key={s.t} className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <Spark className="h-5 w-5 text-[#FFC629]" />
                <h3 className="mt-3 font-[family-name:var(--font-poppins)] text-lg font-bold">{s.t}</h3>
                <p className="mt-1 flex-1 text-sm text-slate-500">{s.d}</p>
                <a href={wa(`Olá! Gostaria de um orçamento de ${s.t} sem compromisso.`)} target="_blank" rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#0A2440] transition hover:text-[#B8860B]">
                  <IconWhats className="h-4 w-4" /> Solicitar orçamento
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== DIFERENCIAIS ========================== */}
      <section id="diferenciais" className="bg-[#F6F8FB] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Eyebrow>Diferenciais</Eyebrow>
          <h2 className="font-[family-name:var(--font-poppins)] text-3xl font-extrabold md:text-4xl">Por que confiar seu investimento à Pazelli</h2>
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {DIFERENCIAIS.map((d) => (
              <div key={d.t}>
                <h3 className="font-[family-name:var(--font-poppins)] font-bold">{d.t}</h3>
                <p className="mt-1 text-sm text-slate-500">{d.d}</p>
              </div>
            ))}
          </div>

          {/* Bancos + marcas */}
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Financiamento com os parceiros</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {BANCOS.map((b) => (
                  <span key={b} className="rounded-full bg-[#0A2440] px-4 py-2 font-[family-name:var(--font-poppins)] text-sm font-bold text-white">{b}</span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Trabalhamos com as melhores marcas</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {MARCAS.map((m) => (
                  <span key={m} className="rounded-full border border-slate-200 px-4 py-2 font-[family-name:var(--font-poppins)] text-sm font-bold text-slate-600">{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 gap-6 rounded-3xl bg-[#0A2440] p-8 text-center text-white md:grid-cols-4">
            {[
              ['+1.000', 'painéis instalados'],
              ['+10 anos', 'de experiência'],
              ['Belém e região', 'atendimento local'],
              ['até 85%', 'de economia na conta'],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="font-[family-name:var(--font-poppins)] text-2xl font-extrabold text-[#FFC629] md:text-3xl">{v}</p>
                <p className="mt-1 text-sm text-white/70">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== DEPOIMENTOS ========================== */}
      <section id="depoimentos" className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Eyebrow>Depoimentos</Eyebrow>
          <h2 className="font-[family-name:var(--font-poppins)] text-3xl font-extrabold md:text-4xl">Clientes reais economizando na conta de luz</h2>
          <p className="mt-1 text-sm text-slate-400">(depoimentos de exemplo — serão substituídos por depoimentos reais)</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {DEPOIMENTOS.map((d) => (
              <figure key={d.d} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-[#FFC629]">★★★★★</p>
                <blockquote className="mt-3 text-slate-600">“{d.d}”</blockquote>
                <figcaption className="mt-4 text-sm font-bold text-[#0A2440]">{d.n}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== FAQ ============================== */}
      <section id="faq" className="bg-[#F6F8FB] py-20">
        <div className="mx-auto max-w-3xl px-5">
          <Eyebrow>Dúvidas frequentes</Eyebrow>
          <h2 className="font-[family-name:var(--font-poppins)] text-3xl font-extrabold md:text-4xl">Tudo o que você precisa saber</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((f, i) => (
              <div key={f.q} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <button onClick={() => setFaqAberta(faqAberta === i ? null : i)} aria-expanded={faqAberta === i}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left font-[family-name:var(--font-poppins)] font-bold text-[#0A2440]">
                  {f.q}
                  <span className={`text-[#FFC629] transition-transform ${faqAberta === i ? 'rotate-45' : ''}`}>＋</span>
                </button>
                {faqAberta === i && <p className="px-6 pb-5 text-sm text-slate-600">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== FORMULÁRIO =========================== */}
      <section id="formulario" className="relative overflow-hidden bg-[#0A2440] py-20 text-white">
        <div aria-hidden className="pointer-events-none absolute -bottom-48 -left-48 h-[420px] w-[420px] rounded-full bg-[#FFC629]/90" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
          <div>
            <h2 className="font-[family-name:var(--font-poppins)] text-3xl font-extrabold md:text-4xl">
              Chega de pagar caro.<br /><span className="text-[#FFC629]">Comece a economizar este mês.</span>
            </h2>
            <p className="mt-4 max-w-md text-white/80">
              Preencha ao lado e receba sua proposta direto no WhatsApp. Sem enrolação, sem pressão — só engenharia e economia.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-8 text-[#10233A] shadow-2xl">
            <h3 className="font-[family-name:var(--font-poppins)] text-xl font-extrabold">Receba seu orçamento</h3>
            <div className="mt-5 space-y-4">
              {([
                ['nome', 'Seu nome', 'text'],
                ['fone', 'WhatsApp (91) 9....', 'tel'],
                ['cidade', 'Cidade/UF', 'text'],
                ['conta', 'Valor médio da conta (R$)', 'number'],
              ] as const).map(([k, ph, t]) => (
                <input key={k} type={t} placeholder={ph} value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FFC629] focus:ring-2 focus:ring-[#FFC629]/40" />
              ))}
              <button onClick={enviarForm}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FFC629] px-6 py-3.5 font-[family-name:var(--font-poppins)] font-bold text-[#0A2440] transition hover:bg-[#ffd45c]">
                <IconWhats /> Quero minha proposta
              </button>
              <p className="text-center text-xs text-slate-400">Seus dados vão direto para o nosso WhatsApp. Não enviamos spam.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= FOOTER ============================= */}
      <footer className="border-t border-white/10 bg-[#061A31] py-12 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 font-[family-name:var(--font-poppins)] text-lg font-bold"><Spark /> Pazelli Energia Solar</p>
            <p className="mt-3 max-w-xs text-sm text-white/60">Transformando o sol de Belém em economia, com engenharia própria e entrega sem surpresas.</p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-white/50">Navegação</p>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              {NAV.map((n) => (<li key={n.href}><a href={n.href} className="hover:text-[#FFC629]">{n.label}</a></li>))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-white/50">Contato</p>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>(91) 99129-4123</li>
              <li>contato@pazelliengenharia.com.br</li>
              <li>Av. Conselheiro Furtado, 2391 — Ed. Belém Metropolitan, Sala 1009 · Belém/PA</li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-white/40">© 2026 Pazelli Energia Solar. Todos os direitos reservados.</p>
      </footer>

      {/* WhatsApp flutuante */}
      <a href={wa('Olá! Vim pelo site e gostaria de um orçamento sem compromisso.')} target="_blank" rel="noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105">
        <IconWhats className="h-7 w-7" />
      </a>
    </main>
  );
}
