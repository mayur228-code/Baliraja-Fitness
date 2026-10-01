import { ReportData } from '../types';

const DB_NAME = 'BalirajaFitnessLocalDB';
const DB_VERSION = 1;
const STORE_NAME = 'customer_reports';
const LOCAL_STORAGE_KEY = 'baliraja_fitness_offline_reports_v1';

/**
 * Open or initialize IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'reportId' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('mobile', 'mobile', { unique: false });
        store.createIndex('village', 'village', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback LocalStorage helpers
function getLocalStorageReports(): Record<string, ReportData> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('[LocalStorage Fallback] Read failed:', e);
    return {};
  }
}

function setLocalStorageReports(data: Record<string, ReportData>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[LocalStorage Fallback] Write failed:', e);
  }
}

/**
 * Save or update a customer report in local offline storage
 */
export async function saveLocalReport(report: ReportData): Promise<ReportData> {
  const now = new Date().toISOString();
  const reportId = report.reportId || `BAR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const finalizedReport: ReportData = {
    ...report,
    reportId,
    createdAt: report.createdAt || now,
  };

  try {
    const db = await openDB();
    return await new Promise<ReportData>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(finalizedReport);

      req.onsuccess = () => {
        // Also keep localStorage mirror updated
        const local = getLocalStorageReports();
        local[reportId] = finalizedReport;
        setLocalStorageReports(local);
        resolve(finalizedReport);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[LocalDatabase] IndexedDB write failed, falling back to LocalStorage:', err);
    const local = getLocalStorageReports();
    local[reportId] = finalizedReport;
    setLocalStorageReports(local);
    return finalizedReport;
  }
}

/**
 * Get a specific customer report by ID from local offline storage
 */
export async function getLocalReport(reportId: string): Promise<ReportData | null> {
  if (!reportId) return null;

  try {
    const db = await openDB();
    return await new Promise<ReportData | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(reportId);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[LocalDatabase] IndexedDB read failed, falling back to LocalStorage:', err);
    const local = getLocalStorageReports();
    return local[reportId] || null;
  }
}

/**
 * Get all customer reports stored locally, sorted by createdAt (newest first)
 */
export async function getAllLocalReports(): Promise<ReportData[]> {
  try {
    const db = await openDB();
    return await new Promise<ReportData[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const list: ReportData[] = req.result || [];
        list.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[LocalDatabase] IndexedDB getAll failed, falling back to LocalStorage:', err);
    const local = getLocalStorageReports();
    const list = Object.values(local);
    list.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
    return list;
  }
}

/**
 * Get only the latest report per person, sorted newest first
 * Historical reports remain safely stored in the database.
 */
export async function getLatestReportsPerPerson(): Promise<ReportData[]> {
  const allReports = await getAllLocalReports();
  const seenMobiles = new Set<string>();
  const seenNames = new Set<string>();
  const results: ReportData[] = [];

  for (const report of allReports) {
    const rawName = (report.name || '').trim().toLowerCase();
    const rawMobile = (report.mobile || '').trim();

    let isDuplicate = false;
    if (rawMobile && seenMobiles.has(rawMobile)) {
      isDuplicate = true;
    }
    if (rawName && seenNames.has(rawName)) {
      isDuplicate = true;
    }

    if (!isDuplicate) {
      if (rawMobile) seenMobiles.add(rawMobile);
      if (rawName) seenNames.add(rawName);
      results.push(report);
    }
  }

  return results;
}

/**
 * Delete a customer report from local storage
 */
export async function deleteLocalReport(reportId: string): Promise<boolean> {
  if (!reportId) return false;

  try {
    const db = await openDB();
    return await new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(reportId);

      req.onsuccess = () => {
        const local = getLocalStorageReports();
        delete local[reportId];
        setLocalStorageReports(local);
        resolve(true);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[LocalDatabase] IndexedDB delete failed, falling back to LocalStorage:', err);
    const local = getLocalStorageReports();
    delete local[reportId];
    setLocalStorageReports(local);
    return true;
  }
}

/**
 * Export all local customer data as a JSON string for manual backup
 */
export async function exportAllReportsAsJson(): Promise<string> {
  const reports = await getAllLocalReports();
  const backupPayload = {
    appName: 'Baliraja Fitness Offline Backup',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    totalReports: reports.length,
    reports,
  };
  return JSON.stringify(backupPayload, null, 2);
}

/**
 * Import customer data from a backup JSON string with validation
 */
export async function importReportsFromJson(
  jsonStr: string
): Promise<{ importedCount: number; errors: string[] }> {
  const errors: string[] = [];
  let importedCount = 0;

  try {
    const parsed = JSON.parse(jsonStr);
    let itemsToImport: ReportData[] = [];

    if (Array.isArray(parsed)) {
      itemsToImport = parsed;
    } else if (parsed && Array.isArray(parsed.reports)) {
      itemsToImport = parsed.reports;
    } else if (parsed && parsed.name) {
      itemsToImport = [parsed as ReportData];
    } else {
      throw new Error('अवैध बॅकअप फाईल स्वरूप (Invalid backup JSON structure)');
    }

    for (const item of itemsToImport) {
      if (item && typeof item === 'object') {
        await saveLocalReport(item);
        importedCount++;
      } else {
        errors.push('काही नोंदी अवैध आढळल्याने वगळण्यात आल्या.');
      }
    }
  } catch (e: any) {
    errors.push(e.message || 'बॅकअप फाईल वाचताना त्रुटी आली');
  }

  return { importedCount, errors };
}

/**
 * Get basic database statistics
 */
export async function getDatabaseStats(): Promise<{ count: number; lastUpdated?: string }> {
  const all = await getAllLocalReports();
  return {
    count: all.length,
    lastUpdated: all.length > 0 ? all[0].createdAt : undefined,
  };
}
