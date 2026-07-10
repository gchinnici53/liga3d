import type { Metadata } from "next";
import Image from "next/image";
import { existsSync } from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Nosotros — Liga 3D",
};

const EQUIPO = [
  { nombre: "Gustavo Chinnici", foto: "/img/equipo/gustavo.jpg"  },
  { nombre: "Andrés Grippo",    foto: "/img/equipo/andres.jpg"   },
  { nombre: "Agustín Pazos",    foto: "/img/equipo/agustin.jpg"  },
  { nombre: "Pablo Jonte",      foto: "/img/equipo/pablo_j.jpg"  },
];

const COLABORADORES = [
  { nombre: "Pablo San Millán", foto: "/img/equipo/pablo_sm.jpg" },
  { nombre: "Marcos Kraft",     foto: "/img/equipo/marcos.jpg"   },
  { nombre: "Soledad Musante",  foto: "/img/equipo/soledad.jpg"  },
  { nombre: "Andrea Manzoni",   foto: "/img/equipo/andrea.jpg"   },
];

function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("");
}

function tieneImagen(src: string): boolean {
  return existsSync(path.join(process.cwd(), "public", src));
}

function PersonaCard({ nombre, foto }: { nombre: string; foto: string }) {
  const hayFoto = tieneImagen(foto);
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-liga/10 border-2 border-liga/20 flex items-center justify-center shrink-0 relative">
        {hayFoto ? (
          <Image src={foto} alt={nombre} fill className="object-cover" />
        ) : (
          <span className="text-liga font-bold text-xl">{iniciales(nombre)}</span>
        )}
      </div>
      <p className="text-sm font-semibold text-slate-700">{nombre}</p>
    </div>
  );
}

export default function NosotrosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">

      {/* Acerca de la Liga */}
      <section className="mb-16">
        <h1 className="font-horta text-5xl text-liga mb-2">Liga 3D Metropolitana</h1>
        <h2 className="text-xl font-semibold text-slate-600 mb-6">Acerca de la Liga</h2>
        <p className="text-slate-600 leading-relaxed text-base max-w-2xl mb-10">
          La Asociación Civil de Tiro con Arco La Liga, organizadora de la Liga 3D Metropolitana,
          es una organización dedicada a la difusión del tiro con arco.
        </p>

        <div className="grid grid-cols-3 gap-4 max-w-lg">
          <div className="bg-liga/5 border border-liga/20 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-liga">+150</p>
            <p className="text-xs text-slate-500 mt-1">Arqueros en el primer año</p>
          </div>
          <div className="bg-liga/5 border border-liga/20 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-liga">25k</p>
            <p className="text-xs text-slate-500 mt-1">Flechas disparadas</p>
          </div>
          <div className="bg-liga/5 border border-liga/20 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-liga">5</p>
            <p className="text-xs text-slate-500 mt-1">Fechas en la primera temporada</p>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="grid sm:grid-cols-2 gap-6 mb-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-7">
          <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-liga rounded-full inline-block" />
            Misión
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            Promover, organizar y desarrollar la práctica del tiro con arco 3D en la región
            metropolitana, generando un espacio competitivo, federal y de calidad que priorice
            el crecimiento deportivo, la camaradería y el respeto.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-7">
          <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-liga rounded-full inline-block" />
            Visión
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            Convertirse en una referencia nacional del tiro con arco 3D, reconocida por su
            profesionalismo organizativo, su identidad propia y su capacidad de innovación
            deportiva y comunicacional.
          </p>
        </div>
      </section>

      {/* El Equipo */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-8">El Equipo</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {EQUIPO.map((p) => (
            <PersonaCard key={p.nombre} nombre={p.nombre} foto={p.foto} />
          ))}
        </div>
      </section>

      {/* Colaboradores */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-8">Colaboradores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {COLABORADORES.map((p) => (
            <PersonaCard key={p.nombre} nombre={p.nombre} foto={p.foto} />
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section className="bg-white border border-slate-200 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Contacto</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="mailto:info@liga3d.com"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            info@liga3d.com
          </a>
          <a
            href="https://www.instagram.com/liga.3d/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-sm font-medium text-white transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            @liga.3d
          </a>
          <a
            href="https://www.facebook.com/liga3dmetropolitana"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </a>
          <a
            href="https://wa.me/5491100000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </section>

    </div>
  );
}
