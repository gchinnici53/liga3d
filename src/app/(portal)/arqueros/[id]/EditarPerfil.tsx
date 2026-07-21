"use client";

import { useState, useTransition } from "react";
import { validarDNI, actualizarPerfil } from "./actions";

type Props = {
  arqueroId: number;
  inicial: {
    nombre: string;
    apellido: string;
    pais: string;
    email: string | null;
    telefono: string | null;
  };
};

type Fase = "idle" | "validando" | "editando" | "guardado";

export default function EditarPerfil({ arqueroId, inicial }: Props) {
  const [fase, setFase]     = useState<Fase>("idle");
  const [dni, setDni]       = useState("");
  const [error, setError]   = useState<string | null>(null);
  const [isPending, start]  = useTransition();

  function cancelar() {
    setFase("idle");
    setError(null);
    setDni("");
  }

  function handleValidar() {
    if (!dni.trim()) return;
    setError(null);
    start(async () => {
      const ok = await validarDNI(arqueroId, dni);
      if (ok) setFase("editando");
      else setError("El DNI no coincide con nuestros registros.");
    });
  }

  function handleGuardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await actualizarPerfil(arqueroId, dni, fd);
      if (res.error) setError(res.error);
      else setFase("guardado");
    });
  }

  if (fase === "guardado") {
    return (
      <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4 text-center text-sm text-green-700 font-medium">
        ✓ Perfil actualizado correctamente.
      </div>
    );
  }

  if (fase === "idle") {
    return (
      <button
        onClick={() => setFase("validando")}
        className="mt-8 w-full border border-slate-200 text-slate-500 rounded-xl py-3 text-sm hover:bg-slate-50 transition-colors"
      >
        ✏️ Editar mi perfil
      </button>
    );
  }

  if (fase === "validando") {
    return (
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-1">Verificar identidad</h3>
        <p className="text-sm text-slate-500 mb-4">
          Ingresá tu DNI (sin puntos) para confirmar que sos el titular de este perfil.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleValidar()}
            placeholder="Ej: 28456789"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-liga/40"
            autoFocus
          />
          <button
            onClick={handleValidar}
            disabled={isPending || !dni.trim()}
            className="bg-liga text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-liga-dark disabled:opacity-50 transition-colors"
          >
            {isPending ? "..." : "Confirmar"}
          </button>
          <button
            onClick={cancelar}
            className="px-3 py-2 rounded-lg border border-slate-200 text-slate-400 text-sm hover:bg-slate-50 transition-colors"
          >
            ✕
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>
    );
  }

  // fase === "editando"
  return (
    <form onSubmit={handleGuardar} className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
      <h3 className="font-semibold text-slate-800 mb-4">Editar perfil</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { name: "nombre",   label: "Nombre",   value: inicial.nombre,        type: "text" },
          { name: "apellido", label: "Apellido", value: inicial.apellido,      type: "text" },
          { name: "email",    label: "Email",    value: inicial.email ?? "",   type: "email" },
          { name: "telefono", label: "Teléfono", value: inicial.telefono ?? "", type: "text" },
          { name: "pais",     label: "País",     value: inicial.pais,          type: "text" },
        ].map(({ name, label, value, type }) => (
          <div key={name}>
            <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
            <input
              name={name}
              type={type}
              defaultValue={value}
              required={name === "nombre" || name === "apellido"}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-liga/40"
            />
          </div>
        ))}
      </div>
      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      <div className="flex gap-2 mt-5">
        <button
          type="submit"
          disabled={isPending}
          className="bg-liga text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-liga-dark disabled:opacity-50 transition-colors"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={cancelar}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
