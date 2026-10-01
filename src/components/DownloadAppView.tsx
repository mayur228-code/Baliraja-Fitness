import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Copy,
  Smartphone,
  Sparkles,
  ArrowLeft,
  FileCheck2,
  HardDrive,
  Cpu,
  Layers,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { getApkDownloadUrl, getCanonicalDownloadPageUrl, getAppMetadata } from '../utils/appConfig';

interface DownloadAppViewProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

export const DownloadAppView: React.FC<DownloadAppViewProps> = ({
  onBack,
  showBackButton = true,
}) => {
  const metadata = getAppMetadata();
  const apkDownloadUrl = getApkDownloadUrl();
  const canonicalPageUrl = getCanonicalDownloadPageUrl();

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);

  // Generate dynamic QR code targeting the canonical /download page URL
  useEffect(() => {
    QRCode.toDataURL(canonicalPageUrl, {
      margin: 2,
      width: 380,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#064e3b', // Deep emerald
        light: '#ffffff',
      },
    })
      .then(setQrCodeDataUrl)
      .catch((err) => {
        console.warn('Failed to generate dynamic download QR code:', err);
      });
  }, [canonicalPageUrl]);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(canonicalPageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (e) {
      console.warn('Could not copy link to clipboard:', e);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: 'बळीराजा फिटनेस अँड्रॉइड ॲप (Baliraja Fitness App)',
          text: 'बळीराजा फिटनेसचे अधिकृत अँड्रॉइड ॲप डाउनलोड करा - १००% ऑफलाइन बॉडी ॲनालिसिस व PDF अहवाल!',
          url: canonicalPageUrl,
        });
      } catch (e) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadClick = () => {
    setDownloadStarted(true);
    setTimeout(() => setDownloadStarted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 flex flex-col text-slate-800">
      {/* Top Header Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                type="button"
                onClick={onBack ? onBack : () => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition"
                aria-label="मुख्य पृष्ठावर जा (Go to Home)"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center font-black text-base shadow-sm">
                ब
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-none">
                  {metadata.appNameMarathi}
                </h1>
                <p className="text-[10px] sm:text-[11px] font-bold text-emerald-700 mt-0.5">
                  {metadata.appNameEnglish} • Android App
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-extrabold border border-emerald-200/60">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              v{metadata.version}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-10 space-y-8">
        {/* Hero Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/80 shadow-md relative overflow-hidden text-center space-y-6">
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-full pointer-events-none blur-xl" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-gradient-to-tr from-teal-100/50 to-transparent rounded-full pointer-events-none blur-xl" />

          {/* Logo / App Icon */}
          <div className="relative inline-block">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 p-1 shadow-xl shadow-emerald-700/20 mx-auto flex items-center justify-center">
              <div className="w-full h-full bg-emerald-800/20 rounded-[22px] flex flex-col items-center justify-center text-white">
                <span className="text-4xl sm:text-5xl font-black tracking-tighter">ब</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-200 mt-1">FITNESS</span>
              </div>
            </div>
            <div className="absolute -bottom-2 right-1/2 translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-wider uppercase shadow-sm">
              Android
            </div>
          </div>

          {/* Titles & Description */}
          <div className="space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>अधिकृत व सुरक्षित रिलीज (Official Verified Release)</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {metadata.appNameMarathi}
            </h2>
            <p className="text-sm sm:text-base font-bold text-emerald-700">
              {metadata.appNameEnglish} Android Application
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-lg mx-auto pt-1">
              ग्राहकांची अचूक शारीरिक तपासणी, जलद २-पेज PDF अहवाल जनरेशन आणि १००% ऑफलाइन डेटाबेससाठी तयार केलेले संपूर्ण मोफत ॲप.
            </p>
          </div>

          {/* Main Download CTA */}
          <div className="max-w-md mx-auto space-y-3 pt-2">
            <a
              href={apkDownloadUrl}
              download={metadata.apkFileName}
              onClick={handleDownloadClick}
              className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.99] text-white font-black text-base sm:text-lg shadow-xl shadow-emerald-700/30 transition flex items-center justify-center gap-3 group"
            >
              <Download className="w-6 h-6 shrink-0 group-hover:translate-y-0.5 transition-transform" />
              <span>अँड्रॉइड ॲप डाउनलोड करा (Download App)</span>
            </a>

            {downloadStarted && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center justify-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>डाउनलोड सुरू होत आहे... कृपया थोडा वेळ थांबा.</span>
              </div>
            )}

            {/* APK File Details Pill */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] text-slate-500 font-semibold pt-1">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200/70">
                आवृत्ती: <strong className="text-slate-800">v{metadata.version}</strong>
              </span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200/70">
                फाइल आकार: <strong className="text-slate-800">{metadata.apkFileSize}</strong>
              </span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200/70">
                फाइल नाव: <strong className="text-slate-800">{metadata.apkFileName}</strong>
              </span>
            </div>
          </div>
        </section>

        {/* QR Code & Mobile Sharing Card */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* QR Code Section */}
          <div className="md:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span>मोबाइलने स्कॅन करा (Scan on Phone)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-inner flex items-center justify-center">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Baliraja Fitness App Download QR Code"
                  className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl object-contain shadow-xs bg-white p-2"
                />
              ) : (
                <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl bg-slate-200 animate-pulse flex items-center justify-center text-slate-400 text-xs">
                  QR कोड तयार होत आहे...
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
              तुमच्या मोबाइल कॅमेरा किंवा QR स्कॅनरने हा कोड स्कॅन करून थेट ॲप डाउनलोड पृष्ठावर जा.
            </p>

            {/* Quick Share / Copy URL Actions */}
            <div className="w-full flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-200/70"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>लिंक कॉपी झाली!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" />
                    <span>लिंक कॉपी करा</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-emerald-200/80"
                aria-label="लिंक शेअर करा (Share Link)"
              >
                <Share2 className="w-4 h-4 text-emerald-700" />
                <span>शेअर करा</span>
              </button>
            </div>
          </div>

          {/* Quick Specifications Card */}
          <div className="md:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>सिस्टम तपशील व आवश्यकता (System Specs)</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">किमान अँड्रॉइड आवृत्ती</span>
                <span className="font-bold text-slate-900">{metadata.minAndroidVersion}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">टार्गेट आवृत्ती</span>
                <span className="font-bold text-slate-900">{metadata.targetAndroidVersion}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">सुरक्षा व स्वाक्षरी (Signing)</span>
                <span className="font-bold text-emerald-700">APK Scheme v2 Verified</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">डेटाबेस प्रकार</span>
                <span className="font-bold text-slate-900">१००% स्थानिक ऑन-डिव्हाइस (IndexedDB)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">नेटवर्क अवलंबित्व</span>
                <span className="font-bold text-emerald-700">इंटरनेट नसतानाही १००% कार्यरत</span>
              </div>
            </div>
          </div>
        </section>

        {/* Step-by-Step Android Installation Guide */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              अँड्रॉइड फोनवर ॲप कसे इन्स्टॉल करावे? (Installation Steps)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              खालील ४ सोप्या पायऱ्या फॉलो करून २ मिनिटांत ॲप सुरू करा:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 relative">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  १
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  APK फाइल डाउनलोड करा
                </h4>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed pl-9">
                वर दिलेल्या <strong>"अँड्रॉइड ॲप डाउनलोड करा"</strong> बटणावर टॅप करा. ब्राऊझर फाइल डाउनलोड करणे सुरू करेल.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 relative">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  २
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  इन्स्टॉलेशनला परवानगी द्या
                </h4>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed pl-9">
                नवीन फोनवर पहिल्यांदा डाउनलोड करताना <em>"Install unknown apps"</em> किंवा <em>"Allow from this source"</em> असा पर्याय आल्यास <strong>Allow / Turn On</strong> करा.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 relative">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  ३
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  इन्स्टॉल (Install) निवडा
                </h4>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed pl-9">
                डाउनलोड पूर्ण झाल्यावर नोटिफिकेशन किंवा Downloads फोल्डरमधून <strong>app-release.apk</strong> वर टॅप करा आणि <strong>"Install"</strong> दाबा.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 relative">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  ४
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  ॲप उघडा व वापरा
                </h4>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed pl-9">
                इन्स्टॉल पूर्ण झाल्यावर <strong>"Open"</strong> दाबा. बळीराजा फिटनेस ॲप आता तुमच्या फोनवर पूर्णपणे ऑफलाइन काम करण्यासाठी तयार आहे!
              </p>
            </div>
          </div>

          {/* Privacy & Offline Badge */}
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
            <div className="text-xs text-emerald-900 font-medium leading-snug">
              <strong className="font-bold">१००% सुरक्षित व गोपनीयता संरक्षित:</strong> हे ॲप कोणताही डेटा बाह्य सर्व्हरवर पाठवत नाही. सर्व अहवाल आणि ग्राहकांचा डेटा तुमच्याच डिव्हाइसमध्ये सुरक्षित राहतो.
            </div>
          </div>
        </section>

        {/* Key Features Overview */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center sm:text-left">
            ॲपमधील मुख्य सुविधा (Core Highlights)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">२-पेज PDF अहवाल</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                अचूक देवनागरी फॉन्ट आणि तक्त्यांसह त्वरित प्रिंट किंवा व्हॉट्सॲप शेअरिंग.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-2">
                <HardDrive className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">ऑफलाइन डेटाबेस</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                इंटरनेटशिवाय हजारो ग्राहकांचे अहवाल फोनमध्ये कायमस्वरूपी साठवा.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                <QrCode className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">QR कोड अहवाल स्कॅन</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                PDF वरील QR कोड स्कॅन करून एका सेकंदात अहवाल डिजिटल स्क्रीनवर उघडा.
              </p>
            </div>
          </div>
        </section>

        {/* Contact & Coach Info Footer Card */}
        <section className="bg-white/70 backdrop-blur-xs rounded-3xl p-6 border border-slate-200/80 text-center space-y-2">
          <p className="text-sm font-extrabold text-slate-800">
            {metadata.appNameMarathi} • {metadata.coachName}
          </p>
          <p className="text-xs text-slate-600 font-medium">
            संपर्क: <a href={`tel:${metadata.coachPhone}`} className="text-emerald-700 font-bold hover:underline">{metadata.coachPhone}</a>
          </p>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto">
            {metadata.coachAddress}
          </p>
          <div className="pt-3 border-t border-slate-200/60 text-[10px] text-slate-400">
            © 2026 {metadata.appNameMarathi} • All Rights Reserved
          </div>
        </section>
      </main>
    </div>
  );
};
