import type { Metadata } from "next";
import { listarFotosGaleria } from "@/lib/driveGallery";
import { listarVideosGaleria } from "@/lib/youtubeGallery";
import GaleriaTabs from "./GaleriaTabs";

export const metadata: Metadata = { title: "Galería — Liga 3D" };

export default async function GaleriaPage() {
  const [fotos, videos] = await Promise.all([listarFotosGaleria(), listarVideosGaleria()]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-horta text-4xl text-slate-800 mb-2">Galería</h1>
      <p className="text-slate-500 text-sm mb-8">Fotos y videos de los torneos de la liga</p>

      <GaleriaTabs fotos={fotos} videos={videos} />
    </div>
  );
}
