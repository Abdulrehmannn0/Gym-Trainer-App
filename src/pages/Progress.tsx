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
  Sparkle
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

export const Progress: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  
  // Tabs: 'analytics' | 'measurements' | 'habits' | 'sleep' | 'calculators' | 'records'
  const [activeTab, setActiveTab] = useState<'analytics' | 'measurements' | 'habits' | 'sleep' | 'calculators' | 'records'>('analytics');
  
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
  const currentHeightMeters = (profile?.height || 178) / 100;
  const currentBMI = latestWeight / (currentHeightMeters * currentHeightMeters);
  
  const bmiStatus = currentBMI < 18.5 ? 'Underweight' :
                    currentBMI < 25 ? 'Healthy Weight' :
                    currentBMI < 30 ? 'Overweight' : 'Obese';

  const bmiColor = currentBMI < 18.5 ? 'text-blue-500' :
                   currentBMI < 25 ? 'text-emerald-500' :
                   currentBMI < 30 ? 'text-amber-500' : 'text-rose-500';

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
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-violet-500 animate-pulse" />
            <span>Biometric Analytics & Progress</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Check body dimension logs, monitor sleep patterns, toggle habit streaks, and access metabolic calculators.
          </p>
        </div>

        {/* Tab Selection Switch */}
        <div className="flex p-1 bg-zinc-200/60 dark:bg-zinc-900/60 border border-zinc-300/20 rounded-2xl gap-1 self-start md:self-auto shrink-0 overflow-x-auto max-w-full">
          {[
            { id: 'analytics', label: 'Analytics' },
            { id: 'measurements', label: 'Body Stats' },
            { id: 'habits', label: 'Daily Habits' },
            { id: 'sleep', label: 'Sleep Tracker' },
            { id: 'calculators', label: 'Calculators' },
            { id: 'records', label: 'PR Hall' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* TAB 1: Analytics & Charts */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Charts Panel */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Weight chart */}
              <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 block uppercase tracking-wider">ATHLETE WEIGHT GRAPH</span>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-emerald-500" />
                      <span>Weight Progression (kg)</span>
                    </h3>
                  </div>
                  <span className="text-xl font-black text-emerald-500 tracking-tight">{latestWeight.toFixed(1)} <span className="text-xs font-normal">kg</span></span>
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
                  <div className="flex justify-between text-[10px] text-zinc-400 font-bold tracking-widest uppercase mt-3">
                    {weightData.map((w, idx) => (
                      <span key={idx}>{w.date}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calories Chart */}
              <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 block uppercase tracking-wider">CALORIE INCINERATOR INDEX</span>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>Calories Burned History (kcal)</span>
                    </h3>
                  </div>
                  <span className="text-xl font-black text-orange-500 tracking-tight">
                    {caloriesData[caloriesData.length - 1]?.value || 0} <span className="text-xs font-normal">kcal</span>
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
                  <div className="flex justify-between text-[10px] text-zinc-400 font-bold tracking-widest uppercase mt-3">
                    {caloriesData.map((c, idx) => (
                      <span key={idx}>{c.date}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workout frequency and BMI Gauge row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 block uppercase tracking-wider">WEEKLY SPLIT FREQUENCY</span>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4 text-indigo-500" />
                      <span>Workout Frequency</span>
                    </h3>
                  </div>

                  <div className="flex justify-between items-end h-28 pt-4">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                      const val = frequencyData[idx] || 0;
                      const pct = Math.min((val / 8) * 100, 100);
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                          <div className="w-5 bg-zinc-100 dark:bg-zinc-850 rounded-full h-20 flex items-end overflow-hidden">
                            <div className="w-full bg-indigo-500 rounded-full" style={{ height: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-zinc-400">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BMI Index Status card */}
                <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 block uppercase tracking-wider">ATHLETIC BODY INDEX</span>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 mb-4">
                      <User className="w-4 h-4 text-violet-500" />
                      <span>BMI Classification Index</span>
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{currentBMI.toFixed(1)}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${bmiColor}`}>{bmiStatus}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                      <div className="bg-blue-400 h-full" style={{ width: '18.5%' }} />
                      <div className="bg-emerald-400 h-full" style={{ width: '25%' }} />
                      <div className="bg-amber-400 h-full" style={{ width: '30%' }} />
                      <div className="bg-rose-400 h-full" style={{ width: '26.5%' }} />
                    </div>
                    <div className="flex justify-between text-[8px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                      <span>UNDER</span><span>HEALTHY</span><span>OVER</span><span>OBESE</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Quick Log simple biometrics form */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <span>Instant Metrics Syncer</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">Directly log base biometrics to keep your records synchronized.</p>
                </div>

                <form onSubmit={handleLogSubmit} className="space-y-4">
                  {success && (
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Metric synchronized!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-1">
                    {['weight', 'calories', 'water'].map((btn) => (
                      <button
                        key={btn}
                        type="button"
                        onClick={() => setLogType(btn as any)}
                        className={`py-2 text-[10px] font-black uppercase rounded-xl border transition-all cursor-pointer ${
                          logType === btn 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                            : 'bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100'
                        }`}
                      >
                        {btn}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Value ({logType === 'weight' ? 'kg' : logType === 'calories' ? 'kcal' : 'ml'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={logValue}
                      onChange={(e) => setLogValue(e.target.value)}
                      placeholder={logType === 'weight' ? 'e.g. 78.5' : logType === 'calories' ? 'e.g. 500' : 'e.g. 2500'}
                      className="w-full bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-zinc-900 dark:text-white outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-indigo-600/10"
                  >
                    SYNC BIOMETRICS
                  </button>
                </form>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: Body Stats Measurements */}
        {activeTab === 'measurements' && (
          <motion.div
            key="measurements"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Form logger */}
            <div className="lg:col-span-1 bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm h-fit">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5 mb-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                <span>Dimensions Logger</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-6">Log body circumference measurements (cm) to track hypertrophy.</p>

              <form onSubmit={handleMeasurementSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 block uppercase">Chest</label>
                    <input type="number" step="0.1" placeholder="cm" value={mChest} onChange={(e) => setMChest(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-white rounded-lg outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 block uppercase">Waist</label>
                    <input type="number" step="0.1" placeholder="cm" value={mWaist} onChange={(e) => setMWaist(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-white rounded-lg outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 block uppercase">Arm Right</label>
                    <input type="number" step="0.1" placeholder="cm" value={mArmsRight} onChange={(e) => setMArmsRight(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-white rounded-lg outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 block uppercase">Arm Left</label>
                    <input type="number" step="0.1" placeholder="cm" value={mArmsLeft} onChange={(e) => setMArmsLeft(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-white rounded-lg outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 block uppercase">Hips</label>
                    <input type="number" step="0.1" placeholder="cm" value={mHips} onChange={(e) => setMHips(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-white rounded-lg outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 block uppercase">Thigh Right</label>
                    <input type="number" step="0.1" placeholder="cm" value={mThighsRight} onChange={(e) => setMThighsRight(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-white rounded-lg outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 block uppercase">Thigh Left</label>
                    <input type="number" step="0.1" placeholder="cm" value={mThighsLeft} onChange={(e) => setMThighsLeft(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-white rounded-lg outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 block uppercase">Calves</label>
                    <input type="number" step="0.1" placeholder="cm" value={mCalves} onChange={(e) => setMCalves(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-white rounded-lg outline-none" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest cursor-pointer shadow-md">
                  Commit Measurements
                </button>
              </form>
            </div>

            {/* List history */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-5 h-5 text-indigo-500" />
                <span>Measurements Ledger</span>
              </h3>

              {measurementLogs.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-10 text-center">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">No dimension entries committed yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {measurementLogs.map((log) => (
                    <div key={log.id} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Entry Date</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{new Date(log.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 text-center font-mono text-[10px]">
                        {log.chest && <div className="bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-lg border border-zinc-200/40 dark:border-zinc-850"><span className="text-zinc-400 block">CHST</span><span className="font-bold text-zinc-900 dark:text-white">{log.chest}cm</span></div>}
                        {log.waist && <div className="bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-lg border border-zinc-200/40 dark:border-zinc-850"><span className="text-zinc-400 block">WST</span><span className="font-bold text-zinc-900 dark:text-white">{log.waist}cm</span></div>}
                        {log.armsRight && <div className="bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-lg border border-zinc-200/40 dark:border-zinc-850"><span className="text-zinc-400 block">AR-R</span><span className="font-bold text-zinc-900 dark:text-white">{log.armsRight}cm</span></div>}
                        {log.armsLeft && <div className="bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-lg border border-zinc-200/40 dark:border-zinc-850"><span className="text-zinc-400 block">AR-L</span><span className="font-bold text-zinc-900 dark:text-white">{log.armsLeft}cm</span></div>}
                        {log.hips && <div className="bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-lg border border-zinc-200/40 dark:border-zinc-850"><span className="text-zinc-400 block">HIPS</span><span className="font-bold text-zinc-900 dark:text-white">{log.hips}cm</span></div>}
                        {log.thighsRight && <div className="bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-lg border border-zinc-200/40 dark:border-zinc-850"><span className="text-zinc-400 block">TH-R</span><span className="font-bold text-zinc-900 dark:text-white">{log.thighsRight}cm</span></div>}
                        {log.thighsLeft && <div className="bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-lg border border-zinc-200/40 dark:border-zinc-850"><span className="text-zinc-400 block">TH-L</span><span className="font-bold text-zinc-900 dark:text-white">{log.thighsLeft}cm</span></div>}
                        {log.calves && <div className="bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-lg border border-zinc-200/40 dark:border-zinc-850"><span className="text-zinc-400 block">CLFS</span><span className="font-bold text-zinc-900 dark:text-white">{log.calves}cm</span></div>}
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
            {/* Habit Checklist interactive */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">DAILY RECURRENCE METRIC</span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Heart className="w-5 h-5 text-indigo-500" />
                  <span>Today's Habit Checklist</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                {habits.map((h) => {
                  const done = todayStatus.completedHabitIds.includes(h.id);
                  return (
                    <div 
                      key={h.id}
                      onClick={() => handleToggleHabit(h.id)}
                      className={`
                        p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-850/50
                        ${done 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                        }
                      `}
                    >
                      <span className="text-xs font-bold flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-md border flex items-center justify-center ${done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
                          {done && <Check className="w-3.5 h-3.5" />}
                        </span>
                        <span>{h.name}</span>
                      </span>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteHabitItem(h.id); }}
                        className="text-zinc-400 hover:text-rose-500 p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add new custom habits form */}
            <div className="lg:col-span-1 bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm h-fit">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-tight mb-2 flex items-center gap-1.5">
                <Sparkle className="w-4 h-4 text-indigo-500" />
                <span>Habit Studio Builder</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-6">Create a daily routine target to build consistent fitness habits.</p>

              <form onSubmit={handleAddHabit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 block uppercase">Habit Title</label>
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="E.g. Take 10,000 steps"
                    className="w-full bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 px-3.5 py-3 text-xs font-bold text-zinc-900 dark:text-white rounded-xl outline-none"
                    required
                  />
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-widest shadow-md">
                  Append Habit
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* TAB 4: Sleep Tracker */}
        {activeTab === 'sleep' && (
          <motion.div
            key="sleep"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Sleep logger form */}
            <div className="lg:col-span-1 bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm h-fit">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5 mb-2">
                <Moon className="w-5 h-5 text-indigo-400" />
                <span>Sleep Logger</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-6">Record your nightly sleep metrics to optimize muscular recovery.</p>

              <form onSubmit={handleSleepSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 block uppercase">Duration (Hours)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={sleepHours} 
                    onChange={(e) => setSleepHours(e.target.value)} 
                    className="w-full bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 px-3 py-2.5 text-xs font-mono font-bold text-zinc-900 dark:text-white rounded-xl outline-none" 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 block uppercase">Quality Rating</label>
                  <select 
                    value={sleepQuality} 
                    onChange={(e) => setSleepQuality(e.target.value)} 
                    className="w-full bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 px-3 py-2.5 text-xs font-bold text-zinc-900 dark:text-white rounded-xl outline-none cursor-pointer"
                  >
                    <option value="Poor">Poor (Restless / Interrupted)</option>
                    <option value="Fair">Fair (Suboptimal depth)</option>
                    <option value="Good">Good (Refreshed / Calm)</option>
                    <option value="Excellent">Excellent (Deep REM / High HRV)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 block uppercase">Notes / Dreams</label>
                  <input 
                    type="text" 
                    placeholder="Had some vivid dreams, woke up flat." 
                    value={sleepNotes} 
                    onChange={(e) => setSleepNotes(e.target.value)} 
                    className="w-full bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 px-3 py-2.5 text-xs font-bold text-zinc-900 dark:text-white rounded-xl outline-none" 
                  />
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-widest shadow-md">
                  Commit Sleep Log
                </button>
              </form>
            </div>

            {/* Sleep Ledger */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Moon className="w-5 h-5 text-indigo-400" />
                <span>Sleep History Logs</span>
              </h3>

              {sleepLogs.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-10 text-center">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">No sleep logs recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sleepLogs.map((log) => (
                    <div key={log.id} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex justify-between items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 block">{new Date(log.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                        {log.notes && <p className="text-xs italic text-zinc-500">"{log.notes}"</p>}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 border border-zinc-200/30 dark:border-zinc-850 text-xs font-bold text-zinc-800 dark:text-zinc-200 rounded-lg">
                          {log.hours} Hours
                        </span>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wide ${
                          log.quality === 'Excellent' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          log.quality === 'Good' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
                          log.quality === 'Fair' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                          'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
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

        {/* TAB 5: Interactive Calculators */}
        {activeTab === 'calculators' && (
          <motion.div
            key="calculators"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Input Form Panel */}
            <div className="lg:col-span-1 bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-5 h-fit">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                  <Calculator className="w-5 h-5 text-indigo-500" />
                  <span>Calculators Input</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Configure your metrics to instantly solve metabolic coefficients.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setCalcGender('male')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${calcGender === 'male' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500'}`}
                  >
                    MALE
                  </button>
                  <button 
                    onClick={() => setCalcGender('female')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${calcGender === 'female' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500'}`}
                  >
                    FEMALE
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 block uppercase">Age (Years)</label>
                  <input type="number" value={calcAge} onChange={(e) => setCalcAge(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 px-3 py-2.5 text-xs font-bold text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-850 rounded-xl outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-400 block uppercase">Weight (kg)</label>
                    <input type="number" value={calcWeight} onChange={(e) => setCalcWeight(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 px-3 py-2.5 text-xs font-bold text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-850 rounded-xl outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-400 block uppercase">Height (cm)</label>
                    <input type="number" value={calcHeight} onChange={(e) => setCalcHeight(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 px-3 py-2.5 text-xs font-bold text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-850 rounded-xl outline-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 block uppercase">Fitness Goal Target</label>
                  <select value={calcGoal} onChange={(e: any) => setCalcGoal(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 px-3 py-2.5 text-xs font-bold text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-850 rounded-xl outline-none cursor-pointer">
                    <option value="lose">Fat Loss Deficit (-500 kcal)</option>
                    <option value="maintain">Maintenance Equilibrium</option>
                    <option value="gain">Hypertrophic Surplus (+350 kcal)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 block uppercase">Activity Factor</label>
                  <select value={calcActivity} onChange={(e) => setCalcActivity(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 px-3 py-2.5 text-xs font-bold text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-850 rounded-xl outline-none cursor-pointer">
                    <option value="1.2">Sedentary (Office job, 0 training)</option>
                    <option value="1.375">Light Training (1-3 days/week)</option>
                    <option value="1.55">Moderate Training (3-5 days/week)</option>
                    <option value="1.725">Heavy Athlete (6-7 days intense splits)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Calculations Result output panels */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* BMR card */}
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">BASAL METABOLIC RATE (BMR)</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-indigo-500 tracking-tight">{Math.round(calculatedBMR)}</span>
                    <span className="text-xs text-zinc-400">kcal/day</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    This represents your resting caloric energy burn in a complete fast.
                  </p>
                </div>

                {/* BMI card */}
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">BODY MASS INDEX (BMI)</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-violet-500 tracking-tight">{calculatedBMI.toFixed(1)}</span>
                    <span className="text-xs text-zinc-400">index</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Standard biometric classification ratio of body density.
                  </p>
                </div>

              </div>

              {/* Maintenance & macro target cards combined */}
              <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-zinc-100 dark:border-zinc-850 gap-2">
                  <div>
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block">TARGET TDEE OUTLET</span>
                    <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight">Daily Caloric Target</h3>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-orange-500 tracking-tight">{Math.round(targetCalories)}</span>
                    <span className="text-xs text-zinc-400">kcal/day</span>
                  </div>
                </div>

                {/* Macromolecules breakdown percentage grids */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Macromolecules Target splits</span>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl text-center space-y-1 border border-zinc-200/40 dark:border-zinc-850">
                      <span className="text-xs text-zinc-400 block">PROTEIN (30%)</span>
                      <span className="text-2xl font-black text-rose-500 block">{pTargetGram}g</span>
                      <span className="text-[10px] text-zinc-400 font-bold block">{pTargetGram * 4} kcal</span>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl text-center space-y-1 border border-zinc-200/40 dark:border-zinc-850">
                      <span className="text-xs text-zinc-400 block">CARBS (45%)</span>
                      <span className="text-2xl font-black text-emerald-500 block">{cTargetGram}g</span>
                      <span className="text-[10px] text-zinc-400 font-bold block">{cTargetGram * 4} kcal</span>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl text-center space-y-1 border border-zinc-200/40 dark:border-zinc-850">
                      <span className="text-xs text-zinc-400 block">FATS (25%)</span>
                      <span className="text-2xl font-black text-amber-500 block">{fTargetGram}g</span>
                      <span className="text-[10px] text-zinc-400 font-bold block">{fTargetGram * 9} kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 6: Personal Records Hall */}
        {activeTab === 'records' && (
          <motion.div
            key="records"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* PR Logger Form */}
            <div className="lg:col-span-1 bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm h-fit">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5 mb-2">
                <Award className="w-5 h-5 text-indigo-500" />
                <span>Log Personal Best</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-6">Enter your ultimate compound rep counts to compute your Epley 1RM.</p>

              <form onSubmit={handlePRSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 block uppercase">Exercise Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Deadlift" 
                    value={prExercise} 
                    onChange={(e) => setPrExercise(e.target.value)} 
                    className="w-full bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 px-3.5 py-3 text-xs font-bold text-zinc-900 dark:text-white rounded-xl outline-none" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">Weight (kg)</label>
                    <input 
                      type="number" 
                      placeholder="kg" 
                      value={prWeight} 
                      onChange={(e) => setPrWeight(e.target.value)} 
                      className="w-full bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 px-3.5 py-3 text-xs font-mono font-bold text-zinc-900 dark:text-white rounded-xl outline-none" 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">Reps Count</label>
                    <input 
                      type="number" 
                      value={prReps} 
                      onChange={(e) => setPrReps(e.target.value)} 
                      className="w-full bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 px-3.5 py-3 text-xs font-mono font-bold text-zinc-900 dark:text-white rounded-xl outline-none" 
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-[10px] uppercase tracking-widest shadow-md">
                  Commit Personal Record
                </button>
              </form>
            </div>

            {/* List personal records trophies */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-5 h-5 text-indigo-500 animate-bounce" />
                <span>Personal Best Records Ledger</span>
              </h3>

              {personalRecords.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-10 text-center">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">No Personal Records entered yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personalRecords.map((rec) => (
                    <div key={rec.id} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 text-indigo-500 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Award className="w-16 h-16" />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">{rec.date}</span>
                        <h4 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate max-w-[200px]">{rec.exerciseName}</h4>
                        <p className="text-xs text-zinc-400 font-semibold">Rep Best: {rec.weight} kg x {rec.reps} reps</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-850 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Calculated 1RM</span>
                        <span className="text-lg font-black text-indigo-500">{rec.calculated1RM} kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
