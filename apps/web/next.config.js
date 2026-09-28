//@ts-check
const path = require('path');
const { loadEnvConfig } = require('@next/env');

// Share the monorepo root .env with the Go server.
loadEnvConfig(path.join(__dirname, '../..'));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js options go here
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js
};

module.exports = nextConfig;
