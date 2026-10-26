"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { enviarConfirmacionInscripcion } from "@/lib/mailer";

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
  const sexo             = (formData.get("sexo") as string | null)?.trim() || null;
  const fechaNacStr      = (formData.get("fechaNacimiento") as string | null)?.trim() || null;

  if (!nombre || !apellido || !email || !categoria) {
    return { error: "Completá todos los campos obligatorios." };
  }
  if (!dni) {
    return { error: "El DNI es obligatorio." };
  }
  if (!fechaNacStr) {
    return { error: "La fecha de nacimiento es obligatoria." };
  }

  const fechaNacimiento = new Date(fechaNacStr);
  if (isNaN(fechaNacimiento.getTime())) {
    return { error: "Fecha de nacimiento inválida." };
  }

  // Verificar si ya existe un arquero con ese DNI (activo o no) y que la
  // fecha coincida, para no permitir que alguien se inscriba con el DNI de
  // otra persona.
  const arqueroExistente = await prisma.arquero.findUnique({
    where: { dni },
    select: { id: true, fechaNacimiento: true },
  });
  if (arqueroExistente) {
    const fa = new Date(arqueroExistente.fechaNacimiento);
    const fi = new Date(fechaNacStr);
    const coincide =
      fa.getUTCFullYear() === fi.getUTCFullYear() &&
      fa.getUTCMonth()    === fi.getUTCMonth()    &&
      fa.getUTCDate()     === fi.getUTCDate();
    if (!coincide) {
      return { error: "La fecha de nacimiento no coincide con nuestros registros. Verificá los datos." };
    }
  } else if (sexo !== "MASCULINO" && sexo !== "FEMENINO") {
    return { error: "Seleccioná tu sexo para darte de alta como arquero nuevo." };
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

  // Enviar email de confirmación
  console.log(`[inscripcion] SMTP_PASS configurado: ${!!process.env.SMTP_PASS}, email destino: ${email}`);
  if (process.env.SMTP_PASS) {
    try {
      await enviarConfirmacionInscripcion({
        torneo: { nombre: torneo.nombre, fecha: torneo.fecha, lugar: torneo.lugar, valor: torneo.valor, notas: torneo.notas },
        arquero: { nombre, apellido, email, categoria, club },
      });
      console.log(`[inscripcion] Email de confirmación enviado a ${email}`);
    } catch (e) {
      console.error("[inscripcion] Error enviando email de confirmación:", e);
    }
  }

  if (arqueroExistente) {
    // Ya estaba en la base: actualizar su ficha con los datos del formulario
    // (y reactivarlo si estaba dado de baja).
    try {
      await prisma.arquero.update({
        where: { id: arqueroExistente.id },
        data: {
          nombre,
          apellido,
          ...(email ? { email } : {}),
          ...(telefono !== null ? { telefono } : {}),
          activo: true,
        },
      });
    } catch {
      // No bloquear si falla (ej: email duplicado con otro arquero)
    }
  } else {
    // No había ningún arquero con ese DNI: se inscribió alguien nuevo en la
    // liga, así que lo damos de alta para que no quede "suelto" solo en
    // este torneo.
    try {
      await prisma.arquero.create({
        data: { nombre, apellido, dni, email, telefono, fechaNacimiento, sexo: sexo! },
      });
    } catch (e) {
      console.error("[inscripcion] Error creando ficha de arquero nuevo:", e);
      // No bloquear la inscripción ya creada; el organizador puede darlo de
      // alta a mano desde el admin si esto llegara a fallar.
    }
  }

  return { exito: true };
}
