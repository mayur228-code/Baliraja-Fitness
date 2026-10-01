// Standalone unit test for recommendation engine logic & deduplication

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

// -------------------------------------------------------------
// RUNNING MINIMUM TESTS FROM SPECIFICATION
// -------------------------------------------------------------
console.log('====================================================');
console.log('🧪 RUNNING RECOMMENDATION ENGINE UNIT TESTS');
console.log('====================================================\n');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
}

// TEST 1: Weight = Extra -> Multivitamin, Cell-U-loss, Cell Activator
const t1 = getRecommendations({ weight: '80', idealWeight: '70', extraWeight: '10 kg', gender: 'Male' });
assert(
  t1.conditionalProducts.some((p) => p.name.includes('Multivitamin')) &&
  t1.conditionalProducts.some((p) => p.name === 'Cell-U-loss') &&
  t1.conditionalProducts.some((p) => p.name === 'Cell Activator'),
  'TEST 1: Weight = Extra recommends Multivitamin, Cell-U-loss, Cell Activator'
);

// TEST 2: Weight = Less -> Dinoshake
const t2 = getRecommendations({ weight: '50', idealWeight: '60', lessWeight: '10 kg', gender: 'Male' });
assert(
  t2.conditionalProducts.some((p) => p.name === 'Dinoshake') &&
  !t2.conditionalProducts.some((p) => p.name.includes('Multivitamin')),
  'TEST 2: Weight = Less recommends Dinoshake'
);

// TEST 3: Body Fat = Risk -> Omega 3
const t3 = getRecommendations({ bodyFat: '28.0', gender: 'Male' }); // >25% Male is Risk
assert(
  t3.conditionalProducts.some((p) => p.name.includes('Omega 3')),
  'TEST 3: Body Fat = Risk recommends Omega 3'
);

// TEST 4: Visceral Fat = High -> Omega 3
const t4 = getRecommendations({ visceralFat: '10', gender: 'Male' }); // 6-14% Male is High
assert(
  t4.conditionalProducts.some((p) => p.name.includes('Omega 3')),
  'TEST 4: Visceral Fat = High recommends Omega 3'
);

// TEST 5: Resting Metabolism = 1599 -> Active Fiber Complex
const t5 = getRecommendations({ restingMetabolism: '1599', gender: 'Male' });
assert(
  t5.conditionalProducts.some((p) => p.name === 'Active Fiber Complex'),
  'TEST 5: Resting Metabolism = 1599 (< 1600) recommends Active Fiber Complex'
);

// TEST 6: Resting Metabolism = 1600 -> NO Active Fiber Complex
const t6 = getRecommendations({ restingMetabolism: '1600', gender: 'Male' });
assert(
  !t6.conditionalProducts.some((p) => p.name === 'Active Fiber Complex'),
  'TEST 6: Resting Metabolism = 1600 (not < 1600) does NOT recommend Active Fiber Complex'
);

// TEST 7: BMI = Risk -> Niteworks
const t7 = getRecommendations({ bmi: '30.5', gender: 'Male' }); // > 28 Male is Risk
assert(
  t7.conditionalProducts.some((p) => p.name === 'Niteworks'),
  'TEST 7: BMI = Risk recommends Niteworks'
);

// TEST 8: Body Fat = Risk + Visceral Fat = High -> Omega 3 appears ONLY ONCE
const t8 = getRecommendations({ bodyFat: '28.0', visceralFat: '10', gender: 'Male' });
const omegaCount = t8.conditionalProducts.filter((p) => p.id === 'omega-3').length;
assert(
  omegaCount === 1,
  'TEST 8: Body Fat = Risk + Visceral Fat = High -> Omega 3 appears EXACTLY ONCE (Deduplicated)'
);

// TEST 9: All conditional conditions triggered -> all applicable condition products appear, no duplicate products
const t9 = getRecommendations({
  weight: '90',
  idealWeight: '70',
  extraWeight: '20 kg',
  bodyFat: '30.0',
  visceralFat: '12',
  restingMetabolism: '1450',
  bmi: '32.0',
  gender: 'Male',
});
const ids9 = t9.conditionalProducts.map((p) => p.id);
const uniqueIds9 = new Set(ids9);
assert(
  ids9.length === uniqueIds9.size &&
  ids9.includes('multivitamin') &&
  ids9.includes('cell-u-loss') &&
  ids9.includes('cell-activator') &&
  ids9.includes('omega-3') &&
  ids9.includes('active-fiber') &&
  ids9.includes('niteworks'),
  'TEST 9: All conditional conditions triggered -> all products present, 0 duplicates'
);

// TEST 10: No conditional conditions triggered -> compulsory products still appear, Energy & Fitness products still appear
const t10 = getRecommendations({
  weight: '70',
  idealWeight: '70',
  extraWeight: '-',
  lessWeight: '-',
  bodyFat: '15.0', // Normal
  visceralFat: '4', // Normal
  restingMetabolism: '1750', // >= 1600
  bmi: '22.0', // Normal
  gender: 'Male',
});
assert(
  t10.conditionalProducts.length === 0 &&
  t10.compulsoryProducts.length === 3 &&
  t10.energyFitnessProducts.length === 3,
  'TEST 10: No conditions triggered -> conditional is empty, compulsory & energy still appear'
);

// TEST 11: Every generated report contains Formula 1, ShakeMate, Personalised Protein Power, 24 Hydrate, Liftoff, Afresh
for (const testObj of [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10]) {
  const allIds = testObj.allProducts.map((p) => p.id);
  assert(
    allIds.includes('formula-1') &&
    allIds.includes('shakemate') &&
    allIds.includes('protein-powder') &&
    allIds.includes('24-hydrate') &&
    allIds.includes('liftoff') &&
    allIds.includes('afresh'),
    'TEST 11: Compulsory & Energy/Fitness products present in report output'
  );
}

console.log('\n🎉 ALL 11 SPECIFICATION UNIT TESTS PASSED PERFECTLY!\n');
