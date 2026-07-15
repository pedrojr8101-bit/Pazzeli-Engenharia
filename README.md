# Plataforma Solar — MVP

Site institucional + simulador técnico de dimensionamento fotovoltaico +
captura de lead. Primeira fase de uma plataforma nos moldes da Luvik,
construída sob medida.

Stack: Next.js 14 (App Router) · TypeScript · Prisma · PostgreSQL · Tailwind ·
Vercel — o mesmo stack do Maison Lux.

## Como rodar localmente

```bash
npm install                 # também roda `prisma generate` (precisa de internet)
cp .env.example .env        # preencha DATABASE_URL, ADMIN_JWT_SECRET e os dados da empresa
npx prisma db push          # cria as tabelas no banco (dev) — use `migrate dev` em produção
node scripts/create-admin.mjs "voce@empresa.com" "senha-forte-aqui" "Seu Nome"
npm run dev
```

Abra http://localhost:3000. O simulador fica em `/simulador`, a área admin em `/admin`
(login com o e-mail/senha criados no passo do `create-admin.mjs`).

## Área admin (`/admin`)

Protegida por login (sessão via cookie JWT assinado com `ADMIN_JWT_SECRET` —
mesma abordagem do Maison Lux, usando a lib `jose`). De lá dá pra:

- ver todos os leads que completaram o simulador, com o resultado da última
  simulação de cada um (potência, economia estimada);
- ver um resumo visual no topo do dashboard: total de leads, taxa de
  conversão, economia mensal somada, ticket médio e um gráfico de leads por
  status;
- mudar o status do lead (Novo → Contatado → Proposta enviada → Convertido/Perdido);
- abrir o detalhe de um lead e ver o histórico completo de simulações dele;
- **editar a proposta de cada negócio** — definir um preço final negociado
  (diferente da estimativa automática) e adicionar observações (desconto,
  condições de pagamento etc.), que aparecem tanto na tela quanto no PDF;
- baixar a **proposta em PDF** de qualquer simulação, com um clique — já
  usando o preço negociado e as observações, se houver.

Criar o primeiro admin — duas formas, use a que for mais fácil pra você:

**Pelo navegador** (não precisa de terminal): configure a variável
`ADMIN_SETUP_SECRET` no ambiente, depois visite:

```
https://seu-projeto.vercel.app/api/admin/setup?secret=SEU_ADMIN_SETUP_SECRET&email=voce@empresa.com&senha=senha-forte-aqui&nome=Seu+Nome
```

Depois de criar, **apague ou troque o valor de `ADMIN_SETUP_SECRET`** nas
variáveis de ambiente — essa rota fica desativada automaticamente se essa
variável não existir.

**Pelo terminal** (se preferir):

```bash
node scripts/create-admin.mjs "email@empresa.com" "senha-forte" "Nome"
```

## Proposta em PDF

Gerada sob demanda em `/api/admin/simulacoes/[id]/proposta` (protegida pelo mesmo
login), usando `@react-pdf/renderer` — não depende de navegador/Chromium, então
roda bem dentro do limite de uma função serverless da Vercel. O template fica em
`src/lib/pdf/proposta.tsx`, com o mesmo resumo técnico e financeiro que aparece
na tela de resultado do simulador.

## Estrutura

```
src/
  app/
    page.tsx                     site institucional (hero + como funciona + diferenciais)
    simulador/page.tsx           wizard de simulação (2 passos + resultado)
    admin/
      login/page.tsx             login (rota pública)
      (protegido)/
        layout.tsx                header + botão sair (grupo de rotas autenticadas)
        page.tsx                  dashboard — lista de leads
        leads/[id]/page.tsx       detalhe do lead + histórico de simulações
    api/
      simular/route.ts            roda o cálculo e grava Lead + Simulacao no banco
      admin/
        login/route.ts            valida login, seta cookie de sessão
        logout/route.ts
        leads/route.ts            lista de leads (GET)
        leads/[id]/route.ts       detalhe (GET) + mudar status (PATCH)
        simulacoes/[id]/proposta/route.ts   gera o PDF da proposta
  middleware.ts                  protege /admin e /api/admin (exceto /login)
  components/
    admin/                       StatusSelect, LogoutButton
    ...                          Hero, SunArc, wizard, cartão de resultado
  lib/
    auth.ts                      sessão JWT do admin (jose)
    dimensionamento.ts            motor de cálculo — junta tudo abaixo
    geocode.ts                    CEP -> coordenadas (BrasilAPI, com fallback por capital)
    irradiacao.ts                 coordenadas -> HSP (NASA POWER, gratuita, sem chave)
    tarifas.ts                    constantes: cronograma do Fio B, tarifas, performance ratio
    pdf/proposta.tsx              template da proposta em PDF (react-pdf)
    types.ts
scripts/create-admin.mjs        cria/atualiza um usuário admin
prisma/schema.prisma            Lead + Simulacao + AdminUser
```

