"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { calcularPuntosTemporada } from "@/lib/scoring";
import type { TipoTorneo } from "@/types/enums";

// Guarda el puntaje de UN arquero apenas se completa, sin depender de que
// el resto de la categoría esté cargada ni de que ya se sepa la posición
// final. Reordena automáticamente por puntaje a todos los que ya tienen
// resultado en la categoría (así la posición se ajusta sola a medida que
// van entrando más puntajes). Si la categoría ya tiene una llave generada,
// no toca las posiciones (ya las define el bracket) — solo guarda el puntaje.
export async function guardarPuntajeParcial(
  torneoId: number,
  categoriaId: number,
  arqueroId: number,
  puntajeRonda1: number,
  puntajeRonda2: number | null,
): Promise<{ error?: string }> {
  if (puntajeRonda1 < 0) return { error: "Puntaje inválido." };

  const torneo = await prisma.torneo.findUnique({ where: { id: torneoId }, select: { tipo: true } });
  if (!torneo) return { error: "Torneo no encontrado." };
  const tipoTorneo = torneo.tipo as TipoTorneo;

  const puntajeTotal = puntajeRonda1 + (puntajeRonda2 ?? 0);

  const tieneLlave = await prisma.eliminatoria.findUnique({
    where: { torneoId_categoriaId: { torneoId, categoriaId } },
    select: { id: true },
  });

  await prisma.$transaction(async (tx) => {
    const existente = await tx.resultado.findUnique({
      where: { arqueroId_torneoId: { arqueroId, torneoId } },
    });

    if (existente) {
      await tx.resultado.update({
        where: { id: existente.id },
        data: { categoriaId, puntajeRonda1, puntajeRonda2, puntajeTotal },
      });
    } else {
      await tx.resultado.create({
        data: {
          arqueroId, torneoId, categoriaId,
          puntajeRonda1, puntajeRonda2, puntajeTotal,
          // Posición provisoria al fondo de la tabla: se recalcula abajo por
          // puntaje. Si la categoría ya tiene llave, el recálculo se salta y
          // esto queda así hasta que se ordene a mano — por eso no usamos 1,
          // para no mostrar a alguien nuevo como si fuera el 1° puesto.
          posicion: 9999, puntosTemporada: 0, esMedallista: false,
        },
      });
    }

    // Si ya hay bracket para esta categoría, las posiciones 1-4 las define
    // la llave (ver /llaves) — no las pisamos acá, solo se guardó el puntaje.
    if (tieneLlave) return;

    const todos = await tx.resultado.findMany({
      where: { torneoId, categoriaId },
      orderBy: { puntajeTotal: "desc" },
    });
    for (let i = 0; i < todos.length; i++) {
      const posicion = i + 1;
      const puntosTemporada = calcularPuntosTemporada(posicion, tipoTorneo);
      if (todos[i].posicion !== posicion || todos[i].puntosTemporada !== puntosTemporada) {
        await tx.resultado.update({
          where: { id: todos[i].id },
          data: { posicion, esMedallista: posicion <= 4, puntosTemporada },
        });
      }
    }
  });

  revalidatePath(`/admin/torneos/${torneoId}`);
  revalidatePath(`/admin/torneos/${torneoId}/cargar`);
  return {};
}

export type FilaManual = {
  arqueroId: number;
  posicion: number;
  puntajeRonda1: number;
  puntajeRonda2: number | null;
};

export type GuardarResult = {
  creados: number;
  actualizados: number;
  errores: string[];
};

export async function guardarResultadosManual(
  filas: FilaManual[],
  torneoId: number,
  categoriaId: number,
): Promise<GuardarResult> {
  const torneo = await prisma.torneo.findUnique({
    where: { id: torneoId },
    select: { tipo: true },
  });
  if (!torneo) return { creados: 0, actualizados: 0, errores: ["Torneo no encontrado"] };

  const tipoTorneo = torneo.tipo as TipoTorneo;
  let creados = 0;
  let actualizados = 0;
  const errores: string[] = [];

  for (const fila of filas) {
    if (fila.posicion < 1 || fila.puntajeRonda1 < 0) {
      errores.push(`Fila inválida: arquero ${fila.arqueroId}`);
      continue;
    }

    const puntajeTotal    = fila.puntajeRonda1 + (fila.puntajeRonda2 ?? 0);
    const puntosTemporada = calcularPuntosTemporada(fila.posicion, tipoTorneo);
    const esMedallista    = fila.posicion <= 4;

    try {
      const existe = await prisma.resultado.findUnique({
        where: { arqueroId_torneoId: { arqueroId: fila.arqueroId, torneoId } },
      });

      if (existe) {
        await prisma.resultado.update({
          where: { id: existe.id },
          data: {
            categoriaId,
            puntajeRonda1: fila.puntajeRonda1,
            puntajeRonda2: fila.puntajeRonda2,
            puntajeTotal,
            posicion: fila.posicion,
            esMedallista,
            puntosTemporada,
          },
        });
        actualizados++;
      } else {
        await prisma.resultado.create({
          data: {
            arqueroId: fila.arqueroId,
            torneoId,
            categoriaId,
            puntajeRonda1: fila.puntajeRonda1,
            puntajeRonda2: fila.puntajeRonda2,
            puntajeTotal,
            posicion: fila.posicion,
            esMedallista,
            puntosTemporada,
          },
        });
        creados++;
      }
    } catch {
      errores.push(`Error al guardar arquero ID ${fila.arqueroId}`);
    }
  }

  revalidatePath(`/admin/torneos/${torneoId}`);
  revalidatePath(`/resultados/${torneoId}`);
  return { creados, actualizados, errores };
}
