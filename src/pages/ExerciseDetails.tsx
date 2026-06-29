import React, { useState, useEffect } from 'react';
import { getExerciseById, getExercises } from '../services/exerciseService';
import { Exercise } from '../types';
import { 
  ChevronLeft, 
  ChevronRight,
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Flame, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  ShieldAlert, 
  Heart,
  Video,
  Layers,
  Sparkles,
  Zap,
  Star,
  RefreshCw,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/userService';

interface ExerciseDetailsProps {
  exerciseId: string;
  onNavigate: (page: string, exerciseId?: string) => void;
}

export const ExerciseDetails: React.FC<ExerciseDetailsProps> = ({ exerciseId, onNavigate }) => {
  const { profile, refreshProfile } = useAuth();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Timer & Logger States
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [completedSets, setCompletedSets] = useState<number>(0);
  const [completedLogs, setCompletedLogs] = useState<{ weight: number; reps: number }[]>([]);
  const [inputWeight, setInputWeight] = useState('');
  const [inputReps, setInputReps] = useState('');
  
  const [finishedWorkout, setFinishedWorkout] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Media Tab: 'gif' | 'video'
  const [mediaTab, setMediaTab] = useState<'gif' | 'video'>('gif');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const fetchExerciseAndRelated = async () => {
      try {
        const data = await getExerciseById(exerciseId);
        setExercise(data || null);
        
        const allData = await getExercises();
        setAllExercises(allData);

        if (data) {
          // prefill log target reps
          const matchedReps = data.recommendedSets.match(/\d+-\d+/);
          setInputReps(matchedReps ? matchedReps[0].split('-')[1] : '10');
          setInputWeight(profile?.weight ? Math.round(profile.weight * 0.4).toString() : '30');

          // Track recently viewed exercises (guarding against infinite loops)
          if (profile) {
            const currentRecent = profile.recentlyViewed || [];
            if (currentRecent[0] !== exerciseId) {
              const filteredRecent = currentRecent.filter(id => id !== exerciseId);
              const updatedRecent = [exerciseId, ...filteredRecent].slice(0, 6);
              updateUserProfile(profile.uid, { recentlyViewed: updatedRecent }).then(() => {
                refreshProfile();
              }).catch(err => console.error("Error saving recently viewed:", err));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching exercise details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExerciseAndRelated();
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
      <div className="flex flex-col items-center justify-center py-24 min-h-[50vh]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#7C3AED] border-t-transparent rounded-full mb-4"
        />
        <p className="text-xs font-bold uppercase tracking-widest text-[#A1A1AA]">Initializing Training Split details...</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="text-center py-16 bg-card-custom border border-border-custom rounded-3xl p-8 max-w-md mx-auto">
        <p className="text-[#A1A1AA] font-bold uppercase text-xs tracking-wider">Exercise blueprint not discovered.</p>
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="mt-6 px-6 py-3.5 bg-[#7C3AED] text-white rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
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
      // Calculate estimated calories burned (roughly 60 kcal for an exercise)
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

      // Update completed counter
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

  // Generate dynamic Unsplash illustrations depending on the muscle target
  const getIllustrationUrl = (muscleGroup: string) => {
    const normalized = muscleGroup.toLowerCase();
    if (normalized.includes('chest')) return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop';
    if (normalized.includes('back')) return 'https://images.unsplash.com/photo-1603287637292-ca1e9a8e5759?q=80&w=800&auto=format&fit=crop';
    if (normalized.includes('shoulder')) return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop';
    if (normalized.includes('arm')) return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop';
    if (normalized.includes('leg')) return 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop';
    if (normalized.includes('cardio')) return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop';
  };

  // Related Exercises: movements focusing on the exact same muscle group
  const alternativeExercises = allExercises
    .filter(ex => ex.muscleGroup === exercise.muscleGroup && ex.id !== exercise.id)
    .slice(0, 3);

  // Common Mistakes based on muscle group
  const getCommonMistakes = (muscleGroup: string) => {
    const mg = muscleGroup.toLowerCase();
    if (mg.includes('chest')) return ['Bouncing the bar or weights off your chest', 'Flaring elbows outward excessively', 'Lifting hips off the bench surface'];
    if (mg.includes('back')) return ['Rounding your lower spine', 'Using momentum to jerk the load', 'Failing to retract shoulder blades'];
    if (mg.includes('arm')) return ['Using hips to swing the weights', 'Elbows moving too far forward', 'Incomplete range of motion'];
    if (mg.includes('leg')) return ['Knees collapsing inward', 'Heels lifting off the ground', 'Improper depth in squat pattern'];
    return ['Using jerky, rapid tempos', 'Holding your breath during extension', 'Improper wrist positioning'];
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. COMPACT TOP HEADER NAVIGATION BAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>BACK TO DASHBOARD</span>
        </button>

        <button
          onClick={handleToggleFavorite}
          className={`inline-flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors px-4 py-2 bg-white/[0.02] border border-border-custom rounded-2xl ${
            isFav ? 'text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10' : 'text-[#A1A1AA] hover:text-[#EF4444]'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-[#EF4444]' : ''}`} />
          <span>{isFav ? 'REMOVE FAVORITE' : 'ADD TO FAVORITES'}</span>
        </button>
      </div>

      {/* 2. MAJESTIC LARGE HERO BANNER IMAGE FRAME */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#111827] to-[#09090B] border border-border-custom text-white rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Banner image mockup representing the kinetic movement */}
        <div className="w-full lg:w-1/3 h-56 lg:h-auto min-h-[220px] bg-zinc-100 dark:bg-[#09090B] rounded-2xl overflow-hidden relative border border-border-custom-light shrink-0">
          <img 
            src={getIllustrationUrl(exercise.muscleGroup)} 
            alt={exercise.name}
            className="w-full h-full object-cover opacity-60 filter brightness-90 contrast-115"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 bg-[#7C3AED]/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
            {exercise.muscleGroup} TARGET
          </div>
        </div>

        {/* Text descriptions blocks */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex gap-2.5">
              <span className="text-[10px] font-black text-[#7C3AED] bg-[#7C3AED]/15 border border-[#7C3AED]/30 px-3.5 py-1.5 rounded-xl uppercase tracking-wider">
                {exercise.muscleGroup}
              </span>
              <span className={`
                text-[10px] font-black px-3.5 py-1.5 rounded-xl border uppercase tracking-wider
                ${exercise.difficulty === 'Beginner' ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/20' : ''}
                ${exercise.difficulty === 'Intermediate' ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/20' : ''}
                ${exercise.difficulty === 'Advanced' ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20' : ''}
              `}>
                {exercise.difficulty}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none text-white">
              {exercise.name}
            </h1>

            <p className="text-sm text-[#A1A1AA] max-w-2xl leading-relaxed">
              {exercise.description}
            </p>
          </div>

          <div className="pt-4 border-t border-border-custom-light flex flex-wrap gap-6 text-xs text-[#A1A1AA] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-extrabold uppercase">Equipment:</span>
              <span className="bg-white/[0.02] border border-border-custom px-2.5 py-1 rounded-lg text-white font-semibold">{exercise.equipment}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-extrabold uppercase">Routine targets:</span>
              <span className="bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-2.5 py-1 rounded-lg text-white font-semibold">{exercise.recommendedSets} Sets</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKOUT ENGINE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Execution Form, Tips, Alternatives & Mistakes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Custom preview player with tabbed GIF / Video Preview selector */}
          <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-custom-light pb-4 mb-5">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Video className="w-4 h-4 text-[#7C3AED]" />
                <span>Routine Visual Form Simulator</span>
              </span>
              
              <div className="flex bg-zinc-100 dark:bg-[#09090B] p-1 rounded-xl border border-border-custom">
                <button
                  onClick={() => { setMediaTab('gif'); setIsVideoPlaying(false); }}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wide cursor-pointer transition-all ${
                    mediaTab === 'gif' ? 'bg-[#7C3AED] text-white' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  3D GIF Preview
                </button>
                <button
                  onClick={() => setMediaTab('video')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wide cursor-pointer transition-all ${
                    mediaTab === 'video' ? 'bg-[#7C3AED] text-white' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  HD Video Demo
                </button>
              </div>
            </div>

            {/* Immersive video simulator container frame */}
            <div className="w-full h-72 sm:h-96 bg-zinc-100 dark:bg-[#09090B] rounded-2xl overflow-hidden relative border border-border-custom-light flex items-center justify-center">
              {mediaTab === 'gif' ? (
                <>
                  <img 
                    src={getIllustrationUrl(exercise.muscleGroup)} 
                    alt="Kinetic model loop preview"
                    className="w-full h-full object-cover opacity-70 filter brightness-90 animate-pulse"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090B]/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#22C55E] rounded-full animate-ping" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest font-mono">Looping 3D bio-mechanical structure...</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full relative">
                  {!isVideoPlaying ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <button
                        onClick={() => setIsVideoPlaying(true)}
                        className="w-16 h-16 bg-[#7C3AED] hover:bg-violet-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                      >
                        <Play className="w-6 h-6 fill-white ml-1" />
                      </button>
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-wider">Stream form demonstration clip</p>
                        <p className="text-xs text-[#A1A1AA] mt-1">HD 60fps cinematic kinetic loop breakdown.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center">
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={() => setIsVideoPlaying(false)}
                          className="bg-white/10 text-white hover:bg-white/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
                        >
                          Pause Demo
                        </button>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="text-[#7C3AED] text-center"
                      >
                        <Video className="w-16 h-16 mx-auto mb-2 animate-bounce" />
                        <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">Streaming Form Tutorial Loop...</span>
                      </motion.div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form instructions checklist */}
          <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2.5 uppercase tracking-wide">
              <CheckCircle2 className="w-5 h-5 text-[#7C3AED]" />
              <span>Execution Checklist</span>
            </h3>

            <div className="space-y-3.5">
              {exercise.instructions.map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-white/[0.02] p-4.5 rounded-2xl border border-border-custom-light hover:border-white/[0.12] transition-colors">
                  <span className="w-6 h-6 rounded-lg bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed font-semibold">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips and Common Mistakes Side-By-Side Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Physiological Benefits */}
            <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl">
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                <TrendingUp className="w-4.5 h-4.5 text-[#22C55E]" />
                <span>Target Benefits</span>
              </h4>
              <ul className="space-y-3">
                {exercise.benefits.map((benefit, idx) => (
                  <li key={idx} className="text-xs text-[#A1A1AA] flex items-start gap-2.5 leading-relaxed font-semibold">
                    <span className="text-[#22C55E] font-black shrink-0 mt-0.5">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes */}
            <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl">
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                <XCircle className="w-4.5 h-4.5 text-[#EF4444]" />
                <span>Common Mistakes</span>
              </h4>
              <ul className="space-y-3">
                {getCommonMistakes(exercise.muscleGroup).map((mistake, idx) => (
                  <li key={idx} className="text-xs text-[#A1A1AA] flex items-start gap-2.5 leading-relaxed font-semibold">
                    <span className="text-[#EF4444] font-black shrink-0 mt-0.5">✗</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Alternative Exercises */}
          {alternativeExercises.length > 0 && (
            <div className="space-y-4 pt-4">
              <span className="text-[10px] font-black text-[#7C3AED] bg-[#7C3AED]/10 px-3.5 py-1.5 rounded-full uppercase tracking-widest block w-fit">
                ALTERNATIVE TARGET SPLITS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {alternativeExercises.map(alt => (
                  <div 
                    key={alt.id}
                    onClick={() => onNavigate('details', alt.id)}
                    className="bg-card-custom border border-border-custom hover:border-[#7C3AED]/40 p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-36"
                  >
                    <div>
                      <span className="text-[8px] font-black text-[#A1A1AA] uppercase">{alt.muscleGroup}</span>
                      <h4 className="text-xs font-black text-white mt-1 truncate uppercase">{alt.name}</h4>
                      <p className="text-[9px] text-[#A1A1AA] truncate">{alt.equipment}</p>
                    </div>
                    <span className="text-[10px] text-[#7C3AED] font-bold uppercase flex items-center gap-1 mt-3">
                      <span>View Altern</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right column: Rest Timer HUD & Logs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl sticky top-6">
            <div className="flex items-center justify-between border-b border-border-custom-light pb-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">Active Trainer HUD</h3>
                <p className="text-[10px] text-[#A1A1AA] mt-0.5">Log completed repetitions & weight metrics.</p>
              </div>
              <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-ping" />
            </div>

            <AnimatePresence mode="wait">
              {finishedWorkout ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-6 space-y-4"
                >
                  <div className="w-16 h-16 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">Kinetic set synchronized</h4>
                    <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed">
                      Split complete! +60 kcal calorie cost successfully synced to your profile metrics desk.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFinishedWorkout(false);
                      setCompletedSets(0);
                      setCompletedLogs([]);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] hover:opacity-95 text-white font-bold rounded-2xl text-xs uppercase tracking-widest cursor-pointer transition-all"
                  >
                    Restart Workout
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Rest countdown interval circle */}
                  <div className="flex flex-col items-center justify-center bg-zinc-100 dark:bg-[#09090B] border border-border-custom p-5 rounded-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED]/5 rounded-full blur-[40px] pointer-events-none" />
                    <span className="text-[10px] text-[#A1A1AA] font-black uppercase tracking-wider">REST TIMER</span>
                    
                    <span className="text-4xl font-black text-[#7C3AED] mt-2 font-mono">
                      00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </span>
                    
                    <div className="flex gap-2.5 mt-4">
                      <button
                        onClick={toggleTimer}
                        className="p-2.5 border border-border-custom rounded-xl hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                      >
                        {isTimerActive ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5" />}
                      </button>
                      <button
                        onClick={resetTimer}
                        className="p-2.5 border border-border-custom rounded-xl hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Weight / Reps Set Logger Inputs */}
                  <div className="bg-zinc-100 dark:bg-[#09090B] p-5 rounded-2xl border border-border-custom space-y-4">
                    <span className="text-[10px] text-[#A1A1AA] font-black uppercase tracking-widest block">Log Finished Set</span>
                    
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-wider block mb-1.5">WEIGHT (kg)</label>
                        <input
                          type="number"
                          value={inputWeight}
                          onChange={(e) => setInputWeight(e.target.value)}
                          className="w-full bg-card-custom border border-border-custom rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#7C3AED]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-wider block mb-1.5">REPETITIONS</label>
                        <input
                          type="number"
                          value={inputReps}
                          onChange={(e) => setInputReps(e.target.value)}
                          className="w-full bg-card-custom border border-border-custom rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-[#7C3AED]"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAddSetLog}
                      className="w-full py-3 bg-gradient-to-r from-[#7C3AED]/10 to-[#4F46E5]/10 border border-[#7C3AED]/30 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all hover:from-[#7C3AED] hover:to-[#4F46E5] cursor-pointer"
                    >
                      LOG SET {completedSets + 1}
                    </button>
                  </div>

                  {/* Completed set list tracker */}
                  {completedLogs.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-widest block">Session Set History</span>
                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                        {completedLogs.map((log, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-[#A1A1AA] bg-zinc-100 dark:bg-[#09090B] px-3.5 py-2.5 rounded-xl border border-white/[0.04] font-semibold font-mono">
                            <span>SET {idx + 1}</span>
                            <span className="text-white font-bold">{log.weight} kg x {log.reps} reps</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completion and synchronization trigger button */}
                  <button
                    onClick={handleFinishWorkout}
                    disabled={completedSets === 0 || syncing}
                    className="w-full bg-[#7C3AED] hover:bg-violet-600 disabled:opacity-40 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-[#7C3AED]/20 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {syncing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Sync Complete Split</span>
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
