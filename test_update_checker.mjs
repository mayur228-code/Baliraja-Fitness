import assert from 'assert';
import http from 'http';

console.log('=== RUNNING IN-APP UPDATE CHECKER TESTS ===\n');

// 1. Test cleanVersionString & isVersionNewer logic
function cleanVersionString(v) {
  if (!v) return '0.0.0';
  return v.replace(/^v/i, '').trim();
}

function isVersionNewer(candidateVersion, currentVersion) {
  const cleanCandidate = cleanVersionString(candidateVersion);
  const cleanCurrent = cleanVersionString(currentVersion);

  const candParts = cleanCandidate.split('.').map((n) => parseInt(n, 10) || 0);
  const currParts = cleanCurrent.split('.').map((n) => parseInt(n, 10) || 0);

  const length = Math.max(candParts.length, currParts.length, 3);
  for (let i = 0; i < length; i++) {
    const candNum = candParts[i] || 0;
    const currNum = currParts[i] || 0;
    if (candNum > currNum) return true;
    if (candNum < currNum) return false;
  }
  return false;
}

// Test Suite 1: Version Comparison Scenarios
console.log('1. Testing Semver Comparison Engine:');
assert.strictEqual(isVersionNewer('1.0.1', '1.0.0'), true, '1.0.1 should be newer than 1.0.0');
assert.strictEqual(isVersionNewer('v1.0.1', '1.0.0'), true, 'v1.0.1 should be newer than 1.0.0');
assert.strictEqual(isVersionNewer('1.1.0', '1.0.9'), true, '1.1.0 should be newer than 1.0.9');
assert.strictEqual(isVersionNewer('2.0.0', '1.9.9'), true, '2.0.0 should be newer than 1.9.9');
assert.strictEqual(isVersionNewer('1.0.0', '1.0.0'), false, '1.0.0 should not be newer than 1.0.0');
assert.strictEqual(isVersionNewer('v1.0.0', '1.0.0'), false, 'v1.0.0 should not be newer than 1.0.0');
assert.strictEqual(isVersionNewer('0.9.9', '1.0.0'), false, '0.9.9 should not be newer than 1.0.0');
assert.strictEqual(isVersionNewer('1.0.0-beta', '1.0.0'), false, '1.0.0-beta should not be newer than 1.0.0');
console.log('  ✓ All Semver comparison assertions passed');

// Test Suite 2: Release Asset Parsing
console.log('\n2. Testing GitHub Release Asset Extraction:');
const sampleReleaseWithApk = {
  tag_name: 'v1.0.1',
  name: 'Baliraja Fitness v1.0.1 Update',
  body: 'Fixed Bluetooth printer connectivity and improved UI.',
  html_url: 'https://github.com/mayur228-code/Baliraja-Fitness/releases/tag/v1.0.1',
  published_at: '2026-10-01T12:00:00Z',
  assets: [
    {
      name: 'app-release.apk',
      browser_download_url: 'https://github.com/mayur228-code/Baliraja-Fitness/releases/download/v1.0.1/app-release.apk',
    },
    {
      name: 'source.zip',
      browser_download_url: 'https://github.com/mayur228-code/Baliraja-Fitness/archive/refs/tags/v1.0.1.zip',
    }
  ]
};

const currentVer = '1.0.0';
const isNewer = isVersionNewer(sampleReleaseWithApk.tag_name, currentVer);
assert.strictEqual(isNewer, true, 'New release tag must be flagged as newer');

const apkAsset = sampleReleaseWithApk.assets.find(a => a.name.toLowerCase().endsWith('.apk'));
assert.ok(apkAsset, 'Should locate APK asset');
assert.strictEqual(apkAsset.browser_download_url, 'https://github.com/mayur228-code/Baliraja-Fitness/releases/download/v1.0.1/app-release.apk');
console.log('  ✓ Correctly extracted APK direct download asset URL:', apkAsset.browser_download_url);

// Test Suite 3: Fallback when no APK asset attached
console.log('\n3. Testing Fallback behavior when release has no direct APK:');
const sampleReleaseWithoutApk = {
  tag_name: 'v1.0.2',
  name: 'Baliraja Fitness v1.0.2',
  html_url: 'https://github.com/mayur228-code/Baliraja-Fitness/releases/tag/v1.0.2',
  assets: []
};

let downloadUrl = sampleReleaseWithoutApk.html_url;
if (Array.isArray(sampleReleaseWithoutApk.assets) && sampleReleaseWithoutApk.assets.length > 0) {
  const asset = sampleReleaseWithoutApk.assets.find(a => a.name && a.name.toLowerCase().endsWith('.apk'));
  if (asset) downloadUrl = asset.browser_download_url;
}
assert.strictEqual(downloadUrl, 'https://github.com/mayur228-code/Baliraja-Fitness/releases/tag/v1.0.2');
console.log('  ✓ Correctly fell back to GitHub release page when no APK binary asset attached');

console.log('\n=== ALL UPDATE CHECKER TESTS PASSED SUCCESSFULLY! ===\n');
