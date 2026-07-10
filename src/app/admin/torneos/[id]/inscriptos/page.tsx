import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EliminarInscripcionButton from "./EliminarInscripcionButton";

type Props = { params: { id: string } };

export default async function InscriptosPage({ params }: Props) {
  const torneoId = Number(params.id);
  if (isNaN(torneoId)) notFound();

  const torneo = await prisma.torneo.findUnique({
    where: { id: torneoId },
    include: {
      temporada: true,
      inscripciones: {
        orderBy: [{ categoria: "asc" }, { apellido: "asc" }],
      },
    },
  });
  if (!torneo) notFound();

  const total = torneo.inscripciones.length;

  // Agrupar por categoría para el resumen
  const porCategoria = torneo.inscripciones.reduce<Record<string, number>>((acc, i) => {
    acc[i.categoria] = (acc[i.categoria] ?? 0) + 1;
    return acc;
  }, {});

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
            {torneo.nombre} · {torneo.temporada.nombre} · {total} inscriptos
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
          {/* Resumen por categoría */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(porCategoria)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([cat, count]) => (
                <span key={cat} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                  {cat}: {count}
                </span>
              ))}
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Apellido</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cat.</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">DNI</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">F. Nac.</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Teléfono</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Club</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Inscripto</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {torneo.inscripciones.map((i, idx) => (
                    <tr key={i.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{i.apellido}</td>
                      <td className="px-4 py-3 text-slate-700">{i.nombre}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-liga/10 text-liga rounded font-semibold text-xs">{i.categoria}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{i.dni ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {i.fechaNacimiento
                          ? new Date(i.fechaNacimiento).toLocaleDateString("es-AR")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{i.email}</td>
                      <td className="px-4 py-3 text-slate-600">{i.telefono ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{i.club ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(i.createdAt).toLocaleDateString("es-AR")}
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
