// Cria (ou atualiza a senha de) um usuário admin.
// Uso:  node scripts/create-admin.mjs "email@empresa.com" "senha-forte" "Nome do admin"
//
// Precisa do DATABASE_URL disponível no ambiente (ex: rode com o .env
// carregado, ou exporte a variável antes de chamar o script).

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [, , email, senha, nome] = process.argv;

if (!email || !senha || !nome) {
  console.error('Uso: node scripts/create-admin.mjs "email@empresa.com" "senha-forte" "Nome"');
  process.exit(1);
}

if (senha.length < 8) {
  console.error("A senha precisa ter pelo menos 8 caracteres.");
  process.exit(1);
}

const prisma = new PrismaClient();

const senhaHash = await bcrypt.hash(senha, 12);

const admin = await prisma.adminUser.upsert({
  where: { email },
  update: { senhaHash, nome },
  create: { email, senhaHash, nome },
});

console.log(`Pronto — admin "${admin.nome}" (${admin.email}) criado/atualizado.`);
await prisma.$disconnect();
