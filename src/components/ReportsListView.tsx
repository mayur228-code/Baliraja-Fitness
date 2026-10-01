import React, { useState, useEffect, useRef } from 'react';
import { ReportData } from '../types';
import {
  getLatestReportsPerPerson,
  deleteLocalReport,
  exportAllReportsAsJson,
  importReportsFromJson,
} from '../utils/localDatabase';
import { generateReportPdf } from '../utils/pdfGenerator';
import { openPdfDocument, saveBackupJsonToDevice, getSafePdfFileName } from '../utils/nativePdfHandler';
import { getReportKeyMetrics } from '../utils/metricSummary';
import {
  ArrowLeft,
  Search,
  FileText,
  User,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  Edit,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

interface ReportsListViewProps {
  onBack: () => void;
  onEditReport: (report: ReportData) => void;
}

export const ReportsListView: React.FC<ReportsListViewProps> = ({
  onBack,
  onEditReport,
}) => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isOpeningPdf, setIsOpeningPdf] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      const list = await getLatestReportsPerPerson();
      setReports(list);
    } catch (e) {
      console.error('Failed to load reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenPdf = async (report: ReportData) => {
    try {
      setIsOpeningPdf(true);
      const { pdfBlob } = await generateReportPdf(report);
      const fileName = getSafePdfFileName(report.name);
      await openPdfDocument(pdfBlob, fileName);
    } catch (err: any) {
      console.error('Error opening report PDF:', err);
      showFeedback('error', err.message || 'PDF उघडताना त्रुटी आली.');
    } finally {
      setIsOpeningPdf(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`खरोखर '${name || 'हा अहवाल'}' हटवायचा आहे का?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteLocalReport(id);
      await loadReports();
      if (selectedReport?.reportId === id) {
        setSelectedReport(null);
      }
      showFeedback('success', 'अहवाल यशस्वीरीत्या हटवला गेला.');
    } catch (e) {
      showFeedback('error', 'अहवाल हटवताना त्रुटी आली.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportBackup = async () => {
    try {
      const jsonStr = await exportAllReportsAsJson();
      const today = new Date().toISOString().split('T')[0];
      const fileName = `Baliraja_Fitness_Backup_${today}.json`;
      const res = await saveBackupJsonToDevice(jsonStr, fileName);
      showFeedback('success', res.message);
    } catch (e: any) {
      console.error('Export backup error:', e);
      showFeedback('error', e.message || 'बॅकअप तयार करताना त्रुटी आली.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const result = await importReportsFromJson(text);
        if (result.errors.length > 0) {
          showFeedback('error', `काही त्रुटी: ${result.errors.join(', ')}`);
        } else {
          showFeedback('success', `${result.importedCount} अहवाल यशस्वीरीत्या रिस्टोअर झाले!`);
        }
        await loadReports();
      } catch (err) {
        showFeedback('error', 'अवैध JSON बॅकअप फाईल.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.mobile && r.mobile.includes(q)) ||
      (r.village && r.village.toLowerCase().includes(q)) ||
      (r.date && r.date.includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hidden File Input for Backup Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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
                अहवाल (Reports)
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {reports.length > 0 ? `एकूण ${reports.length} व्यक्तींचे अहवाल` : 'जतन केलेले अहवाल'}
              </p>
            </div>
          </div>

          {/* Backup Action Shortcuts */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExportBackup}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="बॅकअप डाऊनलोड (Export Backup)"
              aria-label="Export Backup"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleImportClick}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="बॅकअप रिस्टोअर (Import Backup)"
              aria-label="Import Backup"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Feedback Toast */}
        {feedback && (
          <div
            className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
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

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="नाव, मोबाईल किंवा गावावरून शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-xs sm:text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium shadow-2xs"
          />
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold">अहवाल लोड होत आहेत...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-700">कोणताही अहवाल आढळला नाही</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {searchQuery
                ? 'दिलेल्या शोधाशी जुळणारा कोणताही अहवाल नाही.'
                : 'अजून कोणताही अहवाल जतन केलेला नाही.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredReports.map((report) => {
              const clientName = report.name || 'अनामिक ग्राहक';
              const mobile = report.mobile || '';
              const village = report.village || '';
              const subText = [mobile, village].filter(Boolean).join(' · ');

              return (
                <div
                  key={report.reportId || clientName + report.date}
                  onClick={() => setSelectedReport(report)}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 active:bg-slate-50 shadow-2xs transition flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate group-hover:text-emerald-800">
                      {clientName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {subText || 'माहिती उपलब्ध नाही'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 hidden sm:inline-block">
                      {report.date || '-'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPdf(report);
                      }}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition flex items-center gap-1"
                      title="अहवाल PDF उघडा"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Open Report</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Report Summary Modal on Tap */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  अहवाल सारांश (Report Summary)
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                  {selectedReport.name || 'Client'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {[selectedReport.mobile, selectedReport.village, selectedReport.date].filter(Boolean).join(' • ')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2.5">
              {getReportKeyMetrics(selectedReport).map((m) => (
                <div key={m.id} className="p-3 bg-slate-50/90 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-xs font-semibold text-slate-500 block leading-tight">
                    {m.labelMarathi}
                  </span>
                  <div className="text-lg font-black text-slate-900 tracking-tight">
                    {m.value}
                  </div>
                  {m.diffText && (
                    <div className={`text-[15px] font-semibold leading-tight pt-0.5 ${m.diffColor || 'text-rose-600'}`}>
                      {m.diffText}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Primary Modal Action: Open Report */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleOpenPdf(selectedReport)}
                disabled={isOpeningPdf}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                {isOpeningPdf ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>अहवाल उघडत आहे...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>अहवाल उघडा (Open Report)</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onEditReport(selectedReport);
                    setSelectedReport(null);
                  }}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-600" />
                  <span>फॉर्म उघडा (Edit)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(selectedReport.reportId || '', selectedReport.name)}
                  disabled={deletingId === selectedReport.reportId}
                  className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>हटवा (Delete)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
