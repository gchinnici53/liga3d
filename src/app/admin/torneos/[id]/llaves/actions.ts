"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generarBracket, registrarGanador, isBracketComplete, posicionesFinales } from "@/lib/bracket";
import type { BracketData, Contendiente } from "@/lib/bracket";

// Mínimo de clasificados requerido por tamaño de llave.
// Tamano 8 admite bye: con 5, 6 o 7 clasificados los seeds faltantes pasan directo.
const MINIMO_POR_TAMANO: Record<number, number> = { 4: 4, 8: 5, 16: 16, 24: 24 };

export async function generarEliminatoria(
  torneoId: number,
  categoriaId: number,
  tamano: 4 | 8 | 16 | 24
): Promise<{ error?: string }> {
  // Obtener resultados de clasificación ordenados por posición
  const resultados = await prisma.resultado.findMany({
    where: { torneoId, categoriaId },
    include: { arquero: { select: { id: true, nombre: true, apellido: true } } },
    orderBy: { posicion: "asc" },
    take: tamano,
  });

  const minimo = MINIMO_POR_TAMANO[tamano] ?? tamano;
  if (resultados.length < minimo) {
    return { error: `Se necesitan al menos ${minimo} resultados en esta categoría (hay ${resultados.length})` };
  }

  const seedings: Contendiente[] = resultados.map((r, idx) => ({
    arqueroId: r.arqueroId,
    seed:      idx + 1,
    nombre:    r.arquero.nombre,
    apellido:  r.arquero.apellido,
  }));

  const bracket = generarBracket(tamano, seedings);

  await prisma.eliminatoria.upsert({
    where:  { torneoId_categoriaId: { torneoId, categoriaId } },
    create: { torneoId, categoriaId, tamano, llave: JSON.stringify(bracket) },
    update: { tamano, llave: JSON.stringify(bracket) },
  });

  revalidatePath(`/admin/torneos/${torneoId}/llaves`);
  revalidatePath(`/llaves/${torneoId}`);
  return {};
}

export async function registrarResultadoPartido(
  eliminatoriaId: number,
  torneoId: number,
  matchId: string,
  ganadorId: number
): Promise<{ error?: string }> {
  const elim = await prisma.eliminatoria.findUnique({ where: { id: eliminatoriaId } });
  if (!elim) return { error: "Eliminatoria no encontrada" };

  const bracket = JSON.parse(elim.llave) as BracketData;
  const updated = registrarGanador(bracket, matchId, ganadorId);

  await prisma.eliminatoria.update({
    where: { id: eliminatoriaId },
    data:  { llave: JSON.stringify(updated) },
  });

  // Si el bracket está completo, actualizar posiciones 1-4 en Resultado
  // y recalcular el resto (5° en adelante) por puntaje, para que no queden
  // posiciones duplicadas con quienes ya definió la llave.
  if (isBracketComplete(updated)) {
    const posiciones = posicionesFinales(updated);
    const medallistaIds = Array.from(posiciones.keys());

    for (const entry of Array.from(posiciones.entries())) {
      const [arqueroId, posicion] = entry;
      await prisma.resultado.updateMany({
        where: { arqueroId, torneoId },
        data:  { posicion, esMedallista: posicion <= 4 },
      });
    }

    const resto = await prisma.resultado.findMany({
      where: { torneoId, categoriaId: elim.categoriaId, arqueroId: { notIn: medallistaIds } },
      orderBy: { puntajeTotal: "desc" },
    });
    for (let i = 0; i < resto.length; i++) {
      await prisma.resultado.update({
        where: { id: resto[i].id },
        data:  { posicion: 5 + i, esMedallista: false },
      });
    }
  }

  revalidatePath(`/admin/torneos/${torneoId}/llaves`);
  revalidatePath(`/llaves/${torneoId}`);
  return {};
}

export async function eliminarEliminatoria(
  torneoId: number,
  categoriaId: number
): Promise<void> {
  await prisma.eliminatoria.deleteMany({ where: { torneoId, categoriaId } });
  revalidatePath(`/admin/torneos/${torneoId}/llaves`);
  revalidatePath(`/llaves/${torneoId}`);
}
