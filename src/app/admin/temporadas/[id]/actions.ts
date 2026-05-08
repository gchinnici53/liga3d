"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type TorneoFormState = { error?: string };

export async function crearTorneo(
  temporadaId: number,
  _prev: TorneoFormState,
  formData: FormData
): Promise<TorneoFormState> {
  const nombre = (formData.get("nombre") as string).trim();
  const lugar  = (formData.get("lugar") as string).trim();
  const fecha  = formData.get("fecha") as string;
  const tipo   = formData.get("tipo") as string;

  if (!nombre) return { error: "El nombre es obligatorio." };
  if (!lugar)  return { error: "El lugar es obligatorio." };
  if (!fecha)  return { error: "La fecha es obligatoria." };
  if (tipo !== "REGULAR" && tipo !== "FINAL") return { error: "Tipo inválido." };

  if (tipo === "FINAL") {
    const finalExiste = await prisma.torneo.findFirst({
      where: { temporadaId, tipo: "FINAL" },
    });
    if (finalExiste) return { error: "Esta temporada ya tiene un torneo FINAL." };
  }

  await prisma.torneo.create({
    data: { nombre, lugar, fecha: new Date(fecha), tipo, temporadaId },
  });

  revalidatePath(`/admin/temporadas/${temporadaId}`);
  redirect(`/admin/temporadas/${temporadaId}`);
}
