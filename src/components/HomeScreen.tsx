import React from 'react';
import { Menu, PlusCircle, FileText, ArrowRight, Activity, Users, ShieldCheck, Sparkles } from 'lucide-react';

interface HomeScreenProps {
  onMakeReport: () => void;
  onOpenMenu: () => void;
  onOpenReports: () => void;
  totalSavedReports: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onMakeReport,
  onOpenMenu,
  onOpenReports,
  totalSavedReports,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top App Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenMenu}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition flex items-center justify-center"
            aria-label="मेनू उघडा (Open Menu)"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
              ब
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
                बळीराजा फिटनेस
              </h1>
              <p className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                Body Analysis & Nutrition Club
              </p>
            </div>
          </div>

          {/* Placeholder spacer for symmetry */}
          <div className="w-9" />
        </div>
      </header>

      {/* Main Home Content */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-center space-y-6">
        {/* Brand Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-3 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-100/80 shadow-xs">
            <Activity className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              बॉडी ॲनालिसिस अहवाल
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
              ग्राहकांचे अचूक शारीरिक निर्देशांक मोजा, २-पेज PDF अहवाल तयार करा आणि योग्य पोषण मार्गदर्शन द्या.
            </p>
          </div>

          <div className="pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>१००% सुरक्षित व ऑफलाइन सिस्टीम</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button: Make Report */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={onMakeReport}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-base shadow-lg shadow-emerald-700/20 active:scale-[0.99] transition flex items-center justify-center gap-3"
          >
            <PlusCircle className="w-5 h-5 shrink-0" />
            <span>नवीन अहवाल तयार करा (Make Report)</span>
          </button>

          {/* Secondary Quick Action: View Saved Reports */}
          <button
            type="button"
            onClick={onOpenReports}
            className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block font-extrabold text-slate-800 text-xs sm:text-sm">
                  जतन केलेले अहवाल (Reports)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {totalSavedReports > 0
                    ? `एकूण ${totalSavedReports} अहवाल उपलब्ध`
                    : 'साठवलेले अहवाल पाहण्यासाठी येथे टॅप करा'}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </main>

      {/* Clean Bottom Info */}
      <footer className="max-w-lg w-full mx-auto px-4 py-4 text-center text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-600">
          बळीराजा न्युट्रिशन क्लब • वेलनेस कोच: श्री. गणेश शिंदे
        </p>
        <p className="text-[11px]">धारूर रोड, केज • संपर्क: 7972532010</p>
      </footer>
    </div>
  );
};
