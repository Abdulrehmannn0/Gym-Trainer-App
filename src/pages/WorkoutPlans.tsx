import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Dumbbell, 
  Clock, 
  Flame, 
  CheckCircle2, 
  ListTodo, 
  ChevronRight, 
  Sparkles, 
  Award,
  Calendar as CalendarIcon,
  Zap,
  RotateCcw,
  X,
  Plus,
  Trash2,
  CalendarDays,
  History,
  Check,
  Pause,
  ChevronLeft,
  ChevronRightSquare,
  Sparkle,
  Pencil
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/userService';
import { 
  getCustomWorkoutPlans, 
  createCustomWorkoutPlan, 
  deleteCustomWorkoutPlan, 
  updateCustomWorkoutPlan,
  getWorkoutLogs, 
  createWorkoutLog 
} from '../services/fitnessService';
import { CustomWorkoutPlan, WorkoutLog } from '../types';

interface PresetWorkoutPlan {
  id: string;
  title: string;
  description: string;
  duration: number; // mins
  calories: number; // kcal
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  exercises: { name: string; sets: number; reps: string }[];
}

const PRESET_PLANS: PresetWorkoutPlan[] = [
  {
    id: 'push-day',
    title: 'Alpha Push Day',
    description: 'Target chest, shoulders, and triceps with high-volume compound lifts for ultimate strength.',
    duration: 45,
    calories: 420,
    difficulty: 'Intermediate',
    category: 'Hypertrophy',
    exercises: [
      { name: 'Incline Barbell Bench Press', sets: 4, reps: '8-10 reps' },
      { name: 'Overhead Dumbbell Press', sets: 4, reps: '10 reps' },
      { name: 'Dumbbell Chest Flyes', sets: 3, reps: '12 reps' },
      { name: 'Tricep Rope Pushdowns', sets: 3, reps: '15 reps' }
    ]
  },
  {
    id: 'pull-day',
    title: 'Savage Back & Pull',
    description: 'An intense back-building workout focusing on lat width, mid-back density, and bicep peaks.',
    duration: 50,
    calories: 460,
    difficulty: 'Advanced',
    category: 'Strength',
    exercises: [
      { name: 'Deadlifts', sets: 4, reps: '5 reps' },
      { name: 'Pull-ups', sets: 4, reps: 'AMRAP' },
      { name: 'Seated Cable Rows', sets: 3, reps: '12 reps' },
      { name: 'Incline Dumbbell Bicep Curls', sets: 3, reps: '12 reps' }
    ]
  },
  {
    id: 'leg-destruction',
    title: 'Quads & Glutes Demolition',
    description: 'Unleash athletic leg power. Focuses on squat mechanics, hip drive, and hamstring flexibility.',
    duration: 55,
    calories: 550,
    difficulty: 'Advanced',
    category: 'Power',
    exercises: [
      { name: 'Barbell Back Squats', sets: 4, reps: '8 reps' },
      { name: 'Romanian Deadlifts', sets: 4, reps: '10 reps' },
      { name: 'Walking Dumbbell Lunges', sets: 3, reps: '20 steps' },
      { name: 'Seated Calf Raises', sets: 3, reps: '15 reps' }
    ]
  },
  {
    id: 'nike-burn',
    title: 'Core & Cardio Shred',
    description: 'High-intensity interval routines designed to incinerate fat and supercharge endurance.',
    duration: 30,
    calories: 380,
    difficulty: 'Beginner',
    category: 'Endurance',
    exercises: [
      { name: 'Kettlebell Swings', sets: 4, reps: '30 secs' },
      { name: 'Plank Knee-to-Elbow', sets: 3, reps: '45 secs' },
      { name: 'Mountain Climbers', sets: 4, reps: '30 secs' },
      { name: 'Hanging Leg Raises', sets: 3, reps: '15 reps' }
    ]
  }
];

