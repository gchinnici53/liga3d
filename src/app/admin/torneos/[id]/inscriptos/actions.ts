"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
