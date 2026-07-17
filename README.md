# Pazelli Energia Solar — Plataforma

Site institucional (com a identidade visual real da Pazelli) + simulador
técnico de dimensionamento fotovoltaico + captura de lead + área admin com
dashboard, edição de propostas e geração de PDF completo.

Stack: Next.js 14 (App Router) · TypeScript · Prisma · PostgreSQL · Tailwind ·
Vercel.

## Como rodar localmente

```bash
npm install                 # também roda `prisma generate` (precisa de internet)
cp .env.example .env        # preencha DATABASE_URL, ADMIN_JWT_SECRET etc.
npx prisma db push          # cria as tabelas no banco (dev) — use `migrate dev` em produção
node scripts/create-admin.mjs "voce@empresa.com" "senha-forte-aqui" "Seu Nome"
npm run dev
```

Abra http://localhost:3000. O simulador fica em `/simulador`, a área admin em
`/admin` (login com o e-mail/senha criados no passo do `create-admin.mjs`).

## Identidade visual e dados reais da Pazelli

O site e a proposta em PDF usam os dados e imagens reais da Pazelli Energia
Solar, extraídos da proposta de referência enviada pelo cliente: logo, fotos
de projetos instalados, CNPJ, endereço, missão/visão/valores, parceiros
(Fronius, APsystems, Canadian Solar, Sofar Solar, Risen, Deye) e bancos
parceiros (Banpará, Santander, Banco da Amazônia, Banco do Brasil).

- **Conteúdo textual** (sobre, missão, visão, valores, parceiros, bancos,
  suporte, garantias, prazo de entrega, premissas financeiras): editável em
  `src/lib/empresa-config.ts`.
- **Imagens** (logo, foto de capa, logos de parceiros/bancos): ficam em
  `src/lib/pdf/assets-pazelli.ts`, salvas como base64 — isso evita depender
  de hospedagem externa de imagens (funciona direto no Vercel, sem
  configuração extra). Para trocar uma imagem, gere um novo base64 e
  substitua a constante correspondente.

O **redesign visual completo do site** (tema claro, nova estrutura de
seções — dor, diferenciais, serviços, como funciona, depoimentos, CTA) já
foi aplicado, inspirado no site de referência que o cliente indicou,
mantendo o simulador técnico como diferencial central e um botão de
WhatsApp bem visível (hero + botão flutuante).

## Área admin (`/admin`)

Protegida por login (sessão via cookie JWT assinado com `ADMIN_JWT_SECRET`,
usando a lib `jose`). De lá dá pra:

- ver todos os leads que completaram o simulador, com o resultado da última
  simulação de cada um (potência, economia estimada);
- ver um resumo visual no topo do dashboard: total de leads, taxa de
  conversão, economia mensal somada, ticket médio e um gráfico de leads por
  status;
- **buscar e filtrar leads** por nome/e-mail/cidade e por status;
- ver uma página dedicada de **clientes fechados** (`/admin/clientes`), com
  faturamento total e economia gerada somados;
- mudar o status do lead (Novo → Contatado → Proposta enviada → Convertido/Perdido);
- abrir o detalhe de um lead e ver o histórico completo de simulações dele;
- **editar a proposta de cada negócio** — preço final negociado, observações,
  itens do kit, tipo de estrutura do telhado, CPF/endereço do cliente (para
  o aceite da proposta);
- baixar a **proposta em PDF completa** de qualquer simulação, com um clique.

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

## Proposta em PDF completa

10 páginas, seguindo a estrutura real da proposta da Pazelli: capa (foto
real + logo), sobre a empresa, missão/visão/valores + parceiros (logos
reais), dimensionamento técnico, gráfico de geração mensal, lista de
produtos (itens editáveis por negócio), pagamento e entrega (prazo + logos
dos bancos parceiros), retorno do investimento (tabela de 25 anos comparando
com CDB/poupança), TIR/VPL/payback + impacto ambiental, e aceite da proposta
(com tabela de dados do cliente pra preencher: nome, CPF, RG, endereço,
cidade, UF, email, telefone).

