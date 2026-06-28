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
  ShieldCheck, 
  Heart,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  onNavigate: (page: string, exerciseId?: string) => void;
}

const CATEGORIES = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

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

  // Filter exercises
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
      exercise.muscleGroup.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Calculate stats for widgets
  const totalWorkouts = exercises.length;
  const beginnerCount = exercises.filter(e => e.difficulty === 'Beginner').length;
  const intermediateCount = exercises.filter(e => e.difficulty === 'Intermediate').length;
  const advancedCount = exercises.filter(e => e.difficulty === 'Advanced').length;

  return (
    <div className="space-y-8">
      {/* Upper Header Welcome Banner */}
      <div className="bg-zinc-950 text-white rounded-none border-4 border-black p-6 sm:p-8 relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-1.5 bg-blue-500 text-white px-3 py-1 text-xs font-black tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>DASHBOARD ACTIVE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
              HELLO, <span className="text-blue-500 underline decoration-4 decoration-white">{profile?.name || 'ATHLETE'}</span>!
            </h1>
            <p className="text-zinc-400 text-xs font-mono max-w-md uppercase tracking-wider">
              YOUR WORKSPACE IS FULLY OPERATIONAL. DEFINE YOUR ROUTINES, EXAMINE EQUIPMENT STANDARDS, AND SHATTER LIMITS.
            </p>
          </div>
          <div className="flex items-center space-x-4 bg-zinc-900 p-4 border-2 border-zinc-800 self-start md:self-auto">
            <div className="bg-blue-600 p-3 text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">DAILY STREAK</p>
              <p className="text-xl font-black text-white italic">5 ACTIVE DAYS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Dashboard Info Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-4">
          <div className="bg-blue-50 p-3 text-blue-600 border-2 border-black">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">TOTAL MOVES</p>
            <p className="text-2xl font-black text-zinc-900">{totalWorkouts}</p>
          </div>
        </div>

        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-4">
          <div className="bg-emerald-50 p-3 text-emerald-600 border-2 border-black">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">BEGINNER</p>
            <p className="text-2xl font-black text-zinc-900">{beginnerCount}</p>
          </div>
        </div>

        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-4">
          <div className="bg-amber-50 p-3 text-amber-600 border-2 border-black">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">INTERMEDIATE</p>
            <p className="text-2xl font-black text-zinc-900">{intermediateCount}</p>
          </div>
        </div>

        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-4">
          <div className="bg-rose-50 p-3 text-rose-600 border-2 border-black">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">ADVANCED</p>
            <p className="text-2xl font-black text-zinc-900">{advancedCount}</p>
          </div>
        </div>
      </div>

      {/* Main Search and Categories Filter Bar */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tighter flex items-center space-x-3">
            <span>EXPLORE WORKOUTS</span>
            <span className="text-xs font-mono bg-zinc-950 text-white px-2.5 py-0.5">{filteredExercises.length} ITEMS</span>
          </h2>

          {/* Search Input Bar */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-900">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="SEARCH WORKOUTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-3 border-black font-black placeholder:font-bold text-sm tracking-wider uppercase py-2.5 pl-9 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Categories Horizontal Slider Bar */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-5 py-2 border-3 border-black text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap cursor-pointer
                ${selectedCategory === category
                  ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(59,130,246,1)]'
                  : 'bg-white text-zinc-800 hover:bg-zinc-50'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Grid List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-900 font-black text-xs uppercase tracking-widest">SYNCING SYSTEM INDEX...</p>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-16 bg-white border-4 border-dashed border-zinc-300 p-8">
          <div className="bg-zinc-100 p-4 border-2 border-black inline-flex mb-4">
            <Search className="w-8 h-8 text-black" />
          </div>
          <p className="text-zinc-950 font-black text-xl uppercase tracking-tight">NO MATCHING EXERCISES</p>
          <p className="text-zinc-500 text-xs font-mono uppercase mt-1.5 max-w-md mx-auto">
            WE COULD NOT FIND AN EXERCISE MATCHING "{searchQuery}". RETRY FILTER QUERY.
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="mt-6 px-6 py-2.5 bg-black text-white text-xs font-black tracking-widest uppercase border-3 border-black shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:translate-y-0.5 transition-all"
          >
            RESET ALL FILTERS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex flex-col h-full"
            >
              {/* Header Badge Strip */}
              <div className="p-6 flex-1 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-white bg-blue-600 px-3 py-1 border-2 border-black uppercase tracking-wider">
                      {exercise.muscleGroup}
                    </span>
                    <span className={`
                      text-xs font-black uppercase tracking-widest px-2.5 py-1 border-2 border-black
                      ${exercise.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-900' : ''}
                      ${exercise.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-900' : ''}
                      ${exercise.difficulty === 'Advanced' ? 'bg-rose-100 text-rose-900' : ''}
                    `}>
                      {exercise.difficulty}
                    </span>
                  </div>

                  <h3 className="font-black text-zinc-950 text-xl tracking-tight group-hover:text-blue-600 transition-colors duration-150 line-clamp-1 uppercase">
                    {exercise.name}
                  </h3>
                  
                  <p className="text-zinc-500 text-xs mt-2 font-mono flex items-center uppercase tracking-wider">
                    <span className="text-zinc-400 mr-1.5">GEAR:</span> 
                    <span className="text-zinc-950 font-black truncate">{exercise.equipment}</span>
                  </p>

                  <p className="text-zinc-600 text-sm mt-4 line-clamp-3 leading-relaxed font-medium">
                    {exercise.description}
                  </p>
                </div>
              </div>

              {/* Action Bar Footer */}
              <div className="px-6 py-4 border-t-3 border-black bg-zinc-50 flex items-center justify-between mt-auto">
                <span className="text-xs font-mono text-zinc-500 font-bold uppercase tracking-wider">
                  {exercise.recommendedSets.split(' ')[0]} SETS TARGET
                </span>
                <button
                  onClick={() => onNavigate('details', exercise.id)}
                  className="inline-flex items-center space-x-1.5 text-xs font-black tracking-widest uppercase text-zinc-950 group-hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>VIEW DETAILS</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
