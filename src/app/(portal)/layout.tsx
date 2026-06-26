import Navbar from "@/components/portal/Navbar";
import Footer from "@/components/portal/Footer";

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
