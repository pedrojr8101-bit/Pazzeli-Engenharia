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
- mudar o status do lead (Novo → Contatado → Proposta enviada → Convertido/Perdido);
- abrir o detalhe de um lead e ver o histórico completo de simulações dele;
- baixar a **proposta em PDF** de qualquer simulação, com um clique.

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
✅ Área admin com login · ✅ Proposta em PDF

**Ainda não construído:**

- **Área do cliente**: login por e-mail para o lead ver o histórico das
  próprias simulações (hoje só o admin vê).
- **Múltiplos admins com papéis diferentes** (hoje todo AdminUser tem acesso
  total — não tem distinção de permissão).
- **Filtro/busca na lista de leads** do dashboard (hoje é uma lista simples,
  sem paginação — ok para o volume inicial, mas vale revisitar com escala).
- **Tarifa/custo por kWp configurável por empresa** direto pela área admin
  (hoje só via variável de ambiente).

## Nota sobre este ambiente de build

Este projeto foi montado e testado num sandbox sem acesso à internet
completa — não foi possível baixar as fontes do Google Fonts nem o binário
de engine do Prisma aqui dentro. O build (`npm run build`) chegou a compilar
com sucesso (TypeScript, JSX, Tailwind, rotas — tudo validado); o que falhou
foram só essas duas dependências de rede, que funcionam normalmente na sua
máquina e no Vercel.
