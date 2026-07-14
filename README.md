# Plataforma Solar — MVP

Site institucional + simulador técnico de dimensionamento fotovoltaico +
captura de lead. Primeira fase de uma plataforma nos moldes da Luvik,
construída sob medida.

Stack: Next.js 14 (App Router) · TypeScript · Prisma · PostgreSQL · Tailwind ·
Vercel — o mesmo stack do Maison Lux.

## Como rodar localmente

```bash
npm install                 # também roda `prisma generate` (precisa de internet)
cp .env.example .env        # preencha DATABASE_URL e os dados da empresa
npx prisma db push          # cria as tabelas no banco (dev) — use `migrate dev` em produção
npm run dev
```

Abra http://localhost:3000. O simulador fica em `/simulador`.

## Estrutura

```
src/
  app/
    page.tsx                site institucional (hero + como funciona + diferenciais)
    simulador/page.tsx       wizard de simulação (2 passos + resultado)
    api/simular/route.ts     roda o cálculo e grava Lead + Simulacao no banco
  components/                 UI (Hero, SunArc, wizard, cartão de resultado...)
  lib/
    dimensionamento.ts        motor de cálculo — junta tudo abaixo
    geocode.ts                 CEP -> coordenadas (BrasilAPI, com fallback por capital)
    irradiacao.ts               coordenadas -> HSP (NASA POWER, gratuita, sem chave)
    tarifas.ts                   constantes: cronograma do Fio B, tarifas, performance ratio
    types.ts
prisma/schema.prisma          Lead + Simulacao (já pronta para virar CRM na área admin)
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

## O que falta para o próximo escopo (área cliente / admin / PDF)

- **Área admin**: autenticação (o Maison Lux já usa Jose/JWT — dá pra
  reaproveitar), listagem de leads com filtro por status, edição manual da
  tarifa/custo por kWp por empresa.
- **Área do cliente**: login por e-mail, histórico das próprias simulações.
- **Proposta em PDF**: `Simulacao` já guarda todos os campos necessários —
  falta só o template (`@react-pdf/renderer` ou puppeteer) e um botão
  "gerar proposta" na área admin.

## Nota sobre este ambiente de build

Este projeto foi montado e testado num sandbox sem acesso à internet
completa — não foi possível baixar as fontes do Google Fonts nem o binário
de engine do Prisma aqui dentro. O build (`npm run build`) chegou a compilar
com sucesso (TypeScript, JSX, Tailwind, rotas — tudo validado); o que falhou
foram só essas duas dependências de rede, que funcionam normalmente na sua
máquina e no Vercel.
