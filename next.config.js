/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Comentado para permitir Server Actions y rutas dinámicas
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ttglahstbeogwzqlmhkj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  trailingSlash: true,
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
