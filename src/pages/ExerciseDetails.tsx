import React, { useState, useEffect } from 'react';
import { getExerciseById } from '../services/exerciseService';
import { Exercise } from '../types';
import { 
  ArrowLeft, 
  Dumbbell, 
  PlayCircle, 
  Sparkles, 
  ListOrdered, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Zap,
  ChevronRight
} from 'lucide-react';

interface ExerciseDetailsProps {
  exerciseId: string;
  onNavigate: (page: string) => void;
}

export const ExerciseDetails: React.FC<ExerciseDetailsProps> = ({ exerciseId, onNavigate }) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const data = await getExerciseById(exerciseId);
        setExercise(data);
      } catch (err) {
        console.error('Error fetching exercise details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (exerciseId) {
      fetchExercise();
    }
  }, [exerciseId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-950 font-black text-xs uppercase tracking-widest">LOADING DETAIL SCHEMATIC...</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="bg-white border-4 border-black p-8 text-center max-w-lg mx-auto mt-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <HelpCircle className="w-12 h-12 text-zinc-950 mx-auto mb-4" />
        <p className="text-zinc-950 font-black text-xl uppercase tracking-tight">BLUEPRINT NOT FOUND</p>
        <p className="text-zinc-500 text-xs font-mono uppercase mt-1">THE TRAINING DATA FOR THIS MOVEMENT WAS CORRUPTED OR IS MISSING.</p>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="mt-6 px-6 py-2.5 bg-black text-white text-xs font-black tracking-widest uppercase border-3 border-black shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:translate-y-0.5 transition-all"
        >
          RETURN TO DASHBOARD
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back to exercises button */}
      <div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-zinc-950 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO EXERCISES</span>
        </button>
      </div>

      {/* Main Hero Header Card */}
      <div className="bg-zinc-950 text-white rounded-none border-4 border-black p-6 sm:p-8 relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -mr-20 -mt-20" />
        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black bg-blue-600 text-white px-3 py-1 border-2 border-white uppercase tracking-wider">
              {exercise.muscleGroup}
            </span>
            <span className={`
              text-xs font-black px-3 py-1 uppercase tracking-wider border-2
              ${exercise.difficulty === 'Beginner' ? 'bg-emerald-950 text-emerald-400 border-emerald-700' : ''}
              ${exercise.difficulty === 'Intermediate' ? 'bg-amber-950 text-amber-400 border-amber-700' : ''}
              ${exercise.difficulty === 'Advanced' ? 'bg-rose-950 text-rose-400 border-rose-700' : ''}
            `}>
              {exercise.difficulty}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase italic leading-none">{exercise.name}</h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl font-medium">{exercise.description}</p>

          <div className="grid grid-cols-2 gap-4 pt-5 border-t-2 border-zinc-800 max-w-xl">
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">EQUIPMENT REQUIRED</p>
              <p className="text-sm font-black text-white mt-1.5 flex items-center uppercase tracking-wide">
                <Dumbbell className="w-4 h-4 text-blue-500 mr-1.5" />
                <span>{exercise.equipment}</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">SUGGESTED VOLUME</p>
              <p className="text-sm font-black text-white mt-1.5 flex items-center uppercase tracking-wide">
                <Clock className="w-4 h-4 text-blue-500 mr-1.5" />
                <span>{exercise.recommendedSets}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Training Panel */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Step-by-Step Guide Column (Takes 3 columns) */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <h2 className="text-xl font-black text-zinc-950 flex items-center space-x-2 border-b-2 border-black pb-4 uppercase tracking-tight">
              <ListOrdered className="w-5 h-5 text-blue-600" />
              <span>PERFORMANCE METHODOLOGY</span>
            </h2>

            <ol className="space-y-6">
              {exercise.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-4 items-start">
                  <div className="bg-blue-600 text-white border-2 border-black w-7 h-7 flex items-center justify-center font-black font-mono text-xs uppercase shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-900 text-sm sm:text-base leading-relaxed font-bold">
                      {step}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Benefits & Form Tips Column (Takes 2 columns) */}
        <div className="md:col-span-2 space-y-6">
          {/* Target Benefits Card */}
          <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h2 className="text-base font-black text-zinc-950 flex items-center space-x-2 border-b-2 border-black pb-3 uppercase tracking-tight">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>TARGET BIOMECHANICS</span>
            </h2>

            <ul className="space-y-3">
              {exercise.benefits.map((benefit, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-zinc-900 text-sm font-bold leading-normal">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Form Safety Reminder card */}
          <div className="bg-blue-50 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(59,130,246,0.15)] space-y-3">
            <h3 className="text-sm font-black text-zinc-950 flex items-center space-x-2 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>FORM & SAFETY STANDARDS</span>
            </h3>
            <p className="text-zinc-800 text-xs leading-relaxed font-bold uppercase font-mono">
              ALWAYS CONDUCE THOROUGH SYSTEM WARMUPS BEFORE STARTING HEAVY RESISTANCE WORK. MAINTAIN STRICT REPETITION INTEGRITY, KEEP EXCURSIONS CONTROLLED, AND PRIORITIZE SAFETY.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
