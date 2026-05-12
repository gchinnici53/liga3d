"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { calcularPuntosTemporada } from "@/lib/scoring";
import * as XLSX from "xlsx";
import type { TipoTorneo } from "@/types/enums";

export type FilaResultado = {
  categoria:        string;
  categoriaId:      number | null;
  posicion:         number;
  apellido:         string;
  nombre:           string;
  puntajeRonda1:    number;
  esMedallista:     boolean;
  puntosTemporada:  number;
  arqueroId:        number | null;
  arqueroNombreDb:  string | null; // nombre encontrado en DB para confirmar el match
};

type ParseResult = {
  filas:   FilaResultado[];
  errores: string[];
};

export async function parseExcelResultados(
  formData: FormData,
  torneoId: number
): Promise<ParseResult> {
  const archivo = formData.get("archivo") as File | null;
  if (!archivo || archivo.size === 0) throw new Error("No se recibió archivo");

  const torneo = await prisma.torneo.findUnique({ where: { id: torneoId } });
  if (!torneo) throw new Error("Torneo no encontrado");

  const tipoTorneo = torneo.tipo as TipoTorneo;

  // Índice de arqueros por "apellido|nombre" (lowercase) → id
  const arqueros = await prisma.arquero.findMany({
    select: { id: true, nombre: true, apellido: true },
  });
  const porNombre = new Map<string, { id: number; nombre: string; apellido: string }>();
  arqueros.forEach((a) => {
    const key = `${a.apellido.toLowerCase().trim()}|${a.nombre.toLowerCase().trim()}`;
    porNombre.set(key, a);
  });

  // Índice de categorías por nombre
  const categorias = await prisma.categoria.findMany({
    select: { id: true, nombre: true },
  });
  const porCategoria = new Map(categorias.map((c) => [c.nombre.toLowerCase(), c]));

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const filas: FilaResultado[] = [];
  const errores: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const catKey = sheetName.trim().toUpperCase();
    const catDB = porCategoria.get(catKey.toLowerCase());

    if (!catDB) {
      errores.push(`Solapa "${sheetName}" no corresponde a ninguna categoría conocida — omitida`);
      continue;
    }

    const hoja = workbook.Sheets[sheetName];
    type FilaRaw = Record<string, string | number | undefined>;
    const rows = XLSX.utils.sheet_to_json<FilaRaw>(hoja, { defval: "" });

    rows.forEach((row, idx) => {
      const numFila = idx + 2;

      // Normalizar claves a lowercase para tolerar variaciones de mayúsculas
      const r: Record<string, string | number | undefined> = {};
      Object.entries(row).forEach(([k, v]) => { r[k.toLowerCase().trim()] = v; });

      const posRaw     = r["pos"] ?? r["#"] ?? r["posicion"];
      const apellidoRaw = String(r["apellido"] ?? "").trim();
      const nombreRaw   = String(r["nombre"]   ?? "").trim();
      const ronda1Raw   = r["ronda 1"] ?? r["ronda1"] ?? r["r1"] ?? r["puntaje"];

      if (!posRaw && posRaw !== 0) { errores.push(`${catKey} fila ${numFila}: falta posición`); return; }
      if (!apellidoRaw)            { errores.push(`${catKey} fila ${numFila}: falta apellido`);  return; }
      if (!nombreRaw)              { errores.push(`${catKey} fila ${numFila}: falta nombre`);    return; }

      const posicion     = Number(posRaw);
      const puntajeRonda1 = Number(ronda1Raw) || 0;
      const esMedallista = posicion >= 1 && posicion <= 4;
      const puntosTemporada = calcularPuntosTemporada(posicion, tipoTorneo);

      if (isNaN(posicion) || posicion < 1) {
        errores.push(`${catKey} fila ${numFila}: posición inválida ("${posRaw}")`);
        return;
      }

      // Match arquero por apellido + nombre
      const key = `${apellidoRaw.toLowerCase()}|${nombreRaw.toLowerCase()}`;
      const arqueroMatch = porNombre.get(key) ?? null;

      filas.push({
        categoria:       catKey,
        categoriaId:     catDB.id,
        posicion,
        apellido:        apellidoRaw,
        nombre:          nombreRaw,
        puntajeRonda1,
        esMedallista,
        puntosTemporada,
        arqueroId:       arqueroMatch?.id ?? null,
        arqueroNombreDb: arqueroMatch ? `${arqueroMatch.nombre} ${arqueroMatch.apellido}` : null,
      });
    });
  }

  return { filas, errores };
}

export async function importarResultados(
  filas: FilaResultado[],
  torneoId: number
): Promise<{ creados: number; omitidos: number }> {
  let creados = 0;
  let omitidos = 0;

  for (const fila of filas) {
    if (!fila.arqueroId || !fila.categoriaId) { omitidos++; continue; }

    // Evitar duplicados
    const existe = await prisma.resultado.findUnique({
      where: { arqueroId_torneoId: { arqueroId: fila.arqueroId, torneoId } },
    });
    if (existe) { omitidos++; continue; }

    await prisma.resultado.create({
      data: {
        arqueroId:       fila.arqueroId,
        torneoId,
        categoriaId:     fila.categoriaId,
        puntajeRonda1:   fila.puntajeRonda1,
        puntajeRonda2:   null,
        puntajeTotal:    fila.puntajeRonda1,
        posicion:        fila.posicion,
        esMedallista:    fila.esMedallista,
        puntosTemporada: fila.puntosTemporada,
      },
    });
    creados++;
  }

  revalidatePath(`/admin/torneos/${torneoId}`);
  return { creados, omitidos };
}
