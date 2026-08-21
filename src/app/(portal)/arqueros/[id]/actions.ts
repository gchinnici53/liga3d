"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { crearTokenOTP, generarOTP, verificarTokenOTP } from "@/lib/otp";
import { enviarCodigoVerificacion } from "@/lib/mailer";

export async function validarDNI(arqueroId: number, dni: string): Promise<boolean> {
  const arquero = await prisma.arquero.findUnique({
    where: { id: arqueroId },
    select: { dni: true },
  });
  return !!arquero && arquero.dni === dni.trim();
}

// ── OTP: enviar código ────────────────────────────────────────────────────────

export async function enviarCodigo(
  arqueroId: number,
  dni: string,
  email: string
): Promise<{ token?: string; error?: string }> {
  // Re-validar DNI server-side antes de enviar
  const valido = await validarDNI(arqueroId, dni);
  if (!valido) return { error: "DNI incorrecto." };

  const emailNorm = email.trim().toLowerCase();
  if (!emailNorm) return { error: "Ingresá un email para recibir el código." };

  const arquero = await prisma.arquero.findUnique({
    where:  { id: arqueroId },
    select: { nombre: true },
  });
  if (!arquero) return { error: "Arquero no encontrado." };

  const otp   = generarOTP();
  const token = crearTokenOTP(arqueroId, emailNorm, otp);

  try {
    await enviarCodigoVerificacion(emailNorm, otp, arquero.nombre);
  } catch (e) {
    console.error("Error enviando email OTP:", e);
    return { error: "No se pudo enviar el correo. Verificá la dirección e intentá de nuevo." };
  }

  return { token };
}

// ── OTP: verificar código ─────────────────────────────────────────────────────

export async function verificarCodigo(
  token: string,
  codigo: string
): Promise<{ ok?: boolean; error?: string }> {
  const payload = verificarTokenOTP(token);
  if (!payload) return { error: "El código expiró. Solicitá uno nuevo." };
  if (codigo.trim() !== payload.otp) return { error: "Código incorrecto." };

  // Si el email cambió respecto a la DB, actualizarlo ahora
  const arquero = await prisma.arquero.findUnique({
    where:  { id: payload.arqueroId },
    select: { email: true },
  });

  if (arquero && arquero.email?.toLowerCase() !== payload.email) {
    try {
      await prisma.arquero.update({
        where: { id: payload.arqueroId },
        data:  { email: payload.email },
      });
      revalidatePath(`/arqueros/${payload.arqueroId}`);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { error: "Ese email ya está registrado en otro arquero." };
      }
      throw e;
    }
  }

  return { ok: true };
}

// ── Actualizar perfil ─────────────────────────────────────────────────────────

export type ActualizarState = { error?: string; ok?: boolean };

export async function actualizarPerfil(
  arqueroId: number,
  dni: string,
  formData: FormData
): Promise<ActualizarState> {
  // Re-validar DNI server-side
  const valido = await validarDNI(arqueroId, dni);
  if (!valido) return { error: "DNI incorrecto. No se guardaron los cambios." };

  const nombre       = (formData.get("nombre") as string).trim();
  const apellido     = (formData.get("apellido") as string).trim();
  const email        = (formData.get("email") as string).trim().toLowerCase() || null;
  const telefono     = (formData.get("telefono") as string).trim() || null;
  const pais         = (formData.get("pais") as string).trim() || "Argentina";
  const fechaNacStr  = (formData.get("fechaNacimiento") as string | null)?.trim();
  const fechaNacimiento = fechaNacStr ? new Date(fechaNacStr) : undefined;

  if (!nombre || !apellido) return { error: "Nombre y apellido son obligatorios." };
  if (fechaNacimiento && isNaN(fechaNacimiento.getTime())) {
    return { error: "Fecha de nacimiento inválida." };
  }

  try {
    await prisma.arquero.update({
      where: { id: arqueroId },
      data: {
        nombre, apellido, pais,
        ...(email ? { email } : {}),
        telefono,
        ...(fechaNacimiento ? { fechaNacimiento } : {}),
      },
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
