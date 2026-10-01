import React, { useEffect } from 'react';
import { ReportData, Gender } from '../types';
import {
  getBodyFatStatus,
  getVisceralFatStatus,
  getBmiStatus,
  calculateBmi,
  calculateIdealWeight,
  calculateWeightDiff,
} from '../utils/calculations';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Scale,
  Activity,
  HeartPulse,
  Ruler,
  RotateCcw,
  FileCheck2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface ReportFormProps {
  data: ReportData;
  onChange: (updated: ReportData) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  data,
  onChange,
  onGenerate,
  isGenerating,
}) => {
  // Update a single field
  const updateField = (field: keyof ReportData, value: string) => {
    const updated = { ...data, [field]: value };
    onChange(updated);
  };

  // Auto-calculate BMI & Ideal Weight when Height or Weight changes
  const handleWeightOrHeightChange = (
    field: 'weight' | 'height',
    value: string
  ) => {
    const newWeightStr = field === 'weight' ? value : data.weight;
    const newHeightStr = field === 'height' ? value : data.height;

    const wNum = parseFloat(newWeightStr);
    const hNum = parseFloat(newHeightStr);

    let newBmi = data.bmi;
    let newIdeal = data.idealWeight;
    let newExtra = data.extraWeight;
    let newLess = data.lessWeight;

    if (!isNaN(wNum) && !isNaN(hNum) && hNum > 0) {
      newBmi = calculateBmi(wNum, hNum);
      newIdeal = calculateIdealWeight(hNum);
      const idealNum = parseFloat(newIdeal);
      const diff = calculateWeightDiff(wNum, idealNum);
      newExtra = diff.extra;
      newLess = diff.less;
    }

    onChange({
      ...data,
      [field]: value,
      bmi: newBmi,
      idealWeight: newIdeal,
      extraWeight: newExtra,
      lessWeight: newLess,
    });
  };

  const handleGenderChange = (gender: Gender) => {
    onChange({ ...data, gender });
  };

  const handleReset = () => {
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    onChange({
      name: '',
      mobile: '',
      village: '',
      age: '',
      gender: 'Male',
      height: '',
      date: formattedDate,
      weight: '',
      idealWeight: '',
      extraWeight: '',
      lessWeight: '',
      bodyFat: '',
      visceralFat: '',
      restingMetabolism: '',
      bmi: '',
      bodyAge: '',
      subWhole: '',
      subArms: '',
      subTrunk: '',
      subLegs: '',
      skelWhole: '',
      skelArms: '',
      skelTrunk: '',
      skelLegs: '',
      measArms: '',
      measWaist: '',
      measThigh: '',
    });
  };

  // Status badges helper
  const renderBadge = (status: 'Normal' | 'High' | 'Risk') => {
    if (status === 'Normal') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          Normal (सामान्य)
        </span>
      );
    }
    if (status === 'High') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          High (जास्त)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
        Risk (धोकादायक)
      </span>
    );
  };

  const bodyFatVal = parseFloat(data.bodyFat);
  const visceralVal = parseFloat(data.visceralFat);
  const bmiVal = parseFloat(data.bmi);

  return (
    <div className="space-y-6">
      {/* Top Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            रीसेट करा (Reset Form)
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          टेंप्लेट: <span className="text-slate-800 font-bold">BAR.pdf</span>
        </div>
      </div>

      {/* 1. Header Information */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              १. वैयक्तिक माहिती (Personal Details)
            </h3>
            <p className="text-xs text-slate-500">ग्राहकाचे नाव, संपर्क व मूलभूत माहिती</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              नाव (Full Name) *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="उदा. राहुल विठ्ठल पाटील"
                value={data.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
              />
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              मोबाईल क्र. (Mobile)
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="उदा. 9876543210"
                value={data.mobile}
                onChange={(e) => updateField('mobile', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
              />
            </div>
          </div>

          {/* Village */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              गाव / शहर (Village/City)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="उदा. केज (बीड)"
                value={data.village}
                onChange={(e) => updateField('village', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              लिंग (Gender) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleGenderChange('Male')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                  data.gender === 'Male'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                पुरुष (Male)
              </button>
              <button
                type="button"
                onClick={() => handleGenderChange('Female')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                  data.gender === 'Female'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                स्त्री (Female)
              </button>
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              वय (Age)
            </label>
            <input
              type="number"
              placeholder="उदा. 32"
              value={data.age}
              onChange={(e) => updateField('age', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              उंची (Height in cm) *
            </label>
            <input
              type="number"
              placeholder="उदा. 172"
              value={data.height}
              onChange={(e) => handleWeightOrHeightChange('height', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              दिनांक (Date)
            </label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={data.date}
              onChange={(e) => updateField('date', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
            />
          </div>
        </div>
      </div>

      {/* 2. Weight Section */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              २. वजन विश्लेषण (Weight Details)
            </h3>
            <p className="text-xs text-slate-500">सद्याचे वजन, आदर्श वजन आणि फरक</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Weight */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              वजन (Weight kg) *
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="उदा. 78.5"
              value={data.weight}
              onChange={(e) => handleWeightOrHeightChange('weight', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-slate-800"
            />
          </div>

          {/* Ideal Weight */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              आदर्श वजन (Ideal kg)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="उदा. 68.0"
              value={data.idealWeight}
              onChange={(e) => {
                updateField('idealWeight', e.target.value);
                const w = parseFloat(data.weight);
                const idl = parseFloat(e.target.value);
                const diff = calculateWeightDiff(w, idl);
                onChange({
                  ...data,
                  idealWeight: e.target.value,
                  extraWeight: diff.extra,
                  lessWeight: diff.less,
                });
              }}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
            />
          </div>

          {/* Extra Weight */}
          <div>
            <label className="block text-xs font-semibold text-rose-700 mb-1">
              जास्त वजन (Extra)
            </label>
            <input
              type="text"
              placeholder="उदा. 10.5 kg"
              value={data.extraWeight}
              onChange={(e) => updateField('extraWeight', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-rose-200 bg-rose-50/50 text-rose-700 focus:outline-none font-bold"
            />
          </div>

          {/* Less Weight */}
          <div>
            <label className="block text-xs font-semibold text-emerald-700 mb-1">
              कमी वजन (Less)
            </label>
            <input
              type="text"
              placeholder="उदा. -"
              value={data.lessWeight}
              onChange={(e) => updateField('lessWeight', e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-700 focus:outline-none font-bold"
            />
          </div>
        </div>
      </div>

      {/* 3. Core Body Composition Analysis */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                ३. शरीर रचना विश्लेषण (Body Composition)
              </h3>
              <p className="text-xs text-slate-500">
                मूल्ये आपोआप Normal / High / Risk बॉक्समध्ये वर्गीकृत होतात
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Body Fat % */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                पूर्ण शरीरातील चरबी (Body Fat %)
              </label>
              {!isNaN(bodyFatVal) &&
                renderBadge(getBodyFatStatus(bodyFatVal, data.gender))}
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                placeholder="उदा. 22.4"
                value={data.bodyFat}
                onChange={(e) => updateField('bodyFat', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                %
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {data.gender === 'Male'
                ? 'पुरुष संदर्भ: Normal ≤ 17% | High: 20-25% | Risk > 25%'
                : 'स्त्री संदर्भ: Normal ≤ 24% | High: 30-35% | Risk > 35%'}
            </p>
          </div>

          {/* Visceral Fat % */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                अवयवांमधील चरबी (Visceral Fat %)
              </label>
              {!isNaN(visceralVal) &&
                renderBadge(getVisceralFatStatus(visceralVal, data.gender))}
            </div>
            <div className="relative">
              <input
                type="number"
                step="1"
                placeholder="उदा. 12"
                value={data.visceralFat}
                onChange={(e) => updateField('visceralFat', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                %
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {data.gender === 'Male'
                ? 'पुरुष संदर्भ: Normal ≤ 5% | High: 14% | Risk ≥ 15%'
                : 'स्त्री संदर्भ: Normal ≤ 7% | High: 16% | Risk ≥ 17%'}
            </p>
          </div>

          {/* BMI */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                बॉडी मास इंडेक्स (BMI)
              </label>
              {!isNaN(bmiVal) &&
                renderBadge(getBmiStatus(bmiVal, data.gender))}
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                placeholder="उदा. 26.5"
                value={data.bmi}
                onChange={(e) => updateField('bmi', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {data.gender === 'Male'
                ? 'पुरुष संदर्भ: Normal ≤ 23 | High: 28 | Risk > 28'
                : 'स्त्री संदर्भ: Normal ≤ 22 | High: 28 | Risk > 28'}
            </p>
          </div>

          {/* Resting Metabolism */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              उष्मांक (Resting Metabolism kcal)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="उदा. 1650"
                value={data.restingMetabolism}
                onChange={(e) => updateField('restingMetabolism', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                kcal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {data.gender === 'Male'
                ? 'पुरुष संदर्भ: 1800-2000 kcal'
                : 'स्त्री संदर्भ: 1600-1800 kcal'}
            </p>
          </div>

          {/* Body Age */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 sm:col-span-2">
            <label className="block text-xs font-bold text-slate-800">
              शरीरातील पेशीचे वय (Body Age)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="उदा. 38"
                value={data.bodyAge}
                onChange={(e) => updateField('bodyAge', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                वर्षे (Years)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              वय कमी जास्त असल्यास जीवनशैली व आहारात योग्य बदल करणे आवश्यक आहे.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Regional Subcutaneous Fat & Skeletal Muscle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Regional Subcutaneous Fat */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                ४. त्वचेखालील चरबी (Subcutaneous Fat %)
              </h3>
              <p className="text-[11px] text-slate-500">
                शरीराच्या वेगवेगळ्या भागांमधील प्रमाण
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                संपूर्ण शरीर (Whole Body)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="उदा. 18.5"
                  value={data.subWhole}
                  onChange={(e) => updateField('subWhole', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Ref: {data.gender === 'Male' ? '15%' : '20%'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                हात (Arms)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="उदा. 19.2"
                  value={data.subArms}
                  onChange={(e) => updateField('subArms', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Ref: {data.gender === 'Male' ? '20%' : '25%'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                पोट व पाठ (Trunk)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="उदा. 16.8"
                  value={data.subTrunk}
                  onChange={(e) => updateField('subTrunk', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Ref: {data.gender === 'Male' ? '15%' : '20%'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                पाय (Legs)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="उदा. 21.0"
                  value={data.subLegs}
                  onChange={(e) => updateField('subLegs', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Ref: {data.gender === 'Male' ? '20%' : '25%'}
              </span>
            </div>
          </div>
        </div>

        {/* Regional Skeletal Muscle */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                ५. स्नायूंचे प्रमाण (Skeletal Muscle %)
              </h3>
              <p className="text-[11px] text-slate-500">
                शरीराच्या वेगवेगळ्या भागांमधील स्नायू
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                संपूर्ण शरीर (Whole Body)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="उदा. 34.5"
                  value={data.skelWhole}
                  onChange={(e) => updateField('skelWhole', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Ref: {data.gender === 'Male' ? '37%' : '33%'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                हात (Arms)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="उदा. 42.0"
                  value={data.skelArms}
                  onChange={(e) => updateField('skelArms', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Ref: {data.gender === 'Male' ? '45%' : '50%'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                पाठ (Trunk)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="उदा. 28.5"
                  value={data.skelTrunk}
                  onChange={(e) => updateField('skelTrunk', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Ref: {data.gender === 'Male' ? '30%' : '25%'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                पाय (Legs)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="उदा. 47.0"
                  value={data.skelLegs}
                  onChange={(e) => updateField('skelLegs', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Ref: {data.gender === 'Male' ? '50%' : '45%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Measurements (Inches) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              ६. इंचामध्ये माप (Body Measurements in Inches)
            </h3>
            <p className="text-xs text-slate-500">दंड, पोट आणि मांडीचे मोजमाप</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              दंड (Arms / Bicep)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                placeholder="उदा. 14.5"
                value={data.measArms}
                onChange={(e) => updateField('measArms', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">"</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              पोट (Waist)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                placeholder="उदा. 36.0"
                value={data.measWaist}
                onChange={(e) => updateField('measWaist', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">"</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              मांडी (Thigh)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                placeholder="उदा. 22.5"
                value={data.measThigh}
                onChange={(e) => updateField('measThigh', e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">"</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Generate Button */}
      <div className="sticky bottom-3 z-20 pt-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-base shadow-lg shadow-emerald-700/25 active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>रिपोर्ट तयार करत आहे (Generating Report)...</span>
            </>
          ) : (
            <>
              <FileCheck2 className="w-5 h-5" />
              <span>रिपोर्ट तयार करा आणि डाउनलोड करा (Generate & Download PDF)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
