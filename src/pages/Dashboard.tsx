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
  Utensils,
  ArrowRight,
  UserCheck
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
  const upcomingWorkout = exercises[1] || null;

  return (
    <div className="space-y-8">
      {/* Personalized Greeting with premium background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-900/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] -mr-16 -mt-16" />
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-1.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ATHLETE DESK INITIATED</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-violet-300 bg-clip-text text-transparent">{profile?.name || 'Athlete'}</span>!
            </h1>
            <p className="text-zinc-400 text-sm max-w-md">
              Your biometric modules are synchronized. Take a quick action or launch today's training split.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl self-start md:self-auto min-w-[200px]">
            <div className="bg-orange-500/15 p-3 rounded-xl text-orange-400 border border-orange-500/10">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">ACTIVE STREAK</p>
              <p className="text-xl font-black text-white">{streak} DAYS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Completion & Biometrics Tracker Ring Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Calories Burned</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white mt-1 block">
                {todayCalories} <span className="text-xs font-normal text-zinc-400">kcal</span>
              </span>
            </div>
            <div className="p-2.5 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-xl border border-orange-500/10">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/40">
            <div className="flex justify-between text-[10px] text-zinc-400 font-semibold mb-1">
              <span>Goal: {caloriesGoal} kcal</span>
              <span>{Math.round((todayCalories / caloriesGoal) * 100)}%</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min((todayCalories / caloriesGoal) * 100, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Workout Duration Card */}
        <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Workout Duration</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white mt-1 block">
                {todayDuration} <span className="text-xs font-normal text-zinc-400">mins</span>
              </span>
            </div>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/10">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/40">
            <div className="flex justify-between text-[10px] text-zinc-400 font-semibold mb-1">
              <span>Goal: {durationGoal} mins</span>
              <span>{Math.round((todayDuration / durationGoal) * 100)}%</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min((todayDuration / durationGoal) * 100, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Water Intake Card */}
        <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Water Intake</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white mt-1 block">
                {todayWater} <span className="text-xs font-normal text-zinc-400">ml</span>
              </span>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/10">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/40">
            <div className="flex justify-between text-[10px] text-zinc-400 font-semibold mb-1">
              <span>Goal: {waterGoal} ml</span>
              <span>{Math.round((todayWater / waterGoal) * 100)}%</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min((todayWater / waterGoal) * 100, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Workout Streak Card */}
        <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Finished Workouts</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white mt-1 block">
                {completedCount} <span className="text-xs font-normal text-zinc-400">completed</span>
              </span>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/10">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/40">
            <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">TROPHIES EARNED</span>
            <span className="text-xs font-bold text-emerald-500 block mt-1">Excellent Level 14 Conditioning</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons & Today's Workout Layout Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Workout Card (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
          <div className="space-y-3 flex-1">
            <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
              RECOMMENDED TODAY'S WORKOUT
            </span>
            {todayWorkout ? (
              <>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {todayWorkout.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {todayWorkout.description}
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400 pt-1">
                  <span className="bg-zinc-100 dark:bg-zinc-950 px-2.5 py-1 rounded-md">{todayWorkout.muscleGroup}</span>
                  <span className="bg-zinc-100 dark:bg-zinc-950 px-2.5 py-1 rounded-md">{todayWorkout.difficulty}</span>
                </div>
              </>
            ) : (
              <div className="h-20 flex items-center text-zinc-400">No recommended workout loaded yet.</div>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
            {todayWorkout && (
              <button
                onClick={() => onNavigate('details', todayWorkout.id)}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Launch Quick Start</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('workout-plans')}
              className="w-full sm:w-auto border border-zinc-200 dark:border-zinc-800 dark:hover:bg-zinc-900 font-bold text-sm py-3.5 px-6 rounded-2xl text-zinc-700 dark:text-zinc-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Explore Plans</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Action Panel (Takes 1 column) */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Quick Biometric Actions</h3>
            <p className="text-xs text-zinc-500 mt-1">Directly append logs to your metrics today.</p>
          </div>

          <div className="space-y-2 mt-4">
            <button
              onClick={handleQuickWaterLog}
              disabled={loggingWater}
              className="w-full flex items-center justify-between p-3.5 bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-500/5 dark:hover:bg-blue-500/10 border border-blue-100 dark:border-blue-500/10 rounded-2xl text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>LOG 250ML WATER</span>
              </span>
              <Droplet className="w-4 h-4" />
            </button>

            <button
              onClick={handleQuickCalLog}
              disabled={loggingCal}
              className="w-full flex items-center justify-between p-3.5 bg-orange-50/50 hover:bg-orange-50 dark:bg-orange-500/5 dark:hover:bg-orange-500/10 border border-orange-100 dark:border-orange-500/10 rounded-2xl text-xs font-bold text-orange-600 dark:text-orange-400 cursor-pointer disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>LOG 100 KCAL BURNED</span>
              </span>
              <Flame className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Up Next & Active Workouts List Slider */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Explore Targeted Routines</span>
            <span className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-3 py-1 rounded-full">{filteredExercises.length} Units</span>
          </h2>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder="Filter by muscle or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Categories slider */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer
                ${selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                  : 'bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Exercise Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 h-56 animate-pulse flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/3" />
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md w-2/3" />
                  <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full" />
                </div>
                <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-8">
            <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs">No matching workouts discovered.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise, index) => {
              const isFav = (profile?.favorites || []).includes(exercise.id);
              return (
                <motion.div
                  key={exercise.id}
                  whileHover={{ y: -4 }}
                  className="group bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Badge and Level header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {exercise.muscleGroup}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`
                          text-[10px] font-bold uppercase px-2 py-0.5 rounded-md
                          ${exercise.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : ''}
                          ${exercise.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : ''}
                          ${exercise.difficulty === 'Advanced' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : ''}
                        `}>
                          {exercise.difficulty}
                        </span>

                        <button
                          onClick={() => handleToggleFavorite(exercise.id)}
                          className={`p-1 rounded-full transition-colors cursor-pointer ${
                            isFav ? 'text-rose-500' : 'text-zinc-300 dark:text-zinc-600 hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-indigo-500 transition-colors line-clamp-1 uppercase">
                      {exercise.name}
                    </h3>

                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-1 tracking-wider">
                      EQUIPMENT: {exercise.equipment}
                    </p>

                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3 line-clamp-3 leading-relaxed">
                      {exercise.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-zinc-400">
                      {exercise.recommendedSets} TARGET
                    </span>

                    <button
                      onClick={() => onNavigate('details', exercise.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-white group-hover:text-indigo-500 transition-colors cursor-pointer"
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
