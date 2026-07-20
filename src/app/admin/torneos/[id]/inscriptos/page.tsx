import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EliminarInscripcionButton from "./EliminarInscripcionButton";
import PagadoCheckbox from "./PagadoCheckbox";

type Props = {
  params: { id: string };
  searchParams: { orden?: string };
};

export default async function InscriptosPage({ params, searchParams }: Props) {
  const torneoId = Number(params.id);
  if (isNaN(torneoId)) notFound();

  const orden = searchParams.orden === "apellido" ? "apellido" : "categoria";

  const torneo = await prisma.torneo.findUnique({
    where: { id: torneoId },
    include: {
      temporada: true,
      inscripciones: {
        orderBy: orden === "apellido"
          ? [{ apellido: "asc" }, { nombre: "asc" }]
          : [{ categoria: "asc" }, { apellido: "asc" }],
        include: {
          patrulla: { include: { patrulla: { select: { numero: true, bis: true } } } },
        },
      },
    },
  });
  if (!torneo) notFound();

  const total  = torneo.inscripciones.length;
  const pagados = torneo.inscripciones.filter((i) => i.pagado).length;

  const porCategoria = torneo.inscripciones.reduce<Record<string, number>>((acc, i) => {
    acc[i.categoria] = (acc[i.categoria] ?? 0) + 1;
    return acc;
  }, {});

  const linkOrden = (o: string) => `/admin/torneos/${torneoId}/inscriptos?orden=${o}`;

  return (
    <div className="p-6 max-w-5xl">
      <Link
        href={`/admin/torneos/${torneoId}`}
        className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        ← Volver al torneo
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inscriptos</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {torneo.nombre} · {torneo.temporada.nombre}
          </p>
        </div>
        {total > 0 && (
          <a
            href={`/api/exportar-inscriptos/${torneoId}`}
            className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
          >
            ↓ Exportar Excel
          </a>
        )}
      </div>

      {total === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          Aún no hay inscriptos para este torneo.
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="text-sm text-slate-600">
              <strong>{total}</strong> inscriptos ·{" "}
              <strong className="text-green-700">{pagados}</strong> pagados ·{" "}
              <strong className="text-amber-600">{total - pagados}</strong> pendientes
            </span>
            <div className="flex flex-wrap gap-1.5 ml-auto">
              {Object.entries(porCategoria)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([cat, count]) => (
                  <span key={cat} className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                    {cat}: {count}
                  </span>
                ))}
            </div>
          </div>

          {/* Ordenamiento */}
          <div className="flex gap-2 mb-3">
            <span className="text-xs text-slate-400 self-center">Ordenar por:</span>
            <Link
              href={linkOrden("categoria")}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                orden === "categoria"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Categoría
            </Link>
            <Link
              href={linkOrden("apellido")}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                orden === "apellido"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Apellido A–Z
            </Link>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-green-600 uppercase tracking-wide">Pagó</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Apellido</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cat.</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">F. Nac.</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Club</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Patrulla</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {torneo.inscripciones.map((i, idx) => (
                    <tr key={i.id} className={i.pagado ? "bg-green-50/50" : "hover:bg-slate-50"}>
                      <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>
                      <td className="px-3 py-3 text-center">
                        <PagadoCheckbox id={i.id} torneoId={torneoId} inicial={i.pagado} />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{i.apellido}</td>
                      <td className="px-4 py-3 text-slate-700">{i.nombre}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-liga/10 text-liga rounded font-semibold text-xs">{i.categoria}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {i.fechaNacimiento
                          ? new Date(i.fechaNacimiento).toLocaleDateString("es-AR")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{i.club ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                        {i.patrulla
                          ? `${i.patrulla.patrulla.numero}-${i.patrulla.posicion}${i.patrulla.patrulla.bis ? " Bis" : ""}`
                          : "—"}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <EliminarInscripcionButton
                          id={i.id}
                          torneoId={torneoId}
                          nombre={`${i.nombre} ${i.apellido}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
