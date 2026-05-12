import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ImportarResultadosCliente from "./ImportarResultadosCliente";

type Props = { params: { id: string } };

export default async function ImportarResultadosPage({ params }: Props) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const torneo = await prisma.torneo.findUnique({
    where: { id },
    include: { temporada: true },
  });
  if (!torneo) notFound();

  return (
    <div className="p-6 max-w-4xl">
      <Link href={`/admin/torneos/${id}`} className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
        ← Volver a {torneo.nombre}
      </Link>
      <h1 className="text-2xl font-bold text-slate-800 mt-2 mb-1">Importar resultados</h1>
      <p className="text-slate-500 text-sm mb-6">
        {torneo.nombre} · {torneo.temporada.nombre}
      </p>

      <ImportarResultadosCliente torneoId={torneo.id} torneoNombre={torneo.nombre} />
    </div>
  );
}
