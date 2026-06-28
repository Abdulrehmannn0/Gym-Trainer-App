import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  FileText, 
  Send, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How does the Strength & Hypertrophy Simulator calculate my level?",
    answer: "The simulator recalibrates your athletic capability based on your daily biometric deck (body weight, gender, age) coupled with the intensity, volume, and repetition parameters logged in your workout plans. This provides a precise feedback loop for physical muscle loading."
  },
  {
    question: "Can I use GymTrainer Pro offline on my device?",
    answer: "Yes! GymTrainer Pro is a fully functional Progressive Web App (PWA). Once cached by your browser, you can load and run workouts, check your hydration targets, and interact with cached exercise instructions entirely offline. Changes will automatically synchronize when connection resumes."
  },
  {
    question: "How do I back up or export my training history?",
    answer: "Inside the Settings panel, you will find direct controls for 'Data Backup & Export'. This allows you to generate instantly downloadable CSV logs of your workouts or a formatted JSON package containing your complete athlete telemetry."
  },
  {
    question: "Is my personal biometrics data secure?",
    answer: "Absolutely. All biometrics, hydration logs, and physical measurements are stored in a secure Cloud Firestore database managed under strict Firebase security rules. Your personal records are only accessible by you."
  },
  {
    question: "How can I delete my GymTrainer Pro account?",
    answer: "Under the 'Danger Zone' in the Settings panel, you can click 'Delete Account'. This will completely wipe your authentication profile and delete all corresponding athlete telemetry from Firestore databases permanently."
  }
];

