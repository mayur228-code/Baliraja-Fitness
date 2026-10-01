import React, { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import { ReportData } from '../types';
import { getRecommendations } from '../utils/recommendations';
import { getReportKeyMetrics } from '../utils/metricSummary';
import { SuggestionsSection } from './SuggestionsSection';
import {
  openPdfDocument,
  savePdfToDevice,
  sharePdfFile,
  getSafePdfFileName,
} from '../utils/nativePdfHandler';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface ReportPreviewProps {
  data: ReportData;
  pdfBlobUrl: string | null;
  pdfBlob: Blob | null;
  shareUrl: string;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  data,
  pdfBlobUrl,
  pdfBlob,
  shareUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [localQrDataUrl, setLocalQrDataUrl] = useState<string>('');
  const [isOpening, setIsOpening] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const reportSummaryRef = useRef<HTMLDivElement>(null);

  const recommendations = useMemo(() => getRecommendations(data), [data]);
  const keyMetrics = useMemo(() => getReportKeyMetrics(data), [data]);
  const fileName = useMemo(() => getSafePdfFileName(data.name), [data.name]);

  // Automatically scroll to the TOP of the Report Summary section on mount / generation
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      if (reportSummaryRef.current) {
        reportSummaryRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 40);

    return () => clearTimeout(scrollTimer);
  }, []);

  // Generate QR code 100% locally offline
  useEffect(() => {
    if (shareUrl) {
      QRCode.toDataURL(shareUrl, {
        margin: 2,
        width: 400,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' },
      })
        .then(setLocalQrDataUrl)
        .catch((e) => console.warn('Local QR generation error:', e));
    }
  }, [shareUrl]);

  const showFeedback = (type: 'success' | 'error', message: string, duration = 4000) => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback(null), duration);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  /**
   * Helper to ensure we have a valid Blob
   */
  const getActiveBlob = async (): Promise<Blob> => {
    if (pdfBlob) return pdfBlob;
    if (pdfBlobUrl) {
      const res = await fetch(pdfBlobUrl);
      return await res.blob();
    }
    throw new Error('अहवाल PDF उपलब्ध नाही.');
  };

  /**
   * Open / View PDF in full reliability on Android and Web
   */
  const handleOpenPdf = async () => {
    try {
      setIsOpening(true);
      const blob = await getActiveBlob();
      const res = await openPdfDocument(blob, fileName, pdfBlobUrl);
      if (res.message) {
        showFeedback('success', res.message, 3000);
      }
    } catch (err: any) {
      console.error('Open PDF error:', err);
      showFeedback('error', err.message || 'PDF उघडताना त्रुटी आली.');
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Client Name Card (Target of Auto-Scroll with safe sticky header offset) */}
      <div
        ref={reportSummaryRef}
        id="report-summary-top"
        className="scroll-mt-24 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Prominent Client Name */}
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              ग्राहक अहवाल (Client Report)
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {data.name || 'Body Analysis Report'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1 flex-wrap">
              <span>{data.gender === 'Male' ? 'पुरुष (Male)' : 'स्त्री (Female)'}</span>
              {data.age && <span>• {data.age} वर्षे</span>}
              {data.village && <span>• {data.village}</span>}
              <span>• {data.date || '-'}</span>
            </div>
          </div>

          {/* Action Area: QR and Open PDF */}
          <div className="flex items-center gap-2.5">
            {/* QR Button with explicit icon + label */}
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl transition shadow-2xs"
            >
              <QrCode className="w-4 h-4 text-slate-700" />
              <span>QR कोड</span>
            </button>

            {/* Open PDF Button with explicit icon + label */}
            <button
              type="button"
              onClick={handleOpenPdf}
              disabled={isOpening}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{isOpening ? 'उघडत आहे...' : 'PDF उघडा (Open)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Toast Feedback if active */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Preview starts directly with Key Health Metrics */}
      <div className="space-y-6">
        {/* Key Health Metrics Grid with Unit-Aware Indicators */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            महत्त्वाचे तपासणी निर्देशांक (Key Health Metrics)
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
                  <div className={`text-[15px] sm:text-base font-semibold leading-tight pt-0.5 ${metric.diffColor || 'text-rose-600'}`}>
                    {metric.diffText}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions Section with Interactive Product Cutouts and Full-Screen Modal */}
        <SuggestionsSection recommendations={recommendations} />
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-800">
                रिपोर्ट QR कोड
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                कोणत्याही मोबाईल कॅमेऱ्याने स्कॅन करून हा २-पेज रिपोर्ट थेट पहा
              </p>
            </div>

            {/* QR display */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl inline-block shadow-inner">
              {localQrDataUrl ? (
                <img
                  src={localQrDataUrl}
                  alt="Report QR Code"
                  className="w-48 h-48 mx-auto rounded-xl"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Share link input with copy button */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-2 text-xs bg-transparent text-slate-600 focus:outline-none truncate font-mono"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-white text-xs font-bold text-slate-700 rounded-lg shadow-2xs hover:bg-slate-50 flex items-center gap-1 transition shrink-0"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition"
            >
              बंद करा (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
