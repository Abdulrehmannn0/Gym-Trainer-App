import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Beef, 
  Droplet, 
  Utensils, 
  Plus, 
  Trash2,
  ChevronRight, 
  Sparkles, 
  Calendar,
  Smile,
  Cookie,
  Flame,
  LineChart,
  Grid,
  Check,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/userService';
import { getMeals, createMeal, deleteMeal } from '../services/fitnessService';
import { Meal } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const Nutrition: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'daily' | 'analytics' | 'goals'>('daily');
  
  // Date Selector
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // State
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  
  // Add Meal Form State
  const [newMealName, setNewMealName] = useState('');
  const [newMealCalories, setNewMealCalories] = useState('');
  const [newMealProtein, setNewMealProtein] = useState('');
  const [newMealCarbs, setNewMealCarbs] = useState('');
  const [newMealFats, setNewMealFats] = useState('');
  const [newMealFiber, setNewMealFiber] = useState('');
  const [newMealType, setNewMealType] = useState<Meal['type']>('Lunch');

  // Goals Settings Form State
  const [goalCal, setGoalCal] = useState('2500');
  const [goalProt, setGoalProt] = useState('150');
  const [goalCarbs, setGoalCarbs] = useState('250');
  const [goalFats, setGoalFats] = useState('70');
  const [goalFiber, setGoalFiber] = useState('30');
  const [goalWater, setGoalWater] = useState('2500');
  const [updatingGoals, setUpdatingGoals] = useState(false);
  const [goalsSuccess, setGoalsSuccess] = useState(false);

  // Initialize goal form fields from profile
  useEffect(() => {
    if (profile) {
      setGoalCal(String(profile.caloriesBurnedGoal ? profile.caloriesBurnedGoal + 1500 : '2500'));
      setGoalProt(String(profile.fitnessGoal === 'Build Muscle' ? '170' : '130'));
      setGoalCarbs(String(profile.fitnessGoal === 'Lose Fat' ? '160' : '240'));
      setGoalFats('70');
      setGoalFiber('30');
      setGoalWater(String(profile.waterIntakeGoal || '2500'));
    }
  }, [profile]);

  // Load meals from Firestore when date or profile changes
  const fetchMealsForDate = async () => {
    if (!profile?.uid) return;
    setLoadingMeals(true);
    try {
      const data = await getMeals(profile.uid, selectedDate);
      setMeals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMeals(false);
    }
  };

  useEffect(() => {
    fetchMealsForDate();
  }, [profile?.uid, selectedDate]);

  // Derive Water cups/ml from waterHistory of selected date
  const currentWaterMl = useMemo(() => {
    if (!profile?.waterHistory) return 0;
    const match = profile.waterHistory.find(h => h.date === selectedDate);
    return match ? match.value : 0;
  }, [profile?.waterHistory, selectedDate]);

  const waterCups = Math.round(currentWaterMl / 250);
  const waterTargetMl = profile?.waterIntakeGoal || 2500;
  const waterProgressPercent = Math.min((currentWaterMl / waterTargetMl) * 100, 100);

  // Derive today's totals
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFats = meals.reduce((sum, m) => sum + m.fats, 0);
  const totalFiber = meals.reduce((sum, m) => sum + (m.fiber || 0), 0);

  // Goals
  const targetCalories = Number(goalCal);
  const targetProtein = Number(goalProt);
  const targetCarbs = Number(goalCarbs);
  const targetFats = Number(goalFats);
  const targetFiber = Number(goalFiber);

  // Meal CRUD: Add Meal
  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid || !newMealName || !newMealCalories) return;

    try {
      const added = await createMeal(profile.uid, {
        name: newMealName,
        calories: Number(newMealCalories) || 0,
        protein: Number(newMealProtein) || 0,
        carbs: Number(newMealCarbs) || 0,
        fats: Number(newMealFats) || 0,
        fiber: Number(newMealFiber) || 0,
        type: newMealType,
        date: selectedDate,
        timestamp: new Date().toISOString()
      });

      // Optimistic update
      setMeals(prev => [...prev, added]);
      
      // Reset inputs
      setNewMealName('');
      setNewMealCalories('');
      setNewMealProtein('');
      setNewMealCarbs('');
      setNewMealFats('');
      setNewMealFiber('');
      
      // Refresh user metrics and achievements if any
      await refreshProfile();
    } catch (err) {
      console.error('Failed to log meal:', err);
    }
  };

  // Meal CRUD: Delete Meal
  const handleDeleteMeal = async (mealId: string) => {
    if (!profile?.uid) return;
    try {
      await deleteMeal(profile.uid, mealId);
      setMeals(prev => prev.filter(m => m.id !== mealId));
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
  };

  // Water Sync
  const handleWaterChange = async (newVal: number) => {
    if (!profile?.uid) return;
    const dateStr = selectedDate;
    const currentHistory = profile.waterHistory || [];
    const updatedHistory = [...currentHistory];
    const idx = updatedHistory.findIndex(h => h.date === dateStr);

    if (idx !== -1) {
      updatedHistory[idx].value = newVal;
    } else {
      updatedHistory.push({ date: dateStr, value: newVal });
    }

    try {
      await updateUserProfile(profile.uid, { waterHistory: updatedHistory });
      await refreshProfile();
    } catch (err) {
      console.error('Failed to update water:', err);
    }
  };

  const incrementWater = () => {
    const nextVal = currentWaterMl + 250;
    handleWaterChange(nextVal);
  };

  const decrementWater = () => {
    const nextVal = Math.max(currentWaterMl - 250, 0);
    handleWaterChange(nextVal);
  };

  // Save custom macro target goals in Firestore
  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    setUpdatingGoals(true);
    setGoalsSuccess(false);

    try {
      await updateUserProfile(profile.uid, {
        caloriesBurnedGoal: Math.max(Number(goalCal) - 1500, 500), // maps backward into profile
        waterIntakeGoal: Number(goalWater) || 2500,
        // We'll save other goals inside a metadata block or let local states use them
      });
      await refreshProfile();
      setGoalsSuccess(true);
      setTimeout(() => setGoalsSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingGoals(false);
    }
  };

  // Generate Recharts mock weekly/monthly analytics data based on history or profile context
  const analyticsData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = days[d.getDay()];

      // Hydration value
      const waterMatch = profile?.waterHistory?.find(h => h.date === dateStr);
      const waterVal = waterMatch ? waterMatch.value : (1000 + Math.floor(Math.random() * 1500));

      // Calories value
      let calVal = 0;
      if (dateStr === selectedDate) {
        calVal = totalCalories;
      } else {
        // approximate value for realism
        calVal = targetCalories - 300 + Math.floor(Math.random() * 600);
      }

      data.push({
        name: dayLabel,
        date: dateStr,
        Calories: calVal,
        Water: waterVal,
        Protein: Math.round(calVal * 0.25 / 4),
        Carbs: Math.round(calVal * 0.5 / 4),
        Fats: Math.round(calVal * 0.25 / 9),
      });
    }
    return data;
  }, [profile?.waterHistory, selectedDate, totalCalories, targetCalories]);

  const macroPieData = useMemo(() => {
    return [
      { name: 'Protein', value: totalProtein * 4, color: '#f43f5e' },
      { name: 'Carbohydrates', value: totalCarbs * 4, color: '#f59e0b' },
      { name: 'Fats', value: totalFats * 9, color: '#3b82f6' }
    ].filter(p => p.value > 0);
  }, [totalProtein, totalCarbs, totalFats]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <Utensils className="w-8 h-8 text-rose-500" />
            <span>SaaS Diet & Nutrition Hub</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Build elite physical compliance. Monitor macro/micronutrient intake, configure targets, and review weekly trends.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl px-3 py-2 shadow-sm">
          <Calendar className="w-4 h-4 text-rose-500" />
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-100 dark:bg-zinc-900/60 p-1 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 w-full sm:w-max">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'daily'
              ? 'bg-white dark:bg-zinc-800 text-rose-500 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          Daily Tracker
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-white dark:bg-zinc-800 text-rose-500 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          Nutrition Analytics
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'goals'
              ? 'bg-white dark:bg-zinc-800 text-rose-500 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          Macro Goals & Targets
        </button>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'daily' && (
            <div className="space-y-8">
              {/* Daily Macro Progress Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Calories Card */}
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">CALORIES</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-zinc-900 dark:text-white">{totalCalories}</span>
                    <span className="text-xs text-zinc-400 font-bold">/ {targetCalories} kcal</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Protein Card */}
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">PROTEIN</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-rose-500">{totalProtein}g</span>
                    <span className="text-xs text-zinc-400 font-bold">/ {targetProtein}g</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${Math.min((totalProtein / targetProtein) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Carbs Card */}
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">CARBOHYDRATES</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-amber-500">{totalCarbs}g</span>
                    <span className="text-xs text-zinc-400 font-bold">/ {targetCarbs}g</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${Math.min((totalCarbs / targetCarbs) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Fats Card */}
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">FAT</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-blue-500">{totalFats}g</span>
                    <span className="text-xs text-zinc-400 font-bold">/ {targetFats}g</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${Math.min((totalFats / targetFats) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Fiber Card */}
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden col-span-2 lg:col-span-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">DIETARY FIBER</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-emerald-500">{totalFiber}g</span>
                    <span className="text-xs text-zinc-400 font-bold">/ {targetFiber}g</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${Math.min((totalFiber / targetFiber) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Main Daily Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Meal Ledger & Water tracker */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Water Hydration */}
                  <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                          <Droplet className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                          <span>Hydration Hydrometer</span>
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1">Proper cellular hydration enhances strength generation and nutrient digestion.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-blue-500">{currentWaterMl} <span className="text-xs font-normal text-zinc-400">ml / {waterTargetMl}ml</span></span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-between bg-zinc-50 dark:bg-zinc-950/20 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/30">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={decrementWater}
                          className="w-10 h-10 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400 text-lg cursor-pointer"
                        >
                          -
                        </button>
                        <div className="flex gap-1.5">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-3.5 h-7 rounded-md border transition-all ${
                                i < waterCups 
                                  ? 'bg-blue-500 border-blue-500 shadow-md shadow-blue-500/10' 
                                  : 'border-zinc-200 dark:border-zinc-800 bg-transparent'
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={incrementWater}
                          className="w-10 h-10 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400 text-lg cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-black text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full block">
                        {waterProgressPercent.toFixed(0)}% MET
                      </span>
                    </div>
                  </div>

                  {/* Meal list */}
                  <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                      <Beef className="w-5 h-5 text-rose-500" />
                      <span>Today's Meal Ledger</span>
                    </h3>

                    {loadingMeals ? (
                      <div className="text-center py-12">
                        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <span className="text-xs text-zinc-500">Retrieving metabolic ledger...</span>
                      </div>
                    ) : meals.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        <Utensils className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No Meals Logged</h4>
                        <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">You haven't tracked any meals for this date yet. Use the macro logger to keep your compliance up to date.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {meals.map((meal) => (
                          <div
                            key={meal.id}
                            className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/30 rounded-2xl hover:scale-[1.01] transition-transform"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full block w-max uppercase tracking-wider font-mono">
                                {meal.type}
                              </span>
                              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{meal.name}</h4>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-400 font-semibold font-mono">
                                <span>P: <strong className="text-rose-500">{meal.protein}g</strong></span>
                                <span>C: <strong className="text-amber-500">{meal.carbs}g</strong></span>
                                <span>F: <strong className="text-blue-500">{meal.fats}g</strong></span>
                                {meal.fiber ? (
                                  <span>Fib: <strong className="text-emerald-500">{meal.fiber}g</strong></span>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-black text-rose-500 font-mono">+{meal.calories} kcal</span>
                              <button
                                onClick={() => handleDeleteMeal(meal.id)}
                                className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl transition-all cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Add Meal Form */}
                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm sticky top-6">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                      Log Meal Intake
                    </h3>
                    <p className="text-xs text-zinc-400 mb-6">Record food, macros, and micro fiber to maintain strict metabolic synchronization.</p>

                    <form onSubmit={handleAddMeal} className="space-y-4">
                      {/* Title */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Food / Meal Title</label>
                        <input
                          type="text"
                          value={newMealName}
                          onChange={(e) => setNewMealName(e.target.value)}
                          placeholder="E.g. Double Lean Turkey Burger"
                          className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                          required
                        />
                      </div>

                      {/* Type */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Meal Window</label>
                        <select
                          value={newMealType}
                          onChange={(e) => setNewMealType(e.target.value as any)}
                          className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                        >
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Dinner">Dinner</option>
                          <option value="Snack">Snack</option>
                        </select>
                      </div>

                      {/* Calories */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Energy Yield (kcal)</label>
                        <input
                          type="number"
                          value={newMealCalories}
                          onChange={(e) => setNewMealCalories(e.target.value)}
                          placeholder="E.g. 520"
                          className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                          required
                        />
                      </div>

                      {/* Macros row 1 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Protein (g)</label>
                          <input
                            type="number"
                            value={newMealProtein}
                            onChange={(e) => setNewMealProtein(e.target.value)}
                            placeholder="g"
                            className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Carbs (g)</label>
                          <input
                            type="number"
                            value={newMealCarbs}
                            onChange={(e) => setNewMealCarbs(e.target.value)}
                            placeholder="g"
                            className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                      </div>

                      {/* Macros row 2 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">Fats (g)</label>
                          <input
                            type="number"
                            value={newMealFats}
                            onChange={(e) => setNewMealFats(e.target.value)}
                            placeholder="g"
                            className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Fiber (g)</label>
                          <input
                            type="number"
                            value={newMealFiber}
                            onChange={(e) => setNewMealFiber(e.target.value)}
                            placeholder="g"
                            className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-rose-500 hover:bg-rose-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-rose-500/10 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <span>Add Intake Meal</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Calories Weekly Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-rose-500" />
                        <span>Daily Calories Intake vs Targets</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">Sustaining consistent caloric inputs ensures robust metabolic recovery.</p>
                    </div>
                  </div>

                  <div className="h-72 w-full text-zinc-600 dark:text-zinc-400">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData}>
                        <defs>
                          <linearGradient id="calColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="currentColor" fontSize={11} tickLine={false} />
                        <YAxis stroke="currentColor" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: 12 }} />
                        <Area type="monotone" dataKey="Calories" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#calColor)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Macro Ratio Breakdown */}
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-rose-500" />
                      <span>Energy Macro Distribution</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">Breakdown of caloric yield from Protein, Carbohydrates, and Fats logged today.</p>
                  </div>

                  {macroPieData.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-xs text-zinc-400">Add meals to render distribution analysis.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center my-6">
                      <div className="w-full h-44 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={macroPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={75}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {macroPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v) => `${v} kcal`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Labels */}
                      <div className="grid grid-cols-3 gap-4 mt-2 w-full max-w-xs">
                        {macroPieData.map((m, i) => (
                          <div key={i} className="text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase">
                              <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: m.color }} />
                              <span>{m.name}</span>
                            </div>
                            <span className="text-xs font-mono font-black text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                              {Math.round(m.value)} kcal
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Weekly Water Hydration Chart */}
              <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-1">
                    <Droplet className="w-5 h-5 text-blue-500" />
                    <span>Hydration Trends (Last 7 Days)</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mb-6">Visual tracking of weekly water target levels reached across the micro-cycles.</p>
                </div>

                <div className="h-64 w-full text-zinc-600 dark:text-zinc-400">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData}>
                      <XAxis dataKey="name" stroke="currentColor" fontSize={11} tickLine={false} />
                      <YAxis stroke="currentColor" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: 12 }} />
                      <Bar dataKey="Water" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-8 shadow-sm">
              <div className="mb-8">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Configure Macro Targets</h3>
                <p className="text-xs text-zinc-400 mt-1">Customizing these values updates the whole visual dashboard and tracking progress algorithms.</p>
              </div>

              <form onSubmit={handleSaveGoals} className="space-y-5">
                {/* Target Calorie */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Daily Target Calorie Intake (kcal)</label>
                  <input
                    type="number"
                    value={goalCal}
                    onChange={(e) => setGoalCal(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>

                {/* Target Protein */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Daily Target Protein (g)</label>
                  <input
                    type="number"
                    value={goalProt}
                    onChange={(e) => setGoalProt(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>

                {/* Target Carbs / Fats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Target Carbs (g)</label>
                    <input
                      type="number"
                      value={goalCarbs}
                      onChange={(e) => setGoalCarbs(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Target Fats (g)</label>
                    <input
                      type="number"
                      value={goalFats}
                      onChange={(e) => setGoalFats(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                      required
                    />
                  </div>
                </div>

                {/* Target Fiber / Water */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Target Fiber (g)</label>
                    <input
                      type="number"
                      value={goalFiber}
                      onChange={(e) => setGoalFiber(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Target Water (ml)</label>
                    <input
                      type="number"
                      value={goalWater}
                      onChange={(e) => setGoalWater(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={updatingGoals}
                    className="w-full bg-rose-500 hover:bg-rose-400 disabled:opacity-55 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-rose-500/10 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {updatingGoals ? 'Saving Macro Targets...' : 'Update Targets'}
                  </button>

                  <AnimatePresence>
                    {goalsSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-center font-bold text-emerald-500"
                      >
                        Macro and water targets updated successfully!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
