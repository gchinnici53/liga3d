import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import NuevaTemporadaForm from "./NuevaTemporadaForm";
import CambiarEstadoButton from "./CambiarEstadoButton";

export default async function TemporadasPage() {
  const temporadas = await prisma.temporada.findMany({
    orderBy: { anio: "desc" },
    include: { _count: { select: { torneos: true } } },
  });

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Temporadas</h1>
          <p className="text-slate-500 text-sm mt-0.5">{temporadas.length} temporadas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista */}
        <div className="lg:col-span-2 space-y-3">
          {temporadas.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
              No hay temporadas todavía.
            </div>
          ) : (
            temporadas.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-slate-300 w-16 text-center">{t.anio}</div>
                  <div>
                    <Link href={`/admin/temporadas/${t.id}`} className="font-semibold text-slate-800 hover:text-green-700 transition-colors">
                      {t.nombre}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5">{t._count.torneos} torneo{t._count.torneos !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variante={t.estado === "ACTIVA" ? "abierta" : "cerrada"} />
                  <CambiarEstadoButton id={t.id} estado={t.estado as "ACTIVA" | "CERRADA"} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Form nueva temporada */}
        <div>
          <NuevaTemporadaForm />
        </div>
      </div>
    </div>
  );
}
