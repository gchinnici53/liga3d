"use client";

import { useFormState, useFormStatus } from "react-dom";
import { inscribirse, type InscripcionState } from "./actions";

const CATEGORIAS = ["CM", "CW", "BM", "BW", "LM", "LW", "TM", "TW", "ESC", "JUN"];
const NOMBRE_CAT: Record<string, string> = {
  CM: "Compuesto Masculino", CW: "Compuesto Femenino",
  BM: "Barebow Masculino",   BW: "Barebow Femenino",
  LM: "Longbow Masculino",   LW: "Longbow Femenino",
  TM: "Tradicional Masculino", TW: "Tradicional Femenino",
  ESC: "Escuela", JUN: "Junior",
};

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-liga hover:bg-liga-dark text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
    >
      {pending ? "Enviando..." : "Confirmar inscripción"}
    </button>
  );
}

export default function InscripcionForm({ torneoId }: { torneoId: number }) {
  const action = inscribirse.bind(null, torneoId);
  const [state, formAction] = useFormState<InscripcionState, FormData>(action, {});

  if (state.exito) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <p className="text-3xl mb-3">✅</p>
        <h2 className="text-xl font-bold text-green-800 mb-2">¡Inscripción confirmada!</h2>
        <p className="text-green-700 text-sm">Te esperamos en el torneo. Vas a recibir más información por email.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
          <input name="nombre" type="text" required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-liga" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Apellido *</label>
          <input name="apellido" type="text" required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-liga" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
          <input name="email" type="email" required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-liga" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
          <input name="telefono" type="tel"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-liga" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoría *</label>
          <select name="categoria" required defaultValue=""
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-liga">
            <option value="" disabled>Seleccioná tu categoría</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>{cat} — {NOMBRE_CAT[cat]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Club</label>
          <input name="club" type="text" placeholder="Opcional"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-liga" />
        </div>
      </div>

      <Boton />
      <p className="text-xs text-slate-400 text-center">Tu inscripción quedará confirmada una vez enviado el formulario.</p>
    </form>
  );
}
