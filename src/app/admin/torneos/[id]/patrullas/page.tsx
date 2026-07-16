import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PatrullasGrid from "./PatrullasGrid";
import GenerarButton from "./GenerarButton";

type Props = { params: { id: string } };

export default async function PatrullasPage({ params }: Props) {
  const torneoId = Number(params.id);
  if (isNaN(torneoId)) notFound();

  const torneo = await prisma.torneo.findUnique({
    where: { id: torneoId },
    include: {
      temporada: true,
      _count: { select: { inscripciones: true } },
      patrullas: {
        orderBy: [{ bis: "asc" }, { numero: "asc" }],
        include: {
          miembros: {
            include: {
              inscripcion: { select: { id: true, nombre: true, apellido: true, categoria: true } },
            },
          },
        },
      },
    },
  });
  if (!torneo) notFound();

  const hayPatrullas  = torneo.patrullas.length > 0;
  const totalInsc     = torneo._count.inscripciones;
  const sinPatrulla   = totalInsc - torneo.patrullas.reduce((sum, p) => sum + p.miembros.length, 0);

  // Transformar a estructura por posición para el grid
  const patrullasGrid = torneo.patrullas.map((p) => {
    const byPos = Object.fromEntries(p.miembros.map((m) => [m.posicion, m]));
    return {
      id:     p.id,
      numero: p.numero,
      bis:    p.bis,
      estaca: p.estaca,
      A: byPos["A"] ? { id: byPos["A"].id, posicion: "A", inscripcion: byPos["A"].inscripcion } : null,
      B: byPos["B"] ? { id: byPos["B"].id, posicion: "B", inscripcion: byPos["B"].inscripcion } : null,
      C: byPos["C"] ? { id: byPos["C"].id, posicion: "C", inscripcion: byPos["C"].inscripcion } : null,
      D: byPos["D"] ? { id: byPos["D"].id, posicion: "D", inscripcion: byPos["D"].inscripcion } : null,
    };
  });

  return (
    <div className="p-6 max-w-7xl">
      <Link
        href={`/admin/torneos/${torneoId}`}
        className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        ← Volver al torneo
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patrullas</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {torneo.nombre} · {torneo.temporada.nombre}
          </p>
        </div>
        <GenerarButton torneoId={torneoId} hayPatrullas={hayPatrullas} />
      </div>

      {/* Resumen */}
      {totalInsc > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center min-w-[100px]">
            <p className="text-2xl font-bold text-slate-800">{totalInsc}</p>
            <p className="text-xs text-slate-400">Inscriptos</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center min-w-[100px]">
            <p className="text-2xl font-bold text-slate-800">{torneo.patrullas.length}</p>
            <p className="text-xs text-slate-400">Patrullas</p>
          </div>
          {sinPatrulla > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center min-w-[100px]">
              <p className="text-2xl font-bold text-amber-700">{sinPatrulla}</p>
              <p className="text-xs text-amber-500">Sin patrulla</p>
            </div>
          )}
          {/* Leyenda de estacas */}
          <div className="flex items-center gap-3 ml-auto self-center">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Roja (CM/CW)
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Amarilla (ESC/JUN)
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /> Azul (resto)
            </span>
          </div>
        </div>
      )}

      {!hayPatrullas ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">🏹</p>
          <p className="text-slate-500 text-sm">
            {totalInsc === 0
              ? "No hay inscriptos para este torneo todavía."
              : `Hay ${totalInsc} inscriptos. Generá las patrullas con el botón de arriba.`}
          </p>
        </div>
      ) : (
        <PatrullasGrid patrullas={patrullasGrid} torneoId={torneoId} />
      )}
    </div>
  );
}
