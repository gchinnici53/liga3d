"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
import type { ArqueroImportRow } from "@/types";

// ─── CRUD ─────────────────────────────────────────────────

export async function crearArquero(formData: FormData) {
  await prisma.arquero.create({
    data: {
      nombre:          (formData.get("nombre") as string).trim(),
      apellido:        (formData.get("apellido") as string).trim(),
      pais:            (formData.get("pais") as string).trim() || "Argentina",
      dni:             (formData.get("dni") as string).trim(),
      email:           (formData.get("email") as string | null)?.trim() || null,
      telefono:        (formData.get("telefono") as string | null)?.trim() || null,
      fechaNacimiento: new Date(formData.get("fechaNacimiento") as string),
      sexo:            formData.get("sexo") as string,
      categoriaId:     Number(formData.get("categoriaId")),
      activo:          formData.get("activo") === "true",
    },
  });
  revalidatePath("/admin/arqueros");
  redirect("/admin/arqueros");
}

export async function actualizarArquero(id: number, formData: FormData) {
  await prisma.arquero.update({
    where: { id },
    data: {
      nombre:          (formData.get("nombre") as string).trim(),
      apellido:        (formData.get("apellido") as string).trim(),
      pais:            (formData.get("pais") as string).trim() || "Argentina",
      dni:             (formData.get("dni") as string).trim(),
      email:           (formData.get("email") as string | null)?.trim() || null,
      telefono:        (formData.get("telefono") as string | null)?.trim() || null,
      fechaNacimiento: new Date(formData.get("fechaNacimiento") as string),
      sexo:            formData.get("sexo") as string,
      categoriaId:     Number(formData.get("categoriaId")),
      activo:          formData.get("activo") === "true",
    },
  });
  revalidatePath("/admin/arqueros");
  revalidatePath(`/admin/arqueros/${id}`);
  redirect(`/admin/arqueros/${id}`);
}

export async function toggleActivoArquero(id: number, activo: boolean) {
  await prisma.arquero.update({ where: { id }, data: { activo } });
  revalidatePath("/admin/arqueros");
}

// ─── Importación Excel ────────────────────────────────────

type ResultadoParseo = {
  filas: ArqueroImportRow[];
  errores: string[];
};

export async function parseExcelArqueros(formData: FormData): Promise<ResultadoParseo> {
  const archivo = formData.get("archivo") as File | null;
  if (!archivo || archivo.size === 0) throw new Error("No se recibió archivo");

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const hoja = workbook.Sheets[workbook.SheetNames[0]];

  type FilaRaw = Record<string, string | number | Date | undefined>;
  const rawRows = XLSX.utils.sheet_to_json<FilaRaw>(hoja, { defval: "" });

  const filas: ArqueroImportRow[] = [];
  const errores: string[] = [];

  rawRows.forEach((fila, idx) => {
    const num = idx + 2; // la fila 1 es el encabezado

    const nombre   = String(fila["Nombre"] ?? "").trim();
    const apellido = String(fila["Apellido"] ?? "").trim();
    const dni      = String(fila["DNI"] ?? "").trim();
    const rawFecha = fila["Fecha Nacimiento"];

    if (!nombre)   { errores.push(`Fila ${num}: falta Nombre`);           return; }
    if (!apellido) { errores.push(`Fila ${num}: falta Apellido`);         return; }
    if (!dni)      { errores.push(`Fila ${num}: falta DNI`);              return; }
    if (!rawFecha) { errores.push(`Fila ${num}: falta Fecha Nacimiento`); return; }

    // Parseo de fecha: puede ser Date (cellDates:true), número serial de Excel, o string
    let fechaISO: string;
    try {
      fechaISO = parsearFechaExcel(rawFecha);
    } catch {
      errores.push(`Fila ${num}: fecha inválida ("${rawFecha}")`);
      return;
    }

    filas.push({
      nombre,
      apellido,
      pais:      String(fila["pais"] ?? fila["País"] ?? "Argentina").trim() || "Argentina",
      dni,
      email:     String(fila["email"] ?? fila["Email"] ?? "").trim() || undefined,
      telefono:  String(fila["tel"]   ?? fila["Teléfono"] ?? "").trim() || undefined,
      fechaNacimientoISO: fechaISO,
    });
  });

  return { filas, errores };
}

export async function importarArqueros(
  filas: ArqueroImportRow[],
  sexo: string,
  categoriaId: number
): Promise<{ creados: number; duplicados: number }> {
  let creados = 0;
  let duplicados = 0;

  for (const fila of filas) {
    const existe = await prisma.arquero.findUnique({ where: { dni: fila.dni } });
    if (existe) { duplicados++; continue; }

    await prisma.arquero.create({
      data: {
        nombre:          fila.nombre,
        apellido:        fila.apellido,
        pais:            fila.pais,
        dni:             fila.dni,
        email:           fila.email ?? null,
        telefono:        fila.telefono ?? null,
        fechaNacimiento: new Date(fila.fechaNacimientoISO),
        sexo,
        categoriaId,
        activo:          true,
      },
    });
    creados++;
  }

  revalidatePath("/admin/arqueros");
  return { creados, duplicados };
}

// ─── Helpers ──────────────────────────────────────────────

function parsearFechaExcel(valor: string | number | Date | undefined): string {
  if (valor instanceof Date) {
    if (isNaN(valor.getTime())) throw new Error("fecha inválida");
    return valor.toISOString().split("T")[0];
  }

  if (typeof valor === "number") {
    // Serial de Excel: días desde 1/1/1900 (con el bug del año 1900)
    const fecha = new Date(Math.round((valor - 25569) * 86400 * 1000));
    if (isNaN(fecha.getTime())) throw new Error("serial inválido");
    return fecha.toISOString().split("T")[0];
  }

  if (typeof valor === "string" && valor.trim()) {
    // Intentar ISO directo
    let fecha = new Date(valor);
    if (!isNaN(fecha.getTime())) return fecha.toISOString().split("T")[0];

    // Intentar DD/MM/YYYY o DD-MM-YYYY
    const partes = valor.trim().split(/[\/\-\.]/);
    if (partes.length === 3) {
      const [a, b, c] = partes.map(Number);
      // Si el tercer componente parece un año (>31) → DD/MM/YYYY
      fecha = c > 31 ? new Date(c, b - 1, a) : new Date(a, b - 1, c);
      if (!isNaN(fecha.getTime())) return fecha.toISOString().split("T")[0];
    }
  }

  throw new Error(`No se pudo parsear: ${valor}`);
}
