"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireAdmin, getSession } from "@/lib/session";
import { Prisma } from "@prisma/client";

export type UsuarioFormState = { error?: string; exito?: boolean };

export async function crearUsuario(
  _prev: UsuarioFormState,
  formData: FormData
): Promise<UsuarioFormState> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const email    = (formData.get("email") as string).trim().toLowerCase();
  const password = (formData.get("password") as string);
  const rol      = (formData.get("rol") as string);
  const nombre   = (formData.get("nombre") as string | null)?.trim() || null;

  if (!email || !password || !rol) return { error: "Todos los campos son obligatorios." };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
  if (!["ADMIN", "CARGA", "INVITADO"].includes(rol)) return { error: "Rol inválido." };

  const hash = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({ data: { email, password: hash, rol } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Ya existe un usuario con ese email." };
    }
    throw e;
  }

  revalidatePath("/admin/usuarios");
  return { exito: true };
}

export async function eliminarUsuario(id: number): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  const session = await getSession();
  if (session && Number(session.user.id) === id) {
    return { error: "No podés eliminar tu propio usuario." };
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/usuarios");
  return {};
}

export async function resetearPassword(
  id: number,
  nuevaPassword: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado." };
  }

  if (!nuevaPassword || nuevaPassword.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const hash = await bcrypt.hash(nuevaPassword, 10);
  await prisma.user.update({ where: { id }, data: { password: hash } });
  return {};
}
