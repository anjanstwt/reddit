//@ts-check
const path = require('path');
const { loadEnvConfig } = require('@next/env');

// Share the monorepo root .env with the Go server.
loadEnvConfig(path.join(__dirname, '../..'));

const mediaBase = new URL(process.env.SERVER_MEDIA_BASE_URL || 'http://localhost:9000/reddit-media');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server bundle for the Docker image.
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      {
        protocol: /** @type {'http' | 'https'} */ (mediaBase.protocol.replace(':', '')),
        hostname: mediaBase.hostname,
        port: mediaBase.port,
        pathname: `${mediaBase.pathname.replace(/\/$/, '')}/**`,
      },
    ],
    // MinIO runs on localhost in development, which Next blocks by default.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
  },
};

module.exports = nextConfig;
