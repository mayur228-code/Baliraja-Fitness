import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.join(__dirname, 'data', 'reports');

// Ensure reports storage directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// In-memory cache for speed
const reportsCache = new Map();

// Load existing reports from disk into cache
try {
  const files = fs.readdirSync(REPORTS_DIR);
  for (const file of files) {
    if (file.endsWith('.json')) {
      const id = file.replace('.json', '');
      const content = fs.readFileSync(path.join(REPORTS_DIR, file), 'utf-8');
      reportsCache.set(id, JSON.parse(content));
    }
  }
} catch (e) {
  console.warn('Could not read existing reports directory:', e);
}

/**
 * Get active non-internal LAN IPv4 address
 */
export function getLanIp() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const ifaceList = interfaces[devName];
    if (!ifaceList) continue;
    for (const iface of ifaceList) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

/**
 * Get fully accessible base URL (accessible from phone/LAN or cloud)
 */
export function getAccessibleBaseUrl(req, port = 5173) {
  // 1. Environment variable override
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  if (process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL.replace(/\/$/, '');
  }

  // 2. If accessed through external domain / reverse proxy
  const hostHeader = req?.headers?.host || req?.headers?.['x-forwarded-host'];
  if (hostHeader && !hostHeader.includes('localhost') && !hostHeader.includes('127.0.0.1')) {
    const proto = req?.headers?.['x-forwarded-proto'] || (req?.secure ? 'https' : 'http');
    return `${proto}://${hostHeader}`;
  }

  // 3. Fallback to LAN IP
  const lanIp = getLanIp();
  return `http://${lanIp}:${port}`;
}

/**
 * Save report data and return unique ID and accessible URL
 */
export function saveReport(reportData, req, port = 5173) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const id = `BAR-${timestamp}-${rand}`;

  const enrichedData = {
    ...reportData,
    reportId: id,
    createdAt: new Date().toISOString(),
  };

  // Save to cache
  reportsCache.set(id, enrichedData);

  // Save to disk
  const filePath = path.join(REPORTS_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(enrichedData, null, 2), 'utf-8');

  const baseUrl = getAccessibleBaseUrl(req, port);
  const reportUrl = `${baseUrl}/report/${id}`;

  return {
    success: true,
    id,
    reportUrl,
    data: enrichedData,
  };
}

/**
 * Get report by ID
 */
export function getReport(id) {
  if (reportsCache.has(id)) {
    return reportsCache.get(id);
  }

  const filePath = path.join(REPORTS_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      reportsCache.set(id, data);
      return data;
    } catch (e) {
      console.error(`Failed to read report ${id}:`, e);
      return null;
    }
  }

  return null;
}
