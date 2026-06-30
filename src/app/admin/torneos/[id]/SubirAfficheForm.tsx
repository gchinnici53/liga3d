"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { torneoId: number; afficheActual: string | null };

export default function SubirAfficheForm({ torneoId, afficheActual }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [preview, setPreview]     = useState<string | null>(null);
  const [exito, setExito]         = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const imagenMostrada = preview ?? afficheActual;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setExito(false);
      setError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("torneoId", String(torneoId));

    setIsPending(true);
    setError(null);
    try {
      const res  = await fetch("/api/subir-afiche", { method: "POST", body: formData });
      const text = await res.text();
      if (!res.ok) {
        setError(`Error HTTP ${res.status} — ${text.substring(0, 120)}`);
        return;
      }
      const data = JSON.parse(text) as { afiche?: string; error?: string };
      if (data.error) {
        setError(data.error);
      } else if (data.afiche) {
        setPreview(data.afiche);
        setExito(true);
        router.refresh();
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : "desconocido"}`);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Afiche del torneo</h2>
      <form onSubmit={handleSubmit} className="flex items-start gap-5">
        {imagenMostrada && (
          <img
            src={imagenMostrada}
            alt="Afiche"
            className="h-32 w-auto rounded-lg border border-slate-200 object-contain"
          />
        )}
        <div className="flex-1 space-y-2">
          <input
            name="afiche"
            type="file"
            accept="image/*"
            required
            onChange={handleChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          {error  && <p className="text-xs text-red-600">{error}</p>}
          {exito  && <p className="text-xs text-green-700 font-medium">Afiche guardado correctamente.</p>}
          <button
            type="submit"
            disabled={isPending}
            className="bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Subiendo..." : "Guardar afiche"}
          </button>
        </div>
      </form>
    </div>
  );
}
