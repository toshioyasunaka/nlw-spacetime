/** @type {import('next').NextConfig} */
const nextConfig = {
  // permissão p/ carregar imagens de fora do projeto
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig
