import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Beef, 
  Droplet, 
  Utensils, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  Check, 
  Activity,
  Smile,
  Cookie,
  Flame
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/userService';

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number; // g
  carbs: number; // g
  fats: number; // g
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
}

const DEFAULT_MEALS: Meal[] = [
  { id: '1', name: 'Eggs & Oatmeal Bowl', calories: 420, protein: 28, carbs: 45, fats: 14, type: 'Breakfast' },
  { id: '2', name: 'Grilled Chicken & Quinoa', calories: 580, protein: 48, carbs: 55, fats: 12, type: 'Lunch' },
  { id: '3', name: 'Pan Seared Salmon & Asparagus', calories: 510, protein: 38, carbs: 15, fats: 26, type: 'Dinner' }
];

export const Nutrition: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  
  // Custom states
  const [meals, setMeals] = useState<Meal[]>(DEFAULT_MEALS);
  const [newMealName, setNewMealName] = useState('');
  const [newMealCalories, setNewMealCalories] = useState('');
  const [newMealProtein, setNewMealProtein] = useState('');
  const [newMealCarbs, setNewMealCarbs] = useState('');
  const [newMealFats, setNewMealFats] = useState('');
  const [newMealType, setNewMealType] = useState<Meal['type']>('Lunch');

  const [waterCups, setWaterCups] = useState(6); // 1 cup = 250ml
  const [savingWater, setSavingWater] = useState(false);

  // Derive target water goal from profile or default (2500 ml)
  const waterTargetMl = profile?.waterIntakeGoal || 2500;
  const currentWaterMl = waterCups * 250;
  const waterProgressPercent = Math.min((currentWaterMl / waterTargetMl) * 100, 100);

  // Derive macros sum
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFats = meals.reduce((sum, m) => sum + m.fats, 0);

  // Suggested macro goals
  const targetCalories = profile?.caloriesBurnedGoal ? profile.caloriesBurnedGoal + 1500 : 2500; // calories to consume
  const targetProtein = profile?.fitnessGoal === 'Build Muscle' ? 170 : 130;
  const targetCarbs = profile?.fitnessGoal === 'Lose Fat' ? 160 : 240;
  const targetFats = 70;

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName || !newMealCalories) return;

    const newMeal: Meal = {
      id: Math.random().toString(),
      name: newMealName,
      calories: parseInt(newMealCalories, 10) || 0,
      protein: parseInt(newMealProtein, 10) || 0,
      carbs: parseInt(newMealCarbs, 10) || 0,
      fats: parseInt(newMealFats, 10) || 0,
      type: newMealType
    };

    setMeals([...meals, newMeal]);
    setNewMealName('');
    setNewMealCalories('');
    setNewMealProtein('');
    setNewMealCarbs('');
    setNewMealFats('');
  };

  const incrementWater = async () => {
    setWaterCups(prev => prev + 1);
    if (profile) {
      setSavingWater(true);
      const dateStr = new Date().toISOString().split('T')[0];
      const currentHistory = profile.waterHistory || [];
      const updatedHistory = [...currentHistory];
      const idx = updatedHistory.findIndex(h => h.date === dateStr);
      
      const newVal = (waterCups + 1) * 250;
      if (idx !== -1) {
        updatedHistory[idx].value = newVal;
      } else {
        updatedHistory.push({ date: dateStr, value: newVal });
      }

      await updateUserProfile(profile.uid, { waterHistory: updatedHistory });
      await refreshProfile();
      setSavingWater(false);
    }
  };

  const decrementWater = async () => {
    if (waterCups <= 0) return;
    setWaterCups(prev => prev - 1);
    if (profile) {
      setSavingWater(true);
      const dateStr = new Date().toISOString().split('T')[0];
      const currentHistory = profile.waterHistory || [];
      const updatedHistory = [...currentHistory];
      const idx = updatedHistory.findIndex(h => h.date === dateStr);
      
      const newVal = Math.max((waterCups - 1) * 250, 0);
      if (idx !== -1) {
        updatedHistory[idx].value = newVal;
      } else {
        updatedHistory.push({ date: dateStr, value: newVal });
      }

      await updateUserProfile(profile.uid, { waterHistory: updatedHistory });
      await refreshProfile();
      setSavingWater(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
          <Utensils className="w-8 h-8 text-rose-500" />
          <span>Diet & Nutrition Hub</span>
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Monitor your micro/macronutrients, record custom athletic meals, and log water targets interactively.
        </p>
      </div>

      {/* Target Macros Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">CALORIES CONSUMED</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">{totalCalories}</span>
            <span className="text-xs font-bold text-zinc-400">/ {targetCalories} kcal</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-850 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-rose-500 h-full" style={{ width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%` }} />
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">PROTEIN TARGET</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-rose-500">{totalProtein}g</span>
            <span className="text-xs font-bold text-zinc-400">/ {targetProtein}g</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-850 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-rose-500 h-full" style={{ width: `${Math.min((totalProtein / targetProtein) * 100, 100)}%` }} />
          </div>
        </div>

        {/* Carbs Card */}
        <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">CARBOHYDRATES</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-amber-500">{totalCarbs}g</span>
            <span className="text-xs font-bold text-zinc-400">/ {targetCarbs}g</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-850 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full" style={{ width: `${Math.min((totalCarbs / targetCarbs) * 100, 100)}%` }} />
          </div>
        </div>

        {/* Fats Card */}
        <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">HEALTHY FATS</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-blue-500">{totalFats}g</span>
            <span className="text-xs font-bold text-zinc-400">/ {targetFats}g</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-850 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${Math.min((totalFats / targetFats) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Meals Log & Water */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Water Consumption Tracker */}
          <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-blue-500 fill-blue-500/15" />
                  <span>Hydration Hydrometer</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Proper hydration enhances metabolic performance and muscular contractions.</p>
              </div>
              <span className="text-2xl font-black text-blue-500">{currentWaterMl} <span className="text-xs font-normal">ml / {waterTargetMl}ml</span></span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-between bg-zinc-50 dark:bg-zinc-950/20 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={decrementWater}
                  className="w-10 h-10 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 rounded-xl flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400 text-lg cursor-pointer"
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
                  className="w-10 h-10 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 rounded-xl flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400 text-lg cursor-pointer"
                >
                  +
                </button>
              </div>

              <span className="text-xs font-black text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full block">
                {waterProgressPercent.toFixed(0)}% PROGRESS
              </span>
            </div>
          </div>

          {/* Meal List */}
          <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Beef className="w-5 h-5 text-rose-500" />
              <span>Today's Meal Ledger</span>
            </h3>

            <div className="space-y-3">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/30 rounded-2xl"
                >
                  <div>
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full block w-max uppercase mb-1">
                      {meal.type}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{meal.name}</h4>
                    <div className="flex gap-3 text-xs text-zinc-400 mt-1 font-semibold">
                      <span>Protein: <strong className="text-zinc-600 dark:text-zinc-300">{meal.protein}g</strong></span>
                      <span>Carbs: <strong className="text-zinc-600 dark:text-zinc-300">{meal.carbs}g</strong></span>
                      <span>Fats: <strong className="text-zinc-600 dark:text-zinc-300">{meal.fats}g</strong></span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-rose-500 font-mono">+{meal.calories} kcal</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Add Meal Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
              Log Meal intake
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">Record custom food or supplements to keep macro tracking synchronized.</p>

            <form onSubmit={handleAddMeal} className="space-y-4">
              
              {/* Meal Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Food Title</label>
                <input
                  type="text"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  placeholder="E.g. Whey Protein Shake"
                  className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              {/* Meal Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Meal Time Type</label>
                <select
                  value={newMealType}
                  onChange={(e) => setNewMealType(e.target.value as any)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>

              {/* Quick macros grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Calories (kcal)</label>
                  <input
                    type="number"
                    value={newMealCalories}
                    onChange={(e) => setNewMealCalories(e.target.value)}
                    placeholder="E.g. 240"
                    className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-2"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Protein (g)</label>
                  <input
                    type="number"
                    value={newMealProtein}
                    onChange={(e) => setNewMealProtein(e.target.value)}
                    placeholder="E.g. 25"
                    className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Carbohydrates (g)</label>
                  <input
                    type="number"
                    value={newMealCarbs}
                    onChange={(e) => setNewMealCarbs(e.target.value)}
                    placeholder="E.g. 15"
                    className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-2"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Healthy Fats (g)</label>
                  <input
                    type="number"
                    value={newMealFats}
                    onChange={(e) => setNewMealFats(e.target.value)}
                    placeholder="E.g. 3"
                    className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white font-semibold outline-none focus:ring-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-rose-500/10 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Add Intake Meal</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
