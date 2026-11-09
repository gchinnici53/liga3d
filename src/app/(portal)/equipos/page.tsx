import { prisma } from "@/lib/prisma";
import { calcularRankingEquipos } from "@/lib/equipos";
import type { Metadata } from "next";
import EquiposTabs from "./EquiposTabs";

export const metadata: Metadata = {
  title: "Equipos — Liga 3D",
};

export default async function EquiposPage() {
  const temporadaActiva = await prisma.temporada.findFirst({
    where: { estado: "ACTIVA" },
    orderBy: { anio: "desc" },
  });

  if (!temporadaActiva) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Equipos</h1>
        <p className="text-slate-500">No hay temporada activa en este momento.</p>
      </div>
    );
  }

  const equipos = await calcularRankingEquipos(temporadaActiva.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-1">Equipos</h1>
      <p className="text-slate-500 text-sm mb-8">
        Temporada {temporadaActiva.nombre} — equipos de 3 arqueros por tipo de arco
      </p>

      {equipos.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
          Todavía no hay equipos cargados en esta temporada.
        </div>
      ) : (
        <EquiposTabs equipos={equipos} />
      )}
    </div>
  );
}
