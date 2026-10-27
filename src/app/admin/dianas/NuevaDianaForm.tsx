"use client";

import { useFormState, useFormStatus } from "react-dom";
import { crearDiana } from "./actions";
import Button from "@/components/ui/Button";
import { ZONAS_VITALES_MAX } from "@/lib/dianas";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variante="primary" className="w-full" disabled={pending}>
      {pending ? "Creando..." : "Crear diana"}
    </Button>
  );
}

export default function NuevaDianaForm() {
  const [rawState, formAction] = useFormState(crearDiana, {});
  const state = rawState ?? {};

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Nueva diana</h2>

      <form action={formAction} className="space-y-4">
        {state.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {state.error}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Nombre</label>
          <input
            name="nombre"
            type="text"
            placeholder="Ej: Jabalí grande #3"
            required
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Zonas vitales</label>
          <select
            name="cantidadZonas"
            defaultValue={1}
            required
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {Array.from({ length: ZONAS_VITALES_MAX }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Cantidad en inventario</label>
          <input
            name="cantidad"
            type="number"
            min={1}
            defaultValue={1}
            required
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-slate-400">Cuántas dianas físicas de este tipo tiene el club</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Costo de compra ($)</label>
          <input
            name="costoCompra"
            type="number"
            min={0}
            step="0.01"
            placeholder="Opcional"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Vida útil por zona (torneos)</label>
          <input
            name="vidaUtilUsosZona"
            type="number"
            min={1}
            placeholder="Opcional"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-slate-400">Cantidad de torneos que soporta cada zona antes de reponerla</p>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
