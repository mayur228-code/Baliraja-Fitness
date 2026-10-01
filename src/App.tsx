import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { ReportData } from './types';
import { generateReportPdf, preloadPdfAssets } from './utils/pdfGenerator';
import { saveLocalReport, getLocalReport, getLatestReportsPerPerson } from './utils/localDatabase';
import { extractReportDataFromUrl, getReportShareUrl } from './utils/qrPayload';
import { savePdfToDevice } from './utils/nativePdfHandler';
import { HomeScreen } from './components/HomeScreen';
import { NavigationDrawer } from './components/NavigationDrawer';
import { ReportForm } from './components/ReportForm';
import { ReportPreview } from './components/ReportPreview';
import { ReportsListView } from './components/ReportsListView';
import { ContactUsView } from './components/ContactUsView';
import { AboutView } from './components/AboutView';
import { SharedReportView } from './components/SharedReportView';
import { PenLine, Eye, ArrowLeft, AlertCircle } from 'lucide-react';

const getInitialReportData = (): ReportData => {
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  return {
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
  };
};

type AppView = 'home' | 'report' | 'reports' | 'contact' | 'about';
type ReportMode = 'form' | 'preview';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [reportMode, setReportMode] = useState<ReportMode>('form');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [totalSavedReports, setTotalSavedReports] = useState(0);

  const [formData, setFormData] = useState<ReportData>(getInitialReportData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');

  // Public QR scan state
  const [sharedData, setSharedData] = useState<ReportData | null>(null);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [sharedError, setSharedError] = useState<string | null>(null);

  // Preload PDF generation assets on app launch for maximum generation speed
  useEffect(() => {
    preloadPdfAssets();
  }, []);

  // Refresh saved reports count
  const refreshReportsCount = async () => {
    try {
      const list = await getLatestReportsPerPerson();
      setTotalSavedReports(list.length);
    } catch (e) {
      console.warn('Error fetching reports count:', e);
    }
  };

  useEffect(() => {
    refreshReportsCount();
  }, [currentView]);

  // Handle native Android hardware back button
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const handlerPromise = CapApp.addListener('backButton', ({ canGoBack }) => {
        if (isDrawerOpen) {
          setIsDrawerOpen(false);
        } else if (sharedData) {
          setSharedData(null);
          window.history.pushState({}, '', '/');
        } else if (currentView !== 'home') {
          setCurrentView('home');
        } else if (canGoBack) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      });

      return () => {
        handlerPromise.then((h) => h.remove()).catch(console.error);
      };
    }
  }, [isDrawerOpen, currentView, sharedData]);

  // Robust URL detection for QR scan, shared report page, and direct URL navigation
  useEffect(() => {
    const { report, reportId } = extractReportDataFromUrl();

    if (report) {
      // 1. Direct embedded report data in query or hash (?d=... or ?data=...)
      setSharedData(report);
      setIsLoadingShared(false);
      return;
    }

    if (reportId) {
      // 2. Lookup by report ID in local database
      setIsLoadingShared(true);
      getLocalReport(reportId)
        .then((local) => {
          if (local) {
            setSharedData(local);
          } else {
            setSharedError('अहवाल सापडला नाही (Report not found on this device).');
          }
          setIsLoadingShared(false);
        })
        .catch((err) => {
          console.error('Error loading shared report:', err);
          setSharedError('अहवाल लोड करताना त्रुटी आली.');
          setIsLoadingShared(false);
        });
    }
  }, []);

  // Generate Report PDF completely offline with local database persistence
  const handleGenerate = async () => {
    try {
      setIsGenerating(true);

      // 1. Save locally to device database
      const savedReport = await saveLocalReport(formData);
      setFormData(savedReport);
      await refreshReportsCount();

      // 2. Generate accessible offline share URL with compact payload representation
      const targetShareUrl = getReportShareUrl(savedReport);
      setShareUrl(targetShareUrl);

      // 3. Generate multi-page PDF with embedded QR Code
      const { blobUrl, pdfBlob: generatedBlob } = await generateReportPdf(savedReport, targetShareUrl);
      setPdfBlobUrl(blobUrl);
      setPdfBlob(generatedBlob);
      setReportMode('preview');
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('PDF तयार करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Start new report from Home
  const handleMakeReport = () => {
    setFormData(getInitialReportData());
    setPdfBlob(null);
    setPdfBlobUrl(null);
    setReportMode('form');
    setCurrentView('report');
  };

  // Edit existing report from Reports list
  const handleEditReport = (report: ReportData) => {
    setFormData(report);
    setPdfBlob(null);
    setPdfBlobUrl(null);
    setReportMode('form');
    setCurrentView('report');
  };

  // =========================================================================
  // 1. PUBLIC QR SCAN VIEW (ONLY Summary, Suggestions & Download)
  // =========================================================================
  if (isLoadingShared) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-semibold text-sm">
            अहवाल लोड होत आहे (Loading Report)...
          </p>
        </div>
      </div>
    );
  }

  if (sharedError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md max-w-md text-center space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800">त्रुटी (Error)</h2>
          <p className="text-xs text-slate-500">{sharedError}</p>
          <button
            type="button"
            onClick={() => {
              setSharedError(null);
              window.location.href = '/';
            }}
            className="w-full py-3 bg-emerald-600 text-white font-extrabold text-sm rounded-xl hover:bg-emerald-700 transition"
          >
            मुख्य पृष्ठावर जा (Go to Home)
          </button>
        </div>
      </div>
    );
  }

  if (sharedData) {
    return <SharedReportView data={sharedData} />;
  }

  // =========================================================================
  // 2. CONTACT US VIEW
  // =========================================================================
  if (currentView === 'contact') {
    return <ContactUsView onBack={() => setCurrentView('home')} />;
  }

  // =========================================================================
  // 3. ABOUT VIEW
  // =========================================================================
  if (currentView === 'about') {
    return <AboutView onBack={() => setCurrentView('home')} />;
  }

  // =========================================================================
  // 4. REPORTS LIST VIEW (Replaces old Database view)
  // =========================================================================
  if (currentView === 'reports') {
    return (
      <ReportsListView
        onBack={() => setCurrentView('home')}
        onEditReport={handleEditReport}
      />
    );
  }

  // =========================================================================
  // 5. REPORT VIEW (Form | Preview with [Pen] and [Eye] icons)
  // =========================================================================
  if (currentView === 'report') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
        {/* Report Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
          <div className="max-w-4xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition"
                aria-label="मुख्य पृष्ठावर जा (Back to Home)"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                  {reportMode === 'form' ? 'अहवाल फॉर्म (Form)' : 'अहवाल पूर्वावलोकन (Preview)'}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  {formData.name || 'नवीन ग्राहक'}
                </p>
              </div>
            </div>

            {/* Top Navigation: [Pen/Paper icon] and [Eye icon] ONLY */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setReportMode('form')}
                className={`p-2 rounded-xl transition flex items-center justify-center ${
                  reportMode === 'form'
                    ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="फॉर्म भरा (Edit Form)"
                aria-label="फॉर्म भरा (Edit Form)"
              >
                <PenLine className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!pdfBlobUrl) {
                    handleGenerate();
                  } else {
                    setReportMode('preview');
                  }
                }}
                className={`p-2 rounded-xl transition flex items-center justify-center ${
                  reportMode === 'preview'
                    ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="पूर्वावलोकन पहा (Preview Report)"
                aria-label="पूर्वावलोकन पहा (Preview Report)"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
          {reportMode === 'form' ? (
            <ReportForm
              data={formData}
              onChange={setFormData}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          ) : (
            <ReportPreview
              data={formData}
              pdfBlobUrl={pdfBlobUrl}
              pdfBlob={pdfBlob}
              shareUrl={shareUrl}
            />
          )}
        </main>
      </div>
    );
  }

  // =========================================================================
  // 6. DEFAULT: NEW HOME SCREEN
  // =========================================================================
  return (
    <>
      <HomeScreen
        onMakeReport={handleMakeReport}
        onOpenMenu={() => setIsDrawerOpen(true)}
        onOpenReports={() => setCurrentView('reports')}
        totalSavedReports={totalSavedReports}
      />

      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectOption={(opt) => setCurrentView(opt)}
        totalReportsCount={totalSavedReports}
      />
    </>
  );
};

export default App;
