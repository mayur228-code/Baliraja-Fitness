import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Shield, Smartphone, Cpu, ArrowUpCircle } from 'lucide-react';

interface AboutViewProps {
  onBack: () => void;
}

// Extensible Update Information Interface for future remote update source configuration
export interface AppUpdateInfo {
  isUpdateAvailable: boolean;
  version?: string;
  releaseNotes?: string;
  downloadUrl?: string;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  const APP_VERSION = '1.0.0';

  // Extensible update state: ONLY shows update option when an update is actually available
  const [updateInfo] = useState<AppUpdateInfo>({
    isUpdateAvailable: false,
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition"
            aria-label="मागे जा (Go Back)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">
              ॲप माहिती (About)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              सिस्टम आवृत्ती व माहिती
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* App Info Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md shadow-emerald-700/20">
            ब
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              बळीराजा फिटनेस
            </h2>
            <p className="text-xs font-bold text-emerald-700 mt-0.5">
              Body Analysis & Nutrition System
            </p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/60">
              आवृत्ती (Version): v{APP_VERSION}
            </span>
          </div>

          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
            ग्राहकांचे अचूक शारीरिक निर्देशांक मोजणे, सुस्पष्ट २-पेज PDF अहवाल बनवणे आणि स्थानिक पातळीवर १००% सुरक्षित डेटा साठवण्यासाठी तयार केलेले ॲप.
          </p>
        </div>

        {/* Update Option ONLY rendered when an update is actually available */}
        {updateInfo.isUpdateAvailable ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-xs">
                <ArrowUpCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-emerald-950">
                  नवीन अपडेट उपलब्ध आहे ({updateInfo.version || 'New Version'})
                </h3>
                <p className="text-xs text-emerald-700 font-medium">
                  {updateInfo.releaseNotes || 'नवीन सुधारणा आणि कार्यक्षमता उपलब्ध.'}
                </p>
              </div>
            </div>

            <a
              href={updateInfo.downloadUrl || '#'}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>आता अपडेट करा (Update Now)</span>
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-extrabold text-slate-800 block">
                ॲप अद्ययावत आहे (App is up to date)
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                सध्याची स्थापित आवृत्ती: v{APP_VERSION}
              </span>
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            मुख्य वैशिष्ट्ये (Key Features)
          </h3>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">१००% ऑफलाइन व क्लाऊड-मुक्त स्थानिक डेटाबेस</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <Cpu className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">अतिजलद ऑन-डिव्हाइस PDF जनरेशन व QR कोड</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">अँड्रॉइड नेटिव्ह PDF व्ह्युअर व सुरक्षित फाइल सेव्हिंग</span>
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-center text-xs text-slate-400 py-2">
          <p>© 2026 बळीराजा न्युट्रिशन क्लब • सर्व हक्क सुरक्षित</p>
        </div>
      </main>
    </div>
  );
};
