/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['github.com', 'avatars.githubusercontent.com', 'raw.githubusercontent.com'],
  },
  async redirects() {
    return [
      {
        source: '/github',
        destination: 'https://github.com/jmenichole/trap-house-discord-bot',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
