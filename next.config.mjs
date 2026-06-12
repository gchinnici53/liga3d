/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    unoptimized: true,
    localPatterns: [
      { pathname: "/uploads/profiles/**" },
    ],
  },
};

export default nextConfig;
