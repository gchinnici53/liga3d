import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import SorteoClient from "./SorteoClient";

type Props = { params: { id: string } };

export default async function SorteoPage({ params }: Props) {
  const torneoId = Number(params.id);
  if (isNaN(torneoId)) notFound();

  const torneo = await prisma.torneo.findUnique({
    where: { id: torneoId },
    include: { temporada: true },
  });
  if (!torneo) notFound();

  const presentes = await prisma.inscripcion.findMany({
    where: { torneoId, presente: true },
    select: { id: true, nombre: true, apellido: true },
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
  });

  const nombres = presentes.map((p) => `${p.nombre} ${p.apellido}`);

  return (
    <div className="p-6 max-w-2xl">
      <Link
        href={`/admin/torneos/${torneo.id}`}
        className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        ← Volver al torneo
      </Link>

      <div className="mt-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Sorteo</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {torneo.nombre} · {torneo.temporada.nombre} · {nombres.length} presentes
        </p>
      </div>

      {nombres.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
          No hay nadie marcado como presente todavía. Marcá presentes en{" "}
          <Link href={`/admin/torneos/${torneo.id}/inscriptos`} className="text-green-700 hover:underline">
            Inscriptos
          </Link>.
        </div>
      ) : (
        <SorteoClient nombres={nombres} />
      )}
    </div>
  );
}
