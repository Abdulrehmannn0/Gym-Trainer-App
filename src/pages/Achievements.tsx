import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  Droplet, 
  Dumbbell, 
  Crown,
  Zap,
  Users,
  Trophy,
  Target,
  Check,
  ArrowUp,
  TrendingUp,
  Sparkle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getChallenges, updateChallengeProgress } from '../services/fitnessService';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { Challenge } from '../types';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  checkUnlocked: (profile: any) => boolean;
}

const BADGES: Badge[] = [
  {
    id: 'first-step',
    title: 'First Step Athlete',
    description: 'Create your elite training profile to initiate strength blueprints.',
    icon: Award,
    color: 'from-blue-500 to-indigo-500',
    checkUnlocked: () => true
  },
  {
    id: 'workout-one',
    title: 'Shattered Limits',
    description: 'Complete at least 1 plan workout inside the training simulator.',
    icon: Dumbbell,
    color: 'from-amber-500 to-orange-500',
    checkUnlocked: (prof) => (prof?.completedWorkoutsCount || 0) >= 1
  },
  {
    id: 'streak-five',
    title: 'Undefeated Streak',
    description: 'Achieve a 5-day continuous workout training streak.',
    icon: Flame,
    color: 'from-orange-500 to-rose-500',
    checkUnlocked: (prof) => (prof?.streak || 0) >= 5
  },
  {
    id: 'aqua-master',
    title: 'Aqua Commander',
    description: 'Successfully log or record water intake habits.',
    icon: Droplet,
    color: 'from-sky-400 to-blue-500',
    checkUnlocked: (prof) => (prof?.waterHistory || []).length >= 1
  },
  {
    id: 'curator',
    title: 'Routine Curator',
    description: 'Save 3 or more high-performance movements to your favorites.',
    icon: Crown,
    color: 'from-violet-500 to-purple-500',
    checkUnlocked: (prof) => (prof?.favorites || []).length >= 3
  },
  {
    id: 'titanium',
    title: 'Titanium Muscle',
    description: 'Accomplish 10 or more finished training sessions.',
    icon: Zap,
    color: 'from-emerald-400 to-teal-500',
    checkUnlocked: (prof) => (prof?.completedWorkoutsCount || 0) >= 10
  }
];

// Seeded mock competitors to combine with live Firestore users for leaderboard depth
const BASE_LEADERBOARD = [
  { name: 'Marcus Aurelius (Titan)', completedCount: 28, streak: 18, isMe: false, rank: 1 },
  { name: 'Sophia Chen (Pro)', completedCount: 22, streak: 12, isMe: false, rank: 2 },
  { name: 'Alex Rivera (Elite)', completedCount: 16, streak: 8, isMe: false, rank: 3 }
];

