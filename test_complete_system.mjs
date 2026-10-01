import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { PDFDocument } from 'pdf-lib';
import { getLanIp, getAccessibleBaseUrl, saveReport, getReport } from './serverApi.js';

// 1. Classification logic
function getBodyFatStatus(val, gender) {
  if (isNaN(val)) return 'Normal';
  if (gender === 'Male') {
    if (val <= 17.0) return 'Normal';
    if (val <= 25.0) return 'High';
    return 'Risk';
  } else {
    if (val <= 24.0) return 'Normal';
    if (val <= 35.0) return 'High';
    return 'Risk';
  }
}

function getVisceralFatStatus(val, gender) {
  if (isNaN(val)) return 'Normal';
  if (gender === 'Male') {
    if (val <= 5.0) return 'Normal';
    if (val <= 14.0) return 'High';
    return 'Risk';
  } else {
    if (val <= 7.0) return 'Normal';
    if (val <= 16.0) return 'High';
    return 'Risk';
  }
}

function getBmiStatus(val, gender) {
  if (isNaN(val)) return 'Normal';
  if (gender === 'Male') {
    if (val <= 23.0) return 'Normal';
    if (val <= 28.0) return 'High';
    return 'Risk';
  } else {
    if (val <= 22.0) return 'Normal';
    if (val <= 28.0) return 'High';
    return 'Risk';
  }
}

// 2. Product Registry
const PRODUCTS = {
  FORMULA_1: { id: 'formula-1', name: 'Formula 1', imageFileName: 'Formula 1.png' },
  SHAKEMATE: { id: 'shakemate', name: 'ShakeMate', imageFileName: 'ShakeMate.png' },
  PROTEIN_POWDER: { id: 'protein-powder', name: 'Personalised Protein Power', imageFileName: 'Personalised Protein Powder.png' },
  HYDRATE_24: { id: '24-hydrate', name: '24 Hydrate', imageFileName: '24 Hydrate.png' },
  LIFTOFF: { id: 'liftoff', name: 'Liftoff', imageFileName: 'Liftoff.png' },
  AFRESH: { id: 'afresh', name: 'Afresh', imageFileName: 'Afresh.png' },
  MULTIVITAMIN: { id: 'multivitamin', name: 'Multivitamin Mineral & Herbal Tablets Plus', imageFileName: 'Multivitamin Mineral & Herbal Tablets Plus.png' },
  CELL_U_LOSS: { id: 'cell-u-loss', name: 'Cell-U-loss', imageFileName: 'Cell-U-Loss.png' },
  CELL_ACTIVATOR: { id: 'cell-activator', name: 'Cell Activator', imageFileName: 'Cell Activator.png' },
  DINOSHAKE: { id: 'dinoshake', name: 'Dinoshake', imageFileName: 'Dinoshake.png' },
  OMEGA_3: { id: 'omega-3', name: 'Omega 3 (EPA & DHA) Capsules', imageFileName: 'Omega 3 (EPA & DHA) Capsules.png' },
  ACTIVE_FIBER: { id: 'active-fiber', name: 'Active Fiber Complex', imageFileName: 'Active Fiber Complex.png' },
  NITEWORKS: { id: 'niteworks', name: 'Niteworks', imageFileName: 'Niteworks.png' },
};

function deduplicateProducts(items) {
  const seen = new Set();
  const res = [];
  for (const item of items) {
    if (item && item.id && !seen.has(item.id)) {
      seen.add(item.id);
      res.push(item);
    }
  }
  return res;
}

