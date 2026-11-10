"use client";

import { useState } from "react";
import type { FotoGaleria } from "@/lib/driveGallery";
import type { VideoGaleria } from "@/lib/youtubeGallery";

type Tab = "fotos" | "videos";

export default function GaleriaTabs({ fotos, videos }: { fotos: FotoGaleria[]; videos: VideoGaleria[] }) {
  const [tab, setTab] = useState<Tab>(fotos.length === 0 && videos.length > 0 ? "videos" : "fotos");

  return (
    <>
      <div className="flex gap-1.5 mb-6">
        <button
          onClick={() => setTab("fotos")}
          className={[
            "px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
            tab === "fotos" ? "bg-liga text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          ].join(" ")}
        >
          Fotos
        </button>
        <button
          onClick={() => setTab("videos")}
          className={[
            "px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
            tab === "videos" ? "bg-liga text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          ].join(" ")}
        >
          Videos
        </button>
      </div>

      {tab === "fotos" ? (
        fotos.length === 0 ? (
          <Vacio texto="Todavía no hay fotos cargadas." />
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
        )
      ) : videos.length === 0 ? (
        <Vacio texto="Todavía no hay videos cargados." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {videos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={video.miniatura}
                  alt={video.titulo}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-black/75 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                      <path d="M6 4l10 6-10 6V4z" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-700 mt-1.5 line-clamp-2">{video.titulo}</p>
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function Vacio({ texto }: { texto: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-sm">
      {texto}
    </div>
  );
}
