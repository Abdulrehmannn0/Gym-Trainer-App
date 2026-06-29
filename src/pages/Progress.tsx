import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Activity, 
  Plus, 
  Check, 
  Calendar, 
  Clock, 
  Flame, 
  Dumbbell, 
  Scale, 
  ChevronRight,
  User,
  Percent,
  Calculator,
  Moon,
  Droplet,
  Heart,
  Award,
  Trash2,
  Sparkles,
  Layers,
  Sparkle,
  Zap,
  Star,
  Info,
  Camera,
  Printer,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/userService';
import { 
  getMeasurementLogs, 
  createMeasurementLog, 
  getSleepLogs, 
  createSleepLog,
  getHabits, 
  createHabit, 
  deleteHabit, 
  getHabitStatuses, 
  saveHabitStatus,
  getPersonalRecords,
  addPersonalRecord 
} from '../services/fitnessService';
import { BodyMeasurementLog, SleepLog, Habit, HabitStatus, PersonalRecord } from '../types';

// Fallback charts if Firestore is clean
const DEFAULT_WEIGHTS = [
  { date: 'Jun 22', value: 80.5 },
  { date: 'Jun 23', value: 80.1 },
  { date: 'Jun 24', value: 79.8 },
  { date: 'Jun 25', value: 79.9 },
  { date: 'Jun 26', value: 79.5 },
  { date: 'Jun 27', value: 79.2 },
  { date: 'Jun 28', value: 78.8 }
];

const DEFAULT_CALORIES = [
  { date: 'Jun 22', value: 380 },
  { date: 'Jun 23', value: 450 },
  { date: 'Jun 24', value: 290 },
  { date: 'Jun 25', value: 510 },
  { date: 'Jun 26', value: 420 },
  { date: 'Jun 27', value: 610 },
  { date: 'Jun 28', value: 480 }
];

const DEFAULT_WATER = [
  { date: 'Jun 22', value: 2000 },
  { date: 'Jun 23', value: 2500 },
  { date: 'Jun 24', value: 1800 },
  { date: 'Jun 25', value: 3000 },
  { date: 'Jun 26', value: 2200 },
  { date: 'Jun 27', value: 2800 },
  { date: 'Jun 28', value: 2400 }
];

const DEFAULT_PHOTOS = [
  {
    id: 'seed-1',
    date: '2026-04-28',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
    caption: 'Day 1 of clean split - Focus on building baseline endurance and overhead press forms.'
  },
  {
    id: 'seed-2',
    date: '2026-05-28',
    url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop',
    caption: 'Month 1 Check-In - Solid hypertrophy gains across lats and biceps. Increased squat depth.'
  },
  {
    id: 'seed-3',
    date: '2026-06-28',
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
    caption: 'Current Physique - Fat percentage is down 3.5% with significant abdominal conditioning.'
  }
];

