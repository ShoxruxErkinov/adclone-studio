import type { NextConfig } from 'next';
const config: NextConfig = {
  serverExternalPackages: ['@remotion/renderer', '@remotion/bundler'],
  poweredByHeader: false,
  outputFileTracingExcludes: { '/*': ['.data/**/*', '.env*', '.impeccable/**/*', 'tests/**/*', 'node_modules/@electric-sql/pglite/**/*'] },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Frame-Options', value: 'DENY' }
    ] }];
  }
};
export default config;
