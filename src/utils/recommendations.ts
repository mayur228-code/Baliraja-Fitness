import { Gender, ReportData } from '../types';
import { getBodyFatStatus, getVisceralFatStatus, getBmiStatus } from './calculations';

export interface ProductItem {
  id: string;
  name: string;
  marathiName: string;
  imageFileName: string;
  imagePath: string;
  categoryName?: string;
}

/**
 * Registry of all available product assets mapped strictly to existing PNG filenames in src/products & public/products.
 */
export const PRODUCTS = {
  // Compulsory Products
  FORMULA_1: {
    id: 'formula-1',
    name: 'Formula 1',
    marathiName: 'फॉर्म्युला १ न्यूट्रिशनल शेक',
    imageFileName: 'Formula 1.png',
    imagePath: '/products/Formula 1.png',
  },
  SHAKEMATE: {
    id: 'shakemate',
    name: 'ShakeMate',
    marathiName: 'शेक मेट',
    imageFileName: 'ShakeMate.png',
    imagePath: '/products/ShakeMate.png',
  },
  PROTEIN_POWDER: {
    id: 'protein-powder',
    name: 'Personalised Protein Power',
    marathiName: 'पर्सनलाइज्ड प्रोटीन पावडर',
    imageFileName: 'Personalised Protein Powder.png',
    imagePath: '/products/Personalised Protein Powder.png',
  },

  // Energy & Fitness Category
  HYDRATE_24: {
    id: '24-hydrate',
    name: '24 Hydrate',
    marathiName: '२४ हायड्रेट',
    imageFileName: '24 Hydrate.png',
    imagePath: '/products/24 Hydrate.png',
  },
  LIFTOFF: {
    id: 'liftoff',
    name: 'Liftoff',
    marathiName: 'लिफ्टऑफ एनर्जी',
    imageFileName: 'Liftoff.png',
    imagePath: '/products/Liftoff.png',
  },
  AFRESH: {
    id: 'afresh',
    name: 'Afresh',
    marathiName: 'अफ्रेश एनर्जी ड्रिंक',
    imageFileName: 'Afresh.png',
    imagePath: '/products/Afresh.png',
  },

  // Conditional Recommendations
  MULTIVITAMIN: {
    id: 'multivitamin',
    name: 'Multivitamin Mineral & Herbal Tablets Plus',
    marathiName: 'मल्टीव्हिटॅमिन मिनरल आणि हर्बल टॅबलेट्स',
    imageFileName: 'Multivitamin Mineral & Herbal Tablets Plus.png',
    imagePath: '/products/Multivitamin Mineral & Herbal Tablets Plus.png',
  },
  CELL_U_LOSS: {
    id: 'cell-u-loss',
    name: 'Cell-U-loss',
    marathiName: 'सेल-यू-लॉस',
    imageFileName: 'Cell-U-Loss.png',
    imagePath: '/products/Cell-U-Loss.png',
  },
  CELL_ACTIVATOR: {
    id: 'cell-activator',
    name: 'Cell Activator',
    marathiName: 'सेल ॲक्टिव्हेटर',
    imageFileName: 'Cell Activator.png',
    imagePath: '/products/Cell Activator.png',
  },
  DINOSHAKE: {
    id: 'dinoshake',
    name: 'Dinoshake',
    marathiName: 'डिनोशेक',
    imageFileName: 'Dinoshake.png',
    imagePath: '/products/Dinoshake.png',
  },
  OMEGA_3: {
    id: 'omega-3',
    name: 'Omega 3 (EPA & DHA) Capsules',
    marathiName: 'ओमेगा ३ (ईपीए आणि डीएचए) कॅप्सूल',
    imageFileName: 'Omega 3 (EPA & DHA) Capsules.png',
    imagePath: '/products/Omega 3 (EPA & DHA) Capsules.png',
  },
  ACTIVE_FIBER: {
    id: 'active-fiber',
    name: 'Active Fiber Complex',
    marathiName: 'ॲक्टिव्ह फायबर कॉम्प्लेक्स',
    imageFileName: 'Active Fiber Complex.png',
    imagePath: '/products/Active Fiber Complex.png',
  },
  NITEWORKS: {
    id: 'niteworks',
    name: 'Niteworks',
    marathiName: 'नाईटवर्क्स',
    imageFileName: 'Niteworks.png',
    imagePath: '/products/Niteworks.png',
  },
  HERBAL_CONTROL: {
    id: 'herbal-control',
    name: 'Herbal Control',
    marathiName: 'हर्बल कंट्रोल',
    imageFileName: 'Herbal Control.png',
    imagePath: '/products/Herbal Control.png',
  },
} as const;

