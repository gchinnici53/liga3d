/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    localPatterns: [
      { pathname: "/uploads/profiles/**" },
    ],
  },
};

export default nextConfig;