function getRecommendations(data) {
  const rawConditionalList = [];

  const weightNum = parseFloat(data.weight);
  const idealNum = parseFloat(data.idealWeight);

  const hasExplicitExtra = Boolean(data.extraWeight) && data.extraWeight.trim() !== '' && data.extraWeight.trim() !== '-';
  const hasExplicitLess = Boolean(data.lessWeight) && data.lessWeight.trim() !== '' && data.lessWeight.trim() !== '-';
  const diffFromNumbers = !isNaN(weightNum) && !isNaN(idealNum) ? weightNum - idealNum : 0;

  const isExtraWeight = hasExplicitExtra || diffFromNumbers > 0.3;
  const isLessWeight = hasExplicitLess || diffFromNumbers < -0.3;

  if (isExtraWeight) {
    rawConditionalList.push(PRODUCTS.MULTIVITAMIN);
    rawConditionalList.push(PRODUCTS.CELL_U_LOSS);
    rawConditionalList.push(PRODUCTS.CELL_ACTIVATOR);
  } else if (isLessWeight) {
    rawConditionalList.push(PRODUCTS.DINOSHAKE);
  }

  const bodyFatNum = parseFloat(data.bodyFat);
  if (!isNaN(bodyFatNum)) {
    const bfStatus = getBodyFatStatus(bodyFatNum, data.gender);
    if (bfStatus === 'Risk') {
      rawConditionalList.push(PRODUCTS.OMEGA_3);
    }
  }

  const visceralNum = parseFloat(data.visceralFat);
  if (!isNaN(visceralNum)) {
    const vfStatus = getVisceralFatStatus(visceralNum, data.gender);
    if (vfStatus === 'High') {
      rawConditionalList.push(PRODUCTS.OMEGA_3);
    }
  }

  const rmNum = parseFloat(data.restingMetabolism);
  if (!isNaN(rmNum) && rmNum < 1600) {
    rawConditionalList.push(PRODUCTS.ACTIVE_FIBER);
  }

  const bmiNum = parseFloat(data.bmi);
  if (!isNaN(bmiNum)) {
    const bmiStatus = getBmiStatus(bmiNum, data.gender);
    if (bmiStatus === 'Risk') {
      rawConditionalList.push(PRODUCTS.NITEWORKS);
    }
  }

  const conditionalProducts = deduplicateProducts(rawConditionalList);
  const compulsoryProducts = [PRODUCTS.FORMULA_1, PRODUCTS.SHAKEMATE, PRODUCTS.PROTEIN_POWDER];
  const energyFitnessProducts = [PRODUCTS.HYDRATE_24, PRODUCTS.LIFTOFF, PRODUCTS.AFRESH];
  const allProducts = deduplicateProducts([...conditionalProducts, ...compulsoryProducts, ...energyFitnessProducts]);

  return {
    conditionalProducts,
    compulsoryProducts,
    energyFitnessProducts,
    allProducts,
  };
}

