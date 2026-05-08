// Crea el usuario ADMIN y las categorías base en la base de datos
// Uso: npm run seed

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const CATEGORIAS = [
  { nombre: "CM", descripcion: "Compuesto Masculino" },
  { nombre: "CW", descripcion: "Compuesto Femenino" },
  { nombre: "BM", descripcion: "Barebow Masculino" },
  { nombre: "BW", descripcion: "Barebow Femenino" },
  { nombre: "LM", descripcion: "Longbow Masculino" },
  { nombre: "LW", descripcion: "Longbow Femenino" },
  { nombre: "TM", descripcion: "Tradicional Masculino" },
  { nombre: "TW", descripcion: "Tradicional Femenino" },
  { nombre: "ESC", descripcion: "Escuela (unisex)" },
  { nombre: "JUN", descripcion: "Junior (unisex)" },
];

async function main() {
  // ── Usuario admin ─────────────────────────────────────────
  const email    = process.env.ADMIN_EMAIL    || "admin@liga3d.com";
  const password = process.env.ADMIN_PASSWORD || "cambiar123";
  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where:  { email },
    update: {},
    create: { email, password: hash, rol: "ADMIN" },
  });

  console.log(`\n✅ Usuario admin listo: ${user.email}`);

  // ── Categorías ────────────────────────────────────────────
  let creadas = 0;
  for (const cat of CATEGORIAS) {
    await prisma.categoria.upsert({
      where:  { nombre: cat.nombre },
      update: {},
      create: { nombre: cat.nombre, descripcion: cat.descripcion, activa: true },
    });
    creadas++;
  }

  console.log(`✅ ${creadas} categorías listas: ${CATEGORIAS.map((c) => c.nombre).join(", ")}`);
  console.log(`\n⚠️  Cambiá la contraseña del admin después del primer login.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
