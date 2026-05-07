/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Permitir imágenes locales de la carpeta uploads
    localPatterns: [
      {
        pathname: "/uploads/profiles/**",
      },
    ],
  },
};

export default nextConfig;
