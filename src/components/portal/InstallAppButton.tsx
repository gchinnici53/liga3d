"use client";

import { useEffect, useState } from "react";

// Next no tipa este evento (no es estándar en todos los navegadores).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Botón "Instalar app" para el sitio público.
 *
 * - Android / Chrome / Edge: escucha el evento `beforeinstallprompt`, lo
 *   guarda y lo dispara manualmente al tocar el botón. Esto sirve como
 *   respaldo por si el navegador ya mostró el banner nativo una vez y el
 *   usuario lo cerró sin instalar (Chrome no lo vuelve a mostrar solo).
 * - iOS (Safari): no existe forma de disparar la instalación por código
 *   (Apple no expone ese evento), así que el botón abre un instructivo con
 *   los pasos manuales (Compartir → Agregar a inicio).
 * - Si la app ya está instalada (modo standalone), no se muestra nada.
 */
export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari expone esto en vez del media query de arriba
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onAppInstalled() {
      setDeferredPrompt(null);
      setIsStandalone(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (isStandalone) return null;
  if (!deferredPrompt && !isIOS) return null; // navegador sin soporte (ej. desktop Firefox)

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
      return;
    }
    if (isIOS) setShowIOSHelp(true);
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-white/40 text-white hover:bg-white/10 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="shrink-0">
          <path d="M10 2a1 1 0 011 1v8.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 11.586V3a1 1 0 011-1z" />
          <path d="M4 14a1 1 0 011 1v1a1 1 0 001 1h8a1 1 0 001-1v-1a1 1 0 112 0v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1a1 1 0 011-1z" />
        </svg>
        Instalar app
      </button>

      {showIOSHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowIOSHelp(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-horta text-xl text-liga-dark mb-3">Instalar la app</h2>
            <p className="text-sm text-slate-600 mb-4">
              En iPhone/iPad, Safari no permite instalar apps con un solo toque.
              Seguí estos pasos:
            </p>
            <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside mb-4">
              <li>
                Si no estás en Safari (ej. venís desde Instagram o Chrome), abrí este
                sitio en <strong>Safari</strong>.
              </li>
              <li>
                Tocá el ícono de <strong>Compartir</strong> (el cuadrado con la flecha
                hacia arriba) en la barra inferior.
              </li>
              <li>
                Elegí <strong>&quot;Agregar a inicio&quot;</strong> (Add to Home Screen).
              </li>
              <li>Confirmá tocando &quot;Agregar&quot; arriba a la derecha.</li>
            </ol>
            <button
              onClick={() => setShowIOSHelp(false)}
              className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-liga text-white hover:bg-liga-dark transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
