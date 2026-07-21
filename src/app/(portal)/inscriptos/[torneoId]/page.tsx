import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CATEGORIA_ORDER = ["CW", "CM", "ESC", "JUN", "BW", "BM", "TW", "TM", "LW", "LM"];

const CATEGORIA_LABEL: Record<string, string> = {
  CW: "Compuesto Dama",
  CM: "Compuesto Caballero",
  ESC: "Escuela",
  JUN: "Junior",
  BW: "Barebow Dama",
  BM: "Barebow Caballero",
  TW: "Tradicional Dama",
  TM: "Tradicional Caballero",
  LW: "Longbow Dama",
  LM: "Longbow Caballero",
};

type Props = { params: { torneoId: string } };

export default async function InscriptosPublicPage({ params }: Props) {
  const torneoId = Number(params.torneoId);
  if (isNaN(torneoId)) notFound();

  const torneo = await prisma.torneo.findUnique({
    where: { id: torneoId },
    include: {
      temporada: true,
      _count: { select: { inscripciones: true } },
      inscripciones: {
        orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
        select: { nombre: true, apellido: true, categoria: true, club: true },
      },
    },
  });
  if (!torneo) notFound();

  const porCategoria = torneo.inscripciones.reduce<Record<string, typeof torneo.inscripciones>>(
    (acc, i) => {
      if (!acc[i.categoria]) acc[i.categoria] = [];
      acc[i.categoria].push(i);
      return acc;
    },
    {}
  );

  const categoriasOrdenadas = Object.keys(porCategoria).sort((a, b) => {
    const ai = CATEGORIA_ORDER.indexOf(a);
    const bi = CATEGORIA_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const fechaTorneo = new Date(torneo.fecha);
  const ahora = new Date();
  const lunesAnterior = new Date(fechaTorneo);
  lunesAnterior.setDate(fechaTorneo.getDate() - ((fechaTorneo.getDay() + 6) % 7));
  lunesAnterior.setHours(23, 59, 59, 999);
  const inscripcionesAbiertas =
    ahora <= lunesAnterior &&
    ahora <= fechaTorneo &&
    torneo._count.inscripciones < torneo.maxInscriptos;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
        ← Inicio
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-800">{torneo.nombre}</h1>
        <p className="text-slate-500 mt-1">
          {fechaTorneo.toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {torneo.lugar && ` · ${torneo.lugar}`}
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <span className="text-sm font-semibold text-slate-700">
            {torneo._count.inscripciones} inscriptos
          </span>
          {inscripcionesAbiertas && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                Inscripciones abiertas
              </span>
              <Link
                href={`/inscripcion/${torneoId}`}
                className="ml-auto text-sm font-semibold bg-liga text-white px-4 py-1.5 rounded-lg hover:bg-liga-dark transition-colors"
              >
                Inscribirse
              </Link>
            </>
          )}
        </div>
      </div>

      {torneo.inscripciones.length === 0 ? (
        <div className="bg-slate-50 rounded-xl p-12 text-center text-slate-400 text-sm">
          Aún no hay inscriptos para este torneo.
        </div>
      ) : (
        <div className="space-y-5">
          {categoriasOrdenadas.map((cat) => (
            <div key={cat} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <span className="font-bold text-slate-800 text-sm">{cat}</span>
                  {CATEGORIA_LABEL[cat] && (
                    <span className="text-slate-400 text-xs ml-2">{CATEGORIA_LABEL[cat]}</span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {porCategoria[cat].length} arquero{porCategoria[cat].length !== 1 ? "s" : ""}
                </span>
              </div>
              <ul className="divide-y divide-slate-50">
                {porCategoria[cat].map((i, idx) => (
                  <li key={idx} className="flex items-center gap-3 px-5 py-2.5">
                    <span className="text-slate-300 text-xs w-5 text-right shrink-0">{idx + 1}</span>
                    <span className="text-sm font-medium text-slate-800">
                      {i.apellido}, {i.nombre}
                    </span>
                    {i.club && (
                      <span className="text-slate-400 text-xs ml-auto shrink-0">{i.club}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
