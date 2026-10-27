import { prisma } from "@/lib/prisma";

// Categorías de arco que compiten por récord de liga (excluye ESC y JUN,
// que no tienen "mejor marca" — ESC tiene su propio umbral de pase de
// categoría más abajo).
export const CATEGORIAS_RECORD = ["CM", "CW", "BM", "BW", "LM", "LW", "TM", "TW"] as const;

// Puntaje en una ronda que significa pase de categoría para Escuela.
export const PASE_CATEGORIA_ESC = 290;

export type ArqueroBasico = { id: number; nombre: string; apellido: string };
export type TorneoBasico  = { id: number; nombre: string; fecha: Date };

export type RecordCategoria = {
  puntaje: number;
  arquero: ArqueroBasico;
  torneo: TorneoBasico;
};

// Mejor puntaje de UNA ronda por categoría (nunca la suma de dos rondas:
// en los torneos con 2 rondas, cada ronda compite como marca independiente).
export async function calcularRecordsPorCategoria(): Promise<Map<string, RecordCategoria>> {
  const resultados = await prisma.resultado.findMany({
    where: { categoria: { nombre: { in: [...CATEGORIAS_RECORD] } } },
    select: {
      puntajeRonda1: true,
      puntajeRonda2: true,
      arquero:   { select: { id: true, nombre: true, apellido: true } },
      torneo:    { select: { id: true, nombre: true, fecha: true } },
      categoria: { select: { nombre: true } },
    },
    orderBy: { torneo: { fecha: "asc" } },
  });

  const records = new Map<string, RecordCategoria>();
  for (const r of resultados) {
    const cat = r.categoria.nombre;
    const candidatos = [r.puntajeRonda1, r.puntajeRonda2].filter((p): p is number => p != null);
    for (const puntaje of candidatos) {
      const actual = records.get(cat);
      if (!actual || puntaje > actual.puntaje) {
        records.set(cat, { puntaje, arquero: r.arquero, torneo: r.torneo });
      }
    }
  }
  return records;
}

export type PaseCategoria = {
  arquero: ArqueroBasico;
  puntaje: number;
  torneo: TorneoBasico;
};

// Un registro por arquero de Escuela que alguna vez llegó a PASE_CATEGORIA_ESC
// en una ronda — con su mejor marca y en qué torneo la hizo.
export async function listarPasesDeCategoriaEscuela(): Promise<PaseCategoria[]> {
  const resultados = await prisma.resultado.findMany({
    where: { categoria: { nombre: "ESC" } },
    select: {
      puntajeRonda1: true,
      puntajeRonda2: true,
      arquero: { select: { id: true, nombre: true, apellido: true } },
      torneo:  { select: { id: true, nombre: true, fecha: true } },
    },
    orderBy: { torneo: { fecha: "asc" } },
  });

  const mejorPorArquero = new Map<number, PaseCategoria>();
  for (const r of resultados) {
    const candidatos = [r.puntajeRonda1, r.puntajeRonda2]
      .filter((p): p is number => p != null && p >= PASE_CATEGORIA_ESC);
    for (const puntaje of candidatos) {
      const actual = mejorPorArquero.get(r.arquero.id);
      if (!actual || puntaje > actual.puntaje) {
        mejorPorArquero.set(r.arquero.id, { arquero: r.arquero, puntaje, torneo: r.torneo });
      }
    }
  }
  return Array.from(mejorPorArquero.values())
    .sort((a, b) => a.arquero.apellido.localeCompare(b.arquero.apellido, "es"));
}
