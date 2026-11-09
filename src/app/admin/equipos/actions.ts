"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TIPO_ARCO_VALUES, type TipoArco } from "@/types/enums";

export type EquipoFormState = { error?: string };

function parseDatos(formData: FormData) {
  const nombre = (formData.get("nombre") as string)?.trim();
  const tipoArco = formData.get("tipoArco") as string;
  const temporadaId = Number(formData.get("temporadaId"));
  const ids = [1, 2, 3]
    .map((n) => Number(formData.get(`miembro${n}`)))
    .filter((n) => Number.isInteger(n) && n > 0);
  return { nombre, tipoArco, temporadaId, ids };
}

async function validarMiembros(ids: number[]): Promise<EquipoFormState> {
  if (ids.length !== 3 || new Set(ids).size !== 3) {
    return { error: "Elegí 3 arqueros distintos." };
  }
  const arqueros = await prisma.arquero.findMany({
    where: { id: { in: ids } },
    select: { id: true, sexo: true },
  });
  if (arqueros.length !== 3) return { error: "Alguno de los arqueros seleccionados no existe." };
  if (!arqueros.some((a) => a.sexo === "FEMENINO")) {
    return { error: "El equipo debe tener al menos una arquera mujer." };
  }
  return {};
}

async function validarSinOtroEquipo(
  ids: number[],
  temporadaId: number,
  equipoIdExcluir?: number
): Promise<EquipoFormState> {
  const yaEnEquipo = await prisma.miembroEquipo.findFirst({
    where: {
      arqueroId: { in: ids },
      equipo: { temporadaId, ...(equipoIdExcluir ? { id: { not: equipoIdExcluir } } : {}) },
    },
    include: { arquero: true, equipo: true },
  });
  if (yaEnEquipo) {
    return {
      error: `${yaEnEquipo.arquero.nombre} ${yaEnEquipo.arquero.apellido} ya forma parte del equipo "${yaEnEquipo.equipo.nombre}" en esta temporada.`,
    };
  }
  return {};
}

export async function crearEquipo(_prev: EquipoFormState, formData: FormData): Promise<EquipoFormState> {
  const { nombre, tipoArco, temporadaId, ids } = parseDatos(formData);

  if (!nombre) return { error: "El nombre del equipo es obligatorio." };
  if (!TIPO_ARCO_VALUES.includes(tipoArco as TipoArco)) return { error: "Elegí un tipo de arco." };
  if (!temporadaId) return { error: "Falta la temporada." };

  const errMiembros = await validarMiembros(ids);
  if (errMiembros.error) return errMiembros;

  const errDup = await validarSinOtroEquipo(ids, temporadaId);
  if (errDup.error) return errDup;

  try {
    await prisma.equipo.create({
      data: {
        nombre,
        tipoArco,
        temporadaId,
        miembros: { create: ids.map((arqueroId) => ({ arqueroId })) },
      },
    });
  } catch (e) {
    if (e instanceof Error && "code" in e && (e as { code?: string }).code === "P2002") {
      return { error: "Ya existe un equipo con ese nombre en esta temporada." };
    }
    throw e;
  }

  revalidatePath("/admin/equipos");
  return {};
}

export async function actualizarEquipo(id: number, formData: FormData): Promise<EquipoFormState> {
  const { nombre, tipoArco, temporadaId, ids } = parseDatos(formData);

  if (!nombre) return { error: "El nombre del equipo es obligatorio." };
  if (!TIPO_ARCO_VALUES.includes(tipoArco as TipoArco)) return { error: "Elegí un tipo de arco." };
  if (!temporadaId) return { error: "Falta la temporada." };

  const errMiembros = await validarMiembros(ids);
  if (errMiembros.error) return errMiembros;

  const errDup = await validarSinOtroEquipo(ids, temporadaId, id);
  if (errDup.error) return errDup;

  try {
    await prisma.$transaction([
      prisma.miembroEquipo.deleteMany({ where: { equipoId: id } }),
      prisma.equipo.update({
        where: { id },
        data: {
          nombre,
          tipoArco,
          miembros: { create: ids.map((arqueroId) => ({ arqueroId })) },
        },
      }),
    ]);
  } catch (e) {
    if (e instanceof Error && "code" in e && (e as { code?: string }).code === "P2002") {
      return { error: "Ya existe un equipo con ese nombre en esta temporada." };
    }
    throw e;
  }

  revalidatePath("/admin/equipos");
  return {};
}

export async function eliminarEquipo(id: number) {
  await prisma.equipo.delete({ where: { id } });
  revalidatePath("/admin/equipos");
}
