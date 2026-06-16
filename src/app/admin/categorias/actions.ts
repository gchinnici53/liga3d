"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";

export async function crearCategoria(formData: FormData) {
  const nombre = (formData.get("nombre") as string).trim();
  const descripcion = (formData.get("descripcion") as string | null)?.trim() || null;

  await prisma.categoria.create({ data: { nombre, descripcion } });
  revalidatePath("/admin/categorias");
}

export async function actualizarCategoria(id: number, formData: FormData) {
  const nombre = (formData.get("nombre") as string).trim();
  const descripcion = (formData.get("descripcion") as string | null)?.trim() || null;

  await prisma.categoria.update({ where: { id }, data: { nombre, descripcion } });
  revalidatePath("/admin/categorias");
}

export async function toggleActivaCategoria(id: number, activa: boolean) {
  await prisma.categoria.update({ where: { id }, data: { activa } });
  revalidatePath("/admin/categorias");
}

export async function eliminarCategoria(id: number) {
  await requireAdmin();
  const enUso = await prisma.resultado.count({ where: { categoriaId: id } });
  if (enUso > 0) return; // no eliminar si tiene resultados
  await prisma.categoria.delete({ where: { id } });
  revalidatePath("/admin/categorias");
}
