"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { actualizarEquipo, eliminarEquipo, type EquipoFormState } from "./actions";
import SelectorArquero, { type ArqueroOpt } from "./SelectorArquero";
import { TIPO_ARCO_VALUES, type TipoArco } from "@/types/enums";
import { TIPO_ARCO_LABEL, type EquipoRanking } from "@/lib/equipos";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-green-700 text-white text-xs px-3 py-1.5 rounded hover:bg-green-800 disabled:opacity-50 font-medium"
    >
      {pending ? "…" : "Guardar"}
    </button>
  );
}

export default function EquipoRow({
  equipo,
  arqueros,
  temporadaId,
}: {
  equipo: EquipoRanking;
  arqueros: ArqueroOpt[];
  temporadaId: number;
}) {
  const [editando, setEditando] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const actionConId = (_prev: EquipoFormState, formData: FormData) => actualizarEquipo(equipo.id, formData);
  const [state, formAction] = useFormState(actionConId, {});

  const [tipoArco, setTipoArco] = useState<TipoArco>(equipo.tipoArco);
  const [miembros, setMiembros] = useState<(number | null)[]>(equipo.miembros.map((m) => m.id));

  function setMiembro(idx: number, id: number | null) {
    setMiembros((prev) => prev.map((v, i) => (i === idx ? id : v)));
  }

  function handleEliminar() {
    if (!confirm(`¿Eliminar el equipo "${equipo.nombre}"?`)) return;
    setErrorEliminar(null);
    startTransition(() => eliminarEquipo(equipo.id));
  }

  if (editando) {
    const idsElegidos = miembros.filter((m): m is number => m != null);
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="temporadaId" value={temporadaId} />
          <input type="hidden" name="miembro1" value={miembros[0] ?? ""} />
          <input type="hidden" name="miembro2" value={miembros[1] ?? ""} />
          <input type="hidden" name="miembro3" value={miembros[2] ?? ""} />

          {state?.error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1.5">
              {state.error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Nombre</label>
              <input
                name="nombre"
                defaultValue={equipo.nombre}
                required
                className="border border-slate-300 rounded px-2 py-1.5 text-sm w-48"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Tipo de arco</label>
              <select
                name="tipoArco"
                value={tipoArco}
                onChange={(e) => setTipoArco(e.target.value as TipoArco)}
                className="border border-slate-300 rounded px-2 py-1.5 text-sm"
              >
                {TIPO_ARCO_VALUES.map((t) => (
                  <option key={t} value={t}>
                    {TIPO_ARCO_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map((idx) => (
              <SelectorArquero
                key={idx}
                label={`Arquero ${idx + 1}`}
                arqueros={arqueros}
                value={miembros[idx]}
                onChange={(id) => setMiembro(idx, id)}
                excludeIds={idsElegidos.filter((id) => id !== miembros[idx])}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <SaveButton />
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded hover:bg-slate-300 font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800">{equipo.nombre}</h3>
            <span
              className={[
                "px-1.5 py-0.5 rounded text-xs font-semibold",
                equipo.califica ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500",
              ].join(" ")}
            >
              {equipo.califica ? "Puede ser campeón" : "No califica"}
            </span>
          </div>
          <ul className="mt-2 space-y-0.5">
            {equipo.miembros.map((m) => (
              <li key={m.id} className="text-sm text-slate-600 flex items-center gap-1.5">
                <span className={m.califica ? "text-green-600" : "text-slate-300"}>●</span>
                {m.nombre} {m.apellido}
                <span className="text-xs text-slate-400">
                  ({m.torneosRegulares} regulares{m.tiroFinal ? " + final" : ""})
                </span>
                <span className="text-xs font-semibold text-slate-500 ml-auto">{m.total}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className="text-2xl font-bold text-liga">{equipo.total}</p>
          <div className="flex gap-1">
            <button
              onClick={() => setEditando(true)}
              className="text-slate-400 hover:text-blue-600 text-sm px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              title="Editar equipo"
            >
              ✏
            </button>
            <button
              onClick={handleEliminar}
              disabled={isPending}
              className="text-slate-400 hover:text-red-600 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
              title="Eliminar equipo"
            >
              🗑
            </button>
          </div>
          {errorEliminar && <p className="text-xs text-red-500 text-right">{errorEliminar}</p>}
        </div>
      </div>
    </div>
  );
}
