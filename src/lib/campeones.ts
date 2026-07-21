"use server";

import { prisma } from "@/lib/prisma";

const CATEGORIAS_CON_CAMPEON = new Set(["CM", "CW", "BM", "BW", "LM", "LW", "TM", "TW"]);

export type Campeonato = { temporada: string; categoria: string };

/**
 * Calcula todos los campeones de temporadas cerradas.
 * Devuelve un Map arqueroId → lista de campeonatos ganados.
 * Regla: top2(regulares) + final, requiere ≥2 regulares + la final.
 */
export async function calcularCampeonias(): Promise<Map<number, Campeonato[]>> {
  const resultados = await prisma.resultado.findMany({
    where: { torneo: { temporada: { estado: "CERRADA" } } },
    select: {
      arqueroId: true,
      puntosTemporada: true,
      torneo: {
        select: {
          tipo: true,
          temporadaId: true,
          temporada: { select: { nombre: true } },
        },
      },
      categoria: { select: { nombre: true } },
    },
  });

  type Entry = {
    arqueroId: number;
    regulares: number[];
    finalPts: number;
    tiroFinal: boolean;
    temporadaNombre: string;
    categoriaNombre: string;
  };

  // key: "temporadaId|categoria|arqueroId"
  const mapa = new Map<string, Entry>();

  for (const r of resultados) {
    if (!CATEGORIAS_CON_CAMPEON.has(r.categoria.nombre)) continue;
    const key = `${r.torneo.temporadaId}|${r.categoria.nombre}|${r.arqueroId}`;
    if (!mapa.has(key)) {
      mapa.set(key, {
        arqueroId: r.arqueroId,
        regulares: [],
        finalPts: 0,
        tiroFinal: false,
        temporadaNombre: r.torneo.temporada.nombre,
        categoriaNombre: r.categoria.nombre,
      });
    }
    const e = mapa.get(key)!;
    if (r.torneo.tipo === "REGULAR") {
      e.regulares.push(r.puntosTemporada);
    } else {
      e.finalPts = r.puntosTemporada;
      e.tiroFinal = true;
    }
  }

  // Agrupar contendientes por "temporadaId|categoria"
  type Contendiente = { arqueroId: number; total: number; temporada: string; categoria: string };
  const catTempMap = new Map<string, Contendiente[]>();

  for (const e of Array.from(mapa.values())) {
    if (e.regulares.length < 2 || !e.tiroFinal) continue;
    const top2 = [...e.regulares].sort((a, b) => b - a).slice(0, 2);
    const total = top2.reduce((s, p) => s + p, 0) + e.finalPts;
    const catTempKey = `${e.temporadaNombre}|${e.categoriaNombre}`;
    if (!catTempMap.has(catTempKey)) catTempMap.set(catTempKey, []);
    catTempMap.get(catTempKey)!.push({
      arqueroId: e.arqueroId,
      total,
      temporada: e.temporadaNombre,
      categoria: e.categoriaNombre,
    });
  }

  // El ganador por categoría + temporada
  const resultado = new Map<number, Campeonato[]>();
  for (const contendientes of Array.from(catTempMap.values())) {
    const ganador = [...contendientes].sort((a, b) => b.total - a.total)[0];
    if (!ganador) continue;
    if (!resultado.has(ganador.arqueroId)) resultado.set(ganador.arqueroId, []);
    resultado.get(ganador.arqueroId)!.push({
      temporada: ganador.temporada,
      categoria: ganador.categoria,
    });
  }

  return resultado;
}
