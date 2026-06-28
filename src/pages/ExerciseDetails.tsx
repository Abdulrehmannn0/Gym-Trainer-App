import React, { useState, useEffect } from 'react';
import { getExerciseById } from '../services/exerciseService';
import { Exercise } from '../types';
import { 
  ChevronLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Flame, 
  Clock, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  ShieldAlert, 
  Info, 
  Heart 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/userService';

interface ExerciseDetailsProps {
  exerciseId: string;
  onNavigate: (page: string) => void;
}

export const ExerciseDetails: React.FC<ExerciseDetailsProps> = ({ exerciseId, onNavigate }) => {
  const { profile, refreshProfile } = useAuth();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // Live Timer states
  const [timeLeft, setTimeLeft] = useState(60); // standard rest timer of 60 seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [completedSets, setCompletedSets] = useState<number>(0);
  const [completedLogs, setCompletedLogs] = useState<{ weight: number; reps: number }[]>([]);
  const [inputWeight, setInputWeight] = useState('');
  const [inputReps, setInputReps] = useState('');
  
  const [finishedWorkout, setFinishedWorkout] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const data = await getExerciseById(exerciseId);
        setExercise(data || null);
        if (data) {
          // prefill log target reps
          const matchedReps = data.recommendedSets.match(/\d+-\d+/);
          setInputReps(matchedReps ? matchedReps[0].split('-')[1] : '10');
          setInputWeight(profile?.weight ? Math.round(profile.weight * 0.4).toString() : '30');
        }
      } catch (err) {
        console.error('Error fetching exercise details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExercise();
  }, [exerciseId, profile]);

  // Rest Timer ticking logic
  useEffect(() => {
    let timerId: any = null;
    if (isTimerActive && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      setTimeLeft(60);
    }
    return () => clearInterval(timerId);
  }, [isTimerActive, timeLeft]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Loading Blueprint Details...</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900/40 rounded-2xl p-8 border max-w-md mx-auto">
        <p className="text-zinc-500 font-bold uppercase text-xs tracking-wider">Exercise blueprint not discovered.</p>
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const toggleTimer = () => setIsTimerActive(!isTimerActive);
  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeLeft(60);
  };

  const handleAddSetLog = () => {
    const wt = parseFloat(inputWeight) || 0;
    const rp = parseInt(inputReps, 10) || 0;
    setCompletedLogs([...completedLogs, { weight: wt, reps: rp }]);
    setCompletedSets(prev => prev + 1);
    
    // Auto initiate standard rest countdown timer!
    setTimeLeft(60);
    setIsTimerActive(true);
  };

  const handleFinishWorkout = async () => {
    if (!profile) return;
    setSyncing(true);

    try {
      // Calculate estimated calories burned (roughly 45 kcal for a robust individual exercise set set range)
      const caloriesBurned = 60;
      const todayStr = new Date().toISOString().split('T')[0];

      // Append calorie history
      const currentCalHistory = profile.caloriesHistory || [];
      const updatedCalHistory = [...currentCalHistory];
      const calIdx = updatedCalHistory.findIndex(h => h.date === todayStr);
      if (calIdx !== -1) {
        updatedCalHistory[calIdx].value += caloriesBurned;
      } else {
        updatedCalHistory.push({ date: todayStr, value: 350 + caloriesBurned });
      }

      // Update completed counter and streak
      const updatedCount = (profile.completedWorkoutsCount || 0) + 1;
      const currentStreak = profile.streak || 5;

      await updateUserProfile(profile.uid, {
        completedWorkoutsCount: updatedCount,
        streak: currentStreak,
        caloriesHistory: updatedCalHistory
      });

      await refreshProfile();
      setFinishedWorkout(true);
    } catch (err) {
      console.error('Error logging workout:', err);
    } finally {
      setSyncing(false);
    }
  };

  const isFav = (profile?.favorites || []).includes(exercise.id);

  const handleToggleFavorite = async () => {
    if (!profile) return;
    const currentFavs = profile.favorites || [];
    let updatedFavs: string[];
    
    if (currentFavs.includes(exercise.id)) {
      updatedFavs = currentFavs.filter(id => id !== exercise.id);
    } else {
      updatedFavs = [...currentFavs, exercise.id];
    }

    await updateUserProfile(profile.uid, { favorites: updatedFavs });
    await refreshProfile();
  };

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>BACK TO DASHBOARD</span>
        </button>

        <button
          onClick={handleToggleFavorite}
          className={`inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-colors ${
            isFav ? 'text-rose-500' : 'text-zinc-400 hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
          <span>{isFav ? 'FAVORITED' : 'ADD TO FAVORITES'}</span>
        </button>
      </div>

      {/* Hero Header Area with Glassmorphism */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex gap-2">
            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-400/20 px-3 py-1 rounded-full uppercase tracking-wider">
              {exercise.muscleGroup}
            </span>
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/20 px-3 py-1 rounded-full uppercase tracking-wider">
              {exercise.difficulty}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
            {exercise.name}
          </h1>

          <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
            {exercise.description}
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-zinc-400">
            <span>Equipment: <strong className="text-white">{exercise.equipment}</strong></span>
            <span>Target sets: <strong className="text-white">{exercise.recommendedSets}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left is Info Deck, Right is Interactive Trainer Player */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Info Deck (Left) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Instructions checklist */}
          <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-500" />
              <span>Perfect execution form instructions</span>
            </h3>

            <div className="space-y-4">
              {exercise.instructions.map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-zinc-50 dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900/30">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* physiological Benefits */}
            <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Physiological Benefits</span>
              </h4>
              <ul className="space-y-2.5">
                {exercise.benefits.map((benefit, idx) => (
                  <li key={idx} className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety Advisories */}
            <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Biomechanical Safety Tips</span>
              </h4>
              <ul className="space-y-2.5">
                {exercise.safetyTips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-2 leading-relaxed">
                    <span className="text-rose-500 mt-0.5 shrink-0">!</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Live Training Player (Right) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">Live Workout Session</h3>
            <p className="text-xs text-zinc-500 mb-6">Track your sets, rest, and reps continuously.</p>

            <AnimatePresence mode="wait">
              {finishedWorkout ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-6 space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Set Complete!</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Excellent effort! +60 kcal burned logged successfully to your active profile today.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFinishedWorkout(false);
                      setCompletedSets(0);
                      setCompletedLogs([]);
                    }}
                    className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Repeat workout
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Rest Countdown Circle */}
                  <div className="flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900/30 p-5 rounded-2xl">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">REST INTERVAL TIMER</span>
                    <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-2 font-mono">
                      00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </span>
                    
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={toggleTimer}
                        className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                      >
                        {isTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={resetTimer}
                        className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Set Input Form */}
                  <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/40 space-y-4">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Log Finished Set</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">WEIGHT (kg)</label>
                        <input
                          type="number"
                          value={inputWeight}
                          onChange={(e) => setInputWeight(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">REPETITIONS</label>
                        <input
                          type="number"
                          value={inputReps}
                          onChange={(e) => setInputReps(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAddSetLog}
                      className="w-full py-2.5 border border-indigo-500 text-indigo-500 dark:text-indigo-400 font-bold rounded-xl text-xs uppercase tracking-widest transition-all hover:bg-indigo-500 hover:text-white cursor-pointer"
                    >
                      LOG SET {completedSets + 1}
                    </button>
                  </div>

                  {/* Finished Sets Grid */}
                  {completedLogs.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block">Completed Set Logs</span>
                      <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                        {completedLogs.map((log, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/20 px-3 py-2 rounded-lg font-semibold">
                            <span>SET {idx + 1}</span>
                            <span>{log.weight} kg x {log.reps} reps</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Complete Workout Button */}
                  <button
                    onClick={handleFinishWorkout}
                    disabled={completedSets === 0 || syncing}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/15 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Complete Movement</span>
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};
