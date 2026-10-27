import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { listarDianasConUso } from "@/lib/dianas";
import RecorridoBuilder from "./RecorridoBuilder";

type Props = { params: { id: string } };

export default async function RecorridoPage({ params }: Props) {
  const torneoId = Number(params.id);
  if (isNaN(torneoId)) notFound();

  const torneo = await prisma.torneo.findUnique({
    where: { id: torneoId },
    include: { temporada: true },
  });
  if (!torneo) notFound();

  const [dianas, recorrido] = await Promise.all([
    listarDianasConUso(),
    prisma.recorrido.findUnique({
      where: { torneoId },
      include: { estaciones: { orderBy: { numero: "asc" } } },
    }),
  ]);

  const dianasParaSelect = dianas
    .filter((d) => d.activa)
    .map((d) => ({
      id: d.id,
      nombre: d.nombre,
      cantidadZonas: d.cantidadZonas,
      cantidad: d.cantidad,
      zonas: d.zonas.map((z) => ({ zonaVital: z.zonaVital, torneosUsada: z.torneosUsada, vidaRestante: z.vidaRestante })),
    }));

  const estacionesIniciales = recorrido?.estaciones.map((e) => ({
    numero: e.numero,
    dianaId: e.dianaId,
    zonaVital: e.zonaVital,
    cantidadUsada: e.cantidadUsada,
    metros: e.metros,
  })) ?? [];

  return (
    <div className="p-6 max-w-4xl">
      <Link
        href={`/admin/torneos/${torneo.id}`}
        className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        ← Volver al torneo
      </Link>

      <div className="mt-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Recorrido</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {torneo.nombre} · {torneo.temporada.nombre} · 24 estaciones
        </p>
      </div>

      {dianasParaSelect.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
          Todavía no hay dianas activas cargadas. <Link href="/admin/dianas" className="text-green-700 hover:underline">Agregá dianas</Link> antes de armar el recorrido.
        </div>
      ) : (
        <RecorridoBuilder torneoId={torneo.id} dianas={dianasParaSelect} estacionesIniciales={estacionesIniciales} />
      )}
    </div>
  );
}
