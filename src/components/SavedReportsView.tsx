import React, { useState, useEffect, useRef } from 'react';
import { ReportData } from '../types';
import {
  getAllLocalReports,
  deleteLocalReport,
  exportAllReportsAsJson,
  importReportsFromJson,
} from '../utils/localDatabase';
import { generateReportPdf } from '../utils/pdfGenerator';
import { saveBackupJsonToDevice } from '../utils/nativePdfHandler';
import {
  Database,
  Download,
  Upload,
  Search,
  Trash2,
  FileText,
  User,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface SavedReportsViewProps {
  onSelectReport: (report: ReportData) => void;
  onNewReport: () => void;
}

export const SavedReportsView: React.FC<SavedReportsViewProps> = ({
  onSelectReport,
  onNewReport,
}) => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      const list = await getAllLocalReports();
      setReports(list);
    } catch (e) {
      console.error('Failed to load local reports:', e);
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

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`खरोखर '${name || 'हा अहवाल'}' हटवायचा आहे का?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteLocalReport(id);
      await loadReports();
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
      showFeedback('success', `${res.message} (एकूण ${reports.length} अहवाल).`);
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
    <div className="space-y-6">
      {/* Hidden File Input for JSON Restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Top Banner & Local Storage Security Badge */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 sm:p-5 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/10 text-yellow-300">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
              स्थानिक डेटाबेस व बॅकअप (Offline Storage & Backup)
            </h2>
          </div>
          <p className="text-xs text-emerald-100 font-medium">
            सर्व ग्राहकांचा डेटा तुमच्या फोनवर १००% सुरक्षितपणे स्थानिक साठवला जातो.
          </p>
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 text-emerald-100 text-xs font-bold border border-white/20">
          <ShieldCheck className="w-4 h-4 text-yellow-300" />
          <span>100% Offline • Zero Cloud</span>
        </div>
      </div>

      {/* Action Bar: Backup, Restore, New Report */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>बॅकअप फाईल डाउनलोड (Export Backup)</span>
          </button>

          <button
            type="button"
            onClick={handleImportClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>बॅकअप रिस्टोअर करा (Import Backup)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onNewReport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs sm:text-sm rounded-xl border border-teal-200 transition"
        >
          <RotateCcw className="w-4 h-4 text-teal-700" />
          <span>नवीन अहवाल तयार करा</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search Input & Total Counter */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ग्राहकाचे नाव, मोबाईल किंवा गावावरून शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          एकूण अहवाल: <strong className="text-slate-800">{filteredReports.length}</strong>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 space-y-2">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold">डेटा लोड होत आहे...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">कोणताही अहवाल सापडला नाही</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'दिलेल्या शोधानुसार कोणताही अहवाल सापडला नाही.'
              : 'अजून कोणताही अहवाल जतन केलेला नाही. नवीन फॉर्म भरून रिपोर्ट तयार करा.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredReports.map((report) => (
            <div
              key={report.reportId || report.name + report.date}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {report.name || 'अनामिक ग्राहक'}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{report.gender === 'Male' ? 'पुरुष' : 'स्त्री'}</span>
                    {report.age && <span>• {report.age} वर्षे</span>}
                    <span>• {report.date || '-'}</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 shrink-0">
                  {report.reportId || 'BAR-LOCAL'}
                </span>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-1.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">वजन</span>
                  <strong className="text-slate-800">{report.weight ? `${report.weight} kg` : '-'}</strong>
                </div>
                <div className="p-1.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">BMI</span>
                  <strong className="text-slate-800">{report.bmi || '-'}</strong>
                </div>
                <div className="p-1.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">चरबी (Fat)</span>
                  <strong className="text-slate-800">{report.bodyFat ? `${report.bodyFat}%` : '-'}</strong>
                </div>
              </div>

              {/* Contact & Village */}
              {(report.mobile || report.village) && (
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  {report.mobile && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{report.mobile}</span>
                    </div>
                  )}
                  {report.village && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[120px]">{report.village}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectReport(report)}
                  className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition text-center"
                >
                  पाहा व उघडा (Open / Edit)
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(report.reportId || '', report.name)}
                  disabled={deletingId === report.reportId}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="हटवा (Delete)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
