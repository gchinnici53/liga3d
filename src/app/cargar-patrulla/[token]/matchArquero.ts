import { prisma } from "@/lib/prisma";

// Misma lógica de matching que usa /admin/torneos/[id]/cargar: primero por
// DNI exacto, si no por apellido+nombre (case-insensitive, en JS porque
// SQLite no soporta comparación insensible a mayúsculas de forma nativa).
export async function matchArquero(insc: { dni: string | null; apellido: string; nombre: string }) {
  if (insc.dni) {
    const porDni = await prisma.arquero.findUnique({ where: { dni: insc.dni.trim() } });
    if (porDni) return porDni;
  }

  const candidatos = await prisma.arquero.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, apellido: true, dni: true },
  });
  const key = `${insc.apellido.toLowerCase().trim()}|${insc.nombre.toLowerCase().trim()}`;
  return candidatos.find((a) => `${a.apellido.toLowerCase().trim()}|${a.nombre.toLowerCase().trim()}` === key) ?? null;
}