async function runEndToEndVerification() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPLETE SYSTEM & SUGGESTIONS VERIFICATION');
  console.log('====================================================\n');

  // 1. Verify Product Image Assets Exist
  console.log('--- STEP 1: Verify Product Image Assets ---');
  for (const [key, prod] of Object.entries(PRODUCTS)) {
    const srcPath = path.join('src', 'products', prod.imageFileName);
    const pubPath = path.join('public', 'products', prod.imageFileName);
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Missing source asset for ${prod.name}: ${srcPath}`);
    }
    if (!fs.existsSync(pubPath)) {
      throw new Error(`Missing public asset for ${prod.name}: ${pubPath}`);
    }
    const stat = fs.statSync(srcPath);
    console.log(`✅ Asset verified: ${prod.name} -> ${prod.imageFileName} (${(stat.size / 1024).toFixed(1)} KB)`);
  }
  console.log('✅ All required product assets verified!\n');

  // 2. Test Recommendation Engine Tests 1-11
  console.log('--- STEP 2: Verify Recommendation Logic Rules ---');
  // Weight Extra
  const rec1 = getRecommendations({ weight: '85', idealWeight: '70', extraWeight: '15 kg', gender: 'Male' });
  if (!rec1.conditionalProducts.some((p) => p.id === 'multivitamin') ||
      !rec1.conditionalProducts.some((p) => p.id === 'cell-u-loss') ||
      !rec1.conditionalProducts.some((p) => p.id === 'cell-activator')) {
    throw new Error('Weight Extra rule failed');
  }
  console.log('✅ Rule A (Weight = Extra) passed');

  // Weight Less
  const rec2 = getRecommendations({ weight: '55', idealWeight: '65', lessWeight: '10 kg', gender: 'Male' });
  if (!rec2.conditionalProducts.some((p) => p.id === 'dinoshake')) {
    throw new Error('Weight Less rule failed');
  }
  console.log('✅ Rule A (Weight = Less) passed');

  // Body Fat Risk
  const rec3 = getRecommendations({ bodyFat: '26.0', gender: 'Male' });
  if (!rec3.conditionalProducts.some((p) => p.id === 'omega-3')) {
    throw new Error('Body Fat Risk rule failed');
  }
  console.log('✅ Rule B (Body Fat = Risk) passed');

  // Visceral Fat High
  const rec4 = getRecommendations({ visceralFat: '12', gender: 'Male' });
  if (!rec4.conditionalProducts.some((p) => p.id === 'omega-3')) {
    throw new Error('Visceral Fat High rule failed');
  }
  console.log('✅ Rule C (Visceral Fat = High) passed');

  // Resting Metabolism < 1600 vs = 1600
  const rec5 = getRecommendations({ restingMetabolism: '1599', gender: 'Male' });
  const rec6 = getRecommendations({ restingMetabolism: '1600', gender: 'Male' });
  if (!rec5.conditionalProducts.some((p) => p.id === 'active-fiber') ||
      rec6.conditionalProducts.some((p) => p.id === 'active-fiber')) {
    throw new Error('Resting Metabolism rule failed');
  }
  console.log('✅ Rule D (Resting Metabolism < 1600 strictly) passed');

  // BMI Risk
  const rec7 = getRecommendations({ bmi: '29.5', gender: 'Male' });
  if (!rec7.conditionalProducts.some((p) => p.id === 'niteworks')) {
    throw new Error('BMI Risk rule failed');
  }
  console.log('✅ Rule E (BMI = Risk) passed');

  // Deduplication: Body Fat Risk + Visceral Fat High
  const rec8 = getRecommendations({ bodyFat: '28.0', visceralFat: '12', gender: 'Male' });
  const countOmega = rec8.conditionalProducts.filter((p) => p.id === 'omega-3').length;
  if (countOmega !== 1) {
    throw new Error(`Deduplication failed: Omega 3 appeared ${countOmega} times`);
  }
  console.log('✅ Deduplication (Body Fat Risk + Visceral Fat High -> Omega 3 once) passed');

  // Compulsory & Energy/Fitness
  if (rec8.compulsoryProducts.length !== 3 || rec8.energyFitnessProducts.length !== 3) {
    throw new Error('Compulsory / Energy Fitness products count incorrect');
  }
  console.log('✅ Compulsory & Energy/Fitness categories passed\n');

  // 3. Server API & Persistence Verification
  console.log('--- STEP 3: Server API & LAN Persistence ---');
  const lanIp = getLanIp();
  const sampleData = {
    name: 'राहुल विठ्ठल पाटील',
    mobile: '9876543210',
    village: 'केज (बीड)',
    age: '32',
    gender: 'Male',
    height: '172',
    date: '30/09/2026',
    weight: '78.5',
    idealWeight: '68.0',
    extraWeight: '10.5 kg',
    lessWeight: '-',
    bodyFat: '22.4',
    visceralFat: '12',
    restingMetabolism: '1580',
    bmi: '26.5',
    bodyAge: '38',
    subWhole: '18.5',
    subArms: '19.2',
    subTrunk: '16.8',
    subLegs: '21.0',
    skelWhole: '34.5',
    skelArms: '42.0',
    skelTrunk: '28.5',
    skelLegs: '47.0',
    measArms: '14.5',
    measWaist: '36.0',
    measThigh: '22.5',
  };

  const saveRes = saveReport(sampleData, null, 5173);
  console.log(`Saved Report ID: ${saveRes.id}`);
  console.log(`Report URL: ${saveRes.reportUrl}`);

  const fetched = getReport(saveRes.id);
  if (!fetched || fetched.name !== sampleData.name) {
    throw new Error('Report data retrieval from storage failed');
  }
  console.log('✅ Server storage and retrieval verified\n');

  // 4. QR Code Generation & Decodability
  console.log('--- STEP 4: QR Code Generation & Decodability ---');
  const qrDataUrl = await QRCode.toDataURL(saveRes.reportUrl, {
    margin: 2,
    width: 300,
    errorCorrectionLevel: 'M',
    color: { dark: '#000000', light: '#ffffff' },
  });

  const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
  const pngBuffer = Buffer.from(base64Data, 'base64');
  const png = PNG.sync.read(pngBuffer);
  const qrCodeDecoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

  if (!qrCodeDecoded || qrCodeDecoded.data !== saveRes.reportUrl) {
    throw new Error('QR Code decoding mismatch');
  }
  console.log(`✅ Decoded QR matches URL: ${qrCodeDecoded.data}\n`);

  // 5. PDF Structure & Multi-Page Assembly
  console.log('--- STEP 5: Multi-page PDF Assembly with Template ---');
  const templateBytes = fs.readFileSync('public/BAR.pdf');
  const pdfDoc = await PDFDocument.load(templateBytes);
  const pageCountBefore = pdfDoc.getPageCount();

  // Add Page 2 for Suggestions
  const page2 = pdfDoc.addPage([595.5, 842.25]);
  const pageCountAfter = pdfDoc.getPageCount();

  if (pageCountBefore !== 1 || pageCountAfter !== 2) {
    throw new Error(`PDF Page count error: expected 2 pages, got ${pageCountAfter}`);
  }

  const finalPdfBytes = await pdfDoc.save();
  fs.writeFileSync('public/test_generated_report.pdf', finalPdfBytes);
  console.log(`✅ Generated 2-page PDF saved: public/test_generated_report.pdf (${(finalPdfBytes.length / 1024).toFixed(1)} KB)`);

  console.log('\n====================================================');
  console.log('🎉 ALL SYSTEM & FEATURE VERIFICATION CHECKS PASSED!');
  console.log('====================================================\n');
}

runEndToEndVerification().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