Gerada sob demanda em `/api/admin/simulacoes/[id]/proposta` (protegida pelo
login admin), usando `@react-pdf/renderer` — não depende de navegador/
Chromium, então roda bem dentro do limite de uma função serverless da
Vercel. O template fica em `src/lib/pdf/proposta.tsx`.

⚠️ **Sobre as premissas financeiras** (em `premissasFinanceiras`, dentro de
`empresa-config.ts`): a taxa de CDI usada na comparação com renda fixa é uma
**média histórica de longo prazo**, não a Selic do momento — usar a taxa
atual composta por 25 anos seguidos gera comparações irreais (testamos: o
valor final do CDB passava de R$ 1 milhão para um investimento de R$ 16
mil). Ajuste com cautela se for atualizar esse número.

## Área do cliente e monitoramento (SolarZ)

Clientes que já fecharam negócio podem acompanhar a produção de energia da
própria usina em `/cliente` (login separado do admin, em `/cliente/login`).
Os dados vêm da [API da SolarZ](https://app.solarz.com.br/v3/api-docs/seller-open-api)
(monitoramento com +100 inversores compatíveis), consultada no servidor —
as credenciais da SolarZ nunca chegam ao navegador do cliente.

**Como liberar o acesso de um cliente:**
1. No admin, abra o lead (`/admin/leads/[id]`).
2. Na seção "Monitoramento SolarZ", busque a usina pelo e-mail ou CPF do
   cliente (a busca consulta a SolarZ diretamente).
3. Selecione a usina encontrada, defina uma senha de acesso, e clique em
   "Vincular e liberar acesso".
4. Passe o e-mail e a senha pro cliente (WhatsApp, por exemplo) — ele já
   pode entrar em `/cliente/login`.

O dashboard do cliente mostra: status da usina (online/offline), potência
instantânea, geração de hoje/últimos 30 dias (comparado com o esperado),
geração total histórica, e um gráfico diário dos últimos 30 dias.

**Pensando no futuro app**: o login (`/api/cliente/login`) devolve o token
de sessão também no corpo da resposta (além do cookie usado pelo site), e
todas as rotas de `/api/cliente/*` aceitam tanto o cookie quanto um header
`Authorization: Bearer <token>`. Um app nativo pode reusar exatamente essas
mesmas rotas — só precisa guardar o token com segurança e mandar esse
header nas chamadas.

Variáveis necessárias (ver `.env.example`): `SOLARZ_USUARIO`, `SOLARZ_SENHA`
(credenciais da conta raiz do integrador na SolarZ) e `CLIENTE_JWT_SECRET`.



```
src/
  app/
    page.tsx                     site institucional (hero + dor + diferenciais + serviços + como funciona + depoimentos + CTA)
    simulador/page.tsx           wizard de simulação (2 passos + resultado)
    cliente/
      login/page.tsx             login do cliente (rota pública)
      (protegido)/
        layout.tsx                 header + botão sair
        page.tsx                   dashboard de monitoramento (produção da usina via SolarZ)
    admin/
      login/page.tsx             login (rota pública)
      (protegido)/
        layout.tsx                nav (dashboard/clientes) + botão sair
        page.tsx                  dashboard — stats + gráfico + lista de leads (busca/filtro)
        leads/[id]/page.tsx       detalhe do lead + vínculo SolarZ + edição de proposta + histórico de simulações
        clientes/page.tsx         clientes fechados (stats + grade de cards)
    api/
      simular/route.ts            roda o cálculo e grava Lead + Simulacao no banco
      cliente/
        login/route.ts, logout/route.ts
        producao/route.ts          consulta a SolarZ e devolve os dados da usina do cliente logado
      admin/
        login/route.ts, logout/route.ts, setup/route.ts
        leads/route.ts            lista de leads (GET)
        leads/[id]/route.ts       detalhe (GET) + mudar status (PATCH)
        leads/[id]/solarz/route.ts         busca (GET) e vincula (POST) a usina SolarZ ao lead
        simulacoes/[id]/route.ts           atualiza ajustes comerciais da proposta (PATCH)
        simulacoes/[id]/proposta/route.ts   gera o PDF da proposta completa
  middleware.ts                  protege /admin, /api/admin, /cliente e /api/cliente
  components/
    admin/                       StatusSelect, LogoutButton, StatCard, StatusBarChart, LeadsTable, EditarProposta, ClienteCard, ClientesGrid, VincularSolarZ
    cliente/                     LoginClienteForm, LogoutClienteButton, DashboardProducao, GraficoProducaoDiaria
    ...                          Header, Hero, MiniSimulador, Dor, Diferenciais, Servicos, ComoFunciona, Depoimentos, CTAFinal, Footer, BotaoWhatsApp, SunArc, wizard, cartão de resultado
  lib/
    auth.ts                      sessão JWT do admin (jose)
    auth-cliente.ts               sessão JWT do cliente (jose, cookie/segredo separados do admin)
    solarz.ts                     cliente da API SolarZ (Basic Auth) — usinas, potência, performance, produção diária
    empresa-config.ts             dados institucionais reais da Pazelli + premissas financeiras
    dimensionamento.ts            motor de cálculo técnico — junta tudo abaixo
    geocode.ts                    CEP -> coordenadas (BrasilAPI, com fallback por capital)
    irradiacao.ts                 coordenadas -> HSP (NASA POWER, gratuita, sem chave)
    tarifas.ts                    constantes: cronograma do Fio B, tarifas, performance ratio
    projecaoFinanceira.ts         projeção de 25 anos, TIR, VPL, payback, impacto ambiental
    financiamento.ts              calculadora de financiamento SAC
    pdf/
      proposta.tsx                template completo da proposta em PDF (react-pdf)
      charts.tsx                  gráficos em SVG (barras, linhas)
      visuais.tsx                 onda decorativa + ícones de impacto ambiental
      assets-pazelli.ts           imagens reais da Pazelli em base64
      logo-map.ts                 resolve logoKey -> imagem
    types.ts
scripts/create-admin.mjs        cria/atualiza um usuário admin
prisma/schema.prisma            Lead (+ acesso do cliente e vínculo SolarZ) + Simulacao + AdminUser
```

## Metodologia do dimensionamento técnico

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
5. **Financeiro (simulador rápido)** — economia mensal, investimento
   estimado (via R$/kWp configurável) e payback simples.
6. **Financeiro (proposta em PDF)** — projeção completa de 25 anos com
   inflação da tarifa, degradação dos painéis, comparação com CDB/poupança,
   TIR, VPL, payback em meses e impacto ambiental (ver `projecaoFinanceira.ts`).

⚠️ **Isso é uma ferramenta de estimativa para qualificar leads e montar
propostas comerciais**, não um laudo técnico de engenharia. As premissas
consideradas aparecem no resultado do simulador e podem ser conferidas em
`lib/tarifas.ts` e `lib/empresa-config.ts`.

## O que já existe vs. o que falta

✅ Site institucional com identidade visual real da Pazelli · ✅ Simulador
técnico · ✅ Captura de lead · ✅ Área admin com login, dashboard, busca/filtro
e clientes fechados · ✅ Edição de proposta por negócio · ✅ Proposta em PDF
completa (10 páginas, projeção de 25 anos, TIR/VPL/payback, financiamento) ·
✅ Área do cliente com monitoramento de produção via API da SolarZ

**Ainda não construído:**

- **Configuração da empresa pela área admin** — hoje editado direto em
  `src/lib/empresa-config.ts`. Uma tela de configurações no admin é um bom
  próximo passo quando fizer sentido.
- **Galeria de projetos executados como página própria** — hoje as fotos
  aparecem só na capa da proposta.
- **App mobile** — o backend (`/api/cliente/*`) já foi pensado pra isso
  (aceita token via header, não só cookie), mas o app em si ainda não existe.
- **Fluxo de "esqueci minha senha" self-service para o cliente** — hoje é o
  admin quem define/reseta a senha do cliente na tela de vínculo SolarZ.

## Nota sobre este ambiente de build

Este projeto foi montado e testado num sandbox sem acesso à internet
completa — não foi possível baixar as fontes do Google Fonts nem o binário
de engine do Prisma aqui dentro. O build (`npm run build`) chegou a compilar
com sucesso (TypeScript, JSX, Tailwind, rotas, PDF — tudo validado); o que
falhou foram só essas duas dependências de rede, que funcionam normalmente
na sua máquina e no Vercel.
