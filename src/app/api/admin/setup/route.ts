import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Rota de configuração inicial, pensada para quem não tem um terminal à mão.
// Protegida pelo ADMIN_SETUP_SECRET (diferente do ADMIN_JWT_SECRET) — depois
// de criar o primeiro admin, o ideal é apagar essa variável de ambiente (ou
// trocar o valor dela) pra desativar essa rota.
export async function GET(request: Request) {
  const segredoConfigurado = process.env.ADMIN_SETUP_SECRET;
  if (!segredoConfigurado) {
    return NextResponse.json(
      { erro: "ADMIN_SETUP_SECRET não está configurado — essa rota está desativada." },
      { status: 404 }
    );
  }

  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const email = url.searchParams.get("email");
  const senha = url.searchParams.get("senha");
  const nome = url.searchParams.get("nome");

  if (secret !== segredoConfigurado) {
    return NextResponse.json({ erro: "Segredo incorreto." }, { status: 401 });
  }

  if (!email || !senha || !nome) {
    return NextResponse.json(
      { erro: "Informe email, senha e nome como parâmetros na URL." },
      { status: 400 }
    );
  }

  if (senha.length < 8) {
    return NextResponse.json({ erro: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
  }

  const senhaHash = await bcrypt.hash(senha, 12);
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { senhaHash, nome },
    create: { email, senhaHash, nome },
  });

  return NextResponse.json({
    ok: true,
    mensagem: `Admin "${admin.nome}" (${admin.email}) criado/atualizado. Agora apague ou troque o ADMIN_SETUP_SECRET.`,
  });
}
