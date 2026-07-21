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
    fechaNacimiento: string; // YYYY-MM-DD
    foto: string | null;
  };
};

type Fase = "idle" | "validando" | "editando" | "guardado";

export default function EditarPerfil({ arqueroId, inicial }: Props) {
  const [fase, setFase]           = useState<Fase>("idle");
  const [dni, setDni]             = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [isPending, start]        = useTransition();

  // Estado para la foto
  const [fotoActual, setFotoActual]   = useState(inicial.foto);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile]       = useState<File | null>(null);
  const [fotoError, setFotoError]     = useState<string | null>(null);
  const [fotoOk, setFotoOk]           = useState(false);
  const [subiendo, setSubiendo]       = useState(false);

  function cancelar() {
    setFase("idle");
    setError(null);
    setDni("");
    setFotoPreview(null);
    setFotoFile(null);
    setFotoError(null);
    setFotoOk(false);
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

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
    setFotoError(null);
    setFotoOk(false);
  }

  async function handleSubirFoto() {
    if (!fotoFile) return;
    setSubiendo(true);
    setFotoError(null);
    try {
      const fd = new FormData();
      fd.set("arqueroId", String(arqueroId));
      fd.set("dni", dni);
      fd.set("foto", fotoFile);
      const res  = await fetch("/api/perfil/subir-foto", { method: "POST", body: fd });
      const data = await res.json() as { foto?: string; error?: string };
      if (!res.ok || data.error) {
        setFotoError(data.error ?? "Error al subir la foto.");
      } else if (data.foto) {
        setFotoActual(data.foto);
        setFotoPreview(null);
        setFotoFile(null);
        setFotoOk(true);
      }
    } catch {
      setFotoError("Error de conexión al subir la foto.");
    } finally {
      setSubiendo(false);
    }
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

  // ── idle ──────────────────────────────────────────────────
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

  // ── guardado ──────────────────────────────────────────────
  if (fase === "guardado") {
    return (
      <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4 text-center text-sm text-green-700 font-medium">
        ✓ Perfil actualizado correctamente.
      </div>
    );
  }

  // ── validando DNI ─────────────────────────────────────────
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

  // ── editando ──────────────────────────────────────────────
  const fotoMostrada = fotoPreview ?? fotoActual;

  return (
    <div className="mt-8 space-y-5">

      {/* Sección foto */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Foto de perfil</h3>
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
            {fotoMostrada ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoMostrada} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-400 font-bold text-2xl">
                {inicial.nombre[0]}{inicial.apellido[0]}
              </span>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-liga/10 file:text-liga hover:file:bg-liga/20"
            />
            {fotoFile && (
              <button
                type="button"
                onClick={handleSubirFoto}
                disabled={subiendo}
                className="bg-liga text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-liga-dark disabled:opacity-50 transition-colors"
              >
                {subiendo ? "Subiendo..." : "Guardar foto"}
              </button>
            )}
            {fotoError && <p className="text-xs text-red-600">{fotoError}</p>}
            {fotoOk    && <p className="text-xs text-green-700 font-medium">✓ Foto actualizada.</p>}
          </div>
        </div>
      </div>

      {/* Formulario datos */}
      <form onSubmit={handleGuardar} className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Datos personales</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: "nombre",   label: "Nombre *",   value: inicial.nombre,          type: "text",  required: true  },
            { name: "apellido", label: "Apellido *",  value: inicial.apellido,        type: "text",  required: true  },
            { name: "email",    label: "Email",       value: inicial.email ?? "",     type: "email", required: false },
            { name: "telefono", label: "Teléfono",    value: inicial.telefono ?? "",  type: "text",  required: false },
            { name: "pais",     label: "País",        value: inicial.pais,            type: "text",  required: false },
            { name: "fechaNacimiento", label: "Fecha de nacimiento", value: inicial.fechaNacimiento, type: "date", required: false },
          ].map(({ name, label, value, type, required }) => (
            <div key={name}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
              <input
                name={name}
                type={type}
                defaultValue={value}
                required={required}
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
    </div>
  );
}
