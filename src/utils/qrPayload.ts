import { ReportData } from '../types';

/**
 * Field order for ultra-compact report serialization
 */
const REPORT_FIELD_KEYS: (keyof ReportData)[] = [
  'name',
  'mobile',
  'village',
  'age',
  'gender',
  'height',
  'date',
  'weight',
  'idealWeight',
  'extraWeight',
  'lessWeight',
  'bodyFat',
  'visceralFat',
  'restingMetabolism',
  'bmi',
  'bodyAge',
  'subWhole',
  'subArms',
  'subTrunk',
  'subLegs',
  'skelWhole',
  'skelArms',
  'skelTrunk',
  'skelLegs',
  'measArms',
  'measWaist',
  'measThigh',
  'reportId',
  'createdAt',
];

/**
 * Encode UTF-8 string to base64url safely (supports Unicode/Devanagari characters)
 */
export function utf8ToBase64Url(str: string): string {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    // Browser UTF-8 to Base64url
    const utf8Bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } else {
    // Node.js environment
    return Buffer.from(str, 'utf-8').toString('base64url');
  }
}

/**
 * Decode base64url safely to UTF-8 string (supports Unicode/Devanagari characters)
 */
export function base64UrlToUtf8(b64url: string): string {
  if (!b64url) return '';
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }

  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    const binary = window.atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } else {
    return Buffer.from(b64, 'base64').toString('utf-8');
  }
}

/**
 * Serializes a ReportData object into a compact base64url representation.
 * Uses a positional array to avoid repeating object keys.
 */
export function encodeReportToCompactString(data: ReportData): string {
  const arr = [
    data.name || '',
    data.mobile || '',
    data.village || '',
    data.age || '',
    data.gender === 'Female' ? 'F' : 'M',
    data.height || '',
    data.date || '',
    data.weight || '',
    data.idealWeight || '',
    data.extraWeight || '',
    data.lessWeight || '',
    data.bodyFat || '',
    data.visceralFat || '',
    data.restingMetabolism || '',
    data.bmi || '',
    data.bodyAge || '',
    data.subWhole || '',
    data.subArms || '',
    data.subTrunk || '',
    data.subLegs || '',
    data.skelWhole || '',
    data.skelArms || '',
    data.skelTrunk || '',
    data.skelLegs || '',
    data.measArms || '',
    data.measWaist || '',
    data.measThigh || '',
    data.reportId || '',
    data.createdAt || '',
  ];

  const json = JSON.stringify(arr);
  return utf8ToBase64Url(json);
}

/**
 * Deserializes a compact string or legacy encoded payload into a full ReportData object.
 */
export function decodeCompactStringToReport(encoded: string): ReportData | null {
  if (!encoded || typeof encoded !== 'string') return null;

  // 1. Try modern compact positional array
  try {
    const utf8Str = base64UrlToUtf8(encoded.trim());
    const parsed = JSON.parse(utf8Str);

    if (Array.isArray(parsed)) {
      return {
        name: parsed[0] || '',
        mobile: parsed[1] || '',
        village: parsed[2] || '',
        age: parsed[3] || '',
        gender: parsed[4] === 'F' ? 'Female' : 'Male',
        height: parsed[5] || '',
        date: parsed[6] || '',
        weight: parsed[7] || '',
        idealWeight: parsed[8] || '',
        extraWeight: parsed[9] || '',
        lessWeight: parsed[10] || '',
        bodyFat: parsed[11] || '',
        visceralFat: parsed[12] || '',
        restingMetabolism: parsed[13] || '',
        bmi: parsed[14] || '',
        bodyAge: parsed[15] || '',
        subWhole: parsed[16] || '',
        subArms: parsed[17] || '',
        subTrunk: parsed[18] || '',
        subLegs: parsed[19] || '',
        skelWhole: parsed[20] || '',
        skelArms: parsed[21] || '',
        skelTrunk: parsed[22] || '',
        skelLegs: parsed[23] || '',
        measArms: parsed[24] || '',
        measWaist: parsed[25] || '',
        measThigh: parsed[26] || '',
        reportId: parsed[27] || undefined,
        createdAt: parsed[28] || undefined,
      };
    } else if (parsed && typeof parsed === 'object' && parsed.name !== undefined) {
      return parsed as ReportData;
    }
  } catch (e) {
    // Continue to next fallback
  }

  // 2. Try legacy URI encoded base64 JSON
  try {
    let cleanB64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (cleanB64.length % 4 !== 0) cleanB64 += '=';
    const rawStr = typeof window !== 'undefined' ? window.atob(cleanB64) : Buffer.from(cleanB64, 'base64').toString('utf-8');
    const decodedStr = decodeURIComponent(rawStr);
    const parsed = JSON.parse(decodedStr);
    if (parsed && typeof parsed === 'object') {
      return parsed as ReportData;
    }
  } catch (e) {
    // Continue to next fallback
  }

  // 3. Try direct JSON parse
  try {
    const parsed = JSON.parse(encoded);
    if (parsed && typeof parsed === 'object') {
      return parsed as ReportData;
    }
  } catch (e) {
    // Failed all formats
  }

  return null;
}

