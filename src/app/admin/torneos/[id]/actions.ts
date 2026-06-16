"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";

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
