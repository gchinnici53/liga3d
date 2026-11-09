import type { Metadata } from "next";
import Navbar from "@/components/portal/Navbar";
import Footer from "@/components/portal/Footer";

export const dynamic = "force-dynamic";

// Manifest propio para que "instalar app" desde el sitio público abra el
// inicio (/), en vez del manifest del panel admin (que arranca en el login).
export const metadata: Metadata = {
  manifest: "/manifest-front.webmanifest",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
