"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const CATEGORIA_ORDER = ["CW", "CM", "ESC", "JUN", "BW", "BM", "TW", "TM", "LW", "LM"];

const ESTACA: Record<string, string> = {
  CW: "ROJA",     CM: "ROJA",
  ESC: "AMARILLA", JUN: "AMARILLA",
  BW: "AZUL",     BM: "AZUL",
  TW: "AZUL",     TM: "AZUL",
  LW: "AZUL",     LM: "AZUL",
};

const POSICIONES = ["A", "B", "C", "D"] as const;

// Patrullas bis en posiciones múltiplo de 3 para agilizar la largada
const BIS_NUMEROS = [3, 6, 9, 12, 15, 18, 21, 24];

export async function generarPatrullas(torneoId: number): Promise<{ error?: string }> {
  const inscripciones = await prisma.inscripcion.findMany({
    where: { torneoId },
  });

  if (inscripciones.length === 0) return { error: "No hay inscriptos para generar patrullas." };

  // Ordenar por categoría según el orden de la liga
  const sorted = [...inscripciones].sort((a, b) => {
    const ai = CATEGORIA_ORDER.indexOf(a.categoria);
    const bi = CATEGORIA_ORDER.indexOf(b.categoria);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  // Agrupar en bloques de 4. Los archers ya están ordenados por categoría,
  // así que cada grupo queda naturalmente dentro de la misma estaca.
  // No se corta por cambio de estaca para evitar grupos parciales que
  // desbordarían el máximo de 32 patrullas (24 + 8 bis).
  type Item = { id: number; estaca: string };
  const grupos: { ids: number[]; estaca: string }[] = [];
  let current: Item[] = [];

  for (const insc of sorted) {
    current.push({ id: insc.id, estaca: ESTACA[insc.categoria] ?? "AZUL" });
    if (current.length === 4) {
      // Estaca del grupo = la más frecuente entre sus miembros
      const freq = current.reduce<Record<string, number>>((acc, m) => {
        acc[m.estaca] = (acc[m.estaca] ?? 0) + 1;
        return acc;
      }, {});
      const estacaGrupo = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
      grupos.push({ ids: current.map((m) => m.id), estaca: estacaGrupo });
      current = [];
    }
  }
  if (current.length > 0) {
    const freq = current.reduce<Record<string, number>>((acc, m) => {
      acc[m.estaca] = (acc[m.estaca] ?? 0) + 1;
      return acc;
    }, {});
    const estacaGrupo = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    grupos.push({ ids: current.map((m) => m.id), estaca: estacaGrupo });
  }

  if (grupos.length > 32) {
    return { error: `Se requieren ${grupos.length} patrullas pero el máximo es 32 (128 inscriptos).` };
  }

  // Eliminar patrullas existentes y recrear
  await prisma.patrulla.deleteMany({ where: { torneoId } });

  for (let i = 0; i < grupos.length; i++) {
    const grupo = grupos[i];
    const bis    = i >= 24;
    const numero = bis ? BIS_NUMEROS[i - 24] : i + 1;

    await prisma.patrulla.create({
      data: {
        torneoId,
        numero,
        bis,
        estaca: grupo.estaca,
        miembros: {
          create: grupo.ids.map((inscripcionId, j) => ({
            inscripcionId,
            posicion: POSICIONES[j],
          })),
        },
      },
    });
  }

  revalidatePath(`/admin/torneos/${torneoId}/patrullas`);
  return {};
}

export async function moverMiembro(
  miembroId: number,
  targetPatrullaId: number,
  targetPosicion: string,
  torneoId: number,
): Promise<{ error?: string }> {
  const origen = await prisma.miembroPatrulla.findUnique({ where: { id: miembroId } });
  if (!origen) return { error: "Miembro no encontrado." };

  // Ver si la posición destino está ocupada
  const destino = await prisma.miembroPatrulla.findFirst({
    where: { patrullaId: targetPatrullaId, posicion: targetPosicion },
  });

  if (destino) {
    // Intercambio: mover los dos
    await prisma.$transaction([
      prisma.miembroPatrulla.update({
        where: { id: miembroId },
        data: { patrullaId: targetPatrullaId, posicion: targetPosicion },
      }),
      prisma.miembroPatrulla.update({
        where: { id: destino.id },
        data: { patrullaId: origen.patrullaId, posicion: origen.posicion },
      }),
    ]);
  } else {
    // Solo mover
    await prisma.miembroPatrulla.update({
      where: { id: miembroId },
      data: { patrullaId: targetPatrullaId, posicion: targetPosicion },
    });
  }

  revalidatePath(`/admin/torneos/${torneoId}/patrullas`);
  return {};
}
