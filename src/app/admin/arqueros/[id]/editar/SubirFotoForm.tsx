"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { subirFotoArquero } from "../../actions";

type Props = { arqueroId: number; fotoActual: string | null };

export default function SubirFotoForm({ arqueroId, fotoActual }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview]   = useState<string | null>(null);
  const [exito, setExito]       = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const fotoMostrada = preview ?? fotoActual;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setExito(false);
      setError(null);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const res = await subirFotoArquero(arqueroId, formData);
        if (res?.error) {
          setError(res.error);
        } else {
          setExito(true);
          router.refresh();
        }
      } catch {
        setError("Error al subir la foto. Si el archivo es muy grande, reducí el tamaño e intentá de nuevo.");
      }
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Foto de perfil</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
            {fotoMostrada ? (
              <img src={fotoMostrada} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-400 text-xs text-center px-2">Sin foto</span>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <input
              name="foto"
              type="file"
              accept="image/*"
              required
              onChange={handleChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {error  && <p className="text-xs text-red-600">{error}</p>}
            {exito  && <p className="text-xs text-green-700 font-medium">Foto guardada correctamente.</p>}
            <button
              type="submit"
              disabled={isPending}
              className="bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Subiendo..." : "Guardar foto"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
