import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/userService';
import { 
  User, 
  Mail, 
  Camera, 
  Check, 
  Loader2, 
  LogOut, 
  Settings, 
  Sparkles,
  Calendar,
  Layers,
  Activity,
  ChevronRight,
  Upload,
  Ruler,
  Weight as WeightIcon,
  Smile,
  Shield,
  Star,
  Cpu,
  Bookmark,
  Share2,
  Copy,
  Gift,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AVATAR_SEEDS = [
  'John', 'Garfield', 'Kitten', 'Bear', 'Daisy', 
  'Felix', 'Tiger', 'Oliver', 'Mimi', 'Lola'
];

export const Profile: React.FC = () => {
  const { user, profile, logout, refreshProfile, sendEmailVerificationLink } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [selectedSeed, setSelectedSeed] = useState('');
  const [customPhotoURL, setCustomPhotoURL] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Referral system states
  const [activeTab, setActiveTab] = useState<'profile' | 'referral'>('profile');
  const [referredUsers, setReferredUsers] = useState<any[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-generate unique referral code if missing
  useEffect(() => {
    if (profile && !profile.referralCode) {
      const generateCode = async () => {
        const namePart = (profile.name || 'ATH')
          .toUpperCase()
          .replace(/[^A-Z]/g, '')
          .slice(0, 5) || 'ATH';
        const numPart = Math.floor(1000 + Math.random() * 9000);
        const code = `${namePart}${numPart}`;
        try {
          await updateUserProfile(profile.uid, { referralCode: code });
          await refreshProfile();
        } catch (err) {
          console.error('Error generating referral code:', err);
        }
      };
      generateCode();
    }
  }, [profile, refreshProfile]);

  // Fetch registered referrals in real-time
  useEffect(() => {
    if (profile?.referralCode && activeTab === 'referral') {
      const fetchReferrals = async () => {
        setLoadingReferrals(true);
        try {
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          const { db } = await import('../firebase');
          const q = query(collection(db, 'users'), where('referredBy', '==', profile.referralCode));
          const snap = await getDocs(q);
          const list: any[] = [];
          snap.forEach((doc) => {
            const data = doc.data();
            list.push({
              uid: doc.id,
              name: data.name || 'Anonymous Athlete',
              photoURL: data.photoURL,
              createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              }) : 'N/A'
            });
          });
          setReferredUsers(list);
        } catch (err) {
          console.error('Error loading referrals:', err);
        } finally {
          setLoadingReferrals(false);
        }
      };
      fetchReferrals();
    }
  }, [profile?.referralCode, activeTab]);

  // Hydrate fields once profile/user is loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAge(profile.age?.toString() || '');
      setHeight(profile.height?.toString() || '');
      setWeight(profile.weight?.toString() || '');
      setGender(profile.gender || '');
      setFitnessGoal(profile.fitnessGoal || '');
      setExperienceLevel(profile.experienceLevel || '');
      if (profile.photoURL) {
        setCustomPhotoURL(profile.photoURL);
      }
    }
  }, [profile]);

  const handleAvatarSelect = (seed: string) => {
    setSelectedSeed(seed);
    const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
    setCustomPhotoURL(url);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCustomPhotoURL(base64String);
        setSelectedSeed(''); // Deselect preset seeds since user uploaded a custom one
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    setSubmitting(true);
    setSuccess(false);
    setError('');

    try {
      if (profile) {
        const parsedAge = age ? parseInt(age, 10) : undefined;
        const parsedHeight = height ? parseFloat(height) : undefined;
        const parsedWeight = weight ? parseFloat(weight) : undefined;

        if (age && (isNaN(parsedAge) || parsedAge <= 0)) {
          throw new Error('Please enter a valid age');
        }
        if (height && (isNaN(parsedHeight) || parsedHeight <= 0)) {
          throw new Error('Please enter a valid height in cm');
        }
        if (weight && (isNaN(parsedWeight) || parsedWeight <= 0)) {
          throw new Error('Please enter a valid weight in kg');
        }

        await updateUserProfile(profile.uid, {
          name: name.trim(),
          photoURL: customPhotoURL || profile.photoURL,
          age: parsedAge,
          height: parsedHeight,
          weight: parsedWeight,
          gender,
          fitnessGoal,
          experienceLevel
        });

        await refreshProfile();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Human friendly formatting for dates
  const formattedCreationDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-[#7C3AED] animate-spin-slow" />
            <span>My Athlete Profile</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Define physical statistics, active fitness goals, experience levels, and customization settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT PANEL - ACCOUNT BRIEF & PICTURE */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card-custom border border-border-custom rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-xl">
            {/* Soft decorative background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#7C3AED] opacity-10 rounded-full blur-3xl pointer-events-none" />Base

            {/* Profile image with camera upload button */}
            <div className="relative group mb-4 z-10">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#4F46E5] opacity-20 blur group-hover:opacity-40 transition-opacity" />
              <img
                src={customPhotoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.uid}`}
                alt={profile?.name}
                className="w-32 h-32 rounded-full object-cover border border-border-custom bg-zinc-100 dark:bg-[#09090B] relative z-10"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={triggerFileUpload}
                className="absolute bottom-1 right-1 bg-[#7C3AED] hover:bg-violet-600 text-white p-2.5 rounded-full shadow-lg transition-all cursor-pointer border border-border-custom z-20"
                title="Upload Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            <h3 className="text-lg font-black text-text-custom-primary mt-2 z-10">
              {profile?.name || 'GYM ATHLETE'}
            </h3>

            <div className="flex items-center gap-1.5 mt-2.5 z-10">
              <span className="text-[9px] font-black uppercase bg-[#7C3AED]/15 text-[#7C3AED] px-3.5 py-1.5 rounded-full tracking-widest border border-[#7C3AED]/20">
                PRO ATHLETE
              </span>
            </div>

            {/* Account Info Details */}
            <div className="w-full border-t border-border-custom-light mt-6 pt-5 space-y-4 text-left z-10">
              <div>
                <span className="text-[9px] font-bold text-text-custom-secondary uppercase tracking-wider block">
                  EMAIL ADDRESS
                </span>
                <span className="text-xs font-semibold text-text-custom-primary flex items-center mt-1.5 truncate">
                  <Mail className="w-4 h-4 mr-2 text-[#7C3AED] shrink-0" />
                  <span className="truncate">{profile?.email || 'N/A'}</span>
                </span>
                
                {/* Verification block */}
                {user && (
                  <div className="mt-2 flex items-center gap-2">
                    {user.emailVerified ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                        <Check className="w-3 h-3 stroke-[3]" /> VERIFIED PROFILE
                      </span>
                    ) : (
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md self-start">
                          UNVERIFIED EMAIL
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              setError('');
                              setSuccess(false);
                              const buttonEl = document.getElementById('send-verification-btn');
                              if (buttonEl) buttonEl.innerHTML = 'DISPATCHING LINK...';
                              await sendEmailVerificationLink();
                              if (buttonEl) buttonEl.innerHTML = 'VERIFICATION DISPATCHED';
                              setSuccess(true);
                              setTimeout(() => setSuccess(false), 5000);
                            } catch (err: any) {
                              console.error(err);
                              setError(err.message || 'Verification dispatch failed.');
                            }
                          }}
                          id="send-verification-btn"
                          className="text-[10px] font-extrabold uppercase text-[#7C3AED] hover:underline cursor-pointer self-start"
                        >
                          RESEND VERIFICATION LINK
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <span className="text-[9px] font-bold text-text-custom-secondary uppercase tracking-wider block">
                  MEMBER SINCE
                </span>
                <span className="text-xs font-semibold text-text-custom-primary flex items-center mt-1.5">
                  <Calendar className="w-4 h-4 mr-2 text-[#4F46E5] shrink-0" />
                  <span>{formattedCreationDate}</span>
                </span>
              </div>
            </div>

            {/* Logout block */}
            <div className="w-full pt-5 mt-4 border-t border-border-custom-light z-10">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-zinc-50 dark:bg-[#09090B] hover:bg-zinc-100 dark:hover:bg-white/[0.02] text-text-custom-secondary hover:text-text-custom-primary text-xs font-bold tracking-widest uppercase py-3.5 px-4 rounded-xl border border-border-custom-light transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>SIGN OUT SYSTEM</span>
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL - DUAL TABS (PROFILE & REFERRAL SYSTEM) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Selector Buttons */}
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900/60 border border-border-custom rounded-2xl gap-1.5 self-start">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-5 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20'
                  : 'text-text-custom-secondary hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-text-custom-primary'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Athlete Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('referral')}
              className={`flex-1 px-5 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'referral'
                  ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20'
                  : 'text-text-custom-secondary hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-text-custom-primary'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Referral & Rewards</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'profile' ? (
              <motion.div
                key="profile-setup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-card-custom border border-border-custom rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              >
                <h2 className="text-lg font-bold text-text-custom-primary pb-4 border-b border-border-custom-light mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#7C3AED]" />
                  <span>Biometrics & Fitness Setup</span>
                </h2>

                <form onSubmit={handleSave} className="space-y-6">
                  {/* Notifications */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center space-x-2"
                    >
                      <Check className="w-5 h-5" />
                      <span>ATHLETE BLUEPRINT UPDATED SUCCESSFULLY!</span>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-[#EF4444]/15 border border-[#EF4444]/20 text-[#EF4444] text-xs font-semibold rounded-xl"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Primary Identity */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest block">
                      [STEP 1] PRIMARY IDENTITY
                    </span>
                    
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-text-custom-secondary">
                        DISPLAY NAME / FULL NAME
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-custom-secondary">
                          <User className="w-4.5 h-4.5" />
                        </span>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-[#09090B] border border-border-custom rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#7C3AED] text-text-custom-primary placeholder-zinc-400"
                          placeholder="ENTER NAME"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Biometrics Data */}
                  <div className="space-y-4 pt-4 border-t border-border-custom-light">
                    <span className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest block">
                      [STEP 2] BIOMETRICS DATA DECK
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Age */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-custom-secondary">
                          AGE (YEARS)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-custom-secondary">
                            <Smile className="w-4.5 h-4.5" />
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-[#09090B] border border-border-custom rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#7C3AED] text-text-custom-primary placeholder-zinc-400"
                            placeholder="E.G. 28"
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-custom-secondary">
                          GENDER
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-[#09090B] border border-border-custom rounded-xl py-3 px-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#7C3AED] text-text-custom-primary cursor-pointer"
                        >
                          <option value="" className="bg-card-custom text-text-custom-primary">SELECT GENDER</option>
                          <option value="Male" className="bg-card-custom text-text-custom-primary">MALE</option>
                          <option value="Female" className="bg-card-custom text-text-custom-primary">FEMALE</option>
                          <option value="Non-binary" className="bg-card-custom text-text-custom-primary">NON-BINARY</option>
                          <option value="Other" className="bg-card-custom text-text-custom-primary">OTHER</option>
                          <option value="Prefer not to say" className="bg-card-custom text-text-custom-primary">PREFER NOT TO SAY</option>
                        </select>
                      </div>

                      {/* Height */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-custom-secondary">
                          HEIGHT (CM)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-custom-secondary">
                            <Ruler className="w-4.5 h-4.5" />
                          </span>
                          <input
                            type="number"
                            step="0.1"
                            min="50"
                            max="250"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-[#09090B] border border-border-custom rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#7C3AED] text-text-custom-primary placeholder-zinc-400"
                            placeholder="E.G. 175"
                          />
                        </div>
                      </div>

                      {/* Weight */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-custom-secondary">
                          WEIGHT (KG)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-custom-secondary">
                            <WeightIcon className="w-4.5 h-4.5" />
                          </span>
                          <input
                            type="number"
                            step="0.1"
                            min="20"
                            max="400"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-[#09090B] border border-border-custom rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#7C3AED] text-text-custom-primary placeholder-zinc-400"
                            placeholder="E.G. 78.5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fitness Setup */}
                  <div className="space-y-4 pt-4 border-t border-border-custom-light">
                    <span className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest block">
                      [STEP 3] TARGETS & EXPERIENCE BLUEPRINTS
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Fitness Goal */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-custom-secondary">
                          FITNESS GOAL
                        </label>
                        <select
                          value={fitnessGoal}
                          onChange={(e) => setFitnessGoal(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-[#09090B] border border-border-custom rounded-xl py-3 px-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#7C3AED] text-text-custom-primary cursor-pointer"
                        >
                          <option value="" className="bg-card-custom text-text-custom-primary">SELECT FIT TARGET</option>
                          <option value="Build Muscle" className="bg-card-custom text-text-custom-primary">BUILD MUSCLE</option>
                          <option value="Lose Fat" className="bg-card-custom text-text-custom-primary">LOSE BODY FAT</option>
                          <option value="Increase Strength" className="bg-card-custom text-text-custom-primary">INCREASE STRENGTH (1RM)</option>
                          <option value="Improve Endurance" className="bg-card-custom text-text-custom-primary">IMPROVE ENDURANCE</option>
                          <option value="General Health" className="bg-card-custom text-text-custom-primary">GENERAL HEALTH & FITNESS</option>
                        </select>
                      </div>

                      {/* Experience Level */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-custom-secondary">
                          EXPERIENCE LEVEL
                        </label>
                        <select
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-[#09090B] border border-border-custom rounded-xl py-3 px-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#7C3AED] text-text-custom-primary cursor-pointer"
                        >
                          <option value="" className="bg-card-custom text-text-custom-primary">SELECT WORKOUT LEVEL</option>
                          <option value="Beginner" className="bg-card-custom text-text-custom-primary">BEGINNER (0-1 YEARS)</option>
                          <option value="Intermediate" className="bg-card-custom text-text-custom-primary">INTERMEDIATE (1-3 YEARS)</option>
                          <option value="Advanced" className="bg-card-custom text-text-custom-primary">ADVANCED (3-5 YEARS)</option>
                          <option value="Elite" className="bg-card-custom text-text-custom-primary">ELITE (5+ YEARS)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Avatar presets */}
                  <div className="space-y-3 pt-4 border-t border-border-custom-light">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-custom-secondary flex items-center justify-between">
                      <span>OR SWAP WITH AN AVATAR PRESET</span>
                      <span className="text-[10px] text-[#7C3AED] font-bold flex items-center tracking-widest">
                        <Sparkles className="w-3.5 h-3.5 mr-1" /> VECTOR REGS
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_SEEDS.map((seed) => {
                        const isSelected = selectedSeed === seed;
                        return (
                          <button
                            key={seed}
                            type="button"
                            onClick={() => handleAvatarSelect(seed)}
                            className={`
                              px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-lg
                              ${isSelected 
                                ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-md' 
                                : 'bg-zinc-50 dark:bg-[#09090B] border-border-custom text-text-custom-secondary hover:bg-zinc-100 dark:hover:bg-white/[0.02]'
                              }
                            `}
                          >
                            {seed}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-6 border-t border-border-custom-light">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#7C3AED] hover:bg-violet-600 text-white text-xs font-bold tracking-widest uppercase py-4 px-6 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>SYNCHRONIZING PROFILE RECORD...</span>
                        </>
                      ) : (
                        <>
                          <span>SYNC ALL PROFILE CHANGES</span>
                          <ChevronRight className="w-4 h-4 text-white" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="referral-dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Intro Card */}
                <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C3AED] opacity-10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-start gap-4 z-10 relative">
                    <div className="p-3 bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] rounded-2xl text-white shadow-lg">
                      <Gift className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-text-custom-primary">Ambassador & Referral Hub</h3>
                      <p className="text-xs text-text-custom-secondary mt-1 leading-relaxed">
                        Refer friends and athletes to join the elite AzharFit AI platform. Earn exclusive recognition badges, bonus XP tiers, and continuous workout streak extensions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid of Referral Code and Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Code display card */}
                  <div className="bg-card-custom border border-border-custom rounded-3xl p-6 flex flex-col justify-between hover:border-[#7C3AED]/30 transition-all shadow-md">
                    <div>
                      <span className="text-[10px] font-bold text-text-custom-secondary uppercase tracking-widest block">
                        YOUR EXCLUSIVE REFERRAL CODE
                      </span>
                      <div className="bg-zinc-100 dark:bg-zinc-950/60 border border-border-custom rounded-2xl px-5 py-4 mt-3 flex items-center justify-between">
                        <span className="text-xl font-black text-[#7C3AED] tracking-wider select-all uppercase">
                          {profile?.referralCode || 'GENERATING...'}
                        </span>
                        <button
                          onClick={() => {
                            if (profile?.referralCode) {
                              navigator.clipboard.writeText(profile.referralCode);
                              setCopiedCode(true);
                              setTimeout(() => setCopiedCode(false), 2000);
                            }
                          }}
                          className="p-2.5 bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/25 rounded-xl transition-all cursor-pointer"
                          title="Copy Code"
                        >
                          {copiedCode ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-text-custom-secondary mt-3">
                      Share this alphanumeric code directly. Friends can input this manually during registration.
                    </p>
                  </div>

                  {/* Link display card */}
                  <div className="bg-card-custom border border-border-custom rounded-3xl p-6 flex flex-col justify-between hover:border-[#7C3AED]/30 transition-all shadow-md">
                    <div>
                      <span className="text-[10px] font-bold text-text-custom-secondary uppercase tracking-widest block">
                        DIRECT INVITE LINK
                      </span>
                      <div className="bg-zinc-100 dark:bg-zinc-950/60 border border-border-custom rounded-2xl px-5 py-4 mt-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-text-custom-primary truncate mr-2 select-all">
                          {profile?.referralCode 
                            ? `${window.location.origin}?ref=${profile.referralCode}` 
                            : 'GENERATING...'}
                        </span>
                        <button
                          onClick={() => {
                            if (profile?.referralCode) {
                              const url = `${window.location.origin}?ref=${profile.referralCode}`;
                              navigator.clipboard.writeText(url);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2000);
                            }
                          }}
                          className="p-2.5 bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/25 rounded-xl transition-all cursor-pointer shrink-0"
                          title="Copy Link"
                        >
                          {copiedLink ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-text-custom-secondary mt-3">
                      This invite link automatically fills your code when friends click to register.
                    </p>
                  </div>
                </div>

                {/* Instant Share Actions Panel */}
                <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-md">
                  <h4 className="text-xs font-bold text-text-custom-primary uppercase tracking-widest mb-4">
                    Instant Social Dispatch
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* WhatsApp */}
                    <button
                      onClick={() => {
                        if (!profile?.referralCode) return;
                        const text = `Join me on AzharFit AI (Train Smart. Live Strong.) and level up your splits! Register with my athlete code: ${profile.referralCode} or use this link: ${window.location.origin}?ref=${profile.referralCode}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </button>

                    {/* X (formerly Twitter) */}
                    <button
                      onClick={() => {
                        if (!profile?.referralCode) return;
                        const text = `Training smart with AzharFit AI! Join my squad using athlete code: ${profile.referralCode} or invite link: ${window.location.origin}?ref=${profile.referralCode} 🚀🔥`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 hover:bg-black text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Twitter / X</span>
                    </button>

                    {/* Email invite */}
                    <button
                      onClick={() => {
                        if (!profile?.referralCode) return;
                        const subject = `Join my elite split on AzharFit AI`;
                        const body = `Hey athlete,\n\nI've been using AzharFit AI to power my fitness workouts, and it's incredible. You should register and join my athlete circle!\n\nUse my elite referral code: ${profile.referralCode}\nOr sign up directly with this link: ${window.location.origin}?ref=${profile.referralCode}\n\nLet's get stronger!`;
                        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                      }}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email Invite</span>
                    </button>
                  </div>
                </div>

                {/* Referral Standings Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-card-custom border border-border-custom rounded-2xl p-5 text-center shadow-sm">
                    <span className="text-[9px] font-bold text-text-custom-secondary uppercase tracking-wider block">Total Referrals</span>
                    <span className="text-3xl font-black text-text-custom-primary mt-1.5 block">
                      {referredUsers.length}
                    </span>
                  </div>

                  <div className="bg-card-custom border border-border-custom rounded-2xl p-5 text-center shadow-sm">
                    <span className="text-[9px] font-bold text-text-custom-secondary uppercase tracking-wider block">Ambassador Tier</span>
                    <span className="text-sm font-extrabold text-[#7C3AED] uppercase mt-2.5 inline-flex items-center gap-1.5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-3 py-1 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-[#7C3AED]" />
                      <span>
                        {referredUsers.length === 0 ? 'BRONZE' : referredUsers.length <= 2 ? 'SILVER' : referredUsers.length <= 4 ? 'GOLD' : 'PLATINUM'}
                      </span>
                    </span>
                  </div>

                  <div className="bg-card-custom border border-border-custom rounded-2xl p-5 text-center shadow-sm">
                    <span className="text-[9px] font-bold text-text-custom-secondary uppercase tracking-wider block">Streak Boost</span>
                    <span className="text-3xl font-black text-[#22C55E] mt-1.5 block">
                      +{referredUsers.length * 2} <span className="text-xs font-medium text-text-custom-secondary">days</span>
                    </span>
                  </div>
                </div>

                {/* Referral Roster List (Query-backed) */}
                <div className="bg-card-custom border border-border-custom rounded-3xl p-6 shadow-md">
                  <div className="flex items-center justify-between pb-4 border-b border-border-custom-light mb-4">
                    <h4 className="text-xs font-bold text-text-custom-primary uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-4.5 h-4.5 text-[#7C3AED]" />
                      <span>Referred Athlete Roster</span>
                    </h4>
                    <span className="text-[10px] font-bold bg-[#7C3AED]/15 text-[#7C3AED] px-2.5 py-1 rounded-full">
                      {referredUsers.length} MEMBERS ACTIVE
                    </span>
                  </div>

                  {loadingReferrals ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
                      <p className="text-[10px] font-bold text-text-custom-secondary uppercase tracking-widest mt-2">
                        Querying Referral Registry...
                      </p>
                    </div>
                  ) : referredUsers.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border-custom rounded-2xl">
                      <Gift className="w-10 h-10 text-text-custom-secondary mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-bold text-text-custom-primary">No Referred Signups Found</p>
                      <p className="text-xs text-text-custom-secondary mt-1">
                        Your referral register is currently clean. Share your code to build your athletic squad!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {referredUsers.map((refUser, index) => (
                        <div
                          key={refUser.uid || index}
                          className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-white/[0.02] border border-border-custom rounded-2xl hover:border-[#7C3AED]/30 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={refUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${refUser.uid}`}
                              alt={refUser.name}
                              className="w-9 h-9 rounded-full bg-zinc-100 border border-border-custom object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="text-xs font-bold text-text-custom-primary">{refUser.name}</p>
                              <p className="text-[9px] text-text-custom-secondary mt-0.5">Joined on {refUser.createdAt}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-black uppercase text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2.5 py-1 rounded-full">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
