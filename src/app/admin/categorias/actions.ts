"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
