"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function agregarInscripcion(
  torneoId: number,
  formData: FormData
): Promise<{ error?: string }> {
  const nombre          = (formData.get("nombre") as string).trim();
  const apellido        = (formData.get("apellido") as string).trim();
  const email           = (formData.get("email") as string).trim().toLowerCase();
  const categoria       = (formData.get("categoria") as string).trim();
  const dni             = (formData.get("dni") as string | null)?.trim() || null;
  const club            = (formData.get("club") as string | null)?.trim() || null;
  const telefono        = (formData.get("telefono") as string | null)?.trim() || null;
  const fechaNacStr     = (formData.get("fechaNacimiento") as string | null)?.trim() || null;
  const fechaNacimiento = fechaNacStr ? new Date(fechaNacStr) : null;

  if (!nombre || !apellido || !email || !categoria) {
    return { error: "Nombre, apellido, email y categoría son obligatorios." };
  }

  try {
    await prisma.inscripcion.create({
      data: { torneoId, nombre, apellido, email, categoria, dni, club, telefono, fechaNacimiento },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Ya existe una inscripción con ese email para este torneo." };
    }
    throw e;
  }

  revalidatePath(`/admin/torneos/${torneoId}/inscriptos`);
  revalidatePath(`/admin/torneos/${torneoId}/patrullas`);
  return {};
}

export async function eliminarInscripcion(id: number, torneoId: number) {
  // Eliminar el miembro de patrulla asociado primero (si existe)
  await prisma.miembroPatrulla.deleteMany({ where: { inscripcionId: id } });
  await prisma.inscripcion.delete({ where: { id } });
  revalidatePath(`/admin/torneos/${torneoId}/inscriptos`);
  revalidatePath(`/admin/torneos/${torneoId}/patrullas`);
}

export async function togglePagado(id: number, pagado: boolean, torneoId: number) {
  await prisma.inscripcion.update({ where: { id }, data: { pagado } });
  revalidatePath(`/admin/torneos/${torneoId}/inscriptos`);
}

export async function togglePresente(id: number, presente: boolean, torneoId: number) {
  await prisma.inscripcion.update({ where: { id }, data: { presente } });
  revalidatePath(`/admin/torneos/${torneoId}/inscriptos`);
}
