"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { calcularPuntosTemporada } from "@/lib/scoring";
import type { TipoTorneo } from "@/types/enums";

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
