import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { calcularCampeonias } from "@/lib/campeones";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type Props = { searchParams: { q?: string; page?: string } };

export default async function ArquerosPage({ searchParams }: Props) {
  const q    = searchParams.q?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where = {
    activo: true,
    ...(q
      ? { OR: [{ nombre: { contains: q } }, { apellido: { contains: q } }] }
      : {}),
  };

  const [arqueros, total, campeonias] = await Promise.all([
    prisma.arquero.findMany({
      where,
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        pais: true,
        foto: true,
        _count: { select: { resultados: true } },
      },
    }),
    prisma.arquero.count({ where }),
    calcularCampeonias(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/arqueros?${params.toString()}`;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Arqueros</h1>
          <p className="text-slate-500 text-sm mt-1">
            {q ? `${total} resultados para "${q}"` : `${total} arqueros activos`}
          </p>
        </div>

        {/* Búsqueda */}
        <form method="GET" action="/arqueros" className="sm:ml-auto flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o apellido..."
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-liga/40"
          />
          <button
            type="submit"
            className="bg-liga text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-liga-dark transition-colors"
          >
            Buscar
          </button>
          {q && (
            <Link
              href="/arqueros"
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-400 text-sm hover:bg-slate-50 transition-colors"
            >
              ✕
            </Link>
          )}
        </form>
      </div>

      {/* Grid */}
      {arqueros.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          No se encontraron arqueros.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {arqueros.map((a) => {
            const esCampeon = campeonias.has(a.id);
            return (
              <Link
                key={a.id}
                href={`/arqueros/${a.id}`}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-liga/40 hover:shadow-sm transition-all group"
              >
                {/* Foto o iniciales */}
                <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {a.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.foto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 font-bold text-xl">
                      {a.nombre[0]}{a.apellido[0]}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-slate-800 group-hover:text-liga transition-colors truncate">
                      {a.apellido}, {a.nombre}
                    </p>
                    {esCampeon && (
                      <span className="text-amber-500 text-sm" title="Campeón de temporada">🏆</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {a.pais}
                    {a._count.resultados > 0 && ` · ${a._count.resultados} torneos`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          {page > 1 ? (
            <Link
              href={pageUrl(page - 1)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              ← Anterior
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-lg border border-slate-100 text-sm text-slate-300">
              ← Anterior
            </span>
          )}

          <span className="text-sm text-slate-500">
            {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={pageUrl(page + 1)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Siguiente →
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-lg border border-slate-100 text-sm text-slate-300">
              Siguiente →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
