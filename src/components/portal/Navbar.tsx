"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",            label: "Inicio" },
  { href: "/ranking",     label: "Ranking" },
  { href: "/calendario",  label: "Calendario" },
  { href: "/campeones",   label: "Campeones" },
  { href: "/reglamento",  label: "Reglamento" },
  { href: "/nosotros",    label: "Nosotros" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function activo(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header className="bg-liga sticky top-0 z-40 shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/img/Liga3dLOGOALTA.png"
              alt="Liga 3D Metropolitana"
              width={44}
              height={44}
              className="rounded-full"
            />
            <span className="text-white font-horta text-2xl tracking-wide hidden sm:inline">Liga 3D</span>
          </Link>

          {/* Links desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  activo(link.href)
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              Ingresar
            </Link>
          </nav>

          {/* Hamburger mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white/80 hover:text-white p-2 rounded-lg transition-colors"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menú mobile */}
      {open && (
        <nav className="md:hidden border-t border-white/20 px-4 py-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={[
                "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activo(link.href)
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            onClick={() => setOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white border border-white/30 text-center mt-2"
          >
            Ingresar
          </Link>
        </nav>
      )}
    </header>
  );
}
