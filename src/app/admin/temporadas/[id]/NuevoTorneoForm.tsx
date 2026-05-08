"use client";

import { useFormState, useFormStatus } from "react-dom";
import { crearTorneo } from "./actions";
import Button from "@/components/ui/Button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variante="primary" className="w-full" disabled={pending}>
      {pending ? "Creando..." : "Crear torneo"}
    </Button>
  );
}

export default function NuevoTorneoForm({ temporadaId }: { temporadaId: number }) {
  const action = crearTorneo.bind(null, temporadaId);
  const [state, formAction] = useFormState(action, {});

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Nuevo torneo</h2>

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
            placeholder="Torneo 1"
            required
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Lugar</label>
          <input
            name="lugar"
            type="text"
            placeholder="Club de Arquería..."
            required
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Fecha</label>
          <input
            name="fecha"
            type="date"
            required
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Tipo</label>
          <select
            name="tipo"
            defaultValue="REGULAR"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="REGULAR">Regular</option>
            <option value="FINAL">Final</option>
          </select>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
