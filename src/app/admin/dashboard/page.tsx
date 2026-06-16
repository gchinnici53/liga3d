import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { calcularTotalTemporada, nombreCompleto } from "@/lib/scoring";
import type { TipoTorneo } from "@/types/enums";

const CATEGORIAS_RANKING = ["CM", "CW", "BM", "BW", "LM", "LW", "TM", "TW"] as const;
const DIAS_INSCRIPCION = 30;

export default async function DashboardPage() {
  const [totalArqueros, temporadaActiva, proximoTorneo] = await Promise.all([
    prisma.arquero.count({ where: { activo: true } }),
    prisma.temporada.findFirst({ where: { estado: "ACTIVA" }, orderBy: { anio: "desc" } }),
    prisma.torneo.findFirst({
      where: { fecha: { gte: new Date() } },
      orderBy: { fecha: "asc" },
      include: { temporada: true },
    }),
  ]);

  // Inscripciones abiertas si el torneo está a ≤30 días
  const diasParaTorneo = proximoTorneo
    ? Math.ceil((proximoTorneo.fecha.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const inscripcionesAbiertas = diasParaTorneo !== null && diasParaTorneo <= DIAS_INSCRIPCION;

  // Arqueros con más participaciones en torneos (top 10)
  const participacionesRaw = await prisma.resultado.groupBy({
    by: ["arqueroId"],
    _count: { torneoId: true },
    orderBy: { _count: { torneoId: "desc" } },
    take: 10,
  });

  const arqueroIds = participacionesRaw.map((p) => p.arqueroId);
  const arquerosParticipantes = await prisma.arquero.findMany({
    where: { id: { in: arqueroIds } },
    select: { id: true, nombre: true, apellido: true },
  });
  const arqueroMap = new Map(arquerosParticipantes.map((a) => [a.id, a]));
  const topParticipantes = participacionesRaw
    .map((p) => ({ arquero: arqueroMap.get(p.arqueroId), torneos: p._count.torneoId }))
    .filter((p): p is { arquero: { id: number; nombre: string; apellido: string }; torneos: number } => !!p.arquero);

  // Ranking top 3 por categoría de la temporada activa
  const rankingCategorias = new Map<string, { arquero: { id: number; nombre: string; apellido: string }; total: number }[]>(
    CATEGORIAS_RANKING.map((cat) => [cat, []])
  );

  if (temporadaActiva) {
    const resultados = await prisma.resultado.findMany({
      where: {
        torneo:    { temporadaId: temporadaActiva.id },
        categoria: { nombre: { in: [...CATEGORIAS_RANKING] } },
      },
      include: {
        arquero:   { select: { id: true, nombre: true, apellido: true } },
        torneo:    { select: { tipo: true } },
        categoria: { select: { nombre: true } },
      },
    });

    const agrupado = new Map<string, Map<number, { arquero: { id: number; nombre: string; apellido: string }; res: { puntosTemporada: number; tipoTorneo: TipoTorneo }[] }>>();

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

    for (const cat of CATEGORIAS_RANKING) {
      const porArquero = agrupado.get(cat);
      if (!porArquero) continue;
      const ranking = Array.from(porArquero.values())
        .map(({ arquero, res }) => ({ arquero, total: calcularTotalTemporada(res) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 3);
      rankingCategorias.set(cat, ranking);
    }
  }

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Dashboard</h1>
      <p className="text-slate-500 text-sm mb-6">Resumen general de la liga</p>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Tarjeta icono="🏹" titulo="Arqueros activos" valor={String(totalArqueros)} />
        <Tarjeta icono="📅" titulo="Temporada activa" valor={temporadaActiva?.nombre ?? "—"} />

        {/* Próximo torneo */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl mb-1">🏆</p>
          <p className="text-xs text-slate-500 mb-1">Próximo torneo</p>
          {proximoTorneo ? (
            <>
              <p className="text-sm font-bold text-slate-800 leading-tight">{proximoTorneo.nombre}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date(proximoTorneo.fecha).toLocaleDateString("es-AR", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
              {inscripcionesAbiertas && (
                <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                  Inscripciones abiertas
                </span>
              )}
            </>
          ) : (
            <p className="text-lg font-bold text-slate-800">—</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Ranking por categoría */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Ranking {temporadaActiva?.nombre ?? "temporada activa"}
          </h2>
          {!temporadaActiva ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-sm">
              No hay temporada activa.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORIAS_RANKING.map((cat) => {
                const top = rankingCategorias.get(cat) ?? [];
                return (
                  <div key={cat} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{cat}</span>
                    </div>
                    {top.length === 0 ? (
                      <p className="text-xs text-slate-400 italic p-3">Sin datos</p>
                    ) : (
                      <ul className="divide-y divide-slate-50">
                        {top.map((item, i) => (
                          <li key={item.arquero.id} className="px-3 py-2 flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-300 w-3 shrink-0">{i + 1}</span>
                            <Link
                              href={`/admin/arqueros/${item.arquero.id}`}
                              className="flex-1 text-xs text-slate-700 hover:text-green-700 font-medium truncate"
                            >
                              {item.arquero.apellido}
                            </Link>
                            <span className="text-xs font-semibold text-green-700 shrink-0">{item.total}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Más participaciones */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Más participaciones
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {topParticipantes.length === 0 ? (
              <p className="text-sm text-slate-400 text-center p-6">Sin datos.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {topParticipantes.map((p, i) => (
                  <li key={p.arquero.id} className="px-4 py-2.5 flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-300 w-4 shrink-0">{i + 1}</span>
                    <Link
                      href={`/admin/arqueros/${p.arquero.id}`}
                      className="flex-1 text-sm text-slate-800 hover:text-green-700 font-medium truncate"
                    >
                      {nombreCompleto(p.arquero.nombre, p.arquero.apellido)}
                    </Link>
                    <span className="text-xs text-slate-400 shrink-0">{p.torneos} torneos</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function Tarjeta({ icono, titulo, valor }: { icono: string; titulo: string; valor: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-2xl mb-1">{icono}</p>
      <p className="text-xs text-slate-500 mb-1">{titulo}</p>
      <p className="text-lg font-bold text-slate-800 truncate">{valor}</p>
    </div>
  );
}
