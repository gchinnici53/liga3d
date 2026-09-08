"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { generarBracket, registrarGanador, isBracketComplete, posicionesFinales } from "@/lib/bracket";
import type { BracketData, Contendiente } from "@/lib/bracket";
import { calcularPuntosTemporada } from "@/lib/scoring";
import type { TipoTorneo } from "@/types/enums";

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

// Aplica las posiciones 1-4 (según la llave) y recalcula 5+ (según puntaje)
// para el resto de la categoría, incluyendo los puntos de temporada. Se usa
// tanto al completar la llave como para recalcular manualmente si algo quedó
// inconsistente. Corre dentro de la transacción que le pasa el caller.
async function aplicarPosicionesDeLlave(
  tx: Prisma.TransactionClient,
  torneoId: number,
  categoriaId: number,
  bracket: BracketData
): Promise<void> {
  const torneo = await tx.torneo.findUnique({ where: { id: torneoId }, select: { tipo: true } });
  const tipoTorneo = (torneo?.tipo ?? "REGULAR") as TipoTorneo;

  const posiciones = posicionesFinales(bracket);
  const medallistaIds = Array.from(posiciones.keys());

  for (const entry of Array.from(posiciones.entries())) {
    const [arqueroId, posicion] = entry;
    const puntosTemporada = calcularPuntosTemporada(posicion, tipoTorneo);
    await tx.resultado.updateMany({
      where: { arqueroId, torneoId },
      data:  { posicion, esMedallista: posicion <= 4, puntosTemporada },
    });
  }

  const resto = await tx.resultado.findMany({
    where: { torneoId, categoriaId, arqueroId: { notIn: medallistaIds } },
    orderBy: { puntajeTotal: "desc" },
  });
  for (let i = 0; i < resto.length; i++) {
    const posicion = 5 + i;
    await tx.resultado.update({
      where: { id: resto[i].id },
      data:  { posicion, esMedallista: false, puntosTemporada: calcularPuntosTemporada(posicion, tipoTorneo) },
    });
  }
}

export async function registrarResultadoPartido(
  eliminatoriaId: number,
  torneoId: number,
  matchId: string,
  ganadorId: number
): Promise<{ error?: string }> {
  // Todo el ciclo lectura→cálculo→escritura corre en una transacción para
  // evitar carreras si dos partidos se cargan casi al mismo tiempo (dos
  // personas cargando resultados a la vez): sin esto, una request podía leer
  // el bracket antes de que la otra terminara de escribirlo y pisar su
  // resultado, dejando posiciones/puntos inconsistentes.
  await prisma.$transaction(async (tx) => {
    const elim = await tx.eliminatoria.findUnique({ where: { id: eliminatoriaId } });
    if (!elim) return;

    const bracket = JSON.parse(elim.llave) as BracketData;
    const updated = registrarGanador(bracket, matchId, ganadorId);

    await tx.eliminatoria.update({
      where: { id: eliminatoriaId },
      data:  { llave: JSON.stringify(updated) },
    });

    // Si el bracket está completo, actualizar posiciones 1-4 en Resultado
    // y recalcular el resto (5° en adelante) por puntaje, para que no queden
    // posiciones duplicadas con quienes ya definió la llave.
    if (isBracketComplete(updated)) {
      await aplicarPosicionesDeLlave(tx, torneoId, elim.categoriaId, updated);
    }
  });

  revalidatePath(`/admin/torneos/${torneoId}/llaves`);
  revalidatePath(`/llaves/${torneoId}`);
  return {};
}

// Recalcula posiciones 1-4 (según la llave) y 5+ (según puntaje) para una
// categoría con llave completa. Sirve para corregir datos que quedaron
// inconsistentes (ej. por una carrera entre dos cargas simultáneas) sin
// tener que volver a tocar los partidos del bracket.
export async function recalcularPosiciones(
  torneoId: number,
  categoriaId: number
): Promise<{ error?: string }> {
  const elim = await prisma.eliminatoria.findUnique({ where: { torneoId_categoriaId: { torneoId, categoriaId } } });
  if (!elim) return { error: "Esta categoría no tiene llave generada." };

  const bracket = JSON.parse(elim.llave) as BracketData;
  if (!isBracketComplete(bracket)) return { error: "La llave todavía no está completa (falta la final o el bronce)." };

  await prisma.$transaction(async (tx) => {
    await aplicarPosicionesDeLlave(tx, torneoId, categoriaId, bracket);
  });

  revalidatePath(`/admin/torneos/${torneoId}`);
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
