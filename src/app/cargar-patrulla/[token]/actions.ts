"use server";

import { prisma } from "@/lib/prisma";
import { verificarTokenPatrulla } from "@/lib/patrullaToken";
import { guardarPuntajeParcial } from "@/app/admin/torneos/[id]/cargar/actions";
import { matchArquero } from "./matchArquero";

// Guarda el puntaje de un arquero de la patrulla, a partir del token del QR.
// Sin login: valida que el token sea válido y que el inscripto pertenezca
// realmente a esa patrulla antes de guardar nada.
export async function guardarPuntajeQR(
  token: string,
  inscripcionId: number,
  puntajeRonda1: number,
  puntajeRonda2: number | null,
): Promise<{ error?: string }> {
  const payload = verificarTokenPatrulla(token);
  if (!payload) return { error: "Link inválido o vencido." };

  const miembro = await prisma.miembroPatrulla.findUnique({
    where: { inscripcionId },
    include: { inscripcion: true, patrulla: { select: { id: true, torneoId: true } } },
  });
  if (!miembro || miembro.patrulla.id !== payload.patrullaId) {
    return { error: "Ese arquero no pertenece a esta patrulla." };
  }

  const insc = miembro.inscripcion;
  const arquero = await matchArquero({ dni: insc.dni, apellido: insc.apellido, nombre: insc.nombre });
  if (!arquero) {
    return { error: `No encontramos a ${insc.apellido}, ${insc.nombre} en el sistema. Avisale al organizador.` };
  }

  const categoria = await prisma.categoria.findUnique({ where: { nombre: insc.categoria } });
  if (!categoria) return { error: "Categoría no encontrada." };

  return guardarPuntajeParcial(miembro.patrulla.torneoId, categoria.id, arquero.id, puntajeRonda1, puntajeRonda2);
}
