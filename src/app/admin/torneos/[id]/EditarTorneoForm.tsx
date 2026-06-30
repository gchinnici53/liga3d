"use client";

import { useFormState, useFormStatus } from "react-dom";
import { editarTorneo, type EditarTorneoState } from "./actions";

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50 transition-colors"
    >
      {pending ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

type Props = {
  torneo: {
    id: number;
    nombre: string;
    lugar: string;
    fecha: Date;
    horario: string | null;
    direccion: string | null;
    maxInscriptos: number;
  };
};

export default function EditarTorneoForm({ torneo }: Props) {
  const action = editarTorneo.bind(null, torneo.id);
  const [state, formAction] = useFormState<EditarTorneoState, FormData>(action, {});

  const fechaISO = new Date(torneo.fecha).toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Datos del torneo</h2>

      {state.error && <p className="text-sm text-red-600 mb-3">{state.error}</p>}
      {state.exito && <p className="text-sm text-green-700 font-medium mb-3">Cambios guardados.</p>}

      <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
          <input
            name="nombre"
            type="text"
            defaultValue={torneo.nombre}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Lugar *</label>
          <input
            name="lugar"
            type="text"
            defaultValue={torneo.lugar}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Fecha *</label>
          <input
            name="fecha"
            type="date"
            defaultValue={fechaISO}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Horario</label>
          <input
            name="horario"
            type="text"
            defaultValue={torneo.horario ?? ""}
            placeholder="9 hs"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Dirección (para el mapa)</label>
          <input
            name="direccion"
            type="text"
            defaultValue={torneo.direccion ?? ""}
            placeholder="Calle 404 entre 618 y 619, El Pato, Buenos Aires"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Máx. inscriptos</label>
          <input
            name="maxInscriptos"
            type="number"
            defaultValue={torneo.maxInscriptos}
            min={1}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div className="sm:col-span-2 flex justify-end">
          <Boton />
        </div>
      </form>
    </div>
  );
}
