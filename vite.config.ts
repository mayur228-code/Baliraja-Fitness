import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { getLanIp, getAccessibleBaseUrl, saveReport, getReport } from './serverApi.js';

function apiPlugin(): Plugin {
  return {
    name: 'baliraja-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        // 1. Config endpoint
        if (url === '/api/config' && req.method === 'GET') {
          const lanIp = getLanIp();
          const baseUrl = getAccessibleBaseUrl(req, 5173);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ lanIp, port: 5173, baseUrl }));
          return;
        }

        // 2. Save report endpoint
        if (url === '/api/reports' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const result = saveReport(data, req, 5173);
              console.log(`\n[QR Code Generated] Encoded URL: ${result.reportUrl}`);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        // 3. Get report by ID endpoint
        if (url.startsWith('/api/reports/') && req.method === 'GET') {
          const id = url.replace('/api/reports/', '').split('?')[0];
          const data = getReport(id);
          if (data) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Report not found' }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
});