export interface SuggestionRecommendations {
  conditionalProducts: ProductItem[];
  compulsoryProducts: ProductItem[];
  energyFitnessProducts: ProductItem[];
  allProducts: ProductItem[];
}

/**
 * Helper to deduplicate products stably by product ID
 */
export function deduplicateProducts(items: ProductItem[]): ProductItem[] {
  const seen = new Set<string>();
  const result: ProductItem[] = [];
  for (const item of items) {
    if (item && item.id && !seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

/**
 * Calculate the Suggestions product recommendations from actual report data.
 * Evaluates all conditions independently and deduplicates products stably.
 */
export function getRecommendations(data: ReportData): SuggestionRecommendations {
  const rawConditionalList: ProductItem[] = [];

  // A. WEIGHT SECTION
  const weightNum = parseFloat(data.weight);
  const idealNum = parseFloat(data.idealWeight);

  const hasExplicitExtra =
    Boolean(data.extraWeight) &&
    data.extraWeight.trim() !== '' &&
    data.extraWeight.trim() !== '-';

  const hasExplicitLess =
    Boolean(data.lessWeight) &&
    data.lessWeight.trim() !== '' &&
    data.lessWeight.trim() !== '-';

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

  // B. BODY FAT % SECTION
  const bodyFatNum = parseFloat(data.bodyFat);
  if (!isNaN(bodyFatNum)) {
    const bfStatus = getBodyFatStatus(bodyFatNum, data.gender);
    if (bfStatus === 'Risk') {
      rawConditionalList.push(PRODUCTS.OMEGA_3);
    }
  }

  // C. VISCERAL FAT % SECTION
  const visceralNum = parseFloat(data.visceralFat);
  if (!isNaN(visceralNum)) {
    const vfStatus = getVisceralFatStatus(visceralNum, data.gender);
    if (vfStatus === 'High') {
      rawConditionalList.push(PRODUCTS.OMEGA_3);
    }
  }

  // D. RESTING METABOLISM SECTION
  // Numerical condition: value < 1600 strictly (1600 or above does NOT trigger)
  const rmNum = parseFloat(data.restingMetabolism);
  if (!isNaN(rmNum) && rmNum < 1600) {
    rawConditionalList.push(PRODUCTS.ACTIVE_FIBER);
  }

  // E. BMI SECTION
  const bmiNum = parseFloat(data.bmi);
  if (!isNaN(bmiNum)) {
    const bmiStatus = getBmiStatus(bmiNum, data.gender);
    if (bmiStatus === 'Risk') {
      rawConditionalList.push(PRODUCTS.NITEWORKS);
    }
  }

  // Deduplicate conditional products
  const conditionalProducts = deduplicateProducts(rawConditionalList);

  // 2. Compulsory Products (Always present)
  const compulsoryProducts: ProductItem[] = [
    PRODUCTS.FORMULA_1,
    PRODUCTS.SHAKEMATE,
    PRODUCTS.PROTEIN_POWDER,
  ];

  // 3. Energy & Fitness Category (Always present)
  const energyFitnessProducts: ProductItem[] = [
    PRODUCTS.HYDRATE_24,
    PRODUCTS.LIFTOFF,
    PRODUCTS.AFRESH,
  ];

  // Combined deduplicated list
  const allProducts = deduplicateProducts([
    ...conditionalProducts,
    ...compulsoryProducts,
    ...energyFitnessProducts,
  ]);

  return {
    conditionalProducts,
    compulsoryProducts,
    energyFitnessProducts,
    allProducts,
  };
}