/**
 * Extracts ReportData from the current URL or provided search/hash string.
 */
export function extractReportDataFromUrl(urlOrSearch?: string): { report: ReportData | null; reportId: string | null } {
  let search = '';
  let pathname = '';
  let hash = '';

  if (typeof window !== 'undefined') {
    search = window.location.search;
    pathname = window.location.pathname;
    hash = window.location.hash;
  }

  if (urlOrSearch) {
    try {
      const parsedUrl = new URL(urlOrSearch, 'http://localhost');
      search = parsedUrl.search;
      pathname = parsedUrl.pathname;
      hash = parsedUrl.hash;
    } catch (e) {
      if (urlOrSearch.includes('?')) {
        search = '?' + urlOrSearch.split('?')[1];
      }
    }
  }

  // 1. Check pathname for reportId: /report/:id
  let reportId: string | null = null;
  const pathMatch = pathname.match(/\/report\/([^/?#]+)/);
  if (pathMatch && pathMatch[1]) {
    reportId = decodeURIComponent(pathMatch[1]);
  }

  // 2. Check search params for 'd' (compact) or 'data' (legacy)
  const params = new URLSearchParams(search);
  const compactPayload = params.get('d') || params.get('data');
  if (compactPayload) {
    const report = decodeCompactStringToReport(compactPayload);
    if (report) {
      return { report, reportId: report.reportId || reportId };
    }
  }

  // 3. Check hash for search params (e.g., /#/report/:id?d=... or /#/?d=...)
  if (hash) {
    const hashIdx = hash.indexOf('?');
    if (hashIdx !== -1) {
      const hashParams = new URLSearchParams(hash.substring(hashIdx));
      const hashPayload = hashParams.get('d') || hashParams.get('data');
      if (hashPayload) {
        const report = decodeCompactStringToReport(hashPayload);
        if (report) {
          return { report, reportId: report.reportId || reportId };
        }
      }
    }

    const hashPathMatch = hash.match(/report\/([^/?#]+)/);
    if (hashPathMatch && hashPathMatch[1]) {
      reportId = decodeURIComponent(hashPathMatch[1]);
    }
  }

  return { report: null, reportId };
}

/**
 * Determine the optimal, accessible Base URL for sharing reports & generating QR codes.
 */
export function getReportShareUrl(report: ReportData, customBaseUrl?: string): string {
  const compactPayload = encodeReportToCompactString(report);
  const id = report.reportId || 'report';

  let baseUrl = '';

  // 1. Custom URL explicitly provided or stored in localStorage
  if (customBaseUrl && customBaseUrl.trim()) {
    baseUrl = customBaseUrl.trim().replace(/\/$/, '');
  } else if (typeof window !== 'undefined' && window.localStorage) {
    const savedCustom = localStorage.getItem('baliraja_custom_share_url');
    if (savedCustom && savedCustom.trim()) {
      baseUrl = savedCustom.trim().replace(/\/$/, '');
    }
  }

  // 2. If not specified and in browser window
  if (!baseUrl && typeof window !== 'undefined') {
    const origin = window.location.origin;
    // If not running on local-only loopback inside WebView
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1') && !origin.includes('capacitor://')) {
      baseUrl = origin;
    }
  }

  // 3. Environment variable if available
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  if (!baseUrl && metaEnv?.VITE_APP_URL) {
    baseUrl = (metaEnv.VITE_APP_URL as string).replace(/\/$/, '');
  }

  // 4. Default fallback: keep clean path
  if (!baseUrl) {
    if (typeof window !== 'undefined' && window.location.origin) {
      baseUrl = window.location.origin;
    } else {
      baseUrl = 'http://127.0.0.1:5173';
    }
  }

  return `${baseUrl}/report/${id}?d=${compactPayload}`;
}
