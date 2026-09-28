//@ts-check
const path = require('path');
const { loadEnvConfig } = require('@next/env');

// Share the monorepo root .env with the Go server.
loadEnvConfig(path.join(__dirname, '../..'));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server bundle for the Docker image.
  output: 'standalone',
};

module.exports = nextConfig;
