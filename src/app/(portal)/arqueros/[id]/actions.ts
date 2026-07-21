"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function validarDNI(arqueroId: number, dni: string): Promise<boolean> {
  const arquero = await prisma.arquero.findUnique({
    where: { id: arqueroId },
    select: { dni: true },
  });
  return !!arquero && arquero.dni === dni.trim();
}

export type ActualizarState = { error?: string; ok?: boolean };

export async function actualizarPerfil(
  arqueroId: number,
  dni: string,
  formData: FormData
): Promise<ActualizarState> {
  // Re-validar DNI server-side para que no se pueda bypassear desde el cliente
  const valido = await validarDNI(arqueroId, dni);
  if (!valido) return { error: "DNI incorrecto. No se guardaron los cambios." };

  const nombre   = (formData.get("nombre") as string).trim();
  const apellido = (formData.get("apellido") as string).trim();
  const email    = (formData.get("email") as string).trim().toLowerCase() || null;
  const telefono = (formData.get("telefono") as string).trim() || null;
  const pais     = (formData.get("pais") as string).trim() || "Argentina";

  if (!nombre || !apellido) return { error: "Nombre y apellido son obligatorios." };

  try {
    await prisma.arquero.update({
      where: { id: arqueroId },
      data: { nombre, apellido, pais, ...(email ? { email } : {}), telefono },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Ese email ya está registrado en otro arquero." };
    }
    throw e;
  }

  revalidatePath(`/arqueros/${arqueroId}`);
  return { ok: true };
}
