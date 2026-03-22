import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development'

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  connect-src 'self' https://*.supabase.co https://*.supabase.io;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim()

const nextConfig: NextConfig = {
  serverExternalPackages: ['yahoo-finance2'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
        ],
      },
    ]
  },
};

export default nextConfig;
