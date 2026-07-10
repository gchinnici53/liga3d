"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type InscripcionState = { error?: string; exito?: boolean };

export type DatosArquero = {
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  fechaNacimiento: Date;
};

export async function buscarArqueroPorDNI(dni: string): Promise<DatosArquero | null> {
  if (!dni.trim()) return null;
  return prisma.arquero.findFirst({
    where: { dni: dni.trim(), activo: true },
    select: { nombre: true, apellido: true, email: true, telefono: true, fechaNacimiento: true },
  });
}

export async function inscribirse(
  torneoId: number,
  _prev: InscripcionState,
  formData: FormData
): Promise<InscripcionState> {
  const nombre           = (formData.get("nombre") as string).trim();
  const apellido         = (formData.get("apellido") as string).trim();
  const email            = (formData.get("email") as string).trim().toLowerCase();
  const telefono         = (formData.get("telefono") as string | null)?.trim() || null;
  const categoria        = (formData.get("categoria") as string).trim();
  const club             = (formData.get("club") as string | null)?.trim() || null;
  const dni              = (formData.get("dni") as string | null)?.trim() || null;
  const fechaNacStr      = (formData.get("fechaNacimiento") as string | null)?.trim() || null;

  if (!nombre || !apellido || !email || !categoria) {
    return { error: "Completá todos los campos obligatorios." };
  }
  if (!fechaNacStr) {
    return { error: "La fecha de nacimiento es obligatoria." };
  }

  const fechaNacimiento = new Date(fechaNacStr);
  if (isNaN(fechaNacimiento.getTime())) {
    return { error: "Fecha de nacimiento inválida." };
  }

  // Si hay DNI, verificar que la fecha coincida con el arquero registrado
  if (dni) {
    const arquero = await prisma.arquero.findFirst({
      where: { dni, activo: true },
      select: { fechaNacimiento: true },
    });
    if (arquero) {
      const fa = new Date(arquero.fechaNacimiento);
      const fi = new Date(fechaNacStr);
      const coincide =
        fa.getUTCFullYear() === fi.getUTCFullYear() &&
        fa.getUTCMonth()    === fi.getUTCMonth()    &&
        fa.getUTCDate()     === fi.getUTCDate();
      if (!coincide) {
        return { error: "La fecha de nacimiento no coincide con nuestros registros. Verificá los datos." };
      }
    }
  }

  const torneo = await prisma.torneo.findUnique({
    where: { id: torneoId },
    include: { _count: { select: { inscripciones: true } } },
  });
  if (!torneo) return { error: "Torneo no encontrado." };

  const ahora       = new Date();
  const fechaTorneo = new Date(torneo.fecha);

  if (ahora > fechaTorneo) return { error: "Las inscripciones están cerradas." };

  const lunesAnterior = new Date(fechaTorneo);
  lunesAnterior.setDate(fechaTorneo.getDate() - ((fechaTorneo.getDay() + 6) % 7));
  lunesAnterior.setHours(23, 59, 59, 999);
  if (ahora > lunesAnterior) return { error: "Las inscripciones cerraron el lunes anterior al torneo." };

  if (torneo._count.inscripciones >= torneo.maxInscriptos) {
    return { error: "El torneo ya alcanzó el cupo máximo de inscriptos." };
  }

  try {
    await prisma.inscripcion.create({
      data: { torneoId, nombre, apellido, email, telefono, fechaNacimiento, dni, categoria, club },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Ya existe una inscripción con ese email para este torneo." };
    }
    throw e;
  }

  return { exito: true };
}