## Metodologia do dimensionamento

1. **Localização** — o CEP é resolvido via BrasilAPI (`/api/cep/v2`), que já
   devolve latitude/longitude na maioria dos casos. Quando não devolve, caímos
   para a coordenada da capital do estado (aproximação aceitável para fins de
   irradiação solar, que varia pouco dentro da mesma região).
2. **Irradiação (HSP)** — buscamos a climatologia de 22 anos da NASA POWER
   (`ALLSKY_SFC_SW_DWN`) para a coordenada, com fallback para a média nacional
   (5,0 kWh/m²/dia) se a API estiver fora do ar.
3. **Potência do sistema** — `kWp = consumo mensal / (HSP × 30 × Performance
   Ratio)`, com Performance Ratio padrão de 0,78 (perdas típicas de inversor,
   cabeamento, temperatura, sujeira). Painel de referência: 550 Wp.
4. **Lei 14.300 / Fio B** — aplicamos o cronograma oficial de transição
   (15% em 2023 → 60% em 2026 → 100% em 2029), cobrando o Fio B apenas sobre a
   fração de energia injetada que **não** foi consumida simultaneamente (fator
   de simultaneidade — hoje uma estimativa por perfil, já que a curva de carga
   real só existe com medição).
5. **Financeiro** — economia mensal, investimento estimado (via R$/kWp
   configurável) e payback simples.

Todas essas premissas (fator de simultaneidade, participação da TUSD, custo
por kWp) são constantes centralizadas em `lib/tarifas.ts` — dá para deixar
configurável por empresa/concessionária quando a área admin existir.

⚠️ **Isso é uma ferramenta de estimativa para qualificar leads**, não um
laudo técnico. O rodapé "Premissas consideradas" no resultado já deixa isso
explícito para o usuário final.

## O que já existe vs. o que falta

✅ Site institucional · ✅ Simulador técnico · ✅ Captura de lead ·
✅ Área admin com login · ✅ Proposta em PDF completa (12 páginas, projeção
financeira de 25 anos, TIR/VPL/payback, financiamento) · ✅ Dashboard visual ·
✅ Busca/filtro de leads · ✅ Página de clientes fechados

**Ainda não construído:**

- **Redesign visual completo do site** (identidade visual da Pazzeli de
  verdade) — combinado deixar para depois do fechamento do primeiro cliente.
- **Área do cliente**: login por e-mail para o lead ver o histórico das
  próprias simulações (hoje só o admin vê).
- **Configuração da empresa pela área admin** — hoje o conteúdo institucional
  da proposta (sobre, missão/visão, financiamento, fotos de projetos) fica em
  `src/lib/empresa-config.ts`, editado direto no código. Uma tela de
  configurações no admin é um bom próximo passo quando fizer sentido.
- **Fotos de projetos executados** — página da proposta só aparece quando
  `empresaConfig.fotosProjetos` tiver pelo menos uma foto.

## Proposta em PDF completa

A partir da v6, a proposta em PDF ganhou 12 páginas: capa, sobre a empresa,
missão/visão/valores, dimensionamento técnico, gráfico de geração mensal,
lista de produtos (itens editáveis por negócio), pagamento e financiamento
(tabela SAC), retorno do investimento (tabela de 25 anos comparando com
CDB/poupança), TIR/VPL/payback + impacto ambiental, projetos executados
(opcional), termos e condições, e termo de aceite.

**Antes de usar com clientes de verdade, edite `src/lib/empresa-config.ts`**
com os dados reais da empresa: sobre, missão/visão/valores, parceiros,
suporte/garantia, opções de financiamento (taxas mudam com frequência — não
use os valores de exemplo) e, se quiser, fotos de projetos executados.

As premissas financeiras (inflação da tarifa, degradação dos painéis, taxa de
CDI/poupança usada na comparação, TMA do VPL, fatores de impacto ambiental)
também ficam nesse arquivo, na constante `premissasFinanceiras`. Um ponto de
atenção: a taxa de CDI usada ali é uma **média histórica de longo prazo**, não
a Selic do momento — usar a taxa atual composta por 25 anos seguidos gera
comparações irreais (testamos e o valor final do CDB passava de R$ 1 milhão
para um investimento de R$ 16 mil, o que não é um bom ponto de comparação).

## Nota sobre este ambiente de build

Este projeto foi montado e testado num sandbox sem acesso à internet
completa — não foi possível baixar as fontes do Google Fonts nem o binário
de engine do Prisma aqui dentro. O build (`npm run build`) chegou a compilar
com sucesso (TypeScript, JSX, Tailwind, rotas — tudo validado); o que falhou
foram só essas duas dependências de rede, que funcionam normalmente na sua
máquina e no Vercel.
