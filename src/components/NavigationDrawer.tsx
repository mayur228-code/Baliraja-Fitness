import React, { useEffect } from 'react';
import { X, FileText, Phone, Info, ChevronRight, ShieldCheck, Activity, Smartphone } from 'lucide-react';
import { DEFAULT_APP_METADATA } from '../utils/appConfig';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: 'reports' | 'contact' | 'about' | 'download') => void;
  totalReportsCount?: number;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectOption,
  totalReportsCount = 0,
}) => {
  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel sliding in from left */}
      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 transition-transform duration-300 ease-out animate-in slide-in-from-left">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center font-black text-base shadow-sm">
              ब
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                बळीराजा फिटनेस
              </h2>
              <p className="text-[11px] font-semibold text-emerald-700">
                मेनू व पर्याय
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition"
            aria-label="मेनू बंद करा (Close Menu)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Menu List */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {/* Option 1: Reports */}
          <button
            type="button"
            onClick={() => {
              onSelectOption('reports');
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl hover:bg-emerald-50/70 active:bg-emerald-100/70 text-slate-800 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-extrabold text-slate-900 group-hover:text-emerald-900">
                  अहवाल (Reports)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {totalReportsCount > 0 ? `${totalReportsCount} अहवाल जतन` : 'जतन केलेले अहवाल'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Option 2: Download App */}
          <button
            type="button"
            onClick={() => {
              onSelectOption('download');
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl hover:bg-emerald-50/70 active:bg-emerald-100/70 text-slate-800 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-extrabold text-slate-900 group-hover:text-emerald-900">
                  ॲप डाउनलोड (Download App)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  अँड्रॉइड APK व QR कोड
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Option 3: Contact Us */}
          <button
            type="button"
            onClick={() => {
              onSelectOption('contact');
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl hover:bg-emerald-50/70 active:bg-emerald-100/70 text-slate-800 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-extrabold text-slate-900 group-hover:text-teal-900">
                  संपर्क (Contact Us)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  वेलनेस कोच माहिती व कॉल
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Option 4: About */}
          <button
            type="button"
            onClick={() => {
              onSelectOption('about');
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl hover:bg-emerald-50/70 active:bg-emerald-100/70 text-slate-800 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-extrabold text-slate-900 group-hover:text-slate-900">
                  ॲप माहिती (About)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  आवृत्ती व वैशिष्ट्ये
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>१००% स्थानिक व सुरक्षित स्टोरेज</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Baliraja Fitness • Version {DEFAULT_APP_METADATA.version}
          </p>
        </div>
      </div>
    </div>
  );
};
