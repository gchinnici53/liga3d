"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type InscripcionState = { error?: string; exito?: boolean };

export async function inscribirse(
  torneoId: number,
  _prev: InscripcionState,
  formData: FormData
): Promise<InscripcionState> {
  const nombre    = (formData.get("nombre") as string).trim();
  const apellido  = (formData.get("apellido") as string).trim();
  const email     = (formData.get("email") as string).trim().toLowerCase();
  const telefono  = (formData.get("telefono") as string | null)?.trim() || null;
  const categoria = (formData.get("categoria") as string).trim();
  const club      = (formData.get("club") as string | null)?.trim() || null;

  if (!nombre || !apellido || !email || !categoria) {
    return { error: "Completá todos los campos obligatorios." };
  }

  const torneo = await prisma.torneo.findUnique({
    where: { id: torneoId },
    include: { _count: { select: { inscripciones: true } } },
  });
  if (!torneo) return { error: "Torneo no encontrado." };

  const ahora = new Date();
  const fechaTorneo = new Date(torneo.fecha);

  // Torneo ya pasó
  if (ahora > fechaTorneo) return { error: "Las inscripciones están cerradas." };

  // Lunes anterior al torneo
  const lunesAnterior = new Date(fechaTorneo);
  lunesAnterior.setDate(fechaTorneo.getDate() - ((fechaTorneo.getDay() + 6) % 7));
  lunesAnterior.setHours(23, 59, 59, 999);
  if (ahora > lunesAnterior) return { error: "Las inscripciones cerraron el lunes anterior al torneo." };

  // Cupo lleno
  if (torneo._count.inscripciones >= torneo.maxInscriptos) {
    return { error: "El torneo ya alcanzó el cupo máximo de inscriptos." };
  }

  try {
    await prisma.inscripcion.create({
      data: { torneoId, nombre, apellido, email, telefono, categoria, club },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Ya existe una inscripción con ese email para este torneo." };
    }
    throw e;
  }

  return { exito: true };
}
