import React from 'react';
import { ArrowLeft, Phone, MapPin, User, ShieldCheck, MessageSquare } from 'lucide-react';

interface ContactUsViewProps {
  onBack: () => void;
}

export const ContactUsView: React.FC<ContactUsViewProps> = ({ onBack }) => {
  const coachName = 'श्री. गणेश शिंदे';
  const coachPhone = '7972532010';
  const clubName = 'बळीराजा न्युट्रिशन क्लब';
  const address = 'स्वामी विवेकानंद इंग्लिश स्कूल जवळ, लाईट ऑफिस शेजारी, धारूर रोड, केज';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition"
            aria-label="मागे जा (Go Back)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">
              संपर्क (Contact Us)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              वेलनेस कोच संपर्क माहिती
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Coach Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-emerald-700/20 shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                वेलनेस कोच (Wellness Coach)
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {coachName}
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                {clubName}
              </p>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            {/* Phone Item with Call Action */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    मोबाईल नंबर
                  </span>
                  <strong className="text-base font-extrabold text-slate-800 tracking-wide">
                    {coachPhone}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${coachPhone}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>कॉल करा (Call)</span>
                </a>

                <a
                  href={`https://wa.me/91${coachPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition flex items-center justify-center"
                  title="WhatsApp संपर्क"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Address Item */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-slate-200/80 text-slate-700 shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  पत्ता (Club Address)
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                  {address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Commitment Badge */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>आरोग्य व पोषण मार्गदर्शन</span>
          </div>
          <p className="text-[11px] text-slate-500">
            वैयक्तिक आहार व फिटनेस सल्ल्यासाठी वेलनेस कोचशी थेट संपर्क साधा.
          </p>
        </div>
      </main>
    </div>
  );
};
