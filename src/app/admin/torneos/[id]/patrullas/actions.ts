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

  // Agrupar en bloques de 4 respetando el límite de estaca
  const grupos: { ids: number[]; estaca: string }[] = [];
  let current: number[] = [];
  let currentEstaca = "";

  for (const insc of sorted) {
    const estaca = ESTACA[insc.categoria] ?? "AZUL";

    // Si se llena la patrulla O cambia la estaca → cerrar el grupo actual
    if (current.length === 4 || (currentEstaca !== "" && estaca !== currentEstaca)) {
      if (current.length > 0) grupos.push({ ids: current, estaca: currentEstaca });
      current = [];
    }

    current.push(insc.id);
    currentEstaca = estaca;
  }
  if (current.length > 0) grupos.push({ ids: current, estaca: currentEstaca });

  // Eliminar patrullas existentes y recrear
  await prisma.patrulla.deleteMany({ where: { torneoId } });

  for (let i = 0; i < grupos.length; i++) {
    const grupo = grupos[i];
    const numero = (i % 24) + 1;
    const bis    = i >= 24;

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
