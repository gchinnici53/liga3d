"use client";

import { useFormState, useFormStatus } from "react-dom";
import { crearUsuario } from "./actions";

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50 transition-colors"
    >
      {pending ? "Creando..." : "Crear usuario"}
    </button>
  );
}

export default function NuevoUsuarioForm() {
  const [state, action] = useFormState(crearUsuario, {});

  return (
    <form action={action} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
        <input
          name="email"
          type="email"
          required
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          placeholder="usuario@example.com"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Contraseña *</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Rol *</label>
        <select
          name="rol"
          required
          defaultValue="CARGA"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
        >
          <option value="ADMIN">Administrador</option>
          <option value="CARGA">Carga</option>
          <option value="INVITADO">Invitado</option>
        </select>
      </div>

      {state.error && (
        <div className="sm:col-span-2">
          <p className="text-sm text-red-600">{state.error}</p>
        </div>
      )}
      {state.exito && (
        <div className="sm:col-span-2">
          <p className="text-sm text-green-700 font-medium">Usuario creado correctamente.</p>
        </div>
      )}

      <div className="sm:col-span-2 flex justify-end">
        <Boton />
      </div>
    </form>
  );
}
