import React, { useState } from 'react';
import { ReportData } from '../types';
import { generateReportPdf } from '../utils/pdfGenerator';
import { getRecommendations } from '../utils/recommendations';
import { getReportKeyMetrics } from '../utils/metricSummary';
import { SuggestionsSection } from './SuggestionsSection';
import { savePdfToDevice, sharePdfFile, getSafePdfFileName } from '../utils/nativePdfHandler';
import {
  Download,
  Calendar,
  User,
  MapPin,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface SharedReportViewProps {
  data: ReportData;
}

export const SharedReportView: React.FC<SharedReportViewProps> = ({ data }) => {
  const [downloading, setDownloading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const recommendations = getRecommendations(data);
  const keyMetrics = getReportKeyMetrics(data);
  const fileName = getSafePdfFileName(data.name);

  const showFeedback = (type: 'success' | 'error', message: string, duration = 4500) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), duration);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const { pdfBlob } = await generateReportPdf(data, window.location.href);
      const res = await savePdfToDevice(pdfBlob, fileName);
      showFeedback('success', res.message);
    } catch (err: any) {
      console.error('Download error:', err);
      showFeedback('error', err.message || 'PDF तयार करताना त्रुटी आली.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Brand Banner Card */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-wider border border-yellow-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            अधिकृत तपासणी अहवाल
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight">
            बळीराजा न्युट्रिशन क्लब
          </h1>
          <p className="text-emerald-100 text-xs font-medium">
            BODY ANALYSIS REPORT • वेलनेस कोच: श्री. गणेश शिंदे
          </p>
        </div>

        {/* Action Feedback Toast */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Customer Details Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                ग्राहक नाव
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                {data.name || 'Body Analysis Report'}
              </h2>
            </div>
            <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
              {data.gender === 'Male' ? 'पुरुष (Male)' : 'स्त्री (Female)'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>दिनांक: <strong className="text-slate-800">{data.date || '-'}</strong></span>
            </div>
            {data.age && (
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>वय: <strong className="text-slate-800">{data.age} वर्षे</strong></span>
              </div>
            )}
            {data.village && (
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>गाव: <strong className="text-slate-800">{data.village}</strong></span>
              </div>
            )}
            {data.height && (
              <div className="flex items-center gap-2 text-slate-600">
                <Scale className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>उंची: <strong className="text-slate-800">{data.height} cm</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* 1. Report Result Summary with Difference Indicators */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            तपासणी निकाल (Key Health Results)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {keyMetrics.map((metric) => (
              <div
                key={metric.id}
                className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-100 space-y-1"
              >
                <span className="text-xs font-semibold text-slate-500 block leading-tight">
                  {metric.labelMarathi}
                </span>
                <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {metric.value}
                </div>
                {metric.diffText && (
                  <div className={`text-[15px] font-semibold leading-tight pt-0.5 ${metric.diffColor || 'text-rose-600'}`}>
                    {metric.diffText}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. Suggestions / Recommendations Section */}
        <SuggestionsSection recommendations={recommendations} />

        {/* 3. Primary Action: Download Report Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-base shadow-lg shadow-emerald-700/20 active:scale-[0.99] transition flex items-center justify-center gap-2.5"
          >
            {downloading ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>अहवाल डाउनलोड होत आहे...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>अहवाल डाउनलोड करा (Download Report)</span>
              </>
            )}
          </button>
        </div>

        {/* Coach Footer */}
        <div className="text-center p-4 bg-white/60 rounded-2xl border border-slate-200/60 text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-700">
            श्री. गणेश शिंदे • 7972532010
          </p>
          <p>स्वामी विवेकानंद इंग्लिश स्कूल जवळ, लाईट ऑफिस शेजारी, धारूर रोड, केज</p>
        </div>
      </div>
    </div>
  );
};
