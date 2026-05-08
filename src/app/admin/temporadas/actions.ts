"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type TemporadaFormState = { error?: string };

export async function crearTemporada(
  _prev: TemporadaFormState,
  formData: FormData
): Promise<TemporadaFormState> {
  const nombre = (formData.get("nombre") as string).trim();
  const anio   = Number(formData.get("anio"));

  if (!nombre) return { error: "El nombre es obligatorio." };
  if (isNaN(anio) || anio < 2000 || anio > 2100) return { error: "Año inválido." };

  const existe = await prisma.temporada.findFirst({ where: { anio } });
  if (existe) return { error: `Ya existe una temporada para el año ${anio}.` };

  await prisma.temporada.create({
    data: { nombre, anio, estado: "ACTIVA" },
  });

  revalidatePath("/admin/temporadas");
  redirect("/admin/temporadas");
}

export async function cerrarTemporada(id: number) {
  await prisma.temporada.update({
    where: { id },
    data:  { estado: "CERRADA" },
  });
  revalidatePath("/admin/temporadas");
  revalidatePath(`/admin/temporadas/${id}`);
}

export async function reabrirTemporada(id: number) {
  await prisma.temporada.update({
    where: { id },
    data:  { estado: "ACTIVA" },
  });
  revalidatePath("/admin/temporadas");
  revalidatePath(`/admin/temporadas/${id}`);
}
