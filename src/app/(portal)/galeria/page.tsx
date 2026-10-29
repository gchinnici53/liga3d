import type { Metadata } from "next";
import { listarFotosGaleria } from "@/lib/driveGallery";

export const metadata: Metadata = { title: "Galería — Liga 3D" };

export default async function GaleriaPage() {
  const fotos = await listarFotosGaleria();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-horta text-4xl text-slate-800 mb-2">Galería</h1>
      <p className="text-slate-500 text-sm mb-8">Fotos de los torneos de la liga</p>

      {fotos.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-sm">
          Todavía no hay fotos cargadas.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {fotos.map((foto) => (
            <a
              key={foto.id}
              href={foto.full}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:opacity-90 transition-opacity"
            >
              <img src={foto.thumb} alt={foto.nombre} className="w-full h-full object-cover" loading="lazy" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
