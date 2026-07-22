# Antes de tudo: limpar os arquivos soltos que estão quebrando o build

Seu repositório tem ~46 arquivos duplicados na raiz (fora da pasta `src/`),
sobrando de uploads antigos que não preservaram a estrutura de pastas. Seu
`tsconfig.json` manda compilar TODO `.ts`/`.tsx` do projeto — inclusive
esses arquivos soltos, que não são usados por nada mas têm conteúdo
corrompido. É isso que derruba o build, às vezes num arquivo, às vezes
noutro, de forma meio aleatória.

**No GitHub, na raiz do repositório, apague estes arquivos** (use o menu
"..." de cada arquivo → Delete file, ou selecione vários com o checkbox se
sua conta já tem essa opção):

```
BotaoWhatsApp.tsx
CTAFinal.tsx
ClienteCard.tsx
ClientesGrid.tsx
ComoFunciona.tsx
Depoimentos.tsx
Diferenciais.tsx
Dor.tsx
EditarProposta.tsx
Footer.tsx
Header.tsx
Hero.tsx
LeadsTable.tsx
LoginForm.tsx
LogoutButton.tsx
LogoutClienteButton.tsx
MiniSimulador.tsx
ResultadoCard.tsx
Servicos.tsx
SimuladorWizard.tsx
StatCard.tsx
StatusSelect.tsx
SunArc.tsx
VincularSolarZ.tsx
assets-pazelli.ts
empresa-config.ts
geocode.ts
layout.tsx
logo-map.ts
middleware.ts
page (1).tsx
page (19).tsx
page (2).tsx
page (20).tsx
page (3).tsx
page (4).tsx
page.tsx
prisma.ts
proposta-calculo.ts
proposta.tsx
route (11).ts
route (14).ts
route (17).ts
route (9).ts
route.ts
solarz.ts
tarifas.ts
lib/pricing.ts   ← esse eu mandei errado numa mensagem anterior, seguindo
                    pra pasta errada. Pode apagar sem medo, é órfão.
```

**NÃO apague** `tailwind.config.ts` na raiz — esse é de verdade e faz parte
do projeto.

Depois de apagar, o `src/` continua com todo o código de verdade intacto —
essa limpeza não tira nenhuma funcionalidade, só remove lixo.

---

# O que tem neste pacote

Todos os arquivos abaixo já vêm com o caminho certo (`src/...`,
`prisma/...`) — ao subir pro GitHub, mantenha essa estrutura de pastas
exatamente como está no zip.

**Arquivos NOVOS:**
- `src/components/admin/DadosAdicionaisLead.tsx`
- `src/components/admin/BarraComparativa.tsx`
- `src/components/admin/GerenciarChamados.tsx`
- `src/app/admin/(protegido)/chamados/page.tsx`
- `src/app/api/admin/chamados/route.ts`
- `src/app/api/admin/chamados/[id]/route.ts`
- `src/app/api/cliente/chamados/route.ts`
- `src/components/cliente/PainelPosVenda.tsx`
- `src/components/cliente/InfoEmpresaCard.tsx`
- `src/components/cliente/ContratoCard.tsx`

**Arquivos MODIFICADOS** (sobrescrevem os que já existem no mesmo caminho):
- `prisma/schema.prisma`
- `src/components/admin/EditarProposta.tsx`
- `src/app/api/admin/simulacoes/[id]/route.ts`
- `src/app/api/admin/leads/[id]/route.ts`
- `src/app/admin/(protegido)/leads/[id]/page.tsx`
- `src/app/admin/(protegido)/page.tsx`
- `src/app/admin/(protegido)/layout.tsx`
- `src/app/cliente/(protegido)/page.tsx`

## Como subir (sem terminal)

1. No GitHub, vá em **Add file → Upload files**.
2. Arraste a pasta `src` inteira (e a pasta `prisma`) de dentro deste zip
   extraído — o GitHub preserva a estrutura de subpastas quando você
   arrasta pastas (não arquivos soltos).
3. Commit direto na `main`.
4. O Vercel builda automaticamente. Como o comando de build do projeto já
   roda `prisma db push` antes do `next build`, os campos novos do banco
   (`tipoImovel`, `contratoUrl`, `valorServico`, tabela `Chamado`) são
   criados sozinhos no Neon — não precisa mexer no banco manualmente.

Se o GitHub achatar a estrutura de novo (acontece se você arrastar os
arquivos de dentro das pastas em vez das pastas em si), suba pasta por
pasta: abra `Add file → Upload files`, entre na URL
`.../new/main/src/components/admin` e solte só os arquivos daquela pasta,
repetindo para cada pasta do pacote.

---

# O que cada coisa faz

## Dashboard do admin (`/admin`)
Duas linhas novas de indicadores: **material vendido**, **taxa de serviço
vendida**, **faturamento pós-venda** e **chamados em aberto** (com atalho
pra tela de chamados). Dois gráficos novos: **tipo de telhado mais vendido**
e **residencial x comercial** — ambos calculados só em cima de negócios com
status **Convertido**, pra refletir venda de verdade e não só simulação.

## Ficha do lead (`/admin/leads/[id]`)
- Em "Editar proposta" agora tem um campo de **taxa de serviço** separado
  do custo de material.
- Novo card "Imóvel e contrato": marcar residencial/comercial e colar o
  link do contrato assinado (ex: PDF no Google Drive com compartilhamento
  público — o projeto ainda não tem upload de arquivo próprio, então por
  ora é link).

## Chamados (`/admin/chamados`, novo)
Lista todos os chamados abertos pelos clientes, com filtro por status.
Pra cada um dá pra mudar o status e preencher o **valor cobrado** — esse
valor é o que soma no card "Faturamento pós-venda" do dashboard.

## Área do cliente (`/cliente`)
Além do dashboard de produção que já existia, agora tem:
- Card com os dados da empresa (endereço, WhatsApp, e-mail).
- Card do contrato (mostra o link se o admin já cadastrou, senão oferece
  botão de WhatsApp pra pedir).
- Painel "Limpeza, manutenção ou suporte": o cliente escolhe o tipo, escreve
  o que precisa e acompanha o status dos chamados que já abriu.

---

# Observação sobre o link do provedor

Você pediu um link pra levar o cliente até o site do provedor (SolarZ) pra
ver a produção. Reparei que vocês já foram além disso: o dashboard do
cliente já busca os dados **direto da API da SolarZ** e mostra tudo embutido
na própria área do cliente (potência, geração diária, gráfico) — não
depende de sair pro site externo. Por isso não adicionei um link solto pra
lá; se ainda assim você quiser um atalho "ver no site da SolarZ" como
opção extra, é rápido de adicionar, é só pedir.
