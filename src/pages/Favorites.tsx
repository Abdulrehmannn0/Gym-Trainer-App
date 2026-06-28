import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Dumbbell, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  Search,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getExercises } from '../services/exerciseService';
import { Exercise } from '../types';
import { updateUserProfile } from '../services/userService';

interface FavoritesProps {
  onNavigate: (page: string, exerciseId?: string) => void;
}

export const Favorites: React.FC<FavoritesProps> = ({ onNavigate }) => {
  const { profile, refreshProfile } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

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

  const favoritedIds = profile?.favorites || [];
  const favoritedExercises = exercises.filter(e => favoritedIds.includes(e.id));

  const handleRemoveFavorite = async (exerciseId: string) => {
    if (!profile) return;
    const currentFavs = profile.favorites || [];
    const updatedFavs = currentFavs.filter(id => id !== exerciseId);
    
    await updateUserProfile(profile.uid, { favorites: updatedFavs });
    await refreshProfile();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          <span>My Favorite Exercises</span>
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Quickly launch, preview, and follow instructions for your customized set of curated routines.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-900 dark:text-zinc-200 font-bold text-xs uppercase tracking-widest">LOADING PRESETS...</p>
        </div>
      ) : favoritedExercises.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-full inline-flex mb-4 items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <p className="text-zinc-900 dark:text-white font-extrabold text-lg uppercase tracking-tight">No Favorites Yet</p>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1.5 leading-relaxed">
            Curate your ideal workouts by tap-selecting the hearts on any exercise card in the library.
          </p>
          <button 
            onClick={() => onNavigate('library')}
            className="mt-6 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-all shadow-md cursor-pointer"
          >
            Explore Exercise Library
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritedExercises.map((exercise) => (
            <motion.div
              key={exercise.id}
              whileHover={{ y: -4 }}
              className="group bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full">
                    {exercise.muscleGroup}
                  </span>
                  
                  <button
                    onClick={() => handleRemoveFavorite(exercise.id)}
                    className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 transition-colors cursor-pointer"
                  >
                    <Heart className="w-5 h-5 fill-rose-500" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-indigo-500 transition-colors line-clamp-1">
                  {exercise.name}
                </h3>
                
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mt-1 uppercase tracking-wider">
                  Equipment: <strong className="text-zinc-700 dark:text-zinc-300">{exercise.equipment}</strong>
                </p>

                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3.5 line-clamp-3 leading-relaxed">
                  {exercise.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-950/20 rounded-b-2xl flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">
                  {exercise.recommendedSets} TARGET
                </span>
                
                <button
                  onClick={() => onNavigate('details', exercise.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-white group-hover:text-indigo-500 transition-colors cursor-pointer"
                >
                  <span>Launch Workout</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recently Viewed Section */}
      {profile?.recentlyViewed && profile.recentlyViewed.length > 0 && (
        <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800/50 mt-10">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Recently Viewed Routines</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {exercises
              .filter(e => profile.recentlyViewed?.includes(e.id))
              .sort((a, b) => {
                const idxA = profile.recentlyViewed?.indexOf(a.id) ?? 0;
                const idxB = profile.recentlyViewed?.indexOf(b.id) ?? 0;
                return idxA - idxB;
              })
              .slice(0, 3)
              .map((exercise) => (
                <div 
                  key={exercise.id}
                  className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 flex items-center justify-between hover:border-indigo-500/40 transition-all cursor-pointer group"
                  onClick={() => onNavigate('details', exercise.id)}
                >
                  <div className="space-y-1 min-w-0 flex-1 pr-2">
                    <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{exercise.muscleGroup}</span>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-indigo-500 transition-colors">{exercise.name}</h4>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
