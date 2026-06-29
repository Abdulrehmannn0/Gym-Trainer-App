import React, { useState, useEffect } from 'react';
import { getExercises } from '../services/exerciseService';
import { Exercise } from '../types';
import { 
  Search, 
  Dumbbell, 
  SlidersHorizontal,
  ChevronRight,
  Heart,
  Play,
  Clock,
  Flame,
  Layers,
  Sparkles,
  BookmarkCheck,
  Star,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/userService';

interface ExerciseLibraryProps {
  onNavigate: (page: string, exerciseId?: string) => void;
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ onNavigate }) => {
  const { profile, refreshProfile } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced Search & Filter States
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

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
  
  // Extract unique equipments for the advanced filter dropdown
  const equipmentsList = ['All', ...Array.from(new Set(exercises.map(ex => ex.equipment).filter(Boolean)))];

  // Advanced Filtering Logic
  const filtered = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) || 
      ex.description.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(search.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(search.toLowerCase());
    
    const matchesGroup = selectedGroup === 'All' || ex.muscleGroup.toLowerCase() === selectedGroup.toLowerCase();
    const matchesDifficulty = selectedDifficulty === 'All' || ex.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    const matchesEquipment = selectedEquipment === 'All' || ex.equipment.toLowerCase() === selectedEquipment.toLowerCase();
    
    const isFav = (profile?.favorites || []).includes(ex.id);
    const matchesFavorites = !showOnlyFavorites || isFav;

    return matchesSearch && matchesGroup && matchesDifficulty && matchesEquipment && matchesFavorites;
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

  // Dynamic Image Generation/Lookup matching the muscle group style
  const getIllustrationUrl = (muscleGroup: string) => {
    const normalized = muscleGroup.toLowerCase();
    if (normalized.includes('chest')) return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop';
    if (normalized.includes('back')) return 'https://images.unsplash.com/photo-1603287637292-ca1e9a8e5759?q=80&w=400&auto=format&fit=crop';
    if (normalized.includes('shoulder')) return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop';
    if (normalized.includes('arm')) return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop';
    if (normalized.includes('leg')) return 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop';
    if (normalized.includes('cardio')) return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop'; // fallback
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-custom-primary flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-[#7C3AED]" />
            <span>Exercise & Routine Index</span>
          </h1>
          <p className="text-sm text-text-custom-secondary mt-1">
            Explore complete physical blueprints with detailed form, estimated energy cost, and kinetic targets.
          </p>
        </div>

        {/* Favorites only filter switch */}
        <button
          onClick={() => setShowOnlyFavorites(prev => !prev)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
            showOnlyFavorites 
              ? 'bg-[#7C3AED]/15 border-[#7C3AED] text-text-custom-primary shadow-md shadow-[#7C3AED]/10' 
              : 'bg-card-custom border-border-custom text-text-custom-secondary hover:text-text-custom-primary'
          }`}
        >
          <Star className={`w-4 h-4 ${showOnlyFavorites ? 'fill-[#7C3AED] text-[#7C3AED]' : ''}`} />
          <span>{showOnlyFavorites ? 'Showing Favorites Only' : 'Show Favorites Only'}</span>
        </button>
      </div>

      {/* 2. RECENTLY VIEWED ATHLETE TRAYS */}
      {recentExercises.length > 0 && (
        <div className="space-y-4">
          <span className="text-[10px] font-black text-[#7C3AED] bg-[#7C3AED]/10 px-3 py-1.5 rounded-full uppercase tracking-widest block w-fit">
            RECENTLY ACCESSED BLUEPRINTS
          </span>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
            {recentExercises.map(ex => (
              <div 
                key={`recent-${ex.id}`}
                onClick={() => handleViewBlueprint(ex.id)}
                className="group bg-card-custom border border-border-custom hover:border-[#7C3AED]/40 p-4 rounded-2xl min-w-[220px] max-w-[260px] hover:scale-[1.02] cursor-pointer transition-all space-y-3 shrink-0 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-[#7C3AED] uppercase">{ex.muscleGroup}</span>
                    <span className="text-[8px] font-bold text-text-custom-primary bg-zinc-100 dark:bg-white/[0.04] px-2 py-0.5 rounded uppercase">{ex.difficulty}</span>
                  </div>
                  <h4 className="text-sm font-black text-text-custom-primary uppercase truncate mt-2 group-hover:text-[#7C3AED] transition-colors">{ex.name}</h4>
                  <p className="text-[10px] text-text-custom-secondary truncate">{ex.equipment}</p>
                </div>
                <div className="text-[10px] text-[#7C3AED] font-bold uppercase flex items-center gap-1 pt-2 border-t border-border-custom-light">
                  <span>Launch Blueprint</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ADVANCED SEARCH & FILTER DECKS */}
      <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border-custom-light pb-4">
          <div className="flex items-center gap-2.5 text-text-custom-primary font-black text-sm uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-[#7C3AED]" />
            <span>Interactive Filtering Engine</span>
          </div>
          <button
            onClick={() => {
              setSearch('');
              setSelectedGroup('All');
              setSelectedDifficulty('All');
              setSelectedEquipment('All');
              setShowOnlyFavorites(false);
            }}
            className="text-xs text-text-custom-secondary hover:text-text-custom-primary transition-all font-bold uppercase"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Keyword Search Autocomplete Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-custom-secondary">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search index..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#09090B] border border-border-custom text-text-custom-primary rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#7C3AED] transition-all"
            />
          </div>

          {/* Muscle Target Chips Selection */}
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-[#09090B] border border-border-custom px-3 py-1 rounded-2xl">
            <span className="text-[9px] font-black text-text-custom-secondary uppercase tracking-wider">MUSCLE:</span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="flex-1 bg-transparent border-none text-text-custom-primary text-xs font-bold outline-none cursor-pointer"
            >
              {groups.map(g => (
                <option key={g} value={g} className="bg-card-custom text-text-custom-primary">{g.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Level Dropdown */}
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-[#09090B] border border-border-custom px-3 py-1 rounded-2xl">
            <span className="text-[9px] font-black text-text-custom-secondary uppercase tracking-wider">LEVEL:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="flex-1 bg-transparent border-none text-text-custom-primary text-xs font-bold outline-none cursor-pointer"
            >
              {difficulties.map(d => (
                <option key={d} value={d} className="bg-card-custom text-text-custom-primary">{d.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Equipment Dropdown */}
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-[#09090B] border border-border-custom px-3 py-1 rounded-2xl">
            <span className="text-[9px] font-black text-text-custom-secondary uppercase tracking-wider">EQUIP:</span>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="flex-1 bg-transparent border-none text-text-custom-primary text-xs font-bold outline-none cursor-pointer"
            >
              {equipmentsList.map(eq => (
                <option key={eq} value={eq} className="bg-card-custom text-text-custom-primary">{eq.toUpperCase()}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Visual category tags chips bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2">
          {groups.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedGroup(category)}
              className={`
                px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-wider cursor-pointer
                ${selectedGroup === category
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20'
                  : 'bg-zinc-100 dark:bg-white/[0.03] border border-border-custom-light text-text-custom-secondary hover:bg-zinc-200 dark:hover:bg-white/[0.06] hover:text-text-custom-primary'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 4. PREMIUM CARD GRID LIST */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-card-custom border border-border-custom rounded-3xl p-6 h-64 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card-custom border border-border-custom rounded-3xl p-8">
          <Compass className="w-12 h-12 text-text-custom-secondary mx-auto mb-4 animate-bounce" />
          <p className="text-text-custom-secondary font-bold uppercase tracking-wider text-sm">No exercises matched the query constraints.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((ex) => {
            const isFav = (profile?.favorites || []).includes(ex.id);
            
            // Derive static aesthetic values safely
            const isAdvanced = ex.difficulty.toLowerCase() === 'advanced';
            const isIntermediate = ex.difficulty.toLowerCase() === 'intermediate';
            
            const estTime = isAdvanced ? '25 mins' : isIntermediate ? '20 mins' : '15 mins';
            const estCalories = isAdvanced ? '240 kcal' : isIntermediate ? '180 kcal' : '120 kcal';

            return (
              <motion.div 
                key={ex.id}
                whileHover={{ y: -4 }}
                className="bg-card-custom border border-border-custom p-6 rounded-3xl flex flex-col sm:flex-row gap-6 hover:border-[#7C3AED]/40 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Visual Thumbnail Frame with Dark Gradients */}
                <div className="w-full sm:w-44 h-40 sm:h-full bg-zinc-200 dark:bg-[#09090B] rounded-2xl overflow-hidden relative border border-border-custom-light shrink-0">
                  <img 
                    src={getIllustrationUrl(ex.muscleGroup)} 
                    alt={ex.name}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500 filter brightness-90 contrast-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-200 dark:from-[#09090B] via-transparent to-transparent pointer-events-none" />
                  
                  {/* Muscle Group floating pill */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[9px] font-black text-white bg-[#7C3AED]/80 backdrop-blur-md px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {ex.muscleGroup}
                    </span>
                  </div>
                </div>

                {/* Main Content Details Block */}
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black text-text-custom-primary tracking-tight group-hover:text-[#7C3AED] transition-colors leading-tight uppercase">
                          {ex.name}
                        </h3>
                        <p className="text-[10px] text-text-custom-secondary font-bold uppercase mt-1 tracking-widest">
                          EQUIPMENT: {ex.equipment}
                        </p>
                      </div>

                      {/* Favorite icon trigger */}
                      <button
                        onClick={() => handleToggleFavorite(ex.id)}
                        className={`p-2 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-border-custom-light hover:bg-[#EF4444]/15 hover:border-[#EF4444]/20 transition-all cursor-pointer ${
                          isFav ? 'text-[#EF4444] bg-[#EF4444]/10' : 'text-text-custom-secondary hover:text-text-custom-primary'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-[#EF4444] text-[#EF4444]' : ''}`} />
                      </button>
                    </div>

                    <p className="text-text-custom-secondary text-xs leading-relaxed mt-3 line-clamp-2">
                      {ex.description}
                    </p>

                    {/* Meta statistics values inside the card */}
                    <div className="flex items-center gap-4 text-[10px] font-mono text-text-custom-secondary pt-3 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-white/[0.02] border border-border-custom-light px-2.5 py-1.5 rounded-xl">
                        <Clock className="w-3.5 h-3.5 text-[#7C3AED]" />
                        <span>EST: {estTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-white/[0.02] border border-border-custom-light px-2.5 py-1.5 rounded-xl">
                        <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                        <span>BURN: {estCalories}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sets indicator, Difficulty Badge, and Details view CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-border-custom-light mt-auto">
                    <span className={`
                      text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border
                      ${ex.difficulty === 'Beginner' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' : ''}
                      ${ex.difficulty === 'Intermediate' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' : ''}
                      ${ex.difficulty === 'Advanced' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' : ''}
                    `}>
                      {ex.difficulty}
                    </span>

                    <button
                      onClick={() => handleViewBlueprint(ex.id)}
                      className="bg-zinc-100 dark:bg-white/[0.03] border border-border-custom-light hover:bg-[#7C3AED] hover:border-[#7C3AED] hover:text-white text-text-custom-primary hover:text-white font-bold text-[10px] uppercase tracking-widest px-4.5 py-3 rounded-2xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>BluePrint details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
};
