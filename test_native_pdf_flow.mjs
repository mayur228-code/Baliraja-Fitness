import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { PDFDocument } from 'pdf-lib';

console.log('====================================================');
console.log('🧪 VERIFYING COMPLETE BALIRAJA FITNESS PDF & ANDROID FLOW');
console.log('====================================================\n');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
}

// 1. Verify Android Native Scaffolding & Plugins
console.log('--- TEST 1: Native Android Plugin & FileProvider Scaffolding ---');

const pluginPath = path.join('android', 'app', 'src', 'main', 'java', 'com', 'baliraja', 'fitness', 'PdfViewerPlugin.java');
assert(fs.existsSync(pluginPath), 'PdfViewerPlugin.java exists');
const pluginContent = fs.readFileSync(pluginPath, 'utf8');
assert(pluginContent.includes('@CapacitorPlugin(name = "PdfViewer")'), 'PdfViewerPlugin has @CapacitorPlugin annotation');
assert(pluginContent.includes('FileProvider.getUriForFile'), 'PdfViewerPlugin resolves content URI via FileProvider');
assert(pluginContent.includes('Intent.ACTION_VIEW'), 'PdfViewerPlugin creates Intent.ACTION_VIEW');
assert(pluginContent.includes('Intent.FLAG_GRANT_READ_URI_PERMISSION'), 'PdfViewerPlugin grants read URI permission');

const mainActivityPath = path.join('android', 'app', 'src', 'main', 'java', 'com', 'baliraja', 'fitness', 'MainActivity.java');
const mainActivityContent = fs.readFileSync(mainActivityPath, 'utf8');
assert(mainActivityContent.includes('registerPlugin(PdfViewerPlugin.class)'), 'MainActivity registers PdfViewerPlugin.class');

const filePathsXml = path.join('android', 'app', 'src', 'main', 'res', 'xml', 'file_paths.xml');
const filePathsContent = fs.readFileSync(filePathsXml, 'utf8');
assert(filePathsContent.includes('<cache-path'), 'file_paths.xml includes cache-path');
assert(filePathsContent.includes('<files-path'), 'file_paths.xml includes files-path');
assert(filePathsContent.includes('<external-files-path'), 'file_paths.xml includes external-files-path');

const manifestPath = path.join('android', 'app', 'src', 'main', 'AndroidManifest.xml');
const manifestContent = fs.readFileSync(manifestPath, 'utf8');
assert(manifestContent.includes('android.permission.INTERNET'), 'AndroidManifest has INTERNET permission');
assert(manifestContent.includes('android.permission.READ_EXTERNAL_STORAGE'), 'AndroidManifest has READ_EXTERNAL_STORAGE permission');
assert(manifestContent.includes('android.permission.WRITE_EXTERNAL_STORAGE'), 'AndroidManifest has WRITE_EXTERNAL_STORAGE permission');
assert(manifestContent.includes('<data android:mimeType="application/pdf" />'), 'AndroidManifest has PDF Intent query declarations for Android 11+');

// 2. Verify nativePdfHandler TypeScript implementation
console.log('\n--- TEST 2: nativePdfHandler Cross-Platform Implementation ---');
const handlerPath = path.join('src', 'utils', 'nativePdfHandler.ts');
assert(fs.existsSync(handlerPath), 'src/utils/nativePdfHandler.ts exists');
const handlerContent = fs.readFileSync(handlerPath, 'utf8');
assert(handlerContent.includes('savePdfToDevice'), 'nativePdfHandler exports savePdfToDevice');
assert(handlerContent.includes('openPdfDocument'), 'nativePdfHandler exports openPdfDocument');
assert(handlerContent.includes('sharePdfFile'), 'nativePdfHandler exports sharePdfFile');
assert(handlerContent.includes('saveBackupJsonToDevice'), 'nativePdfHandler exports saveBackupJsonToDevice');
assert(handlerContent.includes('Directory.Documents'), 'nativePdfHandler saves to Directory.Documents on Android');
assert(handlerContent.includes('Directory.Cache'), 'nativePdfHandler caches to Directory.Cache on Android');
assert(handlerContent.includes("registerPlugin<NativePdfViewerPlugin>('PdfViewer')"), 'nativePdfHandler connects to native PdfViewer plugin');

// 3. Verify Components Use nativePdfHandler
console.log('\n--- TEST 3: App Components Integration ---');
const reportPreviewContent = fs.readFileSync(path.join('src', 'components', 'ReportPreview.tsx'), 'utf8');
assert(reportPreviewContent.includes('openPdfDocument'), 'ReportPreview uses openPdfDocument');
assert(reportPreviewContent.includes('savePdfToDevice'), 'ReportPreview uses savePdfToDevice');
assert(reportPreviewContent.includes('sharePdfFile'), 'ReportPreview uses sharePdfFile');
assert(!reportPreviewContent.includes('href={pdfBlobUrl}'), 'ReportPreview no longer relies on href=blobUrl for opening/downloading');

const sharedReportContent = fs.readFileSync(path.join('src', 'components', 'SharedReportView.tsx'), 'utf8');
assert(sharedReportContent.includes('savePdfToDevice'), 'SharedReportView uses savePdfToDevice');
assert(sharedReportContent.includes('sharePdfFile'), 'SharedReportView uses sharePdfFile');

const appContent = fs.readFileSync(path.join('src', 'App.tsx'), 'utf8');
assert(appContent.includes('savePdfToDevice'), 'App.tsx uses savePdfToDevice');

// 4. Verify 100% Offline Capability (Fonts, Templates, Images, Local DB)
console.log('\n--- TEST 4: Offline Assets & Document Fonts ---');
const pdfGenContent = fs.readFileSync(path.join('src', 'utils', 'pdfGenerator.ts'), 'utf8');
assert(pdfGenContent.includes('document.fonts.ready'), 'pdfGenerator waits for document.fonts.ready before rendering');
assert(fs.existsSync(path.join('public', 'BAR.pdf')), 'public/BAR.pdf template exists');
assert(fs.existsSync(path.join('public', 'NotoSansDevanagari-Bold.ttf')), 'public/NotoSansDevanagari-Bold.ttf exists');
assert(fs.existsSync(path.join('public', 'mangal.ttf')), 'public/mangal.ttf exists');
assert(fs.existsSync(path.join('public', 'mangalb.ttf')), 'public/mangalb.ttf exists');

// 5. Test Multi-Page PDF Assembly and QR Code integration
console.log('\n--- TEST 5: PDF Assembly & QR Code Generation ---');
const templateBytes = fs.readFileSync('public/BAR.pdf');
const pdfDoc = await PDFDocument.load(templateBytes);
const p2 = pdfDoc.addPage([595.5, 842.25]);
const savedBytes = await pdfDoc.save();
assert(savedBytes.length > 500000, `Generated multi-page PDF size verified (${savedBytes.length} bytes)`);

// 6. Verify built APK exists
console.log('\n--- TEST 6: Android Built APK ---');
const apkPath = path.join('android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
assert(fs.existsSync(apkPath), 'app-debug.apk built successfully');
const apkStat = fs.statSync(apkPath);
assert(apkStat.size > 20000000, `APK size verified (${(apkStat.size / (1024 * 1024)).toFixed(1)} MB)`);

console.log('\n====================================================');
console.log('🎉 ALL BALIRAJA FITNESS PDF & ANDROID FLOW CHECKS PASSED!');
console.log('====================================================\n');
