export type Gender = 'Male' | 'Female';

export type CategoryStatus = 'Normal' | 'High' | 'Risk';

export interface ReportData {
  // Header Info
  name: string;
  mobile: string;
  village: string;
  age: string;
  gender: Gender;
  height: string;
  date: string;

  // Weight Row
  weight: string;
  idealWeight: string;
  extraWeight: string;
  lessWeight: string;

  // Core Body Analysis
  bodyFat: string;
  visceralFat: string;
  restingMetabolism: string;
  bmi: string;
  bodyAge: string;

  // Regional Subcutaneous Fat %
  subWhole: string;
  subArms: string;
  subTrunk: string;
  subLegs: string;

  // Regional Skeletal Muscle %
  skelWhole: string;
  skelArms: string;
  skelTrunk: string;
  skelLegs: string;

  // Body Measurements (Inches)
  measArms: string;
  measWaist: string;
  measThigh: string;

  // Metadata
  reportId?: string;
  createdAt?: string;
}

export interface BoxCoordinates {
  x: number;
  y: number; // PDF top-relative or bottom-relative
  width?: number;
  height?: number;
}
