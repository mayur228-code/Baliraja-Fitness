import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

function utf8ToBase64Url(str) {
  return Buffer.from(str, 'utf-8').toString('base64url');
}

function base64UrlToUtf8(b64url) {
  if (!b64url) return '';
  return Buffer.from(b64url, 'base64').toString('utf-8');
}

function encodeReportToCompactString(data) {
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

function decodeCompactStringToReport(encoded) {
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
      return parsed;
    }
  } catch (e) {}

  // 2. Try legacy URI encoded base64 JSON
  try {
    let cleanB64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (cleanB64.length % 4 !== 0) cleanB64 += '=';
    const rawStr = Buffer.from(cleanB64, 'base64').toString('utf-8');
    const decodedStr = decodeURIComponent(rawStr);
    const parsed = JSON.parse(decodedStr);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (e) {}

  // 3. Try direct JSON parse
  try {
    const parsed = JSON.parse(encoded);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (e) {}

  return null;
}

function extractReportDataFromUrl(urlOrSearch) {
  let search = '';
  let pathname = '';
  let hash = '';

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

  let reportId = null;
  const pathMatch = pathname.match(/\/report\/([^/?#]+)/);
  if (pathMatch && pathMatch[1]) {
    reportId = decodeURIComponent(pathMatch[1]);
  }

  const params = new URLSearchParams(search);
  const compactPayload = params.get('d') || params.get('data');
  if (compactPayload) {
    const report = decodeCompactStringToReport(compactPayload);
    if (report) {
      return { report, reportId: report.reportId || reportId };
    }
  }

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

function getReportShareUrl(report, customBaseUrl) {
  const compactPayload = encodeReportToCompactString(report);
  const id = report.reportId || 'report';
  const baseUrl = (customBaseUrl || 'http://127.0.0.1:5173').replace(/\/$/, '');
  return `${baseUrl}/report/${id}?d=${compactPayload}`;
}

async function runQrFlowTests() {
  console.log('====================================================');
  console.log('🧪 TESTING COMPLETE QR ENCODING & SCANNING FLOW');
  console.log('====================================================\n');

  const testReport = {
    name: 'गणेश तुकाराम शिंदे',
    mobile: '7972532010',
    village: 'धारूर रोड, केज (बीड)',
    age: '29',
    gender: 'Male',
    height: '174',
    date: '01/10/2026',
    weight: '76.4',
    idealWeight: '68.0',
    extraWeight: '8.4 kg',
    lessWeight: '-',
    bodyFat: '21.5',
    visceralFat: '10',
    restingMetabolism: '1620',
    bmi: '25.2',
    bodyAge: '33',
    subWhole: '17.8',
    subArms: '18.4',
    subTrunk: '16.0',
    subLegs: '19.8',
    skelWhole: '35.2',
    skelArms: '43.0',
    skelTrunk: '29.0',
    skelLegs: '48.0',
    measArms: '14.0',
    measWaist: '34.5',
    measThigh: '21.5',
    reportId: 'BAR-2026-GANESH',
    createdAt: '2026-10-01T00:00:00.000Z',
  };

  // 1. Test Compact Encoding & Decoding Roundtrip
  console.log('--- TEST 1: Compact Serialization Roundtrip ---');
  const encodedStr = encodeReportToCompactString(testReport);
  console.log('Encoded String Length:', encodedStr.length);
  console.log('Encoded String:', encodedStr);

  const decoded = decodeCompactStringToReport(encodedStr);
  if (!decoded) {
    throw new Error('Failed to decode compact string');
  }

  // Verify all fields match exactly
  for (const [k, v] of Object.entries(testReport)) {
    if (decoded[k] !== v) {
      throw new Error(`Field mismatch on '${k}': expected '${v}', got '${decoded[k]}'`);
    }
  }
  console.log('✅ PASSED: All 29 fields reconstructed with 100% precision!\n');

  // 2. Test URL Construction & Parsing
  console.log('--- TEST 2: URL Construction & Extraction ---');
  const shareUrl = getReportShareUrl(testReport, 'https://baliraja.example.com');
  console.log('Generated Share URL (Length ' + shareUrl.length + ' chars):');
  console.log(shareUrl);

  const extracted = extractReportDataFromUrl(shareUrl);
  if (!extracted.report || extracted.report.name !== testReport.name) {
    throw new Error('Failed to extract report from standard URL');
  }
  console.log('✅ PASSED: Standard URL parsing successfully extracted report data!');

  // Hash-based URL
  const hashUrl = 'https://baliraja.example.com/#/report/' + testReport.reportId + '?d=' + encodedStr;
  const extractedHash = extractReportDataFromUrl(hashUrl);
  if (!extractedHash.report || extractedHash.report.mobile !== testReport.mobile) {
    throw new Error('Failed to extract report from hash URL');
  }
  console.log('✅ PASSED: Hash URL parsing successfully extracted report data!');

  // Legacy format backward compatibility
  const legacyB64 = Buffer.from(encodeURIComponent(JSON.stringify(testReport))).toString('base64');
  const legacyUrl = 'https://baliraja.example.com/report/123?data=' + legacyB64;
  const extractedLegacy = extractReportDataFromUrl(legacyUrl);
  if (!extractedLegacy.report || extractedLegacy.report.name !== testReport.name) {
    throw new Error('Failed to extract report from legacy URL');
  }
  console.log('✅ PASSED: Legacy URL payload backward compatibility verified!\n');

  // 3. Test Physical QR Code Rendering & Camera / Google Lens Scan Simulation
  console.log('--- TEST 3: Optical QR Code Scanning Simulation ---');
  const qrDataUrl = await QRCode.toDataURL(shareUrl, {
    margin: 2,
    width: 400,
    errorCorrectionLevel: 'M',
    color: { dark: '#000000', light: '#ffffff' },
  });

  const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
  const pngBuffer = Buffer.from(base64Data, 'base64');
  const png = PNG.sync.read(pngBuffer);

  const scannedCode = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  if (!scannedCode) {
    throw new Error('Camera / jsQR scanner could not read QR code image');
  }

  console.log('Optical Scanner Read URL:', scannedCode.data);
  const scannedData = extractReportDataFromUrl(scannedCode.data);
  if (!scannedData.report || scannedData.report.name !== testReport.name) {
    throw new Error('Scanned QR data did not match expected client report');
  }
  console.log('✅ PASSED: Optical Scan -> URL Parse -> Client Report match verified (Client: ' + scannedData.report.name + ')!\n');

  console.log('====================================================');
  console.log('🎉 ALL QR FLOW TESTS PASSED PERFECTLY!');
  console.log('====================================================\n');
}

runQrFlowTests().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