export const SupportFAQ: React.FC = () => {
  const { profile } = useAuth();
  
  // Tabs: 'faq' | 'support' | 'terms' | 'privacy'
  const [activeTab, setActiveTab] = useState<'faq' | 'support' | 'terms' | 'privacy'>('faq');
  
  // Accordion faq index state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setSubmitError('Please fill in all ticket details.');
      return;
    }

    setSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');

    try {
      // Record real support tickets in Firestore under `/support_tickets`
      await addDoc(collection(db, 'support_tickets'), {
        uid: profile?.uid || 'Anonymous',
        athleteName: profile?.name || 'Anonymous Athlete',
        athleteEmail: profile?.email || 'No email',
        subject: subject.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
        status: 'Open'
      });

      setSubject('');
      setMessage('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error dispatching support ticket:', err);
      setSubmitError(err.message || 'Failed to dispatch ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Title Block */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-indigo-500" />
          <span>Support, FAQs & Legal</span>
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Access physical training assistance, submit tickets directly to our dev desk, and view terms compliance.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        {[
          { id: 'faq', name: 'FAQs Accordion', icon: HelpCircle },
          { id: 'support', name: 'Contact Dev Desk', icon: MessageSquare },
          { id: 'terms', name: 'Terms & Conditions', icon: FileText },
          { id: 'privacy', name: 'Privacy Policy', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border
                ${isActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                  : 'bg-white dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Display */}
      <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* FAQs Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Frequently Answered Questions</h3>
            <div className="space-y-3.5">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div 
                    key={idx}
                    className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden transition-all bg-zinc-50/50 dark:bg-zinc-950/20"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex justify-between items-center p-4 text-left font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100/40 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      <span>{item.question}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />}
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-zinc-100 dark:border-zinc-800/60 p-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400"
                        >
                          {item.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Support Request Ticket Form Tab */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Submit Athlete Support Ticket</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Encountering biometric sync errors or physical formulas layout concerns? Send a diagnostic request straight to developer telemetry.
              </p>
            </div>

            <form onSubmit={handleSupportSubmit} className="space-y-4">
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold p-4 rounded-xl flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>SUPPORT TICKET DISPATCHED SUCCESSFULLY! REFID: #{Math.floor(Math.random() * 89999 + 10000)}</span>
                </motion.div>
              )}

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold p-4 rounded-xl flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>{submitError}</span>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">ATHLETE NAME</label>
                  <input
                    type="text"
                    value={profile?.name || ''}
                    disabled
                    className="w-full bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-xl px-4 py-3 text-xs font-semibold outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">ATHLETE EMAIL</label>
                  <input
                    type="text"
                    value={profile?.email || ''}
                    disabled
                    className="w-full bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-xl px-4 py-3 text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">ISSUE SUBJECT</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="E.g. Hydration target resets upon browser refresh"
                  className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">TICKET DETAIL DIAGNOSTIC MESSAGE</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Provide a step-by-step description of the training module error or biometrics calculation discrepancy..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs text-zinc-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/15 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>DISPATCHING TICKET...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>DISPATCH SUPPORT TICKET</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Terms & Conditions Tab */}
        {activeTab === 'terms' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span>GymTrainer Pro - Terms of Service</span>
              </h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-extrabold mt-1">LAST MODIFIED: JUNE 28, 2026</p>
            </div>

            <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold max-h-[400px] overflow-y-auto pr-2">
              <p className="font-bold text-zinc-900 dark:text-white text-sm">1. ACCEPTANCE OF TRAINING REGIME</p>
              <p>
                By accessing GymTrainer Pro, you accept and agree to follow safe athletic protocols and physical exercise regulations. The formulas, calorie counts, strength indexes, and AI advice provided are mathematical estimations and simulations for strength/hypertrophy and do not substitute for professional medical/cardiovascular consulting.
              </p>

              <p className="font-bold text-zinc-900 dark:text-white text-sm">2. BIO-DIAGNOSTIC TELEMETRY LICENSING</p>
              <p>
                You grant GymTrainer Pro permission to collect and analyze physical records (including body weight, age, height, gender indicators, water intake, and logged training sets) purely to calibrate localized hypertrophy multipliers and display charts.
              </p>

              <p className="font-bold text-zinc-900 dark:text-white text-sm">3. ATHLETE RESPONSIBILITIES</p>
              <p>
                Users are solely responsible for verifying the mechanical safety of all physical weights, benches, loading racks, bar collars, and hydration levels before commencing any simulated workout plans. Do not execute exercises if physical form cannot be structurally sustained.
              </p>
              
              <p className="font-bold text-zinc-900 dark:text-white text-sm">4. TERM LIMITS & MODIFICATIONS</p>
              <p>
                We reserve the right to deploy new formula updates, training regimes, and diagnostic variables to our cloud databases at any time. Your continued synchronization of biometrics implies total terms acceptance.
              </p>
            </div>
          </div>
        )}

        {/* Privacy Policy Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <span>Athlete Privacy Shield & Data Collection</span>
              </h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-extrabold mt-1">LAST MODIFIED: JUNE 28, 2026</p>
            </div>

            <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold max-h-[400px] overflow-y-auto pr-2">
              <p className="font-bold text-zinc-900 dark:text-white text-sm">1. BIOMETRICS DATA ENCRYPTION</p>
              <p>
                All physical stats inputs (gender, height, weight, activity levels) are held under strictly configured security rules on our Firestore databases. No biometric telemetry is ever shared with third-party marketing channels.
              </p>

              <p className="font-bold text-zinc-900 dark:text-white text-sm">2. AI COACH CONVERSATIONS</p>
              <p>
                Conversations held with your AI Coach are securely dispatched to the Gemini API using an encrypted, server-side gateway. No API keys are leaked to the client browser, and chat histories are bound purely to your user profile document.
              </p>

              <p className="font-bold text-zinc-900 dark:text-white text-sm">3. OFFLINE STANDALONE SHIELD</p>
              <p>
                When running GymTrainer Pro offline under PWA service workers, your workout history and physical statistics remain locked in local browser storage, and are synchronized to Firestore databases ONLY when your physical network transitions back online.
              </p>

              <p className="font-bold text-zinc-900 dark:text-white text-sm">4. DATA BACKUP AND DELETION RIGHTS</p>
              <p>
                As an athlete, you maintain full control over your telemetry. You can instantly export your entire database logs as JSON backups or delete your complete database record along with your user credentials at any moment via the Settings panel.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
