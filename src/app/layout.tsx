import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Liga 3D — Tiro con Arco",
  description: "Liga de tiro con arco 3D. Torneos, ranking, resultados y más.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Liga 3D",
  },
  icons: {
    icon: "/img/Liga3dLOGOALTA.png",
    apple: "/img/Liga3dLOGOALTA.png",
  },
  // El sitio público pisa esto con manifest-front.webmanifest (ver (portal)/layout.tsx).
  manifest: "/manifest-admin.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#E8722A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
