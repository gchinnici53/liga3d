"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { inscribirse, buscarArqueroPorDNI, type InscripcionState } from "./actions";

const CATEGORIAS = ["CM", "CW", "BM", "BW", "LM", "LW", "TM", "TW", "ESC", "JUN"];
const NOMBRE_CAT: Record<string, string> = {
  CM: "Compuesto Masculino", CW: "Compuesto Femenino",
  BM: "Barebow Masculino",   BW: "Barebow Femenino",
  LM: "Longbow Masculino",   LW: "Longbow Femenino",
  TM: "Tradicional Masculino", TW: "Tradicional Femenino",
  ESC: "Escuela", JUN: "Junior",
};

const INPUT = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-liga";
const INPUT_PREFILL = "w-full border border-green-200 bg-green-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-liga";

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

  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [prefillado, setPrefillado] = useState(false);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [buscando, startBuscar] = useTransition();
  const [mostrarFecha, setMostrarFecha] = useState(false);

  function buscar() {
    if (!dni.trim()) return;
    setNoEncontrado(false);
    startBuscar(async () => {
      const arquero = await buscarArqueroPorDNI(dni);
      if (arquero) {
        setNombre(arquero.nombre);
        setApellido(arquero.apellido);
        setEmail(arquero.email ?? "");
        setTelefono(arquero.telefono ?? "");
        setPrefillado(true);
        setNoEncontrado(false);
        setMostrarFecha(true);
      } else {
        setNombre("");
        setApellido("");
        setEmail("");
        setTelefono("");
        setPrefillado(false);
        setNoEncontrado(true);
        setMostrarFecha(true);
      }
    });
  }

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
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      {/* DNI */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
        <div className="flex gap-2">
          <input
            name="dni"
            type="text"
            value={dni}
            onChange={(e) => { setDni(e.target.value); setPrefillado(false); setNoEncontrado(false); }}
            onBlur={buscar}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), buscar())}
            placeholder="Ingresá tu DNI para autocompletar"
            className={INPUT}
          />
          <button
            type="button"
            onClick={buscar}
            disabled={buscando || !dni.trim()}
            className="shrink-0 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
          >
            {buscando ? "..." : "Buscar"}
          </button>
        </div>

        {/* Feedback DNI */}
        {prefillado && (
          <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <span>✓</span>
            <span>Arquero registrado en la liga — datos precargados, podés editarlos si es necesario.</span>
          </div>
        )}
        {noEncontrado && (
          <p className="mt-1.5 text-xs text-slate-400">DNI no encontrado en el registro — completá los datos manualmente.</p>
        )}
      </div>

      {/* Datos personales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
          <input
            name="nombre" type="text" required
            value={nombre} onChange={(e) => setNombre(e.target.value)}
            className={prefillado ? INPUT_PREFILL : INPUT}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Apellido *</label>
          <input
            name="apellido" type="text" required
            value={apellido} onChange={(e) => setApellido(e.target.value)}
            className={prefillado ? INPUT_PREFILL : INPUT}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
          <input
            name="email" type="email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            className={prefillado ? INPUT_PREFILL : INPUT}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
          <input
            name="telefono" type="tel"
            value={telefono} onChange={(e) => setTelefono(e.target.value)}
            className={prefillado ? INPUT_PREFILL : INPUT}
          />
        </div>

        {/* Fecha de nacimiento */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Fecha de nacimiento *
            {prefillado && (
              <span className="ml-2 text-xs font-normal text-amber-600">
                — Ingresala para verificar tu identidad
              </span>
            )}
          </label>
          <input
            name="fechaNacimiento"
            type="date"
            required
            className={`${INPUT} max-w-xs`}
          />
        </div>

        {/* Categoría y club — siempre manuales */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoría *</label>
          <select name="categoria" required defaultValue=""
            className={`${INPUT} bg-white`}>
            <option value="" disabled>Seleccioná tu categoría</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>{cat} — {NOMBRE_CAT[cat]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Club</label>
          <input name="club" type="text" placeholder="Opcional"
            className={INPUT} />
        </div>
      </div>

      <Boton />
      <p className="text-xs text-slate-400 text-center">Tu inscripción quedará confirmada una vez enviado el formulario.</p>
    </form>
  );
}
