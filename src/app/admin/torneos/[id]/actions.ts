"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";

export type EditarTorneoState = { error?: string; exito?: boolean };

export async function editarTorneo(
  id: number,
  _prev: EditarTorneoState,
  formData: FormData
): Promise<EditarTorneoState> {
  const nombre      = (formData.get("nombre") as string).trim();
  const lugar       = (formData.get("lugar") as string).trim();
  const fecha       = formData.get("fecha") as string;
  const horario     = (formData.get("horario") as string | null)?.trim() || null;
  const direccion   = (formData.get("direccion") as string | null)?.trim() || null;
  const maxStr      = formData.get("maxInscriptos") as string | null;
  const maxInscriptos = maxStr ? parseInt(maxStr, 10) : 130;

  if (!nombre || !lugar || !fecha) return { error: "Nombre, lugar y fecha son obligatorios." };

  await prisma.torneo.update({
    where: { id },
    data: { nombre, lugar, fecha: new Date(fecha), horario, direccion, maxInscriptos },
  });

  revalidatePath(`/admin/torneos/${id}`);
  revalidatePath("/admin/torneos");
  revalidatePath("/calendario");
  return { exito: true };
}

export async function eliminarResultado(id: number) {
  await requireAdmin();
  const resultado = await prisma.resultado.findUnique({
    where: { id },
    select: { torneoId: true },
  });
  if (!resultado) return;
  await prisma.resultado.delete({ where: { id } });
  revalidatePath(`/admin/torneos/${resultado.torneoId}`);
}

export async function eliminarTorneo(id: number) {
  await requireAdmin();
  const torneo = await prisma.torneo.findUnique({
    where: { id },
    include: { _count: { select: { resultados: true } } },
  });
  if (!torneo) return;
  if (torneo._count.resultados > 0) return; // no eliminar si tiene resultados

  const temporadaId = torneo.temporadaId;
  await prisma.torneo.delete({ where: { id } });
  revalidatePath(`/admin/temporadas/${temporadaId}`);
  redirect(`/admin/temporadas/${temporadaId}`);
}
