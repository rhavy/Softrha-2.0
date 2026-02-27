import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Corrigindo dados antigos no banco de dados...");

  // Usar SQL raw para atualizar dados antigos
  const result1 = await prisma.$executeRawUnsafe(`
    UPDATE users SET role = 'USER' WHERE role = 'CLIENT' OR role = 'client'
  `);

  console.log(`✅ ${result1} registros 'CLIENT' atualizados para 'USER'`);

  const result2 = await prisma.$executeRawUnsafe(`
    UPDATE users SET role = 'ADMIN' WHERE role = 'admin'
  `);

  console.log(`✅ ${result2} registros 'admin' atualizados para 'ADMIN'`);

  const result3 = await prisma.$executeRawUnsafe(`
    UPDATE users SET role = 'USER' WHERE role = 'user'
  `);

  console.log(`✅ ${result3} registros 'user' atualizados para 'USER'`);

  console.log("\n✨ Dados corrigidos com sucesso!");
  console.log("🔄 Reinicie o Prisma Studio para ver as alterações.");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
