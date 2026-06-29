import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Monitor, 
  Check, 
  Save, 
  ChevronRight, 
  User, 
  Sparkles,
  Flame,
  Droplet,
  Clock,
  Languages,
  Download,
  Trash2,
  FileSpreadsheet,
  FileJson,
  FileDown,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/userService';

const LANGUAGES_SUPPORTED = [
  { code: 'en', name: 'ENGLISH' },
  { code: 'es', name: 'ESPAÑOL (SPANISH)' },
  { code: 'fr', name: 'FRANÇAIS (FRENCH)' },
  { code: 'de', name: 'DEUTSCH (GERMAN)' }
];

export const Settings: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { profile, refreshProfile, deleteAccount } = useAuth();

  // Custom targets state
  const [waterGoal, setWaterGoal] = useState(profile?.waterIntakeGoal?.toString() || '2500');
  const [caloriesGoal, setCaloriesGoal] = useState(profile?.caloriesBurnedGoal?.toString() || '600');
  const [durationGoal, setDurationGoal] = useState(profile?.workoutDurationGoal?.toString() || '45');
  
  // Settings States
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [langCode, setLangCode] = useState(localStorage.getItem('gymtrainer_lang') || 'en');
  const [langSuccess, setLangSuccess] = useState(false);

  // Danger Zone States
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSaveTargets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setSuccess(false);

    try {
      await updateUserProfile(profile.uid, {
        waterIntakeGoal: parseInt(waterGoal, 10) || 2500,
        caloriesBurnedGoal: parseInt(caloriesGoal, 10) || 600,
        workoutDurationGoal: parseInt(durationGoal, 10) || 45
      });

      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving goals:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (code: string) => {
    setLangCode(code);
    localStorage.setItem('gymtrainer_lang', code);
    setLangSuccess(true);
    setTimeout(() => setLangSuccess(false), 3000);
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (!profile) return;
    const headers = 'Biometric Metric,Target Value,Date Exported\n';
    const row1 = `Hydration Goal,${waterGoal} ml,${new Date().toLocaleDateString()}\n`;
    const row2 = `Active Calories Burned Goal,${caloriesGoal} kcal,${new Date().toLocaleDateString()}\n`;
    const row3 = `Daily Workout Duration,${durationGoal} Mins,${new Date().toLocaleDateString()}\n`;
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + row1 + row2 + row3);
    
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `AzharFit_Biometrics_Logs_${profile.uid}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Data Backup
  const handleExportBackup = () => {
    if (!profile) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `AzharFit_Athlete_Backup_${profile.uid}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable PDF Export Fallback
  const handleExportPDF = () => {
    window.print();
  };

  // Secure Purge Account Handler
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'CONFIRM DELETE') {
      setDeleteError('Please type "CONFIRM DELETE" exactly to execute the system purge.');
      return;
    }

    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount();
      window.location.href = '/';
    } catch (err: any) {
      console.error(err);
      setDeleteError(err.message || 'Purge failed. Try signing in again before deleting.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-indigo-500" />
          <span>System Settings & Goals</span>
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Configure physical biometrics targets, export training packages, change system languages, and manage compliance.
        </p>
      </div>

      {/* Grid: Theme & Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Visual Theme & Language Switcher) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Visual Theme */}
          <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Visual Theme</h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mb-4">Appearance Engine</p>
 
            <div className="space-y-2">
              {[
                { id: 'light', name: 'Light Mode', icon: Sun },
                { id: 'dark', name: 'Dark Mode', icon: Moon },
                { id: 'system', name: 'System Mode', icon: Monitor }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = theme === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id as Theme)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer
                      ${isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                        : 'bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Switcher */}
          <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <Languages className="w-4 h-4 text-indigo-500" />
              <span>System Language</span>
            </h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mb-4">Locale switchboard</p>

            {langSuccess && (
              <div className="p-2.5 mb-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                LOCALE CALIBRATED SUCCESSFULLY!
              </div>
            )}

            <div className="space-y-1.5">
              {LANGUAGES_SUPPORTED.map((lang) => {
                const isActive = langCode === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`
                      w-full flex items-center justify-between p-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer
                      ${isActive
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white shadow-md'
                        : 'bg-zinc-50/50 dark:bg-zinc-950/10 border-zinc-200 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }
                    `}
                  >
                    <span>{lang.name}</span>
                    {isActive && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (Goals Form, Data Exporters, Danger Zone) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Biometrics Target Settings */}
          <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Athletic Target Goals</h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mb-6">Target Metrics Deck</p>

            <form onSubmit={handleSaveTargets} className="space-y-4">
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Targets saved into athlete profile!</span>
                </motion.div>
              )}

              {/* Water Goal */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-blue-500" />
                  <span>Hydration Target (ml)</span>
                </label>
                <input
                  type="number"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(e.target.value)}
                  placeholder="E.g. 2500"
                  className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Calories Goal */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>Active Calories Burned Goal (kcal)</span>
                </label>
                <input
                  type="number"
                  value={caloriesGoal}
                  onChange={(e) => setCaloriesGoal(e.target.value)}
                  placeholder="E.g. 600"
                  className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Duration Goal */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-violet-500" />
                  <span>Daily Training Session Duration (Mins)</span>
                </label>
                <input
                  type="number"
                  value={durationGoal}
                  onChange={(e) => setDurationGoal(e.target.value)}
                  placeholder="E.g. 45"
                  className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/15 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Targets</span>
              </button>
            </form>
          </div>

          {/* Data Backup & Export Channels */}
          <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Backup & Telemetry Export</h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mb-4">Export workout data & biometric backup</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* CSV */}
              <button
                onClick={handleExportCSV}
                className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950/20 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all cursor-pointer group"
              >
                <FileSpreadsheet className="w-6 h-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase text-zinc-800 dark:text-zinc-200 tracking-wider">Export CSV</span>
                <span className="text-[8px] text-zinc-400 uppercase mt-0.5">Spreadsheet compatible</span>
              </button>

              {/* JSON */}
              <button
                onClick={handleExportBackup}
                className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950/20 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all cursor-pointer group"
              >
                <FileJson className="w-6 h-6 text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase text-zinc-800 dark:text-zinc-200 tracking-wider">Backup JSON</span>
                <span className="text-[8px] text-zinc-400 uppercase mt-0.5">Offline Database package</span>
              </button>

              {/* PDF Printable */}
              <button
                onClick={handleExportPDF}
                className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950/20 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl transition-all cursor-pointer group"
              >
                <FileDown className="w-6 h-6 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase text-zinc-800 dark:text-zinc-200 tracking-wider">Export PDF</span>
                <span className="text-[8px] text-zinc-400 uppercase mt-0.5">Printable Summary Report</span>
              </button>
            </div>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/20 dark:border-rose-950/30 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              <span>Danger Zone</span>
            </h3>
            <p className="text-[10px] text-rose-500/80 dark:text-rose-400/60 font-bold uppercase tracking-widest mb-4">Permanent Profile Purge</p>

            <div className="space-y-4">
              <p className="text-[10px] leading-relaxed text-rose-600/80 dark:text-rose-400/70 font-bold uppercase tracking-wider">
                This action is irreversible. It completely purges your credentials, removes your athlete level progress, clears your hydration target logs, and wipes your workout blueprints from Firestore.
              </p>

              {deleteError && (
                <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold rounded-xl uppercase tracking-wider">
                  {deleteError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-rose-500 dark:text-rose-400/80 uppercase tracking-widest block">
                  TYPE <span className="font-black underline">CONFIRM DELETE</span> TO PERMIT PURGE:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="CONFIRM DELETE"
                  className="w-full bg-white dark:bg-zinc-950 border border-rose-500/20 text-xs text-rose-600 rounded-xl px-4 py-2.5 font-extrabold outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>PURGING ATHLETE RECORDS...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>PURGE AND TERMINATE ACCOUNT</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
