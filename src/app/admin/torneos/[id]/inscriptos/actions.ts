"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function eliminarInscripcion(id: number, torneoId: number) {
  await prisma.inscripcion.delete({ where: { id } });
  revalidatePath(`/admin/torneos/${torneoId}/inscriptos`);
}
