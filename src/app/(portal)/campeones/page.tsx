import { prisma } from "@/lib/prisma";
import { calcularTotalTemporada, calificaParaCampeon } from "@/lib/scoring";
import type { TipoTorneo } from "@/types/enums";
import type { Metadata } from "next";
import CampeonesTabs from "./CampeonesTabs";

export const metadata: Metadata = { title: "Campeones — Liga 3D" };

const CATEGORIAS_CON_CAMPEON = ["CM", "CW", "BM", "BW", "LM", "LW", "TM", "TW"] as const;

export default async function CampeonesPage() {
  const temporadasCerradas = await prisma.temporada.findMany({
    where: { estado: "CERRADA" },
    orderBy: { anio: "desc" },
  });

  const temporadasConCampeones = await Promise.all(
    temporadasCerradas.map(async (temporada) => {
      const resultados = await prisma.resultado.findMany({
        where: {
          torneo:    { temporadaId: temporada.id },
          categoria: { nombre: { in: [...CATEGORIAS_CON_CAMPEON] } },
        },
        include: {
          arquero:   { select: { id: true, nombre: true, apellido: true, foto: true } },
          torneo:    { select: { tipo: true } },
          categoria: { select: { nombre: true } },
        },
      });

      // Agrupar: categoria → arqueroId → resultados
      const agrupado = new Map<
        string,
        Map<number, {
          arquero: { id: number; nombre: string; apellido: string; foto: string | null };
          res: { puntosTemporada: number; tipoTorneo: TipoTorneo }[];
        }>
      >();

      for (const r of resultados) {
        const cat = r.categoria.nombre;
        if (!agrupado.has(cat)) agrupado.set(cat, new Map());
        const porArquero = agrupado.get(cat)!;
        if (!porArquero.has(r.arqueroId)) {
          porArquero.set(r.arqueroId, { arquero: r.arquero, res: [] });
        }
        porArquero.get(r.arqueroId)!.res.push({
          puntosTemporada: r.puntosTemporada,
          tipoTorneo: r.torneo.tipo as TipoTorneo,
        });
      }

      const campeones: Record<string, { arquero: { id: number; nombre: string; apellido: string; foto: string | null }; total: number } | null> = {};

      for (const cat of CATEGORIAS_CON_CAMPEON) {
        const porArquero = agrupado.get(cat);
        if (!porArquero) { campeones[cat] = null; continue; }

        let campeon: { arquero: { id: number; nombre: string; apellido: string; foto: string | null }; total: number } | null = null;
        for (const { arquero, res } of Array.from(porArquero.values())) {
          if (!calificaParaCampeon(res)) continue;
          const total = calcularTotalTemporada(res);
          if (!campeon || total > campeon.total) campeon = { arquero, total };
        }
        campeones[cat] = campeon;
      }

      return { id: temporada.id, nombre: temporada.nombre, anio: temporada.anio, campeones };
    })
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-horta text-4xl text-slate-800 mb-2">Campeones</h1>
      <p className="text-slate-500 text-sm mb-8">Campeones por categoría de cada temporada</p>
      <CampeonesTabs temporadas={temporadasConCampeones} />
    </div>
  );
}
