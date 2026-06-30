import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import InscripcionForm from "./InscripcionForm";

type Props = { params: { torneoId: string } };

export default async function InscripcionPage({ params }: Props) {
  const torneoId = Number(params.torneoId);
  if (isNaN(torneoId)) notFound();

  const torneo = await prisma.torneo.findUnique({
    where: { id: torneoId },
    include: {
      temporada: true,
      _count: { select: { inscripciones: true } },
    },
  });
  if (!torneo) notFound();

  const ahora = new Date();
  const fechaTorneo = new Date(torneo.fecha);

  if (ahora > fechaTorneo) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🏹</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Torneo finalizado</h1>
        <p className="text-slate-500 mb-6">Este torneo ya se realizó. Las inscripciones están cerradas.</p>
        <Link href="/calendario" className="text-liga hover:underline text-sm">← Volver al calendario</Link>
      </div>
    );
  }

  const lunesAnterior = new Date(fechaTorneo);
  lunesAnterior.setDate(fechaTorneo.getDate() - ((fechaTorneo.getDay() + 6) % 7));
  lunesAnterior.setHours(23, 59, 59, 999);
  const cerradoPorFecha = ahora > lunesAnterior;
  const cerradoPorCupo  = torneo._count.inscripciones >= torneo.maxInscriptos;

  if (cerradoPorFecha || cerradoPorCupo) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🔒</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Inscripciones cerradas</h1>
        <p className="text-slate-500 mb-2">
          {cerradoPorCupo ? `Se alcanzó el cupo máximo de ${torneo.maxInscriptos} inscriptos.` : "El período de inscripción ya cerró."}
        </p>
        <Link href="/calendario" className="text-liga hover:underline text-sm">← Volver al calendario</Link>
      </div>
    );
  }

  const inscriptos = torneo._count.inscripciones;
  const restantes  = torneo.maxInscriptos - inscriptos;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/calendario" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
        ← Volver al calendario
      </Link>

      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">{torneo.nombre}</h1>
        <p className="text-slate-500 text-sm">
          {new Date(torneo.fecha).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          {torneo.horario && ` · ${torneo.horario}`}
          {torneo.lugar && ` · ${torneo.lugar}`}
        </p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
            Inscripciones abiertas
          </span>
          <span className="text-xs text-slate-500">
            {inscriptos} inscriptos · {restantes} lugares disponibles
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Formulario de inscripción</h2>
        <InscripcionForm torneoId={torneoId} />
      </div>
    </div>
  );
}
