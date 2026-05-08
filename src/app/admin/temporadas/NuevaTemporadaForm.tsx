"use client";

import { useFormState, useFormStatus } from "react-dom";
import { crearTemporada } from "./actions";
import Button from "@/components/ui/Button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variante="primary" className="w-full" disabled={pending}>
      {pending ? "Creando..." : "Crear temporada"}
    </Button>
  );
}

export default function NuevaTemporadaForm() {
  const [state, formAction] = useFormState(crearTemporada, {});
  const anioActual = new Date().getFullYear();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Nueva temporada</h2>

      <form action={formAction} className="space-y-4">
        {state.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {state.error}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Año</label>
          <input
            name="anio"
            type="number"
            defaultValue={anioActual}
            min={2000}
            max={2100}
            required
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Nombre</label>
          <input
            name="nombre"
            type="text"
            placeholder={`Temporada ${anioActual}`}
            required
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-slate-400">Ej: Temporada 2026</p>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
