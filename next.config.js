/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Comentado para permitir Server Actions y rutas dinámicas
  images: {
    unoptimized: true, // Necesario para export estático
  },
  trailingSlash: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
