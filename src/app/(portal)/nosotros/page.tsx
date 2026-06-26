import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros — Liga 3D",
};

export default function NosotrosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Nosotros</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
        <p>
          La <strong>Liga 3D</strong> nace de la pasión por el tiro con arco en su
          modalidad 3D: recorridos en entornos naturales, tirando a blancos
          tridimensionales que simulan animales a distancias desconocidas.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">Nuestra misión</h2>
        <p>
          Promover y difundir el tiro con arco 3D organizando torneos accesibles
          para arqueros de todas las categorías y niveles, fomentando el
          compañerismo, el respeto por la naturaleza y la superación personal.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">Las categorías</h2>
        <p>Competimos en las siguientes categorías:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Compuesto</strong> (CM / CW)</li>
          <li><strong>Barebow</strong> (BM / BW)</li>
          <li><strong>Longbow</strong> (LM / LW)</li>
          <li><strong>Tradicional</strong> (TM / TW)</li>
          <li><strong>Escuela</strong> (ESC) — categoría formativa</li>
          <li><strong>Junior</strong> (JUN) — juveniles</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">Temporada</h2>
        <p>
          Cada temporada consta de torneos regulares y una gran final. Los puntos
          se acumulan a lo largo del año y los mejores arqueros de cada categoría
          son coronados campeones.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-10 mb-3">Contacto</h2>
        <p>
          Podés contactarnos a través de nuestras redes sociales o escribirnos
          por email para cualquier consulta sobre la liga, inscripciones o
          torneos.
        </p>
        <ul className="list-none pl-0 space-y-1">
          <li>
            <a
              href="https://www.instagram.com/liga3d/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:text-green-800 font-medium"
            >
              Instagram: @liga3d
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
