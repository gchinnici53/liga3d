"use client";

import { useState } from "react";
import Link from "next/link";
import type { EquipoRanking } from "@/lib/equipos";
import { TIPO_ARCO_LABEL } from "@/lib/equipos";
import { TIPO_ARCO_VALUES, type TipoArco } from "@/types/enums";

export default function EquiposTabs({ equipos }: { equipos: EquipoRanking[] }) {
  const tiposConEquipos = TIPO_ARCO_VALUES.filter((t) => equipos.some((e) => e.tipoArco === t));
  const [activa, setActiva] = useState<TipoArco>(tiposConEquipos[0] ?? "COMPUESTO");

  const delTipo = equipos
    .filter((e) => e.tipoArco === activa)
    .sort((a, b) => b.total - a.total);

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {tiposConEquipos.map((tipo) => (
          <button
            key={tipo}
            onClick={() => setActiva(tipo)}
            className={[
              "px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors shrink-0",
              activa === tipo ? "bg-liga text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            ].join(" ")}
          >
            {TIPO_ARCO_LABEL[tipo]}
          </button>
        ))}
      </div>

      {delTipo.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
          Sin equipos en esta categoría.
        </div>
      ) : (
        <div className="space-y-3">
          {delTipo.map((equipo, i) => {
            const pos = i + 1;
            return (
              <div key={equipo.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-lg font-bold text-slate-400 w-6 shrink-0 text-center">{pos}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-800">{equipo.nombre}</h3>
                        {equipo.califica && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                            Puede ser campeón
                          </span>
                        )}
                      </div>
                      <ul className="mt-1.5 space-y-0.5">
                        {equipo.miembros.map((m) => (
                          <li key={m.id} className="text-sm text-slate-600">
                            <Link href={`/arqueros/${m.id}`} className="hover:text-liga transition-colors">
                              {m.nombre} {m.apellido}
                            </Link>
                            <span className="text-xs text-slate-400 ml-1.5">{m.total} pts</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-liga shrink-0">{equipo.total}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-slate-400 mt-4">
        Puntaje de equipo = suma de los totales individuales de los 3 arqueros (2 mejores puntajes de
        tirada en torneos regulares + la final de cada uno).
      </p>
    </>
  );
}
