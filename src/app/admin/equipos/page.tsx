import { prisma } from "@/lib/prisma";
import { calcularRankingEquipos, listarArquerosParaEquipo, TIPO_ARCO_LABEL } from "@/lib/equipos";
import { TIPO_ARCO_VALUES } from "@/types/enums";
import NuevoEquipoForm from "./NuevoEquipoForm";
import EquipoRow from "./EquipoRow";

export default async function EquiposPage() {
  const temporadaActiva = await prisma.temporada.findFirst({
    where: { estado: "ACTIVA" },
    orderBy: { anio: "desc" },
  });

  if (!temporadaActiva) {
    return (
      <div className="p-6 max-w-5xl">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Equipos</h1>
        <p className="text-slate-500 text-sm">No hay una temporada activa en este momento.</p>
      </div>
    );
  }

  const [equipos, arqueros] = await Promise.all([
    calcularRankingEquipos(temporadaActiva.id),
    listarArquerosParaEquipo(),
  ]);

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Equipos</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Temporada {temporadaActiva.nombre} · puntaje de equipo = suma de los totales individuales de los
          3 arqueros (2 mejores puntajes de tirada en regulares + la final de cada uno)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {equipos.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
              No hay equipos cargados todavía en esta temporada.
            </div>
          ) : (
            TIPO_ARCO_VALUES.map((tipo) => {
              const delTipo = equipos
                .filter((e) => e.tipoArco === tipo)
                .sort((a, b) => b.total - a.total);
              if (delTipo.length === 0) return null;
              return (
                <div key={tipo}>
                  <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    {TIPO_ARCO_LABEL[tipo]}
                  </h2>
                  <div className="space-y-3">
                    {delTipo.map((equipo) => (
                      <EquipoRow
                        key={equipo.id}
                        equipo={equipo}
                        arqueros={arqueros}
                        temporadaId={temporadaActiva.id}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div>
          <NuevoEquipoForm arqueros={arqueros} temporadaId={temporadaActiva.id} />
        </div>
      </div>
    </div>
  );
}
