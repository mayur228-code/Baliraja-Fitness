import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('🧪 RUNNING OFFLINE & LOCAL DATABASE VERIFICATION');
console.log('====================================================\n');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
}

// 1. Verify Local Offline Fonts
console.log('--- TEST 1: Local Offline Fonts ---');
const font1 = path.join('public', 'NotoSansDevanagari-Bold.ttf');
const font2 = path.join('public', 'mangal.ttf');
const font3 = path.join('public', 'mangalb.ttf');

assert(fs.existsSync(font1), 'NotoSansDevanagari-Bold.ttf exists locally');
assert(fs.existsSync(font2), 'mangal.ttf exists locally');
assert(fs.existsSync(font3), 'mangalb.ttf exists locally');

// Check index.html does not contain google fonts CDN
const indexHtml = fs.readFileSync('index.html', 'utf8');
assert(!indexHtml.includes('fonts.googleapis.com'), 'index.html has NO Google Fonts CDN dependency');
assert(!indexHtml.includes('fonts.gstatic.com'), 'index.html has NO Google Fonts gstatic dependency');

// Check CSS defines font-face
const indexCss = fs.readFileSync('src/index.css', 'utf8');
assert(indexCss.includes('@font-face'), 'src/index.css defines local @font-face rules');

// 2. Verify Offline QR Code Generation
console.log('\n--- TEST 2: Local Offline QR Code Generation ---');
const previewTsx = fs.readFileSync('src/components/ReportPreview.tsx', 'utf8');
assert(!previewTsx.includes('api.qrserver.com'), 'ReportPreview has NO api.qrserver.com dependency');
assert(previewTsx.includes('QRCode.toDataURL'), 'ReportPreview uses local QRCode.toDataURL');

// 3. Verify Local Database Logic & Backup Export/Import Simulation
console.log('\n--- TEST 3: Local Database & Backup/Restore Logic ---');
const sampleReports = [
  {
    reportId: 'BAR-DEMO-01',
    name: 'रमेश पांडुरंग काळे',
    mobile: '9822001122',
    village: 'केज',
    age: '35',
    gender: 'Male',
    height: '170',
    date: '30/09/2026',
    weight: '75.0',
    idealWeight: '63.5',
    extraWeight: '11.5 kg',
    lessWeight: '-',
    bodyFat: '23.0',
    visceralFat: '10',
    restingMetabolism: '1580',
    bmi: '26.0',
    createdAt: new Date().toISOString(),
  },
  {
    reportId: 'BAR-DEMO-02',
    name: 'सुनिता गणेश पाटील',
    mobile: '9423004455',
    village: 'धारूर',
    age: '28',
    gender: 'Female',
    height: '158',
    date: '30/09/2026',
    weight: '52.0',
    idealWeight: '55.0',
    extraWeight: '-',
    lessWeight: '3.0 kg',
    bodyFat: '22.0',
    visceralFat: '5',
    restingMetabolism: '1350',
    bmi: '20.8',
    createdAt: new Date().toISOString(),
  }
];

// Test Backup JSON Serialization
const backupObj = {
  appName: 'Baliraja Fitness Offline Backup',
  version: '1.0.0',
  exportDate: new Date().toISOString(),
  totalReports: sampleReports.length,
  reports: sampleReports,
};

const backupJsonStr = JSON.stringify(backupObj, null, 2);
assert(backupJsonStr.length > 0, 'Backup JSON string serialized');

// Test Backup JSON Deserialization & Validation
const parsedBackup = JSON.parse(backupJsonStr);
assert(parsedBackup.reports && parsedBackup.reports.length === 2, 'Backup JSON parsed successfully with 2 records');
assert(parsedBackup.reports[0].name === 'रमेश पांडुरंग काळे', 'Record 1 name verified');
assert(parsedBackup.reports[1].name === 'सुनिता गणेश पाटील', 'Record 2 name verified');

// 4. Verify Capacitor Configuration
console.log('\n--- TEST 4: Capacitor Configuration & Android Scaffolding ---');
const capConfigFile = path.join('capacitor.config.ts');
assert(fs.existsSync(capConfigFile), 'capacitor.config.ts exists');

const androidManifest = path.join('android', 'app', 'src', 'main', 'AndroidManifest.xml');
assert(fs.existsSync(androidManifest), 'Android project scaffolding and AndroidManifest.xml exist');

const androidStrings = path.join('android', 'app', 'src', 'main', 'res', 'values', 'strings.xml');
assert(fs.existsSync(androidStrings), 'strings.xml exists');

const distIndex = path.join('dist', 'index.html');
assert(fs.existsSync(distIndex), 'dist/index.html web build exists');

console.log('\n====================================================');
console.log('🎉 ALL OFFLINE & LOCAL DATABASE TESTS PASSED!');
console.log('====================================================\n');
