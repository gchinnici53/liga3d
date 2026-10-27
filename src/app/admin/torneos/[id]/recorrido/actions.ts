"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type EstacionInput = {
  numero: number;
  dianaId: number;
  zonaVital: number;
  cantidadUsada: number;
  metros: number;
};

export type GuardarRecorridoResult = { error?: string; guardadas?: number; advertencias?: string[] };

export async function guardarRecorrido(
  torneoId: number,
  estaciones: EstacionInput[]
): Promise<GuardarRecorridoResult> {
  const validas = estaciones.filter(
    (e) => e.dianaId && e.zonaVital && e.metros != null && e.metros > 0 && e.cantidadUsada > 0
  );

  if (validas.length === 0) {
    return { error: "No hay ninguna estación completa para guardar." };
  }

  const dianasUsadas = await prisma.diana.findMany({
    where: { id: { in: Array.from(new Set(validas.map((e) => e.dianaId))) } },
    select: { id: true, nombre: true, cantidadZonas: true, cantidad: true },
  });
  const dianasPorId = new Map(dianasUsadas.map((d) => [d.id, d]));

  for (const e of validas) {
    const diana = dianasPorId.get(e.dianaId);
    if (!diana || e.zonaVital < 1 || e.zonaVital > diana.cantidadZonas) {
      return { error: `La estación ${e.numero} tiene una zona vital inválida para la diana elegida.` };
    }
  }

  // Advertencia (no bloqueante) si se asignaron más dianas de un tipo que las que hay en inventario.
  const usadasPorDiana = new Map<number, number>();
  for (const e of validas) {
    usadasPorDiana.set(e.dianaId, (usadasPorDiana.get(e.dianaId) ?? 0) + e.cantidadUsada);
  }
  const advertencias: string[] = [];
  for (const [dianaId, usadas] of Array.from(usadasPorDiana.entries())) {
    const diana = dianasPorId.get(dianaId);
    if (diana && usadas > diana.cantidad) {
      advertencias.push(`"${diana.nombre}": usaste ${usadas} pero el inventario tiene ${diana.cantidad}.`);
    }
  }

  await prisma.$transaction(async (tx) => {
    const recorrido = await tx.recorrido.upsert({
      where: { torneoId },
      create: { torneoId },
      update: {},
    });

    await tx.recorridoEstacion.deleteMany({ where: { recorridoId: recorrido.id } });
    await tx.recorridoEstacion.createMany({
      data: validas.map((e) => ({
        recorridoId: recorrido.id,
        numero: e.numero,
        dianaId: e.dianaId,
        zonaVital: e.zonaVital,
        cantidadUsada: e.cantidadUsada,
        metros: e.metros,
      })),
    });
  });

  revalidatePath(`/admin/torneos/${torneoId}/recorrido`);
  revalidatePath("/admin/dianas");
  return { guardadas: validas.length, advertencias: advertencias.length > 0 ? advertencias : undefined };
}
