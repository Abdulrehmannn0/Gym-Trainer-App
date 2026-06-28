import React, { useState, useEffect } from 'react';
import { getExercises } from '../services/exerciseService';
import { Exercise } from '../types';
import { 
  Search, 
  Dumbbell, 
  Layers, 
  Flame, 
  HelpCircle,
  TrendingUp,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface ExerciseLibraryProps {
  onNavigate: (page: string, exerciseId?: string) => void;
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ onNavigate }) => {
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

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-zinc-950 flex items-center space-x-3">
            <Dumbbell className="w-8 h-8 text-blue-600" />
            <span>COMPLETE EXERCISE LIBRARY</span>
          </h1>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider mt-1">
            BROWSE STEP-BY-STEP GYM TUTORIALS, TARGET SCHEMAS, AND CORRECT EXECUTION WORKFLOWS.
          </p>
        </div>
      </div>

      {/* Advanced Filters Block */}
      <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex items-center space-x-2 text-zinc-950 font-black text-xs uppercase tracking-widest">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span>ADVANCED FILTER DECK</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-900">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="SEARCH BY KEYWORD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-3 border-black font-black placeholder:font-bold text-xs tracking-wider uppercase py-2.5 pl-9 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Muscle selection */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-zinc-900 uppercase tracking-widest whitespace-nowrap">MUSCLE:</span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="flex-1 bg-white border-3 border-black text-zinc-900 font-black text-xs tracking-wider uppercase py-2.5 px-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              {groups.map(g => (
                <option key={g} value={g}>{g.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-zinc-900 uppercase tracking-widest whitespace-nowrap">LEVEL:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="flex-1 bg-white border-3 border-black text-zinc-900 font-black text-xs tracking-wider uppercase py-2.5 px-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
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
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-900 font-black text-xs uppercase tracking-widest">LOADING DATABASE SYSTEM...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border-4 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-zinc-500 text-xs font-mono uppercase">NO EXERCISES MATCHED THE CHOSEN BLUEPRINTS.</p>
          <button 
            onClick={() => { setSearch(''); setSelectedGroup('All'); setSelectedDifficulty('All'); }}
            className="mt-6 px-6 py-2.5 bg-black text-white text-xs font-black tracking-widest uppercase border-3 border-black shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:translate-y-0.5 transition-all"
          >
            CLEAR FILTERS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((ex) => (
            <div 
              key={ex.id}
              className="bg-white border-4 border-black p-6 flex flex-col md:flex-row gap-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
            >
              {/* Muscle Group Graphic Pill */}
              <div className="md:w-32 flex flex-col justify-center items-center bg-zinc-50 border-2 border-black p-4 text-center space-y-2 shrink-0">
                <Dumbbell className="w-6 h-6 text-blue-600" />
                <span className="text-xs font-black text-zinc-900 uppercase tracking-widest truncate max-w-full">
                  {ex.muscleGroup}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">MUSCLE UNIT</span>
              </div>

              {/* Main Text Block */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-black tracking-tight text-zinc-950 uppercase">{ex.name}</h3>
                    <span className={`
                      text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase tracking-widest shrink-0
                      ${ex.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-900' : ''}
                      ${ex.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-900' : ''}
                      ${ex.difficulty === 'Advanced' ? 'bg-rose-100 text-rose-900' : ''}
                    `}>
                      {ex.difficulty}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">EQUIPMENT: {ex.equipment}</p>
                  <p className="text-zinc-600 text-sm leading-relaxed mt-2 font-medium">{ex.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t-2 border-zinc-100 mt-auto">
                  <span className="text-xs text-zinc-500 font-black tracking-wider uppercase">{ex.recommendedSets}</span>
                  <button
                    onClick={() => onNavigate('details', ex.id)}
                    className="inline-flex items-center space-x-1.5 text-xs font-black tracking-widest uppercase text-zinc-950 hover:text-blue-600 transition-colors"
                  >
                    <span>VIEW BLUEPRINT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
