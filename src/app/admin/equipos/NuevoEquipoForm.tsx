"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { crearEquipo } from "./actions";
import Button from "@/components/ui/Button";
import SelectorArquero, { type ArqueroOpt } from "./SelectorArquero";
import { TIPO_ARCO_VALUES, type TipoArco } from "@/types/enums";
import { TIPO_ARCO_LABEL } from "@/lib/equipos";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variante="primary" className="w-full" disabled={pending}>
      {pending ? "Creando..." : "Crear equipo"}
    </Button>
  );
}

export default function NuevoEquipoForm({
  arqueros,
  temporadaId,
}: {
  arqueros: ArqueroOpt[];
  temporadaId: number;
}) {
  const [rawState, formAction] = useFormState(crearEquipo, {});
  const state = rawState ?? {};
  const [tipoArco, setTipoArco] = useState<TipoArco>("COMPUESTO");
  const [miembros, setMiembros] = useState<(number | null)[]>([null, null, null]);

  function setMiembro(idx: number, id: number | null) {
    setMiembros((prev) => prev.map((v, i) => (i === idx ? id : v)));
  }

  const idsElegidos = miembros.filter((m): m is number => m != null);
  const sexosElegidos = idsElegidos.map((id) => arqueros.find((a) => a.id === id)?.sexo);
  const hayFemenino = sexosElegidos.some((s) => s === "FEMENINO");
  const faltanMiembros = idsElegidos.length < 3;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Nuevo equipo</h2>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="temporadaId" value={temporadaId} />
        <input type="hidden" name="miembro1" value={miembros[0] ?? ""} />
        <input type="hidden" name="miembro2" value={miembros[1] ?? ""} />
        <input type="hidden" name="miembro3" value={miembros[2] ?? ""} />

        {state.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {state.error}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Nombre del equipo</label>
          <input
            name="nombre"
            type="text"
            placeholder="Ej: Los Centauros"
            required
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Tipo de arco</label>
          <select
            name="tipoArco"
            value={tipoArco}
            onChange={(e) => setTipoArco(e.target.value as TipoArco)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {TIPO_ARCO_VALUES.map((t) => (
              <option key={t} value={t}>
                {TIPO_ARCO_LABEL[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-700">Arqueros (3, mínimo 1 mujer)</p>
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
          {!faltanMiembros && !hayFemenino && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              El equipo necesita al menos una arquera mujer.
            </p>
          )}
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
