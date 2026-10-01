import React from 'react';
import { ArrowUpCircle, Sparkles, Download, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { AppUpdateCheckResult } from '../utils/updateChecker';

interface UpdateModalProps {
  updateInfo?: AppUpdateCheckResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ updateInfo, isOpen, onClose }) => {
  if (!isOpen || !updateInfo || !updateInfo.hasUpdate) return null;

  const handleUpdateClick = () => {
    const targetUrl = updateInfo.apkDownloadUrl || updateInfo.releaseUrl;
    if (typeof window !== 'undefined') {
      window.open(targetUrl, '_blank');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200/80 z-10 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
          aria-label="बंद करा (Close)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Icon Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-700/20 shrink-0">
            <ArrowUpCircle className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200/60">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              नवीन आवृत्ती
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight mt-0.5">
              नवीन अपडेट उपलब्ध आहे
            </h3>
          </div>
        </div>

        {/* Update Details */}
        <div className="space-y-2 p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100/90 text-left">
          <p className="text-sm font-black text-emerald-950">
            Baliraja Fitness v{updateInfo.latestVersion} is available
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold">
            <span>सध्याची आवृत्ती: <strong className="text-slate-700">v{updateInfo.currentVersion}</strong></span>
            <span>→</span>
            <span>नवीन: <strong className="text-emerald-700">v{updateInfo.latestVersion}</strong></span>
          </div>
          {updateInfo.releaseNotes && (
            <p className="text-xs text-slate-600 font-medium line-clamp-3 pt-1 border-t border-emerald-200/60">
              {updateInfo.releaseNotes}
            </p>
          )}
        </div>

        {/* Security / Privacy reassurance */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>GitHub वरून अधिकृत व सुरक्षित APK डाउनलोड करा.</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-extrabold text-xs sm:text-sm transition text-center"
          >
            Later (नंतर करा)
          </button>

          <button
            type="button"
            onClick={handleUpdateClick}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-700/20 active:scale-[0.99] transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Update Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