export const Achievements: React.FC = () => {
  const { profile } = useAuth();
  
  // Tabs: 'badges' | 'challenges' | 'leaderboard'
  const [activeTab, setActiveTab] = useState<'badges' | 'challenges' | 'leaderboard'>('badges');
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.uid) {
      const loadAchievementsData = async () => {
        setLoading(true);
        try {
          const chList = await getChallenges(profile.uid);
          setChallenges(chList);

          // Fetch all real registered users from Firestore to build dynamic leaderboard
          const usersRef = collection(db, 'users');
          const snap = await getDocs(usersRef);
          
          const realUsers: any[] = [];
          snap.forEach((doc) => {
            const data = doc.data();
            realUsers.push({
              name: data.name || 'Anonymous Athlete',
              completedCount: data.completedWorkoutsCount || 0,
              streak: data.streak || 0,
              isMe: doc.id === profile.uid
            });
          });

          // Fallback if current user isn't in DB yet
          if (!realUsers.some(u => u.isMe)) {
            realUsers.push({
              name: profile.name || 'Me',
              completedCount: profile.completedWorkoutsCount || 0,
              streak: profile.streak || 5,
              isMe: true
            });
          }

          // Combine real users with mock competitors for competitive density
          const mergedList = [...realUsers];
          BASE_LEADERBOARD.forEach(comp => {
            if (!mergedList.some(u => u.name === comp.name)) {
              mergedList.push({
                name: comp.name,
                completedCount: comp.completedCount,
                streak: comp.streak,
                isMe: false
              });
            }
          });

          // Sort by completed count desc
          mergedList.sort((a, b) => b.completedCount - a.completedCount);
          
          // Map ranks
          const ranked = mergedList.map((u, index) => ({
            ...u,
            rank: index + 1
          }));

          setLeaderboardUsers(ranked);
        } catch (err) {
          console.error('Error fetching achievements data:', err);
        } finally {
          setLoading(false);
        }
      };
      loadAchievementsData();
    }
  }, [profile?.uid, activeTab]);

  const handleManualChallengeClaim = async (cid: string) => {
    if (!profile) return;
    try {
      // Manual increment of 1 target point
      await updateChallengeProgress(profile.uid, cid, 1, true);
      const updated = await getChallenges(profile.uid);
      setChallenges(updated);
    } catch (err) {
      console.error('Error claiming challenge point:', err);
    }
  };

  const unlockedCount = BADGES.filter(b => b.checkUnlocked(profile)).length;
  const progressPercent = Math.round((unlockedCount / BADGES.length) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500 animate-bounce" />
            <span>Achievements & Standings</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Browse unlocked badges, complete Weekly/Monthly challenges, and scale the global athletic standings.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex p-1 bg-zinc-200/60 dark:bg-zinc-900/60 border border-zinc-300/20 rounded-2xl gap-1 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'badges' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Trophy Room</span>
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'challenges' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Challenges</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'leaderboard' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Compiling Standings Ledger...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">

          {/* TAB 1: Trophy Room */}
          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Progress Summary Card */}
              <div className="bg-zinc-950 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl border border-zinc-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -mr-16 -mt-16" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">LEVEL METRICS SUMMARY</span>
                    <h2 className="text-2xl font-black uppercase tracking-tight">
                      Unlocked <span className="text-amber-400">{unlockedCount}</span> of <span className="text-amber-400">{BADGES.length}</span> Medals
                    </h2>
                    <p className="text-xs text-zinc-400 max-w-md">
                      Your physical trajectory is monitored in real-time. Unlocking awards validates your elite status.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl min-w-[200px]">
                    <div className="flex-1">
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">TROPHY LEVEL</span>
                      <span className="text-2xl font-black text-white font-mono">{progressPercent}%</span>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-amber-400 h-full" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {BADGES.map((badge) => {
                  const isUnlocked = badge.checkUnlocked(profile);
                  const Icon = badge.icon;
                  
                  return (
                    <motion.div
                      key={badge.id}
                      whileHover={{ y: -3 }}
                      className={`
                        border rounded-2xl p-6 flex items-start gap-4 transition-all relative overflow-hidden
                        ${isUnlocked 
                          ? 'bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border-zinc-200/80 dark:border-zinc-800/80 shadow-sm' 
                          : 'bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-100 dark:border-zinc-900/30 opacity-75'
                        }
                      `}
                    >
                      <div className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border relative z-10
                        ${isUnlocked
                          ? `bg-gradient-to-br ${badge.color} text-white border-transparent shadow-lg`
                          : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                        }
                      `}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1 relative z-10">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`text-sm font-black uppercase ${isUnlocked ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                            {badge.title}
                          </h3>
                          {isUnlocked ? (
                            <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-zinc-400" />
                          )}
                        </div>
                        
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {badge.description}
                        </p>

                        {isUnlocked && (
                          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block uppercase tracking-wider mt-2.5">
                            Unlocked
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 2: Challenges */}
          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-500" />
                    <span>Active Combat Quests</span>
                  </h3>
                  <p className="text-xs text-zinc-500">Challenges are updated based on training simulator logs.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges.map((c) => {
                  const percent = Math.round((c.progress / c.target) * 100);
                  return (
                    <div 
                      key={c.id} 
                      className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${
                            c.type === 'weekly' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400'
                          }`}>
                            {c.type} Challenge
                          </span>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase">{c.deadline}</span>
                        </div>

                        <h4 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight">{c.title}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{c.description}</p>

                        {/* Progress Bar */}
                        <div className="mt-5 space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                            <span>PROGRESS</span>
                            <span>{c.progress} / {c.target} {c.unit} ({percent}%)</span>
                          </div>
                          <div className="w-full bg-zinc-100 dark:bg-zinc-850 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Claim or join options */}
                      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-850/50 flex justify-end">
                        {c.completed ? (
                          <span className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>QUEST COMPLETED</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleManualChallengeClaim(c.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                          >
                            Claim progress point
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 3: Leaderboards */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 text-white rounded-3xl p-6 border border-zinc-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-16 -mt-16" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="bg-indigo-500/15 p-3 rounded-2xl">
                    <Crown className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">GLOBAL ARENA LEAGUE</span>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Competitive Athlete Arena</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Scale ranking points by finishing intense simulator workout routines.</p>
                  </div>
                </div>
              </div>

              {/* Competitors List */}
              <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 gap-2 p-4 border-b border-zinc-100 dark:border-zinc-850/50 bg-zinc-50 dark:bg-zinc-950/20 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                  <div className="col-span-2 text-center">Rank</div>
                  <div className="col-span-5">Athlete Name</div>
                  <div className="col-span-3 text-center">Completed workouts</div>
                  <div className="col-span-2 text-center">Streak</div>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-850/50">
                  {leaderboardUsers.map((athlete) => (
                    <div 
                      key={athlete.name} 
                      className={`
                        grid grid-cols-12 gap-2 p-4 items-center text-xs font-bold transition-all
                        ${athlete.isMe ? 'bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-l-4 border-l-indigo-500' : 'text-zinc-850 dark:text-zinc-200'}
                      `}
                    >
                      <div className="col-span-2 text-center font-mono">
                        {athlete.rank === 1 ? (
                          <span className="inline-flex p-1.5 bg-amber-500/15 text-amber-500 rounded-lg"><Trophy className="w-4 h-4" /></span>
                        ) : athlete.rank === 2 ? (
                          <span className="inline-flex p-1.5 bg-zinc-400/15 text-zinc-400 rounded-lg"><Crown className="w-4 h-4" /></span>
                        ) : athlete.rank === 3 ? (
                          <span className="inline-flex p-1.5 bg-orange-500/15 text-orange-500 rounded-lg"><Zap className="w-4 h-4" /></span>
                        ) : (
                          <span>#{athlete.rank}</span>
                        )}
                      </div>

                      <div className="col-span-5 flex items-center gap-2 truncate">
                        <span className="truncate">{athlete.name}</span>
                        {athlete.isMe && (
                          <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded font-black tracking-wide shrink-0">
                            ME
                          </span>
                        )}
                      </div>

                      <div className="col-span-3 text-center font-mono text-zinc-900 dark:text-zinc-100 font-extrabold">
                        {athlete.completedCount} sessions
                      </div>

                      <div className="col-span-2 text-center font-mono text-orange-500 flex items-center justify-center gap-1">
                        <Flame className="w-4 h-4 fill-orange-500" />
                        <span>{athlete.streak}d</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      )}
    </div>
  );
};