export const Progress: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  
  // Tabs: 'analytics' | 'measurements' | 'habits' | 'sleep' | 'calculators' | 'records' | 'photos' | 'goals'
  const [activeTab, setActiveTab] = useState<'analytics' | 'measurements' | 'habits' | 'sleep' | 'calculators' | 'records' | 'photos' | 'goals'>('analytics');
  
  // Progress Photos States
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoSyncing, setPhotoSyncing] = useState(false);

  // Custom Log States
  const [logType, setLogType] = useState<'weight' | 'calories' | 'water'>('weight');
  const [logValue, setLogValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Firestore-synced Lists
  const [measurementLogs, setMeasurementLogs] = useState<BodyMeasurementLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitStatuses, setHabitStatuses] = useState<HabitStatus[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Body Measurements log form states
  const [mChest, setMChest] = useState('');
  const [mArmsRight, setMArmsRight] = useState('');
  const [mArmsLeft, setMArmsLeft] = useState('');
  const [mWaist, setMWaist] = useState('');
  const [mHips, setMHips] = useState('');
  const [mThighsRight, setMThighsRight] = useState('');
  const [mThighsLeft, setMThighsLeft] = useState('');
  const [mCalves, setMCalves] = useState('');

  // Sleep log states
  const [sleepHours, setSleepHours] = useState('8');
  const [sleepQuality, setSleepQuality] = useState('Good');
  const [sleepNotes, setSleepNotes] = useState('');

  // Habit builder form states
  const [newHabitName, setNewHabitName] = useState('');

  // Personal Record Form States
  const [prExercise, setPrExercise] = useState('');
  const [prWeight, setPrWeight] = useState('');
  const [prReps, setPrReps] = useState('5');

  // Interactive Calculators states
  const [calcGender, setCalcGender] = useState<'male' | 'female'>('male');
  const [calcAge, setCalcAge] = useState('25');
  const [calcWeight, setCalcWeight] = useState(profile?.weight?.toString() || '75');
  const [calcHeight, setCalcHeight] = useState(profile?.height?.toString() || '175');
  const [calcGoal, setCalcGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  const [calcActivity, setCalcActivity] = useState('1.375'); // Light exercise multiplier

  // Fetch lists
  useEffect(() => {
    if (profile?.uid) {
      const loadProgressData = async () => {
        setLoading(true);
        try {
          const m = await getMeasurementLogs(profile.uid);
          const s = await getSleepLogs(profile.uid);
          const h = await getHabits(profile.uid);
          const st = await getHabitStatuses(profile.uid);
          const pr = await getPersonalRecords(profile.uid);

          setMeasurementLogs(m);
          setSleepLogs(s);
          setHabits(h);
          setHabitStatuses(st);
          setPersonalRecords(pr);
        } catch (err) {
          console.error('Error fetching wellness trackers:', err);
        } finally {
          setLoading(false);
        }
      };
      loadProgressData();
    }
  }, [profile?.uid, activeTab]);

  // Derive histories
  const weightData = profile?.weightHistory && profile.weightHistory.length > 0 
    ? profile.weightHistory.map(w => ({ date: w.date.split('-')[2] || w.date, value: w.value }))
    : DEFAULT_WEIGHTS;

  const caloriesData = profile?.caloriesHistory && profile.caloriesHistory.length > 0
    ? profile.caloriesHistory.map(c => ({ date: c.date.split('-')[2] || c.date, value: c.value }))
    : DEFAULT_CALORIES;

  const waterData = profile?.waterHistory && profile.waterHistory.length > 0
    ? profile.waterHistory.map(wt => ({ date: wt.date.split('-')[2] || wt.date, value: wt.value }))
    : DEFAULT_WATER;

  const frequencyData = profile?.workoutFrequency || [2, 3, 1, 4, 3, 5, 1];

  // Latest stats
  const latestWeight = weightData[weightData.length - 1]?.value || 78;
  const latestWater = waterData[waterData.length - 1]?.value || 0;
  const latestCalories = caloriesData[caloriesData.length - 1]?.value || 0;
  const currentHeightMeters = (profile?.height || 178) / 100;
  const currentBMI = latestWeight / (currentHeightMeters * currentHeightMeters);
  
  const bmiStatus = currentBMI < 18.5 ? 'Underweight' :
                    currentBMI < 25 ? 'Healthy Weight' :
                    currentBMI < 30 ? 'Overweight' : 'Obese';

  const bmiColor = currentBMI < 18.5 ? 'text-blue-400' :
                   currentBMI < 25 ? 'text-emerald-400' :
                   currentBMI < 30 ? 'text-amber-400' : 'text-[#EF4444]';

  // Log Simple Biometrics
  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !logValue || isNaN(parseFloat(logValue))) return;

    setSubmitting(true);
    setSuccess(false);

    try {
      const val = parseFloat(logValue);
      const dateStr = new Date().toISOString().split('T')[0];
      const newEntry = { date: dateStr, value: val };

      if (logType === 'weight') {
        const history = [...(profile.weightHistory || [])];
        const existingIdx = history.findIndex(h => h.date === dateStr);
        if (existingIdx !== -1) {
          history[existingIdx].value = val;
        } else {
          history.push(newEntry);
        }
        await updateUserProfile(profile.uid, { weight: val, weightHistory: history });
      } else if (logType === 'calories') {
        const history = [...(profile.caloriesHistory || [])];
        const existingIdx = history.findIndex(h => h.date === dateStr);
        if (existingIdx !== -1) {
          history[existingIdx].value = val;
        } else {
          history.push(newEntry);
        }
        await updateUserProfile(profile.uid, { caloriesHistory: history });
      } else if (logType === 'water') {
        const history = [...(profile.waterHistory || [])];
        const existingIdx = history.findIndex(h => h.date === dateStr);
        if (existingIdx !== -1) {
          history[existingIdx].value = val;
        } else {
          history.push(newEntry);
        }
        await updateUserProfile(profile.uid, { waterHistory: history });
      }

      setLogValue('');
      setSuccess(true);
      await refreshProfile();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error logging metric:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Body measurements submission
  const handleMeasurementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const todayStr = new Date().toISOString().split('T')[0];

    const payload = {
      date: todayStr,
      chest: parseFloat(mChest) || undefined,
      armsRight: parseFloat(mArmsRight) || undefined,
      armsLeft: parseFloat(mArmsLeft) || undefined,
      waist: parseFloat(mWaist) || undefined,
      hips: parseFloat(mHips) || undefined,
      thighsRight: parseFloat(mThighsRight) || undefined,
      thighsLeft: parseFloat(mThighsLeft) || undefined,
      calves: parseFloat(mCalves) || undefined
    };

    try {
      await createMeasurementLog(profile.uid, payload);
      // Clear forms
      setMChest('');
      setMArmsRight('');
      setMArmsLeft('');
      setMWaist('');
      setMHips('');
      setMThighsRight('');
      setMThighsLeft('');
      setMCalves('');
      // Reload list
      const m = await getMeasurementLogs(profile.uid);
      setMeasurementLogs(m);
    } catch (err) {
      console.error('Error logging measurements:', err);
    }
  };

  // Sleep Log Submission
  const handleSleepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const todayStr = new Date().toISOString().split('T')[0];

    const payload = {
      date: todayStr,
      hours: parseFloat(sleepHours) || 8,
      quality: sleepQuality,
      notes: sleepNotes || undefined
    };

    try {
      await createSleepLog(profile.uid, payload);
      setSleepHours('8');
      setSleepQuality('Good');
      setSleepNotes('');
      const s = await getSleepLogs(profile.uid);
      setSleepLogs(s);
    } catch (err) {
      console.error('Error logging sleep details:', err);
    }
  };

  // Habit tracking checklists
  const todayStr = new Date().toISOString().split('T')[0];
  const todayStatus = habitStatuses.find(st => st.id === todayStr) || { id: todayStr, completedHabitIds: [] };

  const handleToggleHabit = async (habitId: string) => {
    if (!profile) return;
    let list = [...todayStatus.completedHabitIds];
    if (list.includes(habitId)) {
      list = list.filter(id => id !== habitId);
    } else {
      list.push(habitId);
    }

    try {
      await saveHabitStatus(profile.uid, todayStr, list);
      // Update local state instantaneously
      const updatedStatuses = habitStatuses.map(st => st.id === todayStr ? { ...st, completedHabitIds: list } : st);
      if (!habitStatuses.some(st => st.id === todayStr)) {
        updatedStatuses.push({ id: todayStr, completedHabitIds: list });
      }
      setHabitStatuses(updatedStatuses);
    } catch (err) {
      console.error('Error updating habit checklist:', err);
    }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newHabitName.trim()) return;
    try {
      await createHabit(profile.uid, newHabitName.trim());
      setNewHabitName('');
      const h = await getHabits(profile.uid);
      setHabits(h);
    } catch (err) {
      console.error('Error creating habit:', err);
    }
  };

  const handleDeleteHabitItem = async (id: string) => {
    if (!profile) return;
    try {
      await deleteHabit(profile.uid, id);
      setHabits(habits.filter(h => h.id !== id));
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  // Personal Records submission
  const handlePRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !prExercise || !prWeight) return;

    try {
      await addPersonalRecord(profile.uid, {
        exerciseName: prExercise,
        weight: parseFloat(prWeight) || 0,
        reps: parseInt(prReps, 10) || 5,
        date: todayStr
      });
      setPrExercise('');
      setPrWeight('');
      setPrReps('5');
      const pr = await getPersonalRecords(profile.uid);
      setPersonalRecords(pr);
    } catch (err) {
      console.error('Error logging Personal Record:', err);
    }
  };

  // Progress photo submission handler
  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !photoUrl.trim()) return;
    setPhotoSyncing(true);

    try {
      const newPhoto = {
        id: 'photo-' + Date.now(),
        date: photoDate,
        url: photoUrl.trim(),
        caption: photoCaption.trim() || undefined
      };

      const currentPhotos = profile.progressPhotos || [];
      const updatedPhotos = [newPhoto, ...currentPhotos];

      await updateUserProfile(profile.uid, { progressPhotos: updatedPhotos });
      await refreshProfile();
      setPhotoUrl('');
      setPhotoCaption('');
    } catch (err) {
      console.error('Error saving progress photo:', err);
    } finally {
      setPhotoSyncing(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!profile) return;
    try {
      const currentPhotos = profile.progressPhotos || [];
      const updatedPhotos = currentPhotos.filter(p => p.id !== photoId);

      await updateUserProfile(profile.uid, { progressPhotos: updatedPhotos });
      await refreshProfile();
    } catch (err) {
      console.error('Error deleting progress photo:', err);
    }
  };

  // Safe Math for SVG drawing
  const getMinMax = (arr: { value: number }[]) => {
    if (arr.length === 0) return { min: 0, max: 100 };
    const values = arr.map(x => x.value);
    const min = Math.min(...values) * 0.95;
    const max = Math.max(...values) * 1.05;
    return { min, max: min === max ? min + 10 : max };
  };

  const generateLinePoints = (data: { value: number }[], width: number, height: number, min: number, max: number) => {
    if (data.length === 0) return '';
    const stepX = width / (data.length - 1 || 1);
    const rangeY = max - min;
    
    return data.map((item, idx) => {
      const x = idx * stepX;
      const y = height - ((item.value - min) / rangeY) * height;
      return `${x},${y}`;
    }).join(' ');
  };

  const generateAreaPoints = (data: { value: number }[], width: number, height: number, min: number, max: number) => {
    const points = generateLinePoints(data, width, height, min, max);
    if (!points) return '';
    const lastX = width;
    return `0,${height} ${points} ${lastX},${height}`;
  };

  // Advanced Calculators calculations
  const numericWeight = parseFloat(calcWeight) || 70;
  const numericHeight = parseFloat(calcHeight) || 170;
  const numericAge = parseFloat(calcAge) || 25;

  // BMI calculation
  const calculatedBMI = numericWeight / ((numericHeight / 100) * (numericHeight / 100));

  // BMR calculation using Harris-Benedict formula
  let calculatedBMR = 0;
  if (calcGender === 'male') {
    calculatedBMR = 88.362 + (13.397 * numericWeight) + (4.799 * numericHeight) - (5.677 * numericAge);
  } else {
    calculatedBMR = 447.593 + (9.247 * numericWeight) + (3.098 * numericHeight) - (4.330 * numericAge);
  }

  // TDEE Maintenance calories
  const calculatedTDEE = calculatedBMR * parseFloat(calcActivity);
  
  // Total Target Calories
  let targetCalories = calculatedTDEE;
  if (calcGoal === 'lose') {
    targetCalories = calculatedTDEE - 500;
  } else if (calcGoal === 'gain') {
    targetCalories = calculatedTDEE + 350;
  }

  // Target Macros (Protein: 30%, Fats: 25%, Carbs: 45%)
  const pTargetGram = Math.round((targetCalories * 0.3) / 4);
  const fTargetGram = Math.round((targetCalories * 0.25) / 9);
  const cTargetGram = Math.round((targetCalories * 0.45) / 4);

  return (
    <div className="space-y-8 pb-12">
      {/* 0. PRINT STYLE DYNAMIC OVERRIDE */}
      <style>{`
        @media print {
          #app-sidebar, .no-print, nav, header, button, .tab-selector-container {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            width: 100% !important;
          }
          .print-full-width {
            width: 100% !important;
            display: block !important;
          }
          .text-white {
            color: black !important;
          }
          .text-\[\#A1A1AA\] {
            color: #4b5563 !important;
          }
          .bg-\[\#111827\] {
            background-color: #f3f4f6 !important;
            border-color: #d1d5db !important;
          }
          .border-white\/\[0\.08\] {
            border-color: #e5e7eb !important;
          }
        }
      `}</style>
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-[#7C3AED] animate-pulse" />
              <span>Biometric Analytics & Progress</span>
            </h1>
            <p className="text-sm text-[#A1A1AA] mt-1">
              Check body dimension logs, monitor sleep patterns, toggle habit streaks, and access metabolic calculators.
            </p>
          </div>
          
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-card-custom border border-border-custom hover:border-[#7C3AED]/30 text-text-custom-primary rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold no-print self-start sm:self-auto shrink-0"
          >
            <Printer className="w-4 h-4 text-[#7C3AED]" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Tab Selector Buttons Container */}
      <div className="tab-selector-container flex p-1 bg-card-custom border border-border-custom rounded-2xl gap-1 self-start shrink-0 overflow-x-auto max-w-full">
        {[
          { id: 'analytics', label: 'Analytics' },
          { id: 'measurements', label: 'Body Stats' },
          { id: 'habits', label: 'Daily Habits' },
          { id: 'sleep', label: 'Sleep Tracker' },
          { id: 'photos', label: 'Progress Photos' },
          { id: 'goals', label: 'Goals Tracker' },
          { id: 'calculators', label: 'Calculators' },
          { id: 'records', label: 'PR Hall' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-[#7C3AED] text-white shadow-md' 
                : 'text-text-custom-secondary hover:text-text-custom-primary hover:bg-zinc-100 dark:hover:bg-white/[0.02]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. TABBED CONTENT BOX PANELS WITH GLASSMORPHIC EFFECT */}
      <AnimatePresence mode="wait">

        {/* TAB 1: Analytics & Interactive Charts */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Charts Panels Grid */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Weight Progression custom line chart */}
              <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-text-custom-secondary block uppercase tracking-wider">ATHLETE WEIGHT GRAPH</span>
                    <h3 className="text-base font-black text-text-custom-primary flex items-center gap-1.5 mt-1">
                      <Scale className="w-4 h-4 text-emerald-400" />
                      <span>Weight Progression (kg)</span>
                    </h3>
                  </div>
                  <span className="text-2xl font-black text-emerald-400 tracking-tight">{latestWeight.toFixed(1)} <span className="text-xs font-normal text-text-custom-secondary">kg</span></span>
                </div>

                <div className="h-40 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.2)" />
                        <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points={generateAreaPoints(weightData, 500, 140, getMinMax(weightData).min, getMinMax(weightData).max)}
                      fill="url(#weightGrad)"
                    />
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      points={generateLinePoints(weightData, 500, 140, getMinMax(weightData).min, getMinMax(weightData).max)}
                    />
                  </svg>
                  <div className="flex justify-between text-[10px] text-text-custom-secondary font-bold tracking-widest uppercase mt-3 font-mono">
                    {weightData.map((w, idx) => (
                      <span key={idx}>{w.date}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calories Burned Line Area chart */}
              <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-text-custom-secondary block uppercase tracking-wider">CALORIE INCINERATOR INDEX</span>
                    <h3 className="text-base font-black text-text-custom-primary flex items-center gap-1.5 mt-1">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>Calories Burned History (kcal)</span>
                    </h3>
                  </div>
                  <span className="text-2xl font-black text-orange-400 tracking-tight">
                    {caloriesData[caloriesData.length - 1]?.value || 0} <span className="text-xs font-normal text-text-custom-secondary">kcal</span>
                  </span>
                </div>

                <div className="h-40 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(249, 115, 22, 0.2)" />
                        <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points={generateAreaPoints(caloriesData, 500, 140, getMinMax(caloriesData).min, getMinMax(caloriesData).max)}
                      fill="url(#calGrad)"
                    />
                    <polyline
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="3.5"
                      points={generateLinePoints(caloriesData, 500, 140, getMinMax(caloriesData).min, getMinMax(caloriesData).max)}
                    />
                  </svg>
                  <div className="flex justify-between text-[10px] text-text-custom-secondary font-bold tracking-widest uppercase mt-3 font-mono">
                    {caloriesData.map((c, idx) => (
                      <span key={idx}>{c.date}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workout frequency and BMI classifying cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl">
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-text-custom-secondary block uppercase tracking-wider">WEEKLY SPLIT FREQUENCY</span>
                    <h3 className="text-sm font-black text-text-custom-primary flex items-center gap-1.5 mt-1">
                      <Dumbbell className="w-4 h-4 text-[#7C3AED]" />
                      <span>Workout Frequency</span>
                    </h3>
                  </div>

                  <div className="flex justify-between items-end h-28 pt-4">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                      const val = frequencyData[idx] || 0;
                      const pct = Math.min((val / 8) * 100, 100);
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                           <div className="w-5 bg-zinc-100 dark:bg-zinc-100 dark:bg-[#09090B] border border-border-custom-light rounded-full h-20 flex items-end overflow-hidden">
                            <div className="w-full bg-[#7C3AED] rounded-full" style={{ height: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-text-custom-secondary">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BMI Index status classifications */}
                <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-text-custom-secondary block uppercase tracking-wider">ATHLETIC BODY INDEX</span>
                    <h3 className="text-sm font-black text-text-custom-primary flex items-center gap-1.5 mb-4 mt-1">
                      <User className="w-4 h-4 text-[#7C3AED]" />
                      <span>BMI Classification Index</span>
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-text-custom-primary tracking-tight">{currentBMI.toFixed(1)}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${bmiColor}`}>{bmiStatus}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border-custom-light">
                    <div className="w-full bg-zinc-100 dark:bg-zinc-100 dark:bg-[#09090B] h-2 rounded-full overflow-hidden flex">
                      <div className="bg-blue-400 h-full" style={{ width: '18.5%' }} />
                      <div className="bg-emerald-400 h-full" style={{ width: '25%' }} />
                      <div className="bg-amber-400 h-full" style={{ width: '30%' }} />
                      <div className="bg-rose-400 h-full" style={{ width: '26.5%' }} />
                    </div>
                    <div className="flex justify-between text-[8px] text-text-custom-secondary font-bold uppercase tracking-widest mt-1.5">
                      <span>UNDER</span><span>HEALTHY</span><span>OVER</span><span>OBESE</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Metric logger form */}
            <div className="lg:col-span-1">
              <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl space-y-5">
                <div>
                  <h3 className="text-base font-bold text-text-custom-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                    <span>Instant Metrics Syncer</span>
                  </h3>
                  <p className="text-xs text-text-custom-secondary mt-1">Directly log base biometrics to keep your records synchronized.</p>
                </div>

                <form onSubmit={handleLogSubmit} className="space-y-4">
                  {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Metric synchronized!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-[#09090B] border border-border-custom p-1 rounded-2xl">
                    {['weight', 'calories', 'water'].map((btn) => (
                      <button
                        key={btn}
                        type="button"
                        onClick={() => setLogType(btn as any)}
                        className={`py-2 text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer ${
                          logType === btn 
                            ? 'bg-[#7C3AED] text-white shadow-md' 
                            : 'text-[#A1A1AA] hover:text-white'
                        }`}
                      >
                        {btn}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                      Value ({logType === 'weight' ? 'kg' : logType === 'calories' ? 'kcal' : 'ml'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={logValue}
                      onChange={(e) => setLogValue(e.target.value)}
                      placeholder={logType === 'weight' ? 'e.g. 78.5' : logType === 'calories' ? 'e.g. 500' : 'e.g. 2500'}
                      className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#7C3AED]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#7C3AED] hover:bg-violet-600 text-white font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-widest cursor-pointer shadow-lg"
                  >
                    SYNC BIOMETRICS
                  </button>
                </form>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: Body Dimension Measurements */}
        {activeTab === 'measurements' && (
          <motion.div
            key="measurements"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Dimensions form logger */}
            <div className="lg:col-span-1 bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl h-fit">
              <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-1.5 mb-2">
                <Layers className="w-5 h-5 text-[#7C3AED]" />
                <span>Dimensions Logger</span>
              </h3>
              <p className="text-xs text-[#A1A1AA] mb-6">Log body circumference measurements (cm) to track hypertrophy splits.</p>

              <form onSubmit={handleMeasurementSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[#A1A1AA] block uppercase">Chest</label>
                    <input type="number" step="0.1" placeholder="cm" value={mChest} onChange={(e) => setMChest(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-mono font-bold text-white rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[#A1A1AA] block uppercase">Waist</label>
                    <input type="number" step="0.1" placeholder="cm" value={mWaist} onChange={(e) => setMWaist(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-mono font-bold text-white rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[#A1A1AA] block uppercase">Arm Right</label>
                    <input type="number" step="0.1" placeholder="cm" value={mArmsRight} onChange={(e) => setMArmsRight(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-mono font-bold text-white rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[#A1A1AA] block uppercase">Arm Left</label>
                    <input type="number" step="0.1" placeholder="cm" value={mArmsLeft} onChange={(e) => setMArmsLeft(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-mono font-bold text-white rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[#A1A1AA] block uppercase">Hips</label>
                    <input type="number" step="0.1" placeholder="cm" value={mHips} onChange={(e) => setMHips(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-mono font-bold text-white rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[#A1A1AA] block uppercase">Thigh Right</label>
                    <input type="number" step="0.1" placeholder="cm" value={mThighsRight} onChange={(e) => setMThighsRight(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-mono font-bold text-white rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[#A1A1AA] block uppercase">Thigh Left</label>
                    <input type="number" step="0.1" placeholder="cm" value={mThighsLeft} onChange={(e) => setMThighsLeft(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-mono font-bold text-white rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[#A1A1AA] block uppercase">Calves</label>
                    <input type="number" step="0.1" placeholder="cm" value={mCalves} onChange={(e) => setMCalves(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-mono font-bold text-white rounded-xl outline-none" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#7C3AED] hover:bg-violet-600 text-white font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-widest cursor-pointer shadow-md mt-4">
                  Commit Measurements
                </button>
              </form>
            </div>

            {/* List history */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-5 h-5 text-[#7C3AED]" />
                <span>Measurements Ledger</span>
              </h3>

              {measurementLogs.length === 0 ? (
                <div className="bg-card-custom border border-border-custom rounded-3xl p-12 text-center">
                  <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest">No dimension entries committed yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {measurementLogs.map((log) => (
                    <div key={log.id} className="bg-card-custom border border-border-custom rounded-2xl p-4.5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <span className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest block">Entry Date</span>
                        <span className="text-xs font-bold text-white">{new Date(log.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center font-mono text-[10px]">
                        {log.chest && <div className="bg-zinc-100 dark:bg-[#09090B] p-2 rounded-xl border border-border-custom-light"><span className="text-[#A1A1AA] block mb-0.5">CHST</span><span className="font-bold text-white">{log.chest}cm</span></div>}
                        {log.waist && <div className="bg-zinc-100 dark:bg-[#09090B] p-2 rounded-xl border border-border-custom-light"><span className="text-[#A1A1AA] block mb-0.5">WST</span><span className="font-bold text-white">{log.waist}cm</span></div>}
                        {log.armsRight && <div className="bg-zinc-100 dark:bg-[#09090B] p-2 rounded-xl border border-border-custom-light"><span className="text-[#A1A1AA] block mb-0.5">AR-R</span><span className="font-bold text-white">{log.armsRight}cm</span></div>}
                        {log.armsLeft && <div className="bg-zinc-100 dark:bg-[#09090B] p-2 rounded-xl border border-border-custom-light"><span className="text-[#A1A1AA] block mb-0.5">AR-L</span><span className="font-bold text-white">{log.armsLeft}cm</span></div>}
                        {log.hips && <div className="bg-zinc-100 dark:bg-[#09090B] p-2 rounded-xl border border-border-custom-light"><span className="text-[#A1A1AA] block mb-0.5">HIPS</span><span className="font-bold text-white">{log.hips}cm</span></div>}
                        {log.thighsRight && <div className="bg-zinc-100 dark:bg-[#09090B] p-2 rounded-xl border border-border-custom-light"><span className="text-[#A1A1AA] block mb-0.5">TH-R</span><span className="font-bold text-white">{log.thighsRight}cm</span></div>}
                        {log.thighsLeft && <div className="bg-zinc-100 dark:bg-[#09090B] p-2 rounded-xl border border-border-custom-light"><span className="text-[#A1A1AA] block mb-0.5">TH-L</span><span className="font-bold text-white">{log.thighsLeft}cm</span></div>}
                        {log.calves && <div className="bg-zinc-100 dark:bg-[#09090B] p-2 rounded-xl border border-border-custom-light"><span className="text-[#A1A1AA] block mb-0.5">CLFS</span><span className="font-bold text-white">{log.calves}cm</span></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: Habits Trackers */}
        {activeTab === 'habits' && (
          <motion.div
            key="habits"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Habit checklist list */}
            <div className="lg:col-span-2 bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl space-y-4">
              <div>
                <span className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest block">DAILY RECURRENCE METRIC</span>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5 mt-1">
                  <Heart className="w-5 h-5 text-indigo-400" />
                  <span>Today's Habit Checklist</span>
                </h3>
              </div>

              <div className="space-y-3">
                {habits.map((h) => {
                  const done = todayStatus.completedHabitIds.includes(h.id);
                  return (
                    <div 
                      key={h.id}
                      onClick={() => handleToggleHabit(h.id)}
                      className={`
                        p-4.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer hover:bg-white/[0.02]
                        ${done 
                          ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]' 
                          : 'bg-zinc-100 dark:bg-[#09090B] border-border-custom text-[#A1A1AA]'
                        }
                      `}
                    >
                      <span className="text-xs font-bold flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-md border flex items-center justify-center ${done ? 'bg-[#22C55E] border-[#22C55E] text-white' : 'border-white/[0.12]'}`}>
                          {done && <Check className="w-3.5 h-3.5 text-black stroke-[3.5]" />}
                        </span>
                        <span className={done ? 'line-through text-[#A1A1AA]' : 'text-white'}>{h.name}</span>
                      </span>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteHabitItem(h.id); }}
                        className="text-[#A1A1AA] hover:text-[#EF4444] p-1.5 rounded hover:bg-[#EF4444]/15 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add custom habits builder form */}
            <div className="lg:col-span-1 bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl h-fit">
              <h3 className="text-base font-bold text-white uppercase tracking-tight mb-2 flex items-center gap-1.5">
                <Sparkle className="w-4 h-4 text-[#7C3AED]" />
                <span>Habit Studio Builder</span>
              </h3>
              <p className="text-xs text-[#A1A1AA] mb-6">Create a daily routine target to build consistent fitness habits.</p>

              <form onSubmit={handleAddHabit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A1A1AA] block uppercase">Habit Title</label>
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="E.g. Take 10,000 steps"
                    className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3.5 py-3 text-xs font-bold text-white rounded-xl outline-none"
                    required
                  />
                </div>

                <button type="submit" className="w-full bg-[#7C3AED] hover:bg-violet-600 text-white font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-widest">
                  Append Habit
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* TAB 4: Sleep Rec recovery index */}
        {activeTab === 'sleep' && (
          <motion.div
            key="sleep"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Sleep log builder */}
            <div className="lg:col-span-1 bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl h-fit">
              <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-1.5 mb-2">
                <Moon className="w-5 h-5 text-indigo-400 animate-bounce" />
                <span>Sleep Logger</span>
              </h3>
              <p className="text-xs text-[#A1A1AA] mb-6">Record your nightly sleep metrics to optimize muscular recovery.</p>

              <form onSubmit={handleSleepSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A1A1AA] block uppercase">Duration (Hours)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={sleepHours} 
                    onChange={(e) => setSleepHours(e.target.value)} 
                    className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-mono font-bold text-white rounded-xl outline-none" 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A1A1AA] block uppercase">Quality Rating</label>
                  <select 
                    value={sleepQuality} 
                    onChange={(e) => setSleepQuality(e.target.value)} 
                    className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-bold text-white rounded-xl outline-none cursor-pointer"
                  >
                    <option value="Poor" className="bg-card-custom">Poor (Restless / Interrupted)</option>
                    <option value="Fair" className="bg-card-custom">Fair (Suboptimal depth)</option>
                    <option value="Good" className="bg-card-custom">Good (Refreshed / Calm)</option>
                    <option value="Excellent" className="bg-card-custom">Excellent (Deep REM / High HRV)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A1A1AA] block uppercase">Notes</label>
                  <input 
                    type="text" 
                    placeholder="Woke up refreshed." 
                    value={sleepNotes} 
                    onChange={(e) => setSleepNotes(e.target.value)} 
                    className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-bold text-white rounded-xl outline-none" 
                  />
                </div>

                <button type="submit" className="w-full bg-[#7C3AED] hover:bg-violet-600 text-white font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-widest">
                  Commit Sleep Log
                </button>
              </form>
            </div>

            {/* Sleep Ledger list */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Moon className="w-5 h-5 text-indigo-400" />
                <span>Sleep History Logs</span>
              </h3>

              {sleepLogs.length === 0 ? (
                <div className="bg-card-custom border border-border-custom rounded-3xl p-12 text-center">
                  <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest">No sleep logs recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sleepLogs.map((log) => (
                    <div key={log.id} className="bg-card-custom border border-border-custom rounded-2xl p-4.5 flex justify-between items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#A1A1AA] block">{new Date(log.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                        {log.notes && <p className="text-xs italic text-[#A1A1AA]">"{log.notes}"</p>}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="bg-zinc-100 dark:bg-[#09090B] border border-border-custom-light px-3.5 py-1.5 text-xs font-bold text-white rounded-lg">
                          {log.hours} Hours
                        </span>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wide ${
                          log.quality === 'Excellent' ? 'bg-emerald-500/15 text-emerald-400' :
                          log.quality === 'Good' ? 'bg-[#7C3AED]/15 text-[#7C3AED]' :
                          log.quality === 'Fair' ? 'bg-amber-500/15 text-amber-400' :
                          'bg-[#EF4444]/15 text-[#EF4444]'
                        }`}>
                          {log.quality}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 5: Interactive Metabolic Calculators */}
        {activeTab === 'calculators' && (
          <motion.div
            key="calculators"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Form settings */}
            <div className="lg:col-span-1 bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl space-y-5 h-fit">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                  <Calculator className="w-5 h-5 text-[#7C3AED]" />
                  <span>Calculators Input</span>
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-1">Configure your metrics to instantly solve metabolic coefficients.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-[#09090B] p-1 border border-border-custom rounded-2xl">
                  <button 
                    onClick={() => setCalcGender('male')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${calcGender === 'male' ? 'bg-[#7C3AED] text-white' : 'text-[#A1A1AA] hover:text-white'}`}
                  >
                    MALE
                  </button>
                  <button 
                    onClick={() => setCalcGender('female')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${calcGender === 'female' ? 'bg-[#7C3AED] text-white' : 'text-[#A1A1AA] hover:text-white'}`}
                  >
                    FEMALE
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#A1A1AA] block uppercase">Age (Years)</label>
                  <input type="number" value={calcAge} onChange={(e) => setCalcAge(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-bold text-white rounded-xl outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[#A1A1AA] block uppercase">Weight (kg)</label>
                    <input type="number" value={calcWeight} onChange={(e) => setCalcWeight(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-bold text-white rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[#A1A1AA] block uppercase">Height (cm)</label>
                    <input type="number" value={calcHeight} onChange={(e) => setCalcHeight(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-bold text-white rounded-xl outline-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#A1A1AA] block uppercase">Fitness Goal Target</label>
                  <select value={calcGoal} onChange={(e: any) => setCalcGoal(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-bold text-white rounded-xl outline-none cursor-pointer">
                    <option value="lose" className="bg-card-custom">Fat Loss Deficit (-500 kcal)</option>
                    <option value="maintain" className="bg-card-custom">Maintenance Equilibrium</option>
                    <option value="gain" className="bg-card-custom">Hypertrophic Surplus (+350 kcal)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#A1A1AA] block uppercase">Activity Factor</label>
                  <select value={calcActivity} onChange={(e) => setCalcActivity(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3 py-2.5 text-xs font-bold text-white rounded-xl outline-none cursor-pointer">
                    <option value="1.2" className="bg-card-custom">Sedentary (Office job, 0 training)</option>
                    <option value="1.375" className="bg-card-custom">Light Training (1-3 days/week)</option>
                    <option value="1.55" className="bg-card-custom">Moderate Training (3-5 days/week)</option>
                    <option value="1.725" className="bg-card-custom">Heavy Athlete (6-7 days intense splits)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Calculations results */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* BMR card */}
                <div className="bg-card-custom border border-border-custom rounded-3xl p-5 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-[#A1A1AA] block uppercase tracking-wider">BASAL METABOLIC RATE (BMR)</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-3xl font-black text-[#7C3AED] tracking-tight">{Math.round(calculatedBMR)}</span>
                    <span className="text-xs text-[#A1A1AA]">kcal/day</span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed mt-2 font-medium">
                    This represents your resting caloric energy burn in a complete fast.
                  </p>
                </div>

                {/* BMI card */}
                <div className="bg-card-custom border border-border-custom rounded-3xl p-5 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-[#A1A1AA] block uppercase tracking-wider">BODY MASS INDEX (BMI)</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-3xl font-black text-violet-400 tracking-tight">{calculatedBMI.toFixed(1)}</span>
                    <span className="text-xs text-[#A1A1AA]">index</span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed mt-2 font-medium">
                    Standard biometric classification ratio of body density.
                  </p>
                </div>

              </div>

              {/* Macro breakdown percentage bars */}
              <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-border-custom-light gap-2">
                  <div>
                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block">TARGET TDEE OUTLET</span>
                    <h3 className="text-base font-black text-white uppercase tracking-tight mt-1">Daily Caloric Target</h3>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-orange-400 tracking-tight">{Math.round(targetCalories)}</span>
                    <span className="text-xs text-[#A1A1AA]">kcal/day</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest block">Macromolecules Target splits</span>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-zinc-100 dark:bg-[#09090B] p-4 rounded-2xl text-center space-y-1 border border-border-custom-light">
                      <span className="text-[10px] text-[#A1A1AA] font-bold block">PROTEIN (30%)</span>
                      <span className="text-2xl font-black text-rose-500 block mt-1">{pTargetGram}g</span>
                      <span className="text-[9px] text-[#A1A1AA] font-mono block">{pTargetGram * 4} kcal</span>
                    </div>

                    <div className="bg-zinc-100 dark:bg-[#09090B] p-4 rounded-2xl text-center space-y-1 border border-border-custom-light">
                      <span className="text-[10px] text-[#A1A1AA] font-bold block">CARBS (45%)</span>
                      <span className="text-2xl font-black text-emerald-500 block mt-1">{cTargetGram}g</span>
                      <span className="text-[9px] text-[#A1A1AA] font-mono block">{cTargetGram * 4} kcal</span>
                    </div>

                    <div className="bg-zinc-100 dark:bg-[#09090B] p-4 rounded-2xl text-center space-y-1 border border-border-custom-light">
                      <span className="text-[10px] text-[#A1A1AA] font-bold block">FATS (25%)</span>
                      <span className="text-2xl font-black text-amber-500 block mt-1">{fTargetGram}g</span>
                      <span className="text-[9px] text-[#A1A1AA] font-mono block">{fTargetGram * 9} kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 6: Personal Records Trophies Hall */}
        {activeTab === 'records' && (
          <motion.div
            key="records"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Form logger */}
            <div className="lg:col-span-1 bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl h-fit">
              <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-1.5 mb-2">
                <Award className="w-5 h-5 text-[#7C3AED]" />
                <span>Log Personal Best</span>
              </h3>
              <p className="text-xs text-[#A1A1AA] mb-6">Enter your ultimate compound rep counts to compute your Epley 1RM.</p>

              <form onSubmit={handlePRSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A1A1AA] block uppercase">Exercise Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Deadlift" 
                    value={prExercise} 
                    onChange={(e) => setPrExercise(e.target.value)} 
                    className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3.5 py-3 text-xs font-bold text-white rounded-xl outline-none" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#A1A1AA] block uppercase">Weight (kg)</label>
                    <input 
                      type="number" 
                      placeholder="kg" 
                      value={prWeight} 
                      onChange={(e) => setPrWeight(e.target.value)} 
                      className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3.5 py-3 text-xs font-mono font-bold text-white rounded-xl outline-none" 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#A1A1AA] block uppercase">Reps Count</label>
                    <input 
                      type="number" 
                      value={prReps} 
                      onChange={(e) => setPrReps(e.target.value)} 
                      className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3.5 py-3 text-xs font-mono font-bold text-white rounded-xl outline-none" 
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#7C3AED] hover:bg-violet-600 text-white font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-widest">
                  Commit Personal Record
                </button>
              </form>
            </div>

            {/* List trophies */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-5 h-5 text-[#7C3AED] animate-bounce" />
                <span>Personal Best Records Ledger</span>
              </h3>

              {personalRecords.length === 0 ? (
                <div className="bg-card-custom border border-border-custom rounded-3xl p-12 text-center">
                  <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest">No Personal Records entered yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personalRecords.map((rec) => (
                    <div key={rec.id} className="bg-card-custom border border-border-custom rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 text-[#7C3AED] opacity-10 group-hover:opacity-25 transition-opacity pointer-events-none">
                        <Award className="w-16 h-16" />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-[#7C3AED] uppercase tracking-widest block">{rec.date}</span>
                        <h4 className="text-base font-black text-white uppercase tracking-tight truncate max-w-[200px] mt-1">{rec.exerciseName}</h4>
                        <p className="text-xs text-[#A1A1AA] font-semibold mt-1">Rep Best: {rec.weight} kg x {rec.reps} reps</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border-custom-light flex justify-between items-center">
                        <span className="text-[10px] font-bold text-[#A1A1AA] uppercase">Calculated 1RM</span>
                        <span className="text-lg font-black text-[#7C3AED]">{rec.calculated1RM} kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 7: Progress Photos (Aesthetic Athlete Gallery) */}
        {activeTab === 'photos' && (
          <motion.div
            key="photos"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Column: Form Uploader */}
            <div className="lg:col-span-1 bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl h-fit">
              <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-1.5 mb-2">
                <Camera className="w-5 h-5 text-[#7C3AED]" />
                <span>Add Progress Photo</span>
              </h3>
              <p className="text-xs text-[#A1A1AA] mb-6">Log physical conditioning milestones to visually compare hypertrophic adaptations.</p>

              <form onSubmit={handlePhotoSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A1A1AA] block uppercase">Image URL</label>
                  <input 
                    type="url" 
                    placeholder="Enter image web URL" 
                    value={photoUrl} 
                    onChange={(e) => setPhotoUrl(e.target.value)} 
                    className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3.5 py-3 text-xs font-bold text-white rounded-xl outline-none" 
                    required 
                  />
                </div>

                {/* Preset helpers */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-[#A1A1AA] uppercase">Or Use Model Seed Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop')}
                      className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[9px] font-bold text-white rounded-lg border border-border-custom-light cursor-pointer"
                    >
                      Gym Split
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop')}
                      className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[9px] font-bold text-white rounded-lg border border-border-custom-light cursor-pointer"
                    >
                      Athletic Run
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop')}
                      className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[9px] font-bold text-white rounded-lg border border-border-custom-light cursor-pointer"
                    >
                      Weight Lift
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A1A1AA] block uppercase">Date Taken</label>
                  <input 
                    type="date" 
                    value={photoDate} 
                    onChange={(e) => setPhotoDate(e.target.value)} 
                    className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3.5 py-3 text-xs font-bold text-white rounded-xl outline-none" 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A1A1AA] block uppercase">Caption / Muscle focus</label>
                  <textarea 
                    placeholder="Focus: chest fibers split, quad separation, lower back strength." 
                    value={photoCaption} 
                    onChange={(e) => setPhotoCaption(e.target.value)} 
                    className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3.5 py-3 text-xs font-bold text-white rounded-xl outline-none h-20 resize-none" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={photoSyncing}
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                >
                  {photoSyncing ? 'Syncing Photo...' : 'Save Gallery Image'}
                </button>
              </form>
            </div>

            {/* Right Column: Gallery list */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-5 h-5 text-[#7C3AED]" />
                <span>Athlete Conditioning Dossier</span>
              </h3>

              {(() => {
                const photosToRender = profile?.progressPhotos && profile.progressPhotos.length > 0 
                  ? profile.progressPhotos 
                  : DEFAULT_PHOTOS;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {photosToRender.map((pic) => (
                      <div key={pic.id} className="bg-card-custom border border-border-custom rounded-3xl overflow-hidden shadow-2xl flex flex-col group relative">
                        <div className="h-48 w-full overflow-hidden bg-black relative">
                          <img 
                            src={pic.url} 
                            alt={pic.caption || "Progress shot"} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/35 flex flex-col justify-between p-4">
                            <span className="bg-black/45 backdrop-blur-md px-2.5 py-1 text-[9px] font-black text-[#7C3AED] rounded-md tracking-wider uppercase self-start border border-border-custom-light">
                              {pic.date}
                            </span>
                            
                            <button
                              onClick={() => handleDeletePhoto(pic.id)}
                              className="self-end p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                              title="Delete photo reference"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {pic.caption && (
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <p className="text-xs text-[#A1A1AA] leading-relaxed italic">"{pic.caption}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}

        {/* TAB 8: Interactive Goal Tracker (Unified Biometrics Dashboard) */}
        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Quick Goals Log Card */}
            <div className="lg:col-span-1 bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl h-fit">
              <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-1.5 mb-2">
                <Target className="w-5 h-5 text-[#7C3AED]" />
                <span>Adjust Target Goals</span>
              </h3>
              <p className="text-xs text-[#A1A1AA] mb-6">Instantly adjust your athletic profiles for real-time validation inside progress meters.</p>

              {/* Adjust targets form */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A1A1AA] block uppercase">Daily Hydration Goal (ml)</label>
                  <input 
                    type="number" 
                    value={profile?.waterIntakeGoal || 2500} 
                    onChange={async (e) => {
                      if (!profile) return;
                      await updateUserProfile(profile.uid, { waterIntakeGoal: parseInt(e.target.value, 10) || 2500 });
                      await refreshProfile();
                    }}
                    className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3.5 py-3 text-xs font-mono font-bold text-white rounded-xl outline-none" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A1A1AA] block uppercase">Calories Burned Goal (kcal)</label>
                  <input 
                    type="number" 
                    value={profile?.caloriesBurnedGoal || 600} 
                    onChange={async (e) => {
                      if (!profile) return;
                      await updateUserProfile(profile.uid, { caloriesBurnedGoal: parseInt(e.target.value, 10) || 600 });
                      await refreshProfile();
                    }}
                    className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3.5 py-3 text-xs font-mono font-bold text-white rounded-xl outline-none" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A1A1AA] block uppercase">Daily Workout Goal (Mins)</label>
                  <input 
                    type="number" 
                    value={profile?.workoutDurationGoal || 45} 
                    onChange={async (e) => {
                      if (!profile) return;
                      await updateUserProfile(profile.uid, { workoutDurationGoal: parseInt(e.target.value, 10) || 45 });
                      await refreshProfile();
                    }}
                    className="w-full bg-zinc-100 dark:bg-[#09090B] border border-border-custom px-3.5 py-3 text-xs font-mono font-bold text-white rounded-xl outline-none" 
                  />
                </div>

                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-border-custom-light text-[10px] font-semibold text-[#A1A1AA] uppercase leading-relaxed">
                  💡 Updates made here automatically sync to your global Athlete profile settings.
                </div>
              </div>
            </div>

            {/* Goals metrics panel */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-5 h-5 text-[#7C3AED]" />
                <span>Validation Ring Meters</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Hydration Target */}
                <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest block">HYDRATION TRACKER</span>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mt-1">Water Hydration Intake</h4>
                    </div>
                    <Droplet className="w-5 h-5 text-sky-400" />
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-[#A1A1AA]">Current: {latestWater} ml</span>
                      <span className="text-sky-400">Target: {profile?.waterIntakeGoal || 2500} ml</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-[#09090B] rounded-full overflow-hidden border border-white/[0.02]">
                      <div 
                        className="h-full bg-sky-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (latestWater / (profile?.waterIntakeGoal || 2500)) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-[#A1A1AA] mt-1 font-bold">
                      <span>{Math.round((latestWater / (profile?.waterIntakeGoal || 2500)) * 100)}% COMPLETED</span>
                      
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!profile) return;
                            const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            const currentHist = profile.waterHistory || [];
                            const updatedHist = [...currentHist, { date: today, value: latestWater + 250 }];
                            await updateUserProfile(profile.uid, { waterHistory: updatedHist });
                            await refreshProfile();
                          }}
                          className="px-2 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-500/20 text-[9px] font-bold text-sky-400 rounded-lg cursor-pointer transition-all"
                        >
                          +250ml
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!profile) return;
                            const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            const currentHist = profile.waterHistory || [];
                            const updatedHist = [...currentHist, { date: today, value: latestWater + 500 }];
                            await updateUserProfile(profile.uid, { waterHistory: updatedHist });
                            await refreshProfile();
                          }}
                          className="px-2 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-500/20 text-[9px] font-bold text-sky-400 rounded-lg cursor-pointer transition-all"
                        >
                          +500ml
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Calories burned Tracker */}
                <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">ENERGY EXPENDITURE</span>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mt-1">Active Calories Burned</h4>
                    </div>
                    <Flame className="w-5 h-5 text-emerald-400" />
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-[#A1A1AA]">Current: {latestCalories} kcal</span>
                      <span className="text-emerald-400">Target: {profile?.caloriesBurnedGoal || 600} kcal</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-[#09090B] rounded-full overflow-hidden border border-white/[0.02]">
                      <div 
                        className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (latestCalories / (profile?.caloriesBurnedGoal || 600)) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#A1A1AA] mt-1 font-bold">
                      {Math.round((latestCalories / (profile?.caloriesBurnedGoal || 600)) * 100)}% OF DAILY TARGET EXPENDITURE
                    </p>
                  </div>
                </div>

                {/* 3. Sleep Tracker Hours */}
                <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">RECOVERY HYPNOS</span>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mt-1">Nightly Sleep Target</h4>
                    </div>
                    <Moon className="w-5 h-5 text-indigo-400" />
                  </div>

                  {(() => {
                    const latestSleep = sleepLogs.length > 0 ? sleepLogs[0].hours : 7.5;
                    const sleepPercentage = Math.round((latestSleep / 8) * 100);
                    return (
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-xs font-mono font-bold">
                          <span className="text-[#A1A1AA]">Last Sleep: {latestSleep} hrs</span>
                          <span className="text-indigo-400">Standard: 8 hrs</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 dark:bg-[#09090B] rounded-full overflow-hidden border border-white/[0.02]">
                          <div 
                            className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (latestSleep / 8) * 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-[#A1A1AA] mt-1 font-bold">
                          {sleepPercentage}% OF OPTIMAL BIOMETRIC RECOVERY
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* 4. Habits completion rate */}
                <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block">HABIT ADAPTION</span>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mt-1">Habits Mastery Rate</h4>
                    </div>
                    <Check className="w-5 h-5 text-amber-400" />
                  </div>

                  {(() => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const todayStatus = habitStatuses.find(s => s.id === todayStr);
                    const completedCount = todayStatus?.completedHabitIds?.length || 0;
                    const totalCount = habits.length || 1;
                    const completionPercentage = Math.round((completedCount / totalCount) * 100);
                    return (
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-xs font-mono font-bold">
                          <span className="text-[#A1A1AA]">Done: {completedCount}/{totalCount}</span>
                          <span className="text-amber-400">Streak Level: {profile?.streak || 3} days</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 dark:bg-[#09090B] rounded-full overflow-hidden border border-white/[0.02]">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, completionPercentage)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-[#A1A1AA] mt-1 font-bold">
                          {completionPercentage}% DAILY HABITS SUCCESS RATE
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
