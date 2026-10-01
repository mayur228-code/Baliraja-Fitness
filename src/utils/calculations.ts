import { Gender, CategoryStatus, ReportData } from '../types';

/**
 * Categorize Body Fat % based strictly on BAR.pdf printed references:
 * Male: Normal <= 17%, High = 20-25% (17.1-25.0), Risk > 25%
 * Female: Normal <= 24%, High = 30-35% (24.1-35.0), Risk > 35%
 */
export function getBodyFatStatus(val: number, gender: Gender): CategoryStatus {
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

/**
 * Categorize Visceral Fat % based strictly on BAR.pdf printed references:
 * Male: Normal <= 5%, High = 14% (6-14%), Risk >= 15%
 * Female: Normal <= 7%, High = 16% (8-16%), Risk >= 17%
 */
export function getVisceralFatStatus(val: number, gender: Gender): CategoryStatus {
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

/**
 * Categorize BMI based strictly on BAR.pdf printed references:
 * Male: Normal <= 23, High = 28 (23.1-28.0), Risk > 28 / 30
 * Female: Normal <= 22, High = 28 (22.1-28.0), Risk > 28 / 30
 */
export function getBmiStatus(val: number, gender: Gender): CategoryStatus {
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

/**
 * Calculate BMI given weight (kg) and height (cm)
 */
export function calculateBmi(weightKg: number, heightCm: number): string {
  if (!weightKg || !heightCm || heightCm <= 0) return '';
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return bmi.toFixed(1);
}

/**
 * Calculate Ideal Weight (kg) based on standard BMI 22
 */
export function calculateIdealWeight(heightCm: number): string {
  if (!heightCm || heightCm <= 0) return '';
  const heightM = heightCm / 100;
  const ideal = 22 * (heightM * heightM);
  return ideal.toFixed(1);
}

/**
 * Calculate Extra or Less Weight
 */
export function calculateWeightDiff(weightKg: number, idealWeightKg: number): { extra: string; less: string } {
  if (!weightKg || !idealWeightKg || isNaN(weightKg) || isNaN(idealWeightKg)) {
    return { extra: '', less: '' };
  }
  const diff = weightKg - idealWeightKg;
  if (diff > 0.3) {
    return { extra: `${diff.toFixed(1)} kg`, less: '-' };
  } else if (diff < -0.3) {
    return { extra: '-', less: `${Math.abs(diff).toFixed(1)} kg` };
  } else {
    return { extra: '-', less: '-' };
  }
}

/**
 * Default sample report for instant preview / testing
 */
export function getSampleReportData(): ReportData {
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  return {
    name: 'राहुल विठ्ठल पाटील',
    mobile: '9876543210',
    village: 'केज (बीड)',
    age: '32',
    gender: 'Male',
    height: '172',
    date: formattedDate,

    weight: '78.5',
    idealWeight: '68.0',
    extraWeight: '10.5 kg',
    lessWeight: '-',

    bodyFat: '22.4',
    visceralFat: '12',
    restingMetabolism: '1650',
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

    reportId: 'BAR-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    createdAt: new Date().toISOString(),
  };
}
