"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ZONAS_VITALES_MAX } from "@/lib/dianas";

export type DianaFormState = { error?: string };

function parseDatosDiana(formData: FormData): { error?: string; datos?: {
  nombre: string;
  cantidadZonas: number;
  cantidad: number;
  costoCompra: number | null;
  vidaUtilUsosZona: number | null;
} } {
  const nombre = (formData.get("nombre") as string)?.trim();
  const cantidadZonas = Number(formData.get("cantidadZonas"));
  const cantidad = Number(formData.get("cantidad"));
  const costoCompraRaw = (formData.get("costoCompra") as string)?.trim();
  const vidaUtilRaw = (formData.get("vidaUtilUsosZona") as string)?.trim();

  if (!nombre) return { error: "El nombre es obligatorio." };
  if (!Number.isInteger(cantidadZonas) || cantidadZonas < 1 || cantidadZonas > ZONAS_VITALES_MAX) {
    return { error: `La cantidad de zonas vitales debe ser entre 1 y ${ZONAS_VITALES_MAX}.` };
  }
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return { error: "La cantidad en inventario debe ser 1 o más." };
  }

  const costoCompra = costoCompraRaw ? Number(costoCompraRaw) : null;
  if (costoCompra != null && (isNaN(costoCompra) || costoCompra < 0)) {
    return { error: "El costo de compra no es válido." };
  }

  const vidaUtilUsosZona = vidaUtilRaw ? Number(vidaUtilRaw) : null;
  if (vidaUtilUsosZona != null && (!Number.isInteger(vidaUtilUsosZona) || vidaUtilUsosZona < 1)) {
    return { error: "La vida útil por zona no es válida." };
  }

  return { datos: { nombre, cantidadZonas, cantidad, costoCompra, vidaUtilUsosZona } };
}

export async function crearDiana(
  _prev: DianaFormState,
  formData: FormData
): Promise<DianaFormState> {
  const { error, datos } = parseDatosDiana(formData);
  if (error || !datos) return { error };

  await prisma.diana.create({ data: datos });

  revalidatePath("/admin/dianas");
  return {};
}

export async function actualizarDiana(id: number, formData: FormData): Promise<DianaFormState> {
  const { error, datos } = parseDatosDiana(formData);
  if (error || !datos) return { error };

  await prisma.diana.update({ where: { id }, data: datos });

  revalidatePath("/admin/dianas");
  return {};
}

export async function toggleActivaDiana(id: number, activa: boolean) {
  await prisma.diana.update({ where: { id }, data: { activa } });
  revalidatePath("/admin/dianas");
}

export async function eliminarDiana(id: number): Promise<{ error?: string }> {
  const enUso = await prisma.recorridoEstacion.count({ where: { dianaId: id } });
  if (enUso > 0) {
    return { error: "No se puede eliminar: esta diana está usada en uno o más recorridos." };
  }
  await prisma.diana.delete({ where: { id } });
  revalidatePath("/admin/dianas");
  return {};
}
