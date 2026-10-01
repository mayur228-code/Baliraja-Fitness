import { ReportData, Gender } from '../types';

export interface MetricSummaryItem {
  id: string;
  label: string;
  labelMarathi: string;
  value: string;
  unit?: string;
  diffText?: string;
  diffColor?: 'text-rose-600' | 'text-emerald-600';
}

function formatDiffNumber(val: number): string {
  const rounded = Math.round(val * 10) / 10;
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
}

/**
 * Compute key report metrics with unit-aware indicators and strict color rules:
 * - Unfavorable deviation: RED (text-rose-600), e.g. ↑ 10 kg, ↑ 5%, ↓ 4%
 * - Favorable deviation: GREEN (text-emerald-600), e.g. ↑ 4% (muscle), ↓ 4 वर्षे (body age)
 * - Within normal range / no meaningful deviation: undefined (NO indicator)
 * - Age remains strictly in years (वर्षे). Never % on age or weight!
 * - Weight remains strictly in kg.
 */
export function getReportKeyMetrics(data: ReportData): MetricSummaryItem[] {
  const metrics: MetricSummaryItem[] = [];
  const gender: Gender = data.gender || 'Male';

  // 1. Weight (वजन) - Unit-aware: 'kg', never %
  const weightNum = parseFloat(data.weight);
  const idealNum = parseFloat(data.idealWeight);
  if (!isNaN(weightNum)) {
    let diffText: string | undefined;
    let diffColor: 'text-rose-600' | 'text-emerald-600' | undefined;

    if (!isNaN(idealNum) && idealNum > 0) {
      const diff = weightNum - idealNum;
      if (diff >= 0.5) {
        diffText = `↑ ${formatDiffNumber(diff)} kg`;
        diffColor = 'text-rose-600'; // Extra weight is unfavorable -> RED
      } else if (diff <= -0.5) {
        diffText = `↓ ${formatDiffNumber(Math.abs(diff))} kg`;
        diffColor = 'text-rose-600'; // Underweight is unfavorable -> RED
      }
    }

    metrics.push({
      id: 'weight',
      label: 'Weight',
      labelMarathi: 'वजन',
      value: `${weightNum} kg`,
      diffText,
      diffColor,
    });
  }

  // 2. BMI (बॉडी मास इंडेक्स) - Unitless index, never %
  const bmiNum = parseFloat(data.bmi);
  if (!isNaN(bmiNum)) {
    const normalMax = gender === 'Male' ? 23.0 : 22.0;
    const normalMin = 18.5;
    let diffText: string | undefined;
    let diffColor: 'text-rose-600' | 'text-emerald-600' | undefined;

    if (bmiNum > normalMax + 0.1) {
      const diff = bmiNum - normalMax;
      diffText = `↑ ${formatDiffNumber(diff)}`;
      diffColor = 'text-rose-600'; // High BMI -> RED
    } else if (bmiNum < normalMin - 0.1) {
      const diff = normalMin - bmiNum;
      diffText = `↓ ${formatDiffNumber(diff)}`;
      diffColor = 'text-rose-600'; // Low BMI -> RED
    }

    metrics.push({
      id: 'bmi',
      label: 'BMI',
      labelMarathi: 'बॉडी मास इंडेक्स (BMI)',
      value: `${bmiNum}`,
      diffText,
      diffColor,
    });
  }

  // 3. Body Fat % (पूर्ण चरबी) - Percentage metric
  const bodyFatNum = parseFloat(data.bodyFat);
  if (!isNaN(bodyFatNum)) {
    const normalMax = gender === 'Male' ? 17.0 : 24.0;
    let diffText: string | undefined;
    let diffColor: 'text-rose-600' | 'text-emerald-600' | undefined;

    if (bodyFatNum > normalMax + 0.1) {
      const diff = bodyFatNum - normalMax;
      diffText = `↑ ${formatDiffNumber(diff)}%`;
      diffColor = 'text-rose-600'; // Unfavorable high body fat -> RED
    }

    metrics.push({
      id: 'bodyFat',
      label: 'Body Fat',
      labelMarathi: 'पूर्ण चरबी (Body Fat)',
      value: `${bodyFatNum}%`,
      diffText,
      diffColor,
    });
  }

  // 4. Visceral Fat (पोटातील चरबी) - Percentage metric
  const visceralNum = parseFloat(data.visceralFat);
  if (!isNaN(visceralNum)) {
    const normalMax = gender === 'Male' ? 5.0 : 7.0;
    let diffText: string | undefined;
    let diffColor: 'text-rose-600' | 'text-emerald-600' | undefined;

    if (visceralNum > normalMax + 0.1) {
      const diff = visceralNum - normalMax;
      diffText = `↑ ${formatDiffNumber(diff)}%`;
      diffColor = 'text-rose-600'; // Unfavorable high visceral fat -> RED
    }

    metrics.push({
      id: 'visceralFat',
      label: 'Visceral Fat',
      labelMarathi: 'पोटातील चरबी (Visceral)',
      value: `${visceralNum}%`,
      diffText,
      diffColor,
    });
  }

  // 5. Skeletal Muscle % (स्नायूंचे प्रमाण) - Percentage metric
  const skelNum = parseFloat(data.skelWhole);
  if (!isNaN(skelNum)) {
    const standard = gender === 'Male' ? 37.0 : 33.0;
    let diffText: string | undefined;
    let diffColor: 'text-rose-600' | 'text-emerald-600' | undefined;

    if (skelNum < standard - 0.1) {
      const diff = standard - skelNum;
      diffText = `↓ ${formatDiffNumber(diff)}%`;
      diffColor = 'text-rose-600'; // Low muscle is unfavorable -> RED
    } else if (skelNum > standard + 0.1) {
      const diff = skelNum - standard;
      diffText = `↑ ${formatDiffNumber(diff)}%`;
      diffColor = 'text-emerald-600'; // High muscle is favorable -> GREEN!
    }

    metrics.push({
      id: 'skelWhole',
      label: 'Skeletal Muscle',
      labelMarathi: 'स्नायूंचे प्रमाण (Muscle)',
      value: `${skelNum}%`,
      diffText,
      diffColor,
    });
  }

  // 6. Body Age (शरीराचे वय) - In years, NEVER %
  const bodyAgeNum = parseFloat(data.bodyAge);
  const ageNum = parseFloat(data.age);
  if (!isNaN(bodyAgeNum)) {
    let diffText: string | undefined;
    let diffColor: 'text-rose-600' | 'text-emerald-600' | undefined;

    if (!isNaN(ageNum) && ageNum > 0) {
      if (bodyAgeNum > ageNum) {
        const diff = bodyAgeNum - ageNum;
        if (diff >= 1) {
          diffText = `↑ ${Math.round(diff)} वर्षे`;
          diffColor = 'text-rose-600'; // Older body age is unfavorable -> RED
        }
      } else if (bodyAgeNum < ageNum) {
        const diff = ageNum - bodyAgeNum;
        if (diff >= 1) {
          diffText = `↓ ${Math.round(diff)} वर्षे`;
          diffColor = 'text-emerald-600'; // Younger body age is favorable -> GREEN!
        }
      }
    }

    metrics.push({
      id: 'bodyAge',
      label: 'Body Age',
      labelMarathi: 'शरीराचे वय (Body Age)',
      value: `${bodyAgeNum} वर्षे`,
      diffText,
      diffColor,
    });
  }

  return metrics;
}
