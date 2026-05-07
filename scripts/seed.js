// Crea el primer usuario ADMIN en la base de datos
// Uso: npm run seed
// Env vars opcionales: ADMIN_EMAIL, ADMIN_PASSWORD

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email    = process.env.ADMIN_EMAIL    || "admin@liga3d.com";
  const password = process.env.ADMIN_PASSWORD || "cambiar123";

  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where:  { email },
    update: {},
    create: { email, password: hash, rol: "ADMIN" },
  });

  console.log(`\n✅ Usuario admin listo:`);
  console.log(`   Email:      ${user.email}`);
  console.log(`   Contraseña: ${password}`);
  console.log(`\n⚠️  Cambiá la contraseña después del primer login.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
