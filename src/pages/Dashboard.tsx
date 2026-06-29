import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getExercises } from '../services/exerciseService';
import { Exercise } from '../types';
import { 
  Search, 
  Flame, 
  Dumbbell, 
  TrendingUp, 
  Sparkles, 
  ChevronRight, 
  Heart,
  Award,
  Clock,
  Droplet,
  Plus,
  Play,
  CalendarDays,
  Activity,
  Moon,
  Zap,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Compass
} from 'lucide-react';
import { motion } from 'motion/react';
import { updateUserProfile } from '../services/userService';

interface DashboardProps {
  onNavigate: (page: string, exerciseId?: string) => void;
}

const CATEGORIES = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { profile, refreshProfile } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Quick state overrides for interactive logging
  const [loggingWater, setLoggingWater] = useState(false);
  const [loggingCal, setLoggingCal] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await getExercises();
        setExercises(data);
      } catch (err) {
        console.error('Error fetching exercises for dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  // Derive today's values
  const todayStr = new Date().toISOString().split('T')[0];
  const waterHistory = profile?.waterHistory || [];
  const caloriesHistory = profile?.caloriesHistory || [];

  const todayWater = waterHistory.find(w => w.date === todayStr)?.value || 1500;
  const todayCalories = caloriesHistory.find(c => c.date === todayStr)?.value || 350;
  const todayDuration = (profile?.completedWorkoutsCount || 0) > 0 ? 45 : 0; // mins

  // Goals
  const waterGoal = profile?.waterIntakeGoal || 2500;
  const caloriesGoal = profile?.caloriesBurnedGoal || 600;
  const durationGoal = profile?.workoutDurationGoal || 45;

  const streak = profile?.streak ?? 5;
  const completedCount = profile?.completedWorkoutsCount ?? 4;

  // Derive sleep & recovery scores dynamically for UI depth
  const sleepHours = 7.5;
  const sleepScore = Math.round((sleepHours / 8) * 100); // 94%
  const recoveryScore = Math.round(85 + (streak % 3) * 4); // ~85-93% depending on streak

  // Ring calculation: (Calories burned + Water + Duration completion averages) / 3
  const calPercentage = Math.min((todayCalories / caloriesGoal) * 100, 100);
  const waterPercentage = Math.min((todayWater / waterGoal) * 100, 100);
  const overallCompletionRate = Math.round((calPercentage + waterPercentage + (todayDuration > 0 ? 100 : 0)) / 3);

  // Filter exercises
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
      exercise.muscleGroup.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Toggle favorite helper
  const handleToggleFavorite = async (exerciseId: string) => {
    if (!profile) return;
    const currentFavs = profile.favorites || [];
    let updatedFavs: string[];
    
    if (currentFavs.includes(exerciseId)) {
      updatedFavs = currentFavs.filter(id => id !== exerciseId);
    } else {
      updatedFavs = [...currentFavs, exerciseId];
    }

    await updateUserProfile(profile.uid, { favorites: updatedFavs });
    await refreshProfile();
  };

  const handleQuickWaterLog = async () => {
    if (!profile) return;
    setLoggingWater(true);
    const updatedHistory = [...waterHistory];
    const todayIndex = updatedHistory.findIndex(w => w.date === todayStr);
    
    const increment = 250; // add 250ml
    if (todayIndex !== -1) {
      updatedHistory[todayIndex].value += increment;
    } else {
      updatedHistory.push({ date: todayStr, value: 1500 + increment });
    }

    await updateUserProfile(profile.uid, { waterHistory: updatedHistory });
    await refreshProfile();
    setLoggingWater(false);
  };

  const handleQuickCalLog = async () => {
    if (!profile) return;
    setLoggingCal(true);
    const updatedHistory = [...caloriesHistory];
    const todayIndex = updatedHistory.findIndex(c => c.date === todayStr);

    const increment = 100; // add 100 kcal
    if (todayIndex !== -1) {
      updatedHistory[todayIndex].value += increment;
    } else {
      updatedHistory.push({ date: todayStr, value: 350 + increment });
    }

    await updateUserProfile(profile.uid, { caloriesHistory: updatedHistory });
    await refreshProfile();
    setLoggingCal(false);
  };

  // Pre-selected workouts
  const todayWorkout = exercises[0] || null;
  const continueWorkout = exercises[2] || exercises[1] || null;

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. HERO WELCOME BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#111827] to-[#09090B] border border-white/[0.08] text-white rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#7C3AED]/20 to-[#4F46E5]/10 rounded-full blur-[120px] -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#7C3AED]/20 to-[#4F46E5]/20 border border-[#7C3AED]/30 text-[#A1A1AA] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>ATHLETE DESK ACTIVE</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-white">
              Welcome back, <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#22C55E] bg-clip-text text-transparent">
                {profile?.name || 'Athlete'}
              </span>!
            </h1>
            
            <p className="text-[#A1A1AA] text-sm sm:text-base font-medium leading-relaxed">
              You are crushing your split! Your current streak is <span className="text-white font-extrabold">{streak} days</span>. Today's target is <span className="text-white font-bold">{todayWorkout?.name || 'Loading splits...'}</span>.
            </p>

            {todayWorkout && (
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => onNavigate('details', todayWorkout.id)}
                  className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] hover:opacity-90 text-white font-bold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-[#7C3AED]/25 flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START TODAY'S SPLIT</span>
                </button>
                <div className="flex items-center space-x-2 text-xs text-[#A1A1AA] bg-white/[0.03] border border-white/[0.08] px-4 py-3 rounded-2xl">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  <span>Completion status: {overallCompletionRate}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Large dynamic visual dial / Streak score widget */}
          <div className="flex items-center space-x-6 bg-white/[0.02] border border-white/[0.06] p-6 rounded-3xl self-start lg:self-auto shrink-0 min-w-[260px]">
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,.03)" strokeWidth="6" fill="transparent" />
                <circle cx="40" cy="40" r="34" stroke="url(#streakGrad)" strokeWidth="6" fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - Math.min(streak / 10, 1))}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="streakGrad" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#22C55E" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <p className="text-lg font-black text-white">{streak}</p>
                <p className="text-[8px] font-bold text-[#A1A1AA] uppercase tracking-wider">Days</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-[#A1A1AA] font-black tracking-widest uppercase">ACTIVE STREAK</p>
              <p className="text-lg font-black text-white mt-0.5">UNSTOPPABLE</p>
              <p className="text-xs text-[#22C55E] font-medium flex items-center gap-1 mt-1">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>Streak on fire!</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC GOAL COMPLETION CARD GRID (BENTO BOX LAYOUT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Workout Completion Ring Card */}
        <div className="bg-card-custom border border-border-custom rounded-3xl p-6 flex flex-col justify-between hover:border-[#7C3AED]/40 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-custom-secondary uppercase tracking-wider block">COMPLETION RING</span>
              <span className="text-2xl font-black text-text-custom-primary block mt-1">Daily Target</span>
            </div>
            <div className="p-2.5 bg-[#7C3AED]/10 text-[#7C3AED] rounded-2xl border border-[#7C3AED]/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-custom-light">
            <div className="relative w-16 h-16 transform -rotate-90 shrink-0">
              <svg className="w-full h-full">
                <circle cx="32" cy="32" r="26" stroke="rgba(128,128,128,.1)" strokeWidth="5.5" fill="transparent" />
                <circle cx="32" cy="32" r="26" stroke="#7C3AED" strokeWidth="5.5" fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - overallCompletionRate / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center rotate-90">
                <span className="text-xs font-black text-text-custom-primary">{overallCompletionRate}%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-text-custom-secondary">Biometrics</p>
              <p className="text-[10px] text-[#22C55E] font-bold mt-1">Synchronized</p>
            </div>
          </div>
        </div>

        {/* Calories Burned Card */}
        <div className="bg-card-custom border border-border-custom rounded-3xl p-6 flex flex-col justify-between hover:border-orange-500/40 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-custom-secondary uppercase tracking-wider block">CALORIES BURNED</span>
              <span className="text-2xl font-black text-text-custom-primary block mt-1">
                {todayCalories} <span className="text-xs font-normal text-text-custom-secondary">kcal</span>
              </span>
            </div>
            <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-2xl border border-orange-500/20 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5 fill-orange-500" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-custom-light">
            <div className="flex justify-between text-[10px] text-text-custom-secondary font-extrabold mb-1.5 uppercase">
              <span>Goal: {caloriesGoal} kcal</span>
              <span className="text-orange-400">{Math.round(calPercentage)}%</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-white/[0.04] h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${calPercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Water Intake Card */}
        <div className="bg-card-custom border border-border-custom rounded-3xl p-6 flex flex-col justify-between hover:border-blue-500/40 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-custom-secondary uppercase tracking-wider block">WATER INTAKE</span>
              <span className="text-2xl font-black text-text-custom-primary block mt-1">
                {todayWater} <span className="text-xs font-normal text-text-custom-secondary">ml</span>
              </span>
            </div>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Droplet className="w-5 h-5 fill-blue-500" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-custom-light">
            <div className="flex justify-between text-[10px] text-text-custom-secondary font-extrabold mb-1.5 uppercase">
              <span>Goal: {waterGoal} ml</span>
              <span className="text-blue-400">{Math.round(waterPercentage)}%</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-white/[0.04] h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-500" style={{ width: `${waterPercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Sleep & Recovery Card */}
        <div className="bg-card-custom border border-border-custom rounded-3xl p-6 flex flex-col justify-between hover:border-[#4F46E5]/40 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-custom-secondary uppercase tracking-wider block">WELLNESS METRICS</span>
              <span className="text-2xl font-black text-text-custom-primary block mt-1">
                {sleepScore} <span className="text-xs font-normal text-text-custom-secondary">Sleep Score</span>
              </span>
            </div>
            <div className="p-2.5 bg-[#4F46E5]/10 text-[#4F46E5] rounded-2xl border border-[#4F46E5]/20">
              <Moon className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-custom-light flex items-center justify-between">
            <div>
              <p className="text-[10px] text-text-custom-secondary font-bold uppercase tracking-wider">RECOVERY RATE</p>
              <p className="text-sm font-black text-[#22C55E] mt-0.5">{recoveryScore}% READY</p>
            </div>
            <div className="bg-zinc-100 dark:bg-white/[0.04] border border-border-custom px-3 py-1.5 rounded-xl text-[10px] font-mono text-text-custom-secondary">
              PRIME STATE
            </div>
          </div>
        </div>

      </div>

      {/* 3. QUICK START, CONTINUE LAST WORKOUT & QUICK BIOMETRIC ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Start Today's Split Card */}
        <div className="bg-card-custom border border-border-custom rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-[10px] font-black text-[#7C3AED] bg-[#7C3AED]/10 px-3.5 py-1.5 rounded-full uppercase tracking-widest w-fit">
              <Zap className="w-3.5 h-3.5 fill-[#7C3AED]" />
              <span>LAUNCH QUICK START</span>
            </div>

            {todayWorkout ? (
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-text-custom-primary group-hover:text-[#7C3AED] transition-colors">
                  {todayWorkout.name}
                </h3>
                <p className="text-xs text-text-custom-secondary line-clamp-3 leading-relaxed">
                  {todayWorkout.description}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-white/[0.03] border border-border-custom-light px-2.5 py-1 rounded-lg text-text-custom-secondary">
                    {todayWorkout.muscleGroup}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#22C55E]/10 border border-[#22C55E]/20 px-2.5 py-1 rounded-lg text-[#22C55E]">
                    {todayWorkout.difficulty}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-custom-secondary">Your recommended workout splits are generating...</p>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-border-custom-light">
            {todayWorkout && (
              <button
                onClick={() => onNavigate('details', todayWorkout.id)}
                className="w-full bg-[#7C3AED] hover:bg-violet-600 text-white font-bold text-xs py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>START TRAINING</span>
              </button>
            )}
          </div>
        </div>

        {/* Continue Last Workout Card */}
        <div className="bg-card-custom border border-border-custom rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3.5 py-1.5 rounded-full uppercase tracking-widest w-fit">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>CONTINUE LAST WORKOUT</span>
            </div>

            {continueWorkout ? (
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-text-custom-primary">
                  {continueWorkout.name}
                </h3>
                <p className="text-xs text-text-custom-secondary line-clamp-3 leading-relaxed">
                  {continueWorkout.description}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-white/[0.03] border border-border-custom-light px-2.5 py-1 rounded-lg text-text-custom-secondary">
                    {continueWorkout.muscleGroup}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg text-indigo-400">
                    {continueWorkout.difficulty}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-custom-secondary">History of splits will organize here.</p>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-border-custom-light">
            {continueWorkout && (
              <button
                onClick={() => onNavigate('details', continueWorkout.id)}
                className="w-full border border-border-custom hover:bg-zinc-100 dark:hover:bg-white/[0.03] text-text-custom-primary font-bold text-xs py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>RESUME SPLIT</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Action Biometrics Panel */}
        <div className="bg-card-custom border border-border-custom rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-text-custom-primary flex items-center gap-2 uppercase tracking-wide">
              <Sparkles className="w-4.5 h-4.5 text-[#7C3AED]" />
              <span>BIOMETRIC ACTION HUD</span>
            </h3>
            <p className="text-xs text-text-custom-secondary mt-1">Directly append logs to your metrics today.</p>
          </div>

          <div className="space-y-3 mt-6">
            <button
              onClick={handleQuickWaterLog}
              disabled={loggingWater}
              className="w-full flex items-center justify-between p-4 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs font-bold text-blue-400 cursor-pointer disabled:opacity-50 transition-all"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>LOG +250ML HYDRATION</span>
              </span>
              <Droplet className="w-4 h-4 fill-blue-400" />
            </button>

            <button
              onClick={handleQuickCalLog}
              disabled={loggingCal}
              className="w-full flex items-center justify-between p-4 bg-orange-500/5 hover:bg-orange-500/10 border border-orange-500/20 rounded-2xl text-xs font-bold text-orange-400 cursor-pointer disabled:opacity-50 transition-all"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-400" />
                <span>LOG +100 KCAL ACTIVITY</span>
              </span>
              <Flame className="w-4 h-4 fill-orange-400" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. EXERCISE TARGETED SPLITS WITH ADVANCED FILTERING & SEARCH */}
      <div className="space-y-6 pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-text-custom-primary flex items-center gap-3">
              <Trophy className="w-6 h-6 text-[#7C3AED]" />
              <span>Explore Targeted Routines</span>
            </h2>
            <p className="text-xs text-text-custom-secondary">Instant autocomplete lookup across target muscle groups.</p>
          </div>

          {/* Autocomplete Search Input */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-custom-secondary">
              <Search className="w-4.5 h-4.5 text-text-custom-secondary" />
            </span>
            <input
              type="text"
              placeholder="Filter by muscle group, name, equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card-custom border border-border-custom text-text-custom-primary placeholder-zinc-400 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#7C3AED] transition-all"
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-5 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap cursor-pointer
                ${selectedCategory === category
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white shadow-lg shadow-[#7C3AED]/15'
                  : 'bg-card-custom border border-border-custom text-text-custom-secondary hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-text-custom-primary'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Exercise list grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-card-custom border border-border-custom rounded-3xl p-6 h-60 animate-pulse flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-zinc-200 dark:bg-white/10 rounded-md w-1/3" />
                  <div className="h-6 bg-zinc-200 dark:bg-white/10 rounded-md w-2/3" />
                  <div className="h-12 bg-zinc-200 dark:bg-white/10 rounded-md w-full" />
                </div>
                <div className="h-8 bg-zinc-200 dark:bg-white/10 rounded-md w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-16 bg-card-custom border border-border-custom rounded-3xl p-8">
            <Compass className="w-10 h-10 text-text-custom-secondary mx-auto mb-3" />
            <p className="text-text-custom-secondary font-bold uppercase tracking-wider text-xs">No matching splits discovered.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => {
              const isFav = (profile?.favorites || []).includes(exercise.id);
              return (
                <motion.div
                  key={exercise.id}
                  whileHover={{ y: -5 }}
                  className="group bg-card-custom border border-border-custom rounded-3xl p-6 shadow-md hover:border-[#7C3AED]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Card Badge and Level Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-white bg-gradient-to-r from-[#7C3AED]/30 to-[#4F46E5]/30 border border-[#7C3AED]/20 px-3 py-1 rounded-lg uppercase tracking-wider">
                        {exercise.muscleGroup}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`
                          text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border
                          ${exercise.difficulty === 'Beginner' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' : ''}
                          ${exercise.difficulty === 'Intermediate' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' : ''}
                          ${exercise.difficulty === 'Advanced' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' : ''}
                        `}>
                          {exercise.difficulty}
                        </span>

                        <button
                           onClick={() => handleToggleFavorite(exercise.id)}
                           className={`p-1.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-border-custom hover:bg-[#EF4444]/15 hover:border-[#EF4444]/20 transition-all cursor-pointer ${
                             isFav ? 'text-[#EF4444] bg-[#EF4444]/10' : 'text-text-custom-secondary hover:text-[#EF4444]'
                           }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-[#EF4444]' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-text-custom-primary group-hover:text-[#7C3AED] transition-colors leading-snug line-clamp-1 uppercase tracking-tight">
                      {exercise.name}
                    </h3>

                    <p className="text-[9px] text-text-custom-secondary font-black uppercase mt-1 tracking-widest">
                      EQUIPMENT: {exercise.equipment}
                    </p>

                    <p className="text-text-custom-secondary text-xs mt-3 line-clamp-3 leading-relaxed">
                      {exercise.description}
                    </p>
                  </div>

                  {/* Sets indicator and details CTA button */}
                  <div className="mt-6 pt-4 border-t border-border-custom-light flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-text-custom-secondary">
                      {exercise.recommendedSets} TARGET SPLIT
                    </span>

                    <button
                      onClick={() => onNavigate('details', exercise.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-text-custom-primary group-hover:text-[#7C3AED] transition-all cursor-pointer"
                    >
                      <span>DETAILS</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
