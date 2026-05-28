import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import NuevoTorneoForm from "./NuevoTorneoForm";
import CambiarEstadoButton from "../CambiarEstadoButton";
import { calcularTotalTemporada, calificaParaCampeon, nombreCompleto } from "@/lib/scoring";
import type { TipoTorneo } from "@/types/enums";

type Props = { params: { id: string } };

const CATEGORIAS_CON_CAMPEON = ["CM", "CW", "BM", "BW", "LM", "LW", "TM", "TW"] as const;

type Arquero = { id: number; nombre: string; apellido: string; foto: string | null };
type CampeonData = { arquero: Arquero; total: number } | null;

export default async function DetalleTemporadaPage({ params }: Props) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const temporada = await prisma.temporada.findUnique({
    where: { id },
    include: { torneos: { orderBy: { fecha: "asc" } } },
  });
  if (!temporada) notFound();

  const regulares = temporada.torneos.filter((t) => t.tipo === "REGULAR");
  const final     = temporada.torneos.find((t) => t.tipo === "FINAL");

  // ── Campeones (solo si la temporada está cerrada) ─────────
  const campeones = new Map<string, CampeonData>();

  if (temporada.estado === "CERRADA") {
    const resultados = await prisma.resultado.findMany({
      where: {
        torneo:    { temporadaId: id },
        categoria: { nombre: { in: [...CATEGORIAS_CON_CAMPEON] } },
      },
      include: {
        arquero:   { select: { id: true, nombre: true, apellido: true, foto: true } },
        torneo:    { select: { tipo: true } },
        categoria: { select: { nombre: true } },
      },
    });

    // Agrupar: categoria → arqueroId → { arquero, resultados[] }
    const agrupado = new Map<string, Map<number, { arquero: Arquero; res: { puntosTemporada: number; tipoTorneo: TipoTorneo }[] }>>();

    for (const r of resultados) {
      const cat = r.categoria.nombre;
      if (!agrupado.has(cat)) agrupado.set(cat, new Map());
      const porArquero = agrupado.get(cat)!;
      if (!porArquero.has(r.arqueroId)) {
        porArquero.set(r.arqueroId, { arquero: r.arquero, res: [] });
      }
      porArquero.get(r.arqueroId)!.res.push({
        puntosTemporada: r.puntosTemporada,
        tipoTorneo:      r.torneo.tipo as TipoTorneo,
      });
    }

    for (const cat of CATEGORIAS_CON_CAMPEON) {
      const porArquero = agrupado.get(cat);
      if (!porArquero) { campeones.set(cat, null); continue; }

      let campeon: CampeonData = null;
      for (const { arquero, res } of Array.from(porArquero.values())) {
        if (!calificaParaCampeon(res)) continue;
        const total = calcularTotalTemporada(res);
        if (!campeon || total > campeon.total) campeon = { arquero, total };
      }
      campeones.set(cat, campeon);
    }
  }

  const cerrada = temporada.estado === "CERRADA";

  return (
    <div className="p-6 max-w-5xl">
      <Link href="/admin/temporadas" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
        ← Volver a temporadas
      </Link>

      <div className="flex items-center gap-3 mt-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{temporada.nombre}</h1>
        <Badge variante={cerrada ? "cerrada" : "abierta"} />
        <CambiarEstadoButton id={temporada.id} estado={temporada.estado as "ACTIVA" | "CERRADA"} />
      </div>

      {/* ── Campeones ── */}
      {cerrada && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Campeones {temporada.anio}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIAS_CON_CAMPEON.map((cat) => {
              const data = campeones.get(cat);
              return (
                <div key={cat} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center text-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cat}</span>
                  <FotoArquero
                    foto={data?.arquero.foto ?? null}
                    nombre={data ? nombreCompleto(data.arquero.nombre, data.arquero.apellido) : "—"}
                  />
                  {data ? (
                    <>
                      <Link
                        href={`/admin/arqueros/${data.arquero.id}`}
                        className="text-sm font-semibold text-slate-800 hover:text-green-700 leading-tight"
                      >
                        {nombreCompleto(data.arquero.nombre, data.arquero.apellido)}
                      </Link>
                      <span className="text-xs text-green-700 font-medium">{data.total} pts</span>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Sin campeón</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Torneos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">

          {/* Regulares */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-700">
                Torneos regulares
                <span className="ml-2 text-slate-400 font-normal">({regulares.length})</span>
              </h2>
            </div>
            {regulares.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">Sin torneos regulares.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Lugar</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {regulares.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-800">{t.nombre}</td>
                      <td className="px-4 py-2.5 text-slate-600 hidden sm:table-cell">{t.lugar}</td>
                      <td className="px-4 py-2.5 text-slate-600">{new Date(t.fecha).toLocaleDateString("es-AR")}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Link href={`/admin/torneos/${t.id}`} className="text-xs text-green-700 hover:underline">Ver →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Final */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-700">Torneo Final</h2>
            </div>
            {!final ? (
              <p className="text-slate-500 text-sm text-center py-6">Sin final cargada.</p>
            ) : (
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">{final.nombre}</p>
                  <p className="text-xs text-slate-400">{final.lugar} · {new Date(final.fecha).toLocaleDateString("es-AR")}</p>
                </div>
                <Link href={`/admin/torneos/${final.id}`} className="text-xs text-green-700 hover:underline">Ver →</Link>
              </div>
            )}
          </div>
        </div>

        <div>
          <NuevoTorneoForm temporadaId={temporada.id} />
        </div>
      </div>
    </div>
  );
}

function FotoArquero({ foto, nombre }: { foto: string | null; nombre: string }) {
  if (foto) {
    return (
      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-300 shadow">
        <Image src={foto} alt={nombre} fill className="object-cover" />
      </div>
    );
  }
  // Avatar genérico con iniciales
  const iniciales = nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
  return (
    <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center shadow">
      <span className="text-slate-500 font-bold text-lg">{iniciales === "—" ? "?" : iniciales}</span>
    </div>
  );
}
