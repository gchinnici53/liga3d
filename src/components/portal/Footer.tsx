import Link from "next/link";

export default function Footer() {
  const anio = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Marca */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🏹</span>
              <span className="text-white font-bold text-lg">Liga 3D</span>
            </div>
            <p className="text-sm leading-relaxed">
              Liga de tiro con arco 3D. Competí, mejorá y compartí la pasión por el arco.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wide mb-3">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/ranking" className="hover:text-white transition-colors">Ranking</Link></li>
              <li><Link href="/calendario" className="hover:text-white transition-colors">Calendario</Link></li>
              <li><Link href="/campeones" className="hover:text-white transition-colors">Campeones</Link></li>
              <li><Link href="/reglamento" className="hover:text-white transition-colors">Reglamento</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wide mb-3">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Sobre nosotros</Link></li>
              <li>
                <a
                  href="https://www.instagram.com/liga3d/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-6 text-center text-xs">
          <p>&copy; {anio} Liga 3D. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
