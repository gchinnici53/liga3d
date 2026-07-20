"use client";

import { useState, useTransition } from "react";
import { moverMiembro } from "./actions";

const ESTACA_COLOR: Record<string, string> = {
  ROJA:     "bg-red-100 text-red-700 border-red-200",
  AMARILLA: "bg-amber-100 text-amber-700 border-amber-200",
  AZUL:     "bg-blue-100 text-blue-700 border-blue-200",
};

const ESTACA_HEADER: Record<string, string> = {
  ROJA:     "border-t-4 border-t-red-400",
  AMARILLA: "border-t-4 border-t-amber-400",
  AZUL:     "border-t-4 border-t-blue-400",
};

type Miembro = {
  id: number;
  posicion: string;
  inscripcion: { id: number; nombre: string; apellido: string; categoria: string; presente: boolean };
} | null;

type Patrulla = {
  id: number;
  numero: number;
  bis: boolean;
  estaca: string;
  A: Miembro;
  B: Miembro;
  C: Miembro;
  D: Miembro;
};

type Props = {
  patrullas: Patrulla[];
  torneoId: number;
};

function etiqueta(p: Patrulla) {
  return `Patrulla ${p.numero}${p.bis ? " bis" : ""}`;
}

export default function PatrullasGrid({ patrullas, torneoId }: Props) {
  const [seleccionado, setSeleccionado] = useState<{ miembroId: number; label: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function seleccionar(miembroId: number, label: string) {
    if (seleccionado?.miembroId === miembroId) {
      setSeleccionado(null);
    } else {
      setSeleccionado({ miembroId, label });
      setError(null);
    }
  }

  function moverA(targetPatrullaId: number, targetPosicion: string) {
    if (!seleccionado) return;
    startTransition(async () => {
      const res = await moverMiembro(seleccionado.miembroId, targetPatrullaId, targetPosicion, torneoId);
      if (res?.error) setError(res.error);
      else setSeleccionado(null);
    });
  }

  const posiciones = ["A", "B", "C", "D"] as const;

  return (
    <div>
      {/* Instrucciones cuando hay algo seleccionado */}
      {seleccionado ? (
        <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <span className="text-sm text-blue-700">
            <strong>{seleccionado.label}</strong> seleccionado — hacé click en la posición destino para mover o intercambiar.
          </span>
          <button
            onClick={() => setSeleccionado(null)}
            className="ml-auto text-xs text-blue-400 hover:text-blue-600"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <p className="mb-4 text-xs text-slate-400">
          Hacé click en un arquero para seleccionarlo, luego click en la posición destino para moverlo.
        </p>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {patrullas.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${ESTACA_HEADER[p.estaca]}`}
          >
            {/* Header */}
            <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100">
              <span className="text-sm font-bold text-slate-800">{etiqueta(p)}</span>
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${ESTACA_COLOR[p.estaca]}`}>
                {p.estaca}
              </span>
            </div>

            {/* Posiciones */}
            <div className="divide-y divide-slate-50">
              {posiciones.map((pos) => {
                const miembro = p[pos];
                const esSeleccionado = seleccionado && miembro && seleccionado.miembroId === miembro.id;
                const esDestino = !!seleccionado && !isPending;

                return (
                  <div
                    key={pos}
                    onClick={() => {
                      if (!miembro && esDestino) {
                        moverA(p.id, pos);
                      } else if (miembro && esDestino && seleccionado?.miembroId !== miembro.id) {
                        moverA(p.id, pos);
                      } else if (miembro && !seleccionado) {
                        seleccionar(miembro.id, `${miembro.inscripcion.apellido} ${miembro.inscripcion.nombre} (${etiqueta(p)} - ${pos})`);
                      }
                    }}
                    className={[
                      "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                      miembro
                        ? esSeleccionado
                          ? "bg-blue-100 cursor-pointer"
                          : esDestino
                          ? "hover:bg-green-50 cursor-pointer"
                          : "hover:bg-slate-50 cursor-pointer"
                        : esDestino
                        ? "bg-green-50/50 hover:bg-green-100 cursor-pointer border-dashed"
                        : "bg-slate-50/50",
                    ].join(" ")}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {pos}
                    </span>
                    {miembro ? (
                      <div className="min-w-0">
                        <p className={`truncate leading-tight ${esSeleccionado ? "text-blue-700" : "text-slate-800"} ${miembro.inscripcion.presente ? "font-bold" : "font-medium"}`}>
                          {miembro.inscripcion.apellido}, {miembro.inscripcion.nombre}
                        </p>
                        <p className="text-xs text-slate-400">{miembro.inscripcion.categoria}</p>
                      </div>
                    ) : (
                      <span className={`text-xs ${esDestino ? "text-green-500 font-medium" : "text-slate-300"}`}>
                        {esDestino ? "← mover acá" : "vacío"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {isPending && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg px-6 py-4 text-sm text-slate-600">Guardando...</div>
        </div>
      )}
    </div>
  );
}
