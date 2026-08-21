"use client";

import { useState, useTransition } from "react";
import { validarDNI, enviarCodigo, verificarCodigo, actualizarPerfil } from "./actions";

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

type Fase = "idle" | "validando" | "verificando-email" | "editando" | "guardado";
type EmailSubFase = "ingresando" | "codigo";

export default function EditarPerfil({ arqueroId, inicial }: Props) {
  const [fase, setFase]               = useState<Fase>("idle");
  const [dni, setDni]                 = useState("");
  const [error, setError]             = useState<string | null>(null);
  const [isPending, start]            = useTransition();

  // OTP
  const [emailSubFase, setEmailSubFase] = useState<EmailSubFase>("ingresando");
  const [emailInput, setEmailInput]     = useState("");   // lo que escribe el usuario
  const [otpToken, setOtpToken]         = useState("");   // token firmado devuelto por el server
  const [codigoInput, setCodigoInput]   = useState("");   // código de 6 dígitos
  const [emailVerificado, setEmailVerificado] = useState(""); // email validado por OTP

  // Foto
  const [fotoActual, setFotoActual]   = useState(inicial.foto);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile]       = useState<File | null>(null);
  const [fotoError, setFotoError]     = useState<string | null>(null);
  const [fotoOk, setFotoOk]           = useState(false);
  const [subiendo, setSubiendo]       = useState(false);

  // ── Helpers ────────────────────────────────────────────────
  function cancelar() {
    setFase("idle");
    setError(null);
    setDni("");
    setEmailSubFase("ingresando");
    setEmailInput("");
    setOtpToken("");
    setCodigoInput("");
    setEmailVerificado("");
    setFotoPreview(null);
    setFotoFile(null);
    setFotoError(null);
    setFotoOk(false);
  }

  // ── Paso 1: validar DNI ────────────────────────────────────
  function handleValidarDNI() {
    if (!dni.trim()) return;
    setError(null);
    start(async () => {
      const ok = await validarDNI(arqueroId, dni);
      if (ok) {
        setEmailInput(inicial.email ?? ""); // pre-cargar email de la DB
        setFase("verificando-email");
      } else {
        setError("El DNI no coincide con nuestros registros.");
      }
    });
  }

  // ── Paso 2a: enviar código al email ───────────────────────
  function handleEnviarCodigo() {
    if (!emailInput.trim()) { setError("Ingresá un email para recibir el código."); return; }
    setError(null);
    start(async () => {
      const res = await enviarCodigo(arqueroId, dni, emailInput);
      if (res.error) {
        setError(res.error);
      } else {
        setOtpToken(res.token!);
        setCodigoInput("");
        setEmailSubFase("codigo");
      }
    });
  }

  // ── Paso 2b: verificar código ingresado ───────────────────
  function handleVerificarCodigo() {
    if (codigoInput.trim().length < 6) return;
    setError(null);
    start(async () => {
      const res = await verificarCodigo(otpToken, codigoInput);
      if (res.error) {
        setError(res.error);
      } else {
        setEmailVerificado(emailInput.trim().toLowerCase());
        setFase("editando");
      }
    });
  }

  // ── Foto ───────────────────────────────────────────────────
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

  // ── Paso 3: guardar perfil ─────────────────────────────────
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

  // ══════════════════════════════════════════════════════════
  // Renders
  // ══════════════════════════════════════════════════════════

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

  if (fase === "guardado") {
    return (
      <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4 text-center text-sm text-green-700 font-medium">
        ✓ Perfil actualizado correctamente.
      </div>
    );
  }

  // ── Paso 1: DNI ───────────────────────────────────────────
  if (fase === "validando") {
    return (
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-1">Paso 1 de 2 — Verificar identidad</h3>
        <p className="text-sm text-slate-500 mb-4">
          Ingresá tu DNI (sin puntos) para confirmar que sos el titular de este perfil.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleValidarDNI()}
            placeholder="Ej: 28456789"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-liga/40"
            autoFocus
          />
          <button
            onClick={handleValidarDNI}
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

  // ── Paso 2: verificación por email ────────────────────────
  if (fase === "verificando-email") {
    // Sub-fase A: ingresar email y pedir código
    if (emailSubFase === "ingresando") {
      return (
        <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="font-semibold text-slate-800 mb-1">Paso 2 de 2 — Verificación por email</h3>
          <p className="text-sm text-slate-500 mb-4">
            Enviamos un código de un solo uso a tu email. Confirmá o modificá la dirección.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEnviarCodigo()}
              placeholder="tu@email.com"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-liga/40"
              autoFocus
            />
            <button
              onClick={handleEnviarCodigo}
              disabled={isPending || !emailInput.trim()}
              className="bg-liga text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-liga-dark disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {isPending ? "Enviando..." : "Enviar código"}
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          <button
            onClick={cancelar}
            className="mt-4 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← Cancelar
          </button>
        </div>
      );
    }

    // Sub-fase B: ingresar el código recibido
    return (
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-1">Paso 2 de 2 — Código de verificación</h3>
        <p className="text-sm text-slate-500 mb-4">
          Revisá <strong>{emailInput}</strong> e ingresá el código de 6 dígitos que te enviamos.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={codigoInput}
            onChange={(e) => setCodigoInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => e.key === "Enter" && handleVerificarCodigo()}
            placeholder="000000"
            maxLength={6}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-36 text-center tracking-widest text-lg font-mono focus:outline-none focus:ring-2 focus:ring-liga/40"
            autoFocus
          />
          <button
            onClick={handleVerificarCodigo}
            disabled={isPending || codigoInput.length < 6}
            className="bg-liga text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-liga-dark disabled:opacity-50 transition-colors"
          >
            {isPending ? "..." : "Verificar"}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <button
            onClick={() => { setEmailSubFase("ingresando"); setError(null); setCodigoInput(""); }}
            className="hover:text-slate-600 transition-colors"
          >
            ← Cambiar email o reenviar
          </button>
          <span>·</span>
          <button onClick={cancelar} className="hover:text-slate-600 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // ── Paso 3: editar datos ──────────────────────────────────
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
            { name: "nombre",          label: "Nombre *",             value: inicial.nombre,            type: "text",  required: true  },
            { name: "apellido",        label: "Apellido *",           value: inicial.apellido,          type: "text",  required: true  },
            { name: "email",           label: "Email",                value: emailVerificado,           type: "email", required: false },
            { name: "telefono",        label: "Teléfono",             value: inicial.telefono ?? "",    type: "text",  required: false },
            { name: "pais",            label: "País",                 value: inicial.pais,              type: "text",  required: false },
            { name: "fechaNacimiento", label: "Fecha de nacimiento",  value: inicial.fechaNacimiento,   type: "date",  required: false },
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