export const WorkoutPlans: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  
  // Tabs: 'plans' | 'calendar' | 'history'
  const [activeTab, setActiveTab] = useState<'plans' | 'calendar' | 'history'>('plans');
  
  // Data lists from Firestore
  const [customPlans, setCustomPlans] = useState<CustomWorkoutPlan[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Custom plan creator state
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState('45');
  const [newPlanCalories, setNewPlanCalories] = useState('400');
  const [newPlanDiff, setNewPlanDiff] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [newPlanCat, setNewPlanCat] = useState('Strength');
  const [newExercises, setNewExercises] = useState<{ name: string; sets: number; reps: string }[]>([
    { name: '', sets: 3, reps: '10' }
  ]);

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string>(''); // YYYY-MM-DD
  const [showScheduleSelector, setShowScheduleSelector] = useState(false);

  // Active Workout Player Overlay
  const [activePlan, setActivePlan] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [workoutFinished, setWorkoutFinished] = useState(false);

  // Sets logging inside simulator
  const [exerciseLogs, setExerciseLogs] = useState<{
    [exerciseIndex: number]: {
      sets: { weight: number; reps: number; completed: boolean }[];
    }
  }>({});

  // Rest Timer states inside simulator
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRestActive, setIsRestActive] = useState(false);
  const [restIntervalId, setRestIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Fetch Firestore logs and plans
  useEffect(() => {
    if (profile?.uid) {
      const loadData = async () => {
        setLoading(true);
        try {
          const cPlans = await getCustomWorkoutPlans(profile.uid);
          const logs = await getWorkoutLogs(profile.uid);
          setCustomPlans(cPlans);
          setWorkoutLogs(logs);
        } catch (err) {
          console.error('Error fetching workout module details:', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [profile?.uid, activeTab]);

  // Combined plans list
  const allPlans = [...PRESET_PLANS, ...customPlans];

  // Rest Timer logic
  useEffect(() => {
    if (isRestActive && timeLeft > 0) {
      const id = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(id);
    } else if (timeLeft === 0) {
      setIsRestActive(false);
    }
  }, [isRestActive, timeLeft]);

  // Session stopwatch timer logic
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = (plan: any) => {
    setActivePlan(plan);
    setIsPlaying(true);
    setCurrentExerciseIndex(0);
    setTimerSeconds(0);
    setWorkoutFinished(false);
    setIsRestActive(false);

    // Set up standard logging structure for each exercise
    const logs: any = {};
    plan.exercises.forEach((ex: any, idx: number) => {
      logs[idx] = {
        sets: Array.from({ length: ex.sets || 3 }).map(() => ({
          weight: profile?.weight ? Math.round(profile.weight * 0.4) : 40,
          reps: parseInt(ex.reps.match(/\d+/)?.[0] || '10', 10),
          completed: false
        }))
      };
    });
    setExerciseLogs(logs);

    const id = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  const toggleSetCompleted = (exIdx: number, setIdx: number) => {
    const logsCopy = { ...exerciseLogs };
    const setItem = logsCopy[exIdx].sets[setIdx];
    setItem.completed = !setItem.completed;
    setExerciseLogs(logsCopy);

    // If marked completed, launch a 60-second rest interval countdown
    if (setItem.completed) {
      setTimeLeft(60);
      setIsRestActive(true);
    }
  };

  const handleWeightChange = (exIdx: number, setIdx: number, val: string) => {
    const logsCopy = { ...exerciseLogs };
    logsCopy[exIdx].sets[setIdx].weight = parseFloat(val) || 0;
    setExerciseLogs(logsCopy);
  };

  const handleRepsChange = (exIdx: number, setIdx: number, val: string) => {
    const logsCopy = { ...exerciseLogs };
    logsCopy[exIdx].sets[setIdx].reps = parseInt(val, 10) || 0;
    setExerciseLogs(logsCopy);
  };

  const nextExercise = () => {
    if (!activePlan) return;
    if (currentExerciseIndex < activePlan.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setIsRestActive(false);
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = async () => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    setWorkoutFinished(true);

    if (profile && activePlan) {
      const todayStr = new Date().toISOString().split('T')[0];
      const workoutDuration = Math.round(timerSeconds / 60) || 1;
      const workoutCalories = activePlan.calories || 350;

      // Construct sets structured object for workout log
      const loggedExercises = activePlan.exercises.map((ex: any, idx: number) => {
        return {
          name: ex.name,
          sets: exerciseLogs[idx]?.sets || []
        };
      });

      // Write complete workout log to Firestore
      const logPayload = {
        planId: activePlan.id,
        title: activePlan.title,
        duration: workoutDuration,
        calories: workoutCalories,
        date: todayStr,
        timestamp: new Date().toISOString(),
        exercises: loggedExercises
      };

      try {
        await createWorkoutLog(profile.uid, logPayload);

        // Update User stats
        const currentCalories = profile.caloriesHistory || [];
        const freq = [...(profile.workoutFrequency || [0, 0, 0, 0, 0, 0, 0])];
        const dayOfWeek = (new Date().getDay() + 6) % 7; // Convert Sun-Sat to Mon-Sun (0-6)
        freq[dayOfWeek] = (freq[dayOfWeek] || 0) + 1;

        let newCalories = [...currentCalories];
        const todayCalEntry = currentCalories.find(c => c.date === todayStr);
        if (todayCalEntry) {
          newCalories = currentCalories.map(c => c.date === todayStr ? { ...c, value: c.value + workoutCalories } : c);
        } else {
          newCalories.push({ date: todayStr, value: workoutCalories });
        }

        await updateUserProfile(profile.uid, {
          completedWorkoutsCount: (profile.completedWorkoutsCount || 0) + 1,
          streak: (profile.streak || 5) + 1,
          workoutFrequency: freq,
          caloriesHistory: newCalories
        });

        await refreshProfile();
      } catch (err) {
        console.error('Error recording completed workout:', err);
      }
    }
  };

  const closePlayer = () => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    setIsPlaying(false);
    setActivePlan(null);
    setWorkoutFinished(false);
    setActiveTab('history');
  };

  // Custom Plan Creator: Add exercise fields
  const handleAddExerciseRow = () => {
    setNewExercises([...newExercises, { name: '', sets: 3, reps: '10' }]);
  };

  const handleRemoveExerciseRow = (index: number) => {
    setNewExercises(newExercises.filter((_, idx) => idx !== index));
  };

  const handleNewExerciseChange = (index: number, key: string, value: any) => {
    const list = [...newExercises];
    (list[index] as any)[key] = value;
    setNewExercises(list);
  };

  const handleCreatePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newPlanTitle) return;

    const filteredEx = newExercises.filter(ex => ex.name.trim() !== '');
    if (filteredEx.length === 0) return;

    try {
      if (editingPlanId) {
        const planPayload = {
          title: newPlanTitle,
          description: newPlanDesc || 'A customized athlete workout plan.',
          duration: parseInt(newPlanDuration, 10) || 45,
          calories: parseInt(newPlanCalories, 10) || 400,
          difficulty: newPlanDiff,
          category: newPlanCat,
          exercises: filteredEx,
        };
        await updateCustomWorkoutPlan(profile.uid, editingPlanId, planPayload);
        setEditingPlanId(null);
      } else {
        const planPayload = {
          title: newPlanTitle,
          description: newPlanDesc || 'A customized athlete workout plan.',
          duration: parseInt(newPlanDuration, 10) || 45,
          calories: parseInt(newPlanCalories, 10) || 400,
          difficulty: newPlanDiff,
          category: newPlanCat,
          exercises: filteredEx,
          createdAt: new Date().toISOString(),
          scheduledDates: []
        };
        await createCustomWorkoutPlan(profile.uid, planPayload);
      }
      
      setNewPlanTitle('');
      setNewPlanDesc('');
      setNewPlanDuration('45');
      setNewPlanCalories('400');
      setNewPlanDiff('Intermediate');
      setNewPlanCat('Strength');
      setNewExercises([{ name: '', sets: 3, reps: '10' }]);
      setIsCreatingPlan(false);
      // Reload custom plans
      const cPlans = await getCustomWorkoutPlans(profile.uid);
      setCustomPlans(cPlans);
    } catch (err) {
      console.error('Error saving custom plan:', err);
    }
  };

  const handleEditPlanClick = (plan: CustomWorkoutPlan) => {
    setEditingPlanId(plan.id);
    setNewPlanTitle(plan.title);
    setNewPlanDesc(plan.description);
    setNewPlanDuration(String(plan.duration));
    setNewPlanCalories(String(plan.calories));
    setNewPlanDiff(plan.difficulty);
    setNewPlanCat(plan.category);
    setNewExercises(plan.exercises);
    setIsCreatingPlan(true);
  };

  const handleCancelPlanEdit = () => {
    setEditingPlanId(null);
    setNewPlanTitle('');
    setNewPlanDesc('');
    setNewPlanDuration('45');
    setNewPlanCalories('400');
    setNewPlanDiff('Intermediate');
    setNewPlanCat('Strength');
    setNewExercises([{ name: '', sets: 3, reps: '10' }]);
    setIsCreatingPlan(false);
  };

  const handleDeletePlan = async (id: string) => {
    if (!profile) return;
    try {
      await deleteCustomWorkoutPlan(profile.uid, id);
      setCustomPlans(customPlans.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting custom plan:', err);
    }
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay(); // Sun = 0, Mon = 1...
  
  // Adjusted start day for Mon = 0, Sun = 6
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const dayStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setSelectedDayStr(dayStr);
    setShowScheduleSelector(true);
  };

  const handleScheduleWorkout = async (planId: string) => {
    if (!profile || !selectedDayStr) return;
    try {
      // Find the plan inside our lists
      const plan = customPlans.find(p => p.id === planId);
      if (plan) {
        const scheduled = plan.scheduledDates || [];
        if (!scheduled.includes(selectedDayStr)) {
          const updated = [...scheduled, selectedDayStr];
          await updateCustomWorkoutPlan(profile.uid, planId, { scheduledDates: updated });
          // Refresh list
          const refreshed = await getCustomWorkoutPlans(profile.uid);
          setCustomPlans(refreshed);
        }
      } else {
        // If it's a preset plan, we let them create it as a scheduled custom plan
        const preset = PRESET_PLANS.find(p => p.id === planId);
        if (preset) {
          await createCustomWorkoutPlan(profile.uid, {
            title: preset.title,
            description: preset.description,
            duration: preset.duration,
            calories: preset.calories,
            difficulty: preset.difficulty,
            category: preset.category,
            exercises: preset.exercises,
            createdAt: new Date().toISOString(),
            scheduledDates: [selectedDayStr]
          });
          const refreshed = await getCustomWorkoutPlans(profile.uid);
          setCustomPlans(refreshed);
        }
      }
      setShowScheduleSelector(false);
    } catch (err) {
      console.error('Error scheduling workout:', err);
    }
  };

  // Weekly Calendar Row
  const getWeeklyDays = () => {
    const days = [];
    const tempDate = new Date();
    // Get start of week (Monday)
    const currentDay = tempDate.getDay();
    const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
    tempDate.setDate(tempDate.getDate() + distanceToMon);

    for (let i = 0; i < 7; i++) {
      days.push(new Date(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return days;
  };

  const weeklyDays = getWeeklyDays();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-indigo-500 animate-pulse" />
            <span>Athletic Training & Scheduler</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Build custom workout splits, schedule routine calendars, and run a sets-tracking simulator.
          </p>
        </div>

        {/* Tab Selection Switch */}
        <div className="flex p-1 bg-zinc-200/60 dark:bg-zinc-900/60 border border-zinc-300/20 rounded-2xl gap-1 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'plans' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plans & Builder</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'calendar' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar Splits</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Workout History</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading Workout Modules...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          
          {/* TAB 1: Plans & Builder */}
          {activeTab === 'plans' && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-indigo-500" />
                  <span>Available Blueprints</span>
                </h3>
                
                <button
                  onClick={() => setIsCreatingPlan(!isCreatingPlan)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>Build Custom Plan</span>
                </button>
              </div>

              {/* Custom Plan Form Modal Overlay */}
              <AnimatePresence>
                {isCreatingPlan && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6"
                  >
                    <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <Sparkle className="w-4 h-4 text-indigo-500" />
                          <span>{editingPlanId ? 'Edit Blueprint Studio' : 'Custom Blueprint Studio'}</span>
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {editingPlanId ? 'Modify your custom blueprint settings and movements.' : 'Design a target movement routine to save permanently.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelPlanEdit}
                        className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-850"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreatePlanSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Plan Title</label>
                          <input
                            type="text"
                            value={newPlanTitle}
                            onChange={(e) => setNewPlanTitle(e.target.value)}
                            placeholder="E.g. Upper Body Volume Split"
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Description / Goals</label>
                          <input
                            type="text"
                            value={newPlanDesc}
                            onChange={(e) => setNewPlanDesc(e.target.value)}
                            placeholder="Target chest width and lat spread with isolation pumps."
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Duration (Mins)</label>
                          <input
                            type="number"
                            value={newPlanDuration}
                            onChange={(e) => setNewPlanDuration(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none text-zinc-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Est. Calories Burn (kcal)</label>
                          <input
                            type="number"
                            value={newPlanCalories}
                            onChange={(e) => setNewPlanCalories(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none text-zinc-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Difficulty</label>
                          <select
                            value={newPlanDiff}
                            onChange={(e: any) => setNewPlanDiff(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none text-zinc-900 dark:text-white cursor-pointer"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Category</label>
                          <input
                            type="text"
                            value={newPlanCat}
                            onChange={(e) => setNewPlanCat(e.target.value)}
                            placeholder="E.g. Strength, Power"
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none text-zinc-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Exercises rows builder */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Exercises List</label>
                        <div className="space-y-2.5">
                          {newExercises.map((ex, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={ex.name}
                                onChange={(e) => handleNewExerciseChange(index, 'name', e.target.value)}
                                placeholder="Exercise Name (e.g. Dumbbell Incline Press)"
                                className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none text-zinc-900 dark:text-white"
                                required
                              />
                              <input
                                type="number"
                                placeholder="Sets"
                                value={ex.sets}
                                onChange={(e) => handleNewExerciseChange(index, 'sets', parseInt(e.target.value, 10) || 3)}
                                className="w-20 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none text-zinc-900 dark:text-white"
                                min="1"
                              />
                              <input
                                type="text"
                                placeholder="Reps"
                                value={ex.reps}
                                onChange={(e) => handleNewExerciseChange(index, 'reps', e.target.value)}
                                className="w-24 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none text-zinc-900 dark:text-white"
                              />
                              {newExercises.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExerciseRow(index)}
                                  className="text-rose-500 hover:text-rose-600 p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl hover:scale-105 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={handleAddExerciseRow}
                          className="text-xs font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-1 hover:text-indigo-600 transition-all mt-2 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Exercise</span>
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="submit"
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 transition-all text-xs uppercase tracking-widest cursor-pointer"
                        >
                          {editingPlanId ? 'Update Blueprint Plan' : 'Save Blueprint Plan'}
                        </button>
                        {editingPlanId && (
                          <button
                            type="button"
                            onClick={handleCancelPlanEdit}
                            className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-600 dark:text-zinc-350 font-bold py-3.5 px-6 rounded-xl transition-all text-xs uppercase tracking-widest cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Workout Plans Grid (Combined Presets + Custom) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allPlans.map((plan) => {
                  const isCustom = !PRESET_PLANS.some(p => p.id === plan.id);
                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={{ y: -3 }}
                      className="group relative overflow-hidden bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md flex flex-col justify-between"
                    >
                      <div>
                        {/* Headers */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                            {plan.category}
                          </span>
                          <div className="flex items-center gap-2">
                            {isCustom && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                CUSTOM
                              </span>
                            )}
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              plan.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                              plan.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                              'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                            }`}>
                              {plan.difficulty}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-indigo-500 transition-colors uppercase">
                          {plan.title}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                          {plan.description}
                        </p>

                        {/* Metric labels */}
                        <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 px-2 py-1 rounded-md">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" /> {plan.duration} mins
                          </span>
                          <span className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 px-2 py-1 rounded-md">
                            <Flame className="w-3.5 h-3.5 text-orange-500" /> {plan.calories} kcal
                          </span>
                          <span className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 px-2 py-1 rounded-md">
                            <ListTodo className="w-3.5 h-3.5 text-indigo-500" /> {plan.exercises.length} Exercises
                          </span>
                        </div>

                        {/* Exercises List Peeks */}
                        <div className="mt-5 border-t border-zinc-100 dark:border-zinc-850/50 pt-4 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">TARGET MOVEMENTS</span>
                          <div className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin">
                            {plan.exercises.map((ex: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200/40 dark:border-zinc-800/20 px-3 py-2 rounded-xl">
                                <span className="font-bold truncate max-w-[180px]">{ex.name}</span>
                                <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0">{ex.sets}x {ex.reps}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Launch options */}
                      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-850/50 flex gap-2">
                        <button
                          onClick={() => startWorkout(plan)}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>START TRAINING</span>
                        </button>
                        
                        {isCustom && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditPlanClick(plan)}
                              className="text-indigo-500 hover:text-indigo-600 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/15 rounded-xl transition-all cursor-pointer hover:scale-105"
                              title="Edit Plan"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePlan(plan.id)}
                              className="text-rose-500 hover:text-rose-600 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/15 rounded-xl transition-all cursor-pointer hover:scale-105"
                              title="Delete Plan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 2: Calendar Splits */}
          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Weekly Calendar Row Widget */}
              <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-4">WEEKLY PROGRESS MAP</span>
                <div className="grid grid-cols-7 gap-2.5">
                  {weeklyDays.map((d, i) => {
                    const dStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
                    const isToday = d.toDateString() === new Date().toDateString();
                    const hasLogged = workoutLogs.some(l => l.date === dStr);
                    const scheduledPlan = customPlans.find(p => p.scheduledDates?.includes(dStr));

                    return (
                      <div 
                        key={i} 
                        onClick={() => handleDayClick(d.getDate())}
                        className={`
                          p-3 rounded-xl border flex flex-col items-center justify-between min-h-[90px] transition-all cursor-pointer hover:scale-[1.03]
                          ${isToday 
                            ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                            : 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                          }
                        `}
                      >
                        <span className={`text-[10px] font-black uppercase ${isToday ? 'text-indigo-100' : 'text-zinc-400'}`}>
                          {d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3)}
                        </span>
                        <span className="text-lg font-black">{d.getDate()}</span>
                        
                        {/* Status Check circles */}
                        <div className="flex gap-1">
                          {hasLogged && (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex items-center justify-center border border-white dark:border-zinc-900 shadow-sm" title="Completed Workout" />
                          )}
                          {scheduledPlan && (
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 flex items-center justify-center border border-white dark:border-zinc-900 shadow-sm" title={scheduledPlan.title} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Calendar View */}
              <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-850/50">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                      {monthNames[month]} {year}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-850/50">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-900 rounded-lg cursor-pointer">
                      <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-900 rounded-lg cursor-pointer">
                      <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    </button>
                  </div>
                </div>

                {/* Week Day Labels */}
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest py-4">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>

                {/* Monthly Grids */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Offsets padding */}
                  {Array.from({ length: adjustedStartDay }).map((_, idx) => (
                    <div key={`offset-${idx}`} className="bg-transparent h-16 sm:h-20" />
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const dayStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                    
                    const scheduledPlan = customPlans.find(p => p.scheduledDates?.includes(dayStr));
                    const completedLog = workoutLogs.find(l => l.date === dayStr);

                    return (
                      <div
                        key={day}
                        onClick={() => handleDayClick(day)}
                        className={`
                          border rounded-2xl h-16 sm:h-20 p-2 flex flex-col justify-between items-start transition-all cursor-pointer hover:scale-[1.03]
                          ${isToday 
                            ? 'bg-indigo-50 border-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400' 
                            : 'bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-100 dark:border-zinc-900 hover:bg-zinc-100'
                          }
                        `}
                      >
                        <span className="text-xs font-bold font-mono">{day}</span>
                        
                        <div className="w-full flex flex-col gap-1">
                          {scheduledPlan && (
                            <div className="bg-indigo-600 text-white font-extrabold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-md truncate max-w-full">
                              {scheduledPlan.title}
                            </div>
                          )}
                          {completedLog && (
                            <div className="bg-emerald-500 text-white font-extrabold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-md flex items-center gap-0.5 max-w-full">
                              <Check className="w-2.5 h-2.5" />
                              <span className="truncate">{completedLog.title}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day Details Schedule modal overlay popup */}
              <AnimatePresence>
                {showScheduleSelector && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative"
                    >
                      <button 
                        onClick={() => setShowScheduleSelector(false)}
                        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1 bg-zinc-50 dark:bg-zinc-800 rounded-full"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-2">
                        <CalendarIcon className="w-5 h-5 text-indigo-500" />
                        <span>Schedule training Split</span>
                      </h3>
                      <p className="text-xs text-zinc-400 font-semibold mb-6">Day selected: {selectedDayStr}</p>

                      <div className="space-y-4">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Choose Blueprint Routine</span>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {allPlans.map((plan) => (
                            <button
                              key={plan.id}
                              onClick={() => handleScheduleWorkout(plan.id)}
                              className="w-full text-left p-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 hover:border-indigo-500/40 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between"
                            >
                              <span>{plan.title} ({plan.duration} mins)</span>
                              <ChevronRight className="w-4 h-4 text-zinc-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* TAB 3: Workout History */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" />
                <span>Athletic Session History logs</span>
              </h3>

              {workoutLogs.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-8">
                  <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs">No completed workouts logged yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workoutLogs.map((log) => (
                    <div 
                      key={log.id}
                      className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-850/50">
                        <div>
                          <h4 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight">{log.title}</h4>
                          <span className="text-[10px] font-bold text-zinc-400 mt-0.5 block">{new Date(log.timestamp).toLocaleDateString(undefined, { dateStyle: 'long' })} at {new Date(log.timestamp).toLocaleTimeString(undefined, { timeStyle: 'short' })}</span>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase">
                          <span className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1 rounded-md">
                            <Clock className="w-3.5 h-3.5" /> {log.duration} mins
                          </span>
                          <span className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1 rounded-md">
                            <Flame className="w-3.5 h-3.5 text-orange-500" /> {log.calories} kcal
                          </span>
                        </div>
                      </div>

                      {/* Logged Exercises details list */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {log.exercises.map((ex, idx) => (
                          <div key={idx} className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-zinc-800/20 p-3.5 rounded-xl space-y-2">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block truncate">{ex.name}</span>
                            
                            <div className="grid grid-cols-3 gap-1.5">
                              {ex.sets.map((set, sIdx) => (
                                <div key={sIdx} className="bg-white dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-850/60 p-1.5 rounded-lg text-center text-[10px] font-semibold text-zinc-500">
                                  <span className="block font-bold text-indigo-500">SET {sIdx + 1}</span>
                                  <span className="block text-zinc-800 dark:text-zinc-300 font-mono mt-0.5">{set.weight} kg x {set.reps}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      )}

      {/* ACTIVE WORKOUT PLAYER OVERLAY FULL-SCREEN SIMULATOR */}
      <AnimatePresence>
        {isPlaying && activePlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-3xl rounded-3xl p-6 sm:p-8 relative shadow-2xl my-8">
              <button
                onClick={closePlayer}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {!workoutFinished ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">
                      ACTIVE TRAINING SESSION SPLIT
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                      {activePlan.title}
                    </h2>
                  </div>

                  {/* Stopwatch and Rest Timer Widgets Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Session stopwatch */}
                    <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex flex-col items-center justify-center shadow-inner">
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Stopwatch (Total Session Duration)</span>
                      <span className="text-3xl font-mono font-black text-white mt-1.5 tracking-widest">{formatTime(timerSeconds)}</span>
                    </div>

                    {/* Rest Interval Timer */}
                    <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Rest Interval Timer</span>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-3xl font-mono font-black text-indigo-400 tracking-widest">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setIsRestActive(!isRestActive)}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-300"
                          >
                            {isRestActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => { setIsRestActive(false); setTimeLeft(60); }}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-300"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Exercise Slider Info */}
                  <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-2xl space-y-3">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                      EXERCISE {currentExerciseIndex + 1} OF {activePlan.exercises.length}
                    </span>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                      {activePlan.exercises[currentExerciseIndex].name}
                    </h3>

                    {/* Sets Logger Checklist */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Configure & Complete Sets</span>
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {Array.from({ length: activePlan.exercises[currentExerciseIndex].sets || 3 }).map((_, setIdx) => {
                          const logItem = exerciseLogs[currentExerciseIndex]?.sets?.[setIdx] || { weight: 40, reps: 10, completed: false };
                          return (
                            <div 
                              key={setIdx}
                              className={`
                                flex items-center justify-between p-3 rounded-xl border transition-all
                                ${logItem.completed 
                                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                                  : 'bg-zinc-900 border-zinc-800'
                                }
                              `}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`text-xs font-black ${logItem.completed ? 'text-emerald-400' : 'text-zinc-500'}`}>SET {setIdx + 1}</span>
                                
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    value={logItem.weight}
                                    onChange={(e) => handleWeightChange(currentExerciseIndex, setIdx, e.target.value)}
                                    className="w-14 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs font-mono font-bold text-white text-center"
                                  />
                                  <span className="text-[10px] text-zinc-500 font-bold uppercase">kg</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    value={logItem.reps}
                                    onChange={(e) => handleRepsChange(currentExerciseIndex, setIdx, e.target.value)}
                                    className="w-12 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs font-mono font-bold text-white text-center"
                                  />
                                  <span className="text-[10px] text-zinc-500 font-bold uppercase">reps</span>
                                </div>
                              </div>

                              <button
                                onClick={() => toggleSetCompleted(currentExerciseIndex, setIdx)}
                                className={`
                                  px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer
                                  ${logItem.completed 
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                                    : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300'
                                  }
                                `}
                              >
                                {logItem.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                                <span>{logItem.completed ? 'DONE' : 'COMPLETE'}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Back/Next session controller */}
                  <div className="flex gap-4 pt-4 border-t border-zinc-850/50">
                    <button
                      onClick={closePlayer}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-750 text-white font-bold py-3.5 rounded-xl transition-all uppercase tracking-wider text-xs"
                    >
                      Quit Split
                    </button>
                    <button
                      onClick={nextExercise}
                      className="flex-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                    >
                      <span>{currentExerciseIndex === activePlan.exercises.length - 1 ? 'Finish Split' : 'Next Exercise'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6 py-8">
                  <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 p-5 rounded-full inline-flex animate-bounce">
                    <Award className="w-12 h-12 text-indigo-400" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Workout Splits Synced!</h2>
                    <p className="text-sm text-zinc-400 max-w-md mx-auto">
                      Incredible physical effort! All metrics, sets, and calorie burnt calculations have been committed to your athlete ledger.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto text-left pt-4">
                    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
                      <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-widest">SESSION STOPWATCH</span>
                      <span className="text-lg font-black text-white font-mono mt-0.5 block">{formatTime(timerSeconds)}</span>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
                      <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-widest">METRIC INCINERATED</span>
                      <span className="text-lg font-black text-white font-mono mt-0.5 block">+{activePlan.calories} kcal</span>
                    </div>
                  </div>

                  <button
                    onClick={closePlayer}
                    className="mt-6 w-full max-w-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest text-xs"
                  >
                    Done & View History
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
