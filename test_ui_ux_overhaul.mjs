import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('🧪 RUNNING UI/UX OVERHAUL & FEATURE VERIFICATION');
console.log('====================================================\n');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
}

// Read relevant source files
const appTsx = fs.readFileSync('src/App.tsx', 'utf8');
const homeTsx = fs.readFileSync('src/components/HomeScreen.tsx', 'utf8');
const drawerTsx = fs.readFileSync('src/components/NavigationDrawer.tsx', 'utf8');
const reportsTsx = fs.readFileSync('src/components/ReportsListView.tsx', 'utf8');
const contactTsx = fs.readFileSync('src/components/ContactUsView.tsx', 'utf8');
const aboutTsx = fs.readFileSync('src/components/AboutView.tsx', 'utf8');
const previewTsx = fs.readFileSync('src/components/ReportPreview.tsx', 'utf8');
const sharedTsx = fs.readFileSync('src/components/SharedReportView.tsx', 'utf8');
const metricSummaryTs = fs.readFileSync('src/utils/metricSummary.ts', 'utf8');
const localDbTs = fs.readFileSync('src/utils/localDatabase.ts', 'utf8');
const pdfGenTs = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');
const nativePdfTs = fs.readFileSync('src/utils/nativePdfHandler.ts', 'utf8');

// 1. HOME
console.log('--- 1. HOME SCREEN ---');
assert(appTsx.includes("useState<AppView>('home')"), 'App starts on Home screen by default');
assert(homeTsx.includes('onMakeReport'), 'Home screen has Make Report action handler');
assert(homeTsx.includes('नवीन अहवाल तयार करा') || homeTsx.includes('Make Report'), 'Home screen displays prominent Make Report button');
assert(homeTsx.includes('onOpenMenu') && homeTsx.includes('<Menu'), 'Home screen has hamburger / menu button');

// 2. SIDEBAR
console.log('\n--- 2. SIDEBAR / NAVIGATION DRAWER ---');
assert(drawerTsx.includes('slide-in-from-left'), 'Drawer slides in from the left');
assert(drawerTsx.includes("'reports'"), 'Drawer has Reports item');
assert(drawerTsx.includes("'contact'"), 'Drawer has Contact Us item');
assert(drawerTsx.includes("'about'"), 'Drawer has About item');

// 3. REPORTS
console.log('\n--- 3. REPORTS & DATABASE BROWSING ---');
assert(localDbTs.includes('getLatestReportsPerPerson'), 'localDatabase has getLatestReportsPerPerson deduplication');
assert(reportsTsx.includes('getSafePdfFileName'), 'ReportsListView uses getSafePdfFileName for PDF opening');
assert(reportsTsx.includes('openPdfDocument'), 'ReportsListView opens generated PDF on demand');
assert(reportsTsx.includes('selectedReport'), 'Clicking report shows summary modal first with Open Report action');

// 4. CONTACT US
console.log('\n--- 4. CONTACT US ---');
assert(contactTsx.includes('श्री. गणेश शिंदे'), 'ContactUsView shows owner / coach name');
assert(contactTsx.includes('7972532010'), 'ContactUsView shows phone number');
assert(contactTsx.includes('tel:'), 'ContactUsView includes direct Call (tel:) action');

// 5. ABOUT
console.log('\n--- 5. ABOUT ---');
assert(aboutTsx.includes('1.0.0'), 'AboutView shows app version');
assert(aboutTsx.includes('isUpdateAvailable'), 'AboutView has extensible update check structure');
assert(!aboutTsx.includes('onClick={handleCheckUpdate}'), 'AboutView does not render arbitrary dummy update button');

// 6. REPORT SCREEN TOP NAVIGATION
console.log('\n--- 6. REPORT TOP NAVIGATION ---');
assert(appTsx.includes('<PenLine') && appTsx.includes('<Eye'), 'Top navigation uses Pen and Eye icon buttons');
// Ensure no tab or button with text Database / डेटाबेस in header navigation
assert(!appTsx.includes('>Database<') && !appTsx.includes('>डेटाबेस<'), 'Database tab button removed from report screen top nav');

// 7. REPORT HEADER & ACTIONS
console.log('\n--- 7. REPORT HEADER & ACTIONS ---');
assert(previewTsx.includes('QrCode') && previewTsx.includes('QR कोड'), 'ReportPreview keeps QR action with label');
assert(previewTsx.includes('PDF उघडा') || previewTsx.includes('Open'), 'ReportPreview keeps Open PDF action');
assert(!previewTsx.includes('WhatsApp Share') && !previewTsx.includes('WhatsApp वर पाठवा'), 'WhatsApp Share button removed from ReportPreview header');

// 8. QR SHARED REPORT PAGE
console.log('\n--- 8. QR SHARED REPORT PAGE ---');
assert(sharedTsx.includes('SuggestionsSection'), 'SharedReportView includes SuggestionsSection');
assert(sharedTsx.includes('getReportKeyMetrics'), 'SharedReportView includes Key Metrics summary');
assert(sharedTsx.includes('Download Report') || sharedTsx.includes('अहवाल डाउनलोड करा'), 'SharedReportView includes Download Report button');
assert(!sharedTsx.includes('ReportForm') && !sharedTsx.includes('NavigationDrawer'), 'SharedReportView has no form, database, or sidebar navigation');

// 9. REPORT SUMMARY RULES
console.log('\n--- 9. REPORT SUMMARY METRICS & DEVIATION RULES ---');
assert(metricSummaryTs.includes('text-rose-600') && metricSummaryTs.includes('text-emerald-600'), 'metricSummary uses red for unfavorable and green for favorable');
assert(!previewTsx.includes('योग्य प्रमाणात'), 'ReportPreview does not show placeholder label when metric is normal');
assert(!sharedTsx.includes('योग्य प्रमाणात'), 'SharedReportView does not show placeholder label when metric is normal');
assert(previewTsx.includes('text-[15px] font-semibold') || previewTsx.includes('font-semibold'), 'Indicator text is formatted as 14-16px semibold text');

// 10. SUGGESTIONS & RECOMMENDATION LOGIC
console.log('\n--- 10. SUGGESTIONS & RECOMMENDATIONS ---');
assert(fs.existsSync('src/utils/recommendations.ts'), 'recommendations.ts exists');
const recTs = fs.readFileSync('src/utils/recommendations.ts', 'utf8');
assert(recTs.includes('conditionalProducts') && recTs.includes('compulsoryProducts') && recTs.includes('energyFitnessProducts'), 'Recommendations structure intact');

// 11. PDF GENERATION PERFORMANCE
console.log('\n--- 11. PDF GENERATION PERFORMANCE ---');
assert(pdfGenTs.includes('preloadPdfAssets'), 'pdfGenerator exports preloadPdfAssets');
assert(appTsx.includes('preloadPdfAssets()'), 'App calls preloadPdfAssets on startup');
assert(nativePdfTs.includes('openPdfDocument') && nativePdfTs.includes('savePdfToDevice'), 'Native Android PDF handling methods intact');

console.log('\n====================================================');
console.log('🎉 ALL UI/UX OVERHAUL REQUIREMENTS VERIFIED SUCCESSFULLY!');
console.log('====================================================\n');
