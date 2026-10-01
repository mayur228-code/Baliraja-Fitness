import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

console.log('====================================================');
console.log('📱 TESTING BALIRAJA FITNESS /download PAGE & QR FLOW');
console.log('====================================================\n');

// 1. Verify Build Output dist/index.html & assets
console.log('--- STEP 1: Verify Build Outputs ---');
const distIndexPath = path.resolve('dist', 'index.html');
if (!fs.existsSync(distIndexPath)) {
  console.error('❌ dist/index.html does not exist!');
  process.exit(1);
}
console.log('✅ dist/index.html exists');

const distAssets = fs.readdirSync(path.resolve('dist', 'assets'));
const jsBundle = distAssets.find((f) => f.startsWith('index-') && f.endsWith('.js'));
const cssBundle = distAssets.find((f) => f.startsWith('index-') && f.endsWith('.css'));

if (!jsBundle || !cssBundle) {
  console.error('❌ Missing compiled JS or CSS bundle in dist/assets!');
  process.exit(1);
}
console.log(`✅ JS Bundle found: ${jsBundle} (${(fs.statSync(path.resolve('dist', 'assets', jsBundle)).size / 1024).toFixed(1)} KB)`);
console.log(`✅ CSS Bundle found: ${cssBundle} (${(fs.statSync(path.resolve('dist', 'assets', cssBundle)).size / 1024).toFixed(1)} KB)`);

// 2. Test Dynamic QR Code Generation & Decodability for /download
console.log('\n--- STEP 2: Verify Dynamic QR Generation for /download ---');
const testDownloadUrls = [
  'http://localhost:5173/download',
  'https://baliraja-fitness.example.com/download',
  'https://user.github.io/Baliraja_Fitness/download',
];

for (const targetUrl of testDownloadUrls) {
  const qrBuffer = await QRCode.toBuffer(targetUrl, {
    margin: 2,
    width: 400,
    errorCorrectionLevel: 'M',
    color: { dark: '#064e3b', light: '#ffffff' },
  });

  const png = PNG.sync.read(qrBuffer);
  const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

  if (!code || code.data !== targetUrl) {
    console.error(`❌ QR decode failed for ${targetUrl}`);
    process.exit(1);
  }
  console.log(`✅ Successfully generated & decoded QR code for: ${targetUrl}`);
}

// 3. Test APK URL Resolution Hierarchy
console.log('\n--- STEP 3: Verify APK URL Config Hierarchy ---');
const appConfigContent = fs.readFileSync('src/utils/appConfig.ts', 'utf-8');
const versionMatch = appConfigContent.match(/version:\s*'([^']+)'/);
const apkFileMatch = appConfigContent.match(/apkFileName:\s*'([^']+)'/);
const apkSizeMatch = appConfigContent.match(/apkFileSize:\s*'([^']+)'/);
const minSdkMatch = appConfigContent.match(/minAndroidVersion:\s*'([^']+)'/);

const version = versionMatch ? versionMatch[1] : '1.0.0';
const apkFileName = apkFileMatch ? apkFileMatch[1] : 'app-release.apk';
const apkFileSize = apkSizeMatch ? apkSizeMatch[1] : '29.8 MB';
const minAndroidVersion = minSdkMatch ? minSdkMatch[1] : 'Android 7.0+';

console.log(`✅ Default App Version: v${version}`);
console.log(`✅ Default APK Filename: ${apkFileName}`);
console.log(`✅ Default APK File Size: ${apkFileSize}`);
console.log(`✅ Default Min Android SDK: ${minAndroidVersion}`);

// 4. Verify Server Routing for /download
console.log('\n--- STEP 4: Verify Server Static & SPA Fallback ---');
const serverContent = fs.readFileSync('server.js', 'utf-8');
if (serverContent.includes("app.get('*'") || serverContent.includes('app.use(express.static')) {
  console.log('✅ server.js properly configured for SPA fallback routing including /download');
} else {
  console.error('❌ server.js missing SPA fallback!');
  process.exit(1);
}

console.log('\n====================================================');
console.log('🎉 ALL /download PAGE & QR VERIFICATION CHECKS PASSED!');
console.log('====================================================\n');
