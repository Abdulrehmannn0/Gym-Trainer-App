import React, { useState, useEffect } from 'react';
import { getExercises } from '../services/exerciseService';
import { Exercise } from '../types';
import { 
  Search, 
  Dumbbell, 
  HelpCircle,
  SlidersHorizontal,
  ChevronRight,
  Heart,
  Plus,
  Play
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/userService';

interface ExerciseLibraryProps {
  onNavigate: (page: string, exerciseId?: string) => void;
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ onNavigate }) => {
  const { profile, refreshProfile } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const data = await getExercises();
        setExercises(data);
      } catch (err) {
        console.error('Error loading library:', err);
      } finally {
        setLoading(false);
      }
    };
    loadExercises();
  }, []);

  const groups = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Advanced Filtering
  const filtered = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) || 
      ex.description.toLowerCase().includes(search.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(search.toLowerCase());
    
    const matchesGroup = selectedGroup === 'All' || ex.muscleGroup === selectedGroup;
    const matchesDifficulty = selectedDifficulty === 'All' || ex.difficulty === selectedDifficulty;

    return matchesSearch && matchesGroup && matchesDifficulty;
  });

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

  const handleViewBlueprint = async (exId: string) => {
    if (profile) {
      const currentRecent = profile.recentlyViewed || [];
      const updatedRecent = [exId, ...currentRecent.filter(id => id !== exId)].slice(0, 10);
      try {
        await updateUserProfile(profile.uid, { recentlyViewed: updatedRecent });
        await refreshProfile();
      } catch (err) {
        console.error('Error saving recently viewed exercise:', err);
      }
    }
    onNavigate('details', exId);
  };

  const recentExercises = exercises.filter(ex => (profile?.recentlyViewed || []).includes(ex.id));

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
          <Dumbbell className="w-8 h-8 text-indigo-500" />
          <span>Exercise & Movement Library</span>
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Explore complete physical blueprints with detailed form, sets, reps, and biomechanical targets.
        </p>
      </div>

      {/* Recently Viewed Horizontal Tray */}
      {recentExercises.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">RECENTLY VIEWED BLUEPRINTS</span>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {recentExercises.map(ex => (
              <div 
                key={`recent-${ex.id}`}
                onClick={() => handleViewBlueprint(ex.id)}
                className="bg-white dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-850 p-4 rounded-xl min-w-[200px] max-w-[240px] hover:scale-[1.02] cursor-pointer transition-all space-y-2 shrink-0 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">{ex.muscleGroup}</span>
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase truncate">{ex.name}</h4>
                  <p className="text-[10px] text-zinc-400">{ex.difficulty}</p>
                </div>
                <div className="text-[9px] text-indigo-500 font-bold uppercase flex items-center gap-1 mt-2">
                  <span>View Details</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters Block */}
      <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          <span>Advanced Filter Deck</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Muscle selection */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">MUSCLE:</span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {groups.map(g => (
                <option key={g} value={g}>{g.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Selection */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">LEVEL:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {difficulties.map(d => (
                <option key={d} value={d}>{d.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-8 shadow-sm">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">No movements matched your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((ex) => {
            const isFav = (profile?.favorites || []).includes(ex.id);
            return (
              <div 
                key={ex.id}
                className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-2xl flex flex-col sm:flex-row gap-5 shadow-sm hover:shadow-lg transition-all duration-200"
              >
                {/* Muscle Group Graphic Pill */}
                <div className="sm:w-32 flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/50 p-4 rounded-xl text-center space-y-2 shrink-0">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-500">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider truncate max-w-full">
                    {ex.muscleGroup}
                  </span>
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">MUSCLE UNIT</span>
                </div>

                {/* Main Text Block */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white uppercase">{ex.name}</h3>
                      <div className="flex items-center gap-1.5">
                        <span className={`
                          text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider
                          ${ex.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : ''}
                          ${ex.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : ''}
                          ${ex.difficulty === 'Advanced' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : ''}
                        `}>
                          {ex.difficulty}
                        </span>

                        <button
                          onClick={() => handleToggleFavorite(ex.id)}
                          className={`p-1 rounded-full transition-colors cursor-pointer ${
                            isFav ? 'text-rose-500' : 'text-zinc-300 dark:text-zinc-600 hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">EQUIPMENT: {ex.equipment}</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mt-3.5 font-medium line-clamp-2">{ex.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3.5 border-t border-zinc-100 dark:border-zinc-800/50 mt-auto">
                    <span className="text-xs text-zinc-400 font-semibold">{ex.recommendedSets} TARGET</span>
                    <button
                      onClick={() => handleViewBlueprint(ex.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      <span>VIEW BLUEPRINT</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
