import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Liga 3D Metropolitana",
    short_name: "Liga 3D",
    description: "Gestión de torneos de tiro con arco 3D — Liga 3D Metropolitana",
    // Al tocar el ícono va directo al login (o al dashboard si ya hay sesión).
    start_url: "/admin/dashboard",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#E8722A",
    icons: [
      { src: "/img/Liga3dLOGOALTA.png", sizes: "192x192", type: "image/png" },
      { src: "/img/Liga3dLOGOALTA.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
