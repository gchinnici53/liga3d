"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type EstacionInput = {
  numero: number;
  dianaId: number;
  zonaVital: number;
  metros: number;
};

export type GuardarRecorridoResult = { error?: string; guardadas?: number };

export async function guardarRecorrido(
  torneoId: number,
  estaciones: EstacionInput[]
): Promise<GuardarRecorridoResult> {
  const validas = estaciones.filter(
    (e) => e.dianaId && e.zonaVital && e.metros != null && e.metros > 0
  );

  if (validas.length === 0) {
    return { error: "No hay ninguna estación completa para guardar." };
  }

  const dianasUsadas = await prisma.diana.findMany({
    where: { id: { in: Array.from(new Set(validas.map((e) => e.dianaId))) } },
    select: { id: true, cantidadZonas: true },
  });
  const zonasPorDiana = new Map(dianasUsadas.map((d) => [d.id, d.cantidadZonas]));

  for (const e of validas) {
    const maxZonas = zonasPorDiana.get(e.dianaId);
    if (!maxZonas || e.zonaVital < 1 || e.zonaVital > maxZonas) {
      return { error: `La estación ${e.numero} tiene una zona vital inválida para la diana elegida.` };
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
        metros: e.metros,
      })),
    });
  });

  revalidatePath(`/admin/torneos/${torneoId}/recorrido`);
  revalidatePath("/admin/dianas");
  return { guardadas: validas.length };
}
