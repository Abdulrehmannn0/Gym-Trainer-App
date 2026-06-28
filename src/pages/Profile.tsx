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
  Smile
} from 'lucide-react';
import { motion } from 'motion/react';

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
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Title block */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-500" />
          <span>My Athlete Profile</span>
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Define physical statistics, active fitness goals, experience level metrics, and custom vectors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Account Metadata & Profile Picture Upload */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            
            {/* Profile Picture */}
            <div className="relative group mb-4">
              <img
                src={customPhotoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.uid}`}
                alt={profile?.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-2 border-indigo-500/20 bg-zinc-50 dark:bg-zinc-950 shadow-md"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={triggerFileUpload}
                className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-full shadow-lg transition-all cursor-pointer border border-white dark:border-zinc-900"
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

            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-2">
              {profile?.name || 'GYM ATHLETE'}
            </h3>

            <span className="text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-500/15 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 mt-2.5 rounded-full tracking-widest inline-block">
              LEVEL 14 ATHLETE
            </span>

            {/* Account Details */}
            <div className="w-full border-t border-zinc-100 dark:border-zinc-800/50 mt-6 pt-5 space-y-3.5 text-left">
              <div>
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                  EMAIL ADDRESS
                </span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center mt-1 truncate">
                  <Mail className="w-4 h-4 mr-2 text-indigo-500 shrink-0" />
                  <span className="truncate">{profile?.email || 'N/A'}</span>
                </span>
                
                {/* Email Verification Action & Status */}
                {user && (
                  <div className="mt-2.5 flex items-center gap-2">
                    {user.emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3" /> VERIFIED ATHLETE
                      </span>
                    ) : (
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md self-start">
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
                          className="text-[10px] font-extrabold uppercase text-indigo-500 dark:text-indigo-400 hover:underline cursor-pointer self-start"
                        >
                          RESEND VERIFICATION LINK
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                  REGISTRATION DATE
                </span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-2 text-indigo-500 shrink-0" />
                  <span>{formattedCreationDate}</span>
                </span>
              </div>
            </div>

            {/* Logout block */}
            <div className="w-full pt-5 mt-4 border-t border-zinc-100 dark:border-zinc-800/50">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs font-bold tracking-widest uppercase py-3 px-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>SIGN OUT SYSTEM</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Update Biometrics & Level Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900/40 dark:backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-100 dark:border-zinc-800/50 mb-6 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              <span>Biometrics & Workout Configuration</span>
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Notifications */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center space-x-2"
                >
                  <Check className="w-5 h-5" />
                  <span>ATHLETE BLUEPRINT UPDATED SUCCESSFULLY!</span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              {/* Basic Details Section */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">
                  [STEP 1] PRIMARY IDENTITY
                </span>
                
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    DISPLAY NAME / FULL NAME
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                      <User className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                      placeholder="ENTER NAME"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Biometrics Section */}
              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">
                  [STEP 2] BIOMETRICS DATA DECK
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Age Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      AGE (YEARS)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                        <Smile className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                        placeholder="E.G. 28"
                      />
                    </div>
                  </div>

                  {/* Gender Select */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      GENDER
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      <option value="">SELECT GENDER</option>
                      <option value="Male">MALE</option>
                      <option value="Female">FEMALE</option>
                      <option value="Non-binary">NON-BINARY</option>
                      <option value="Other">OTHER</option>
                      <option value="Prefer not to say">PREFER NOT TO SAY</option>
                    </select>
                  </div>

                  {/* Height Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      HEIGHT (CM)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                        <Ruler className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        min="50"
                        max="250"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                        placeholder="E.G. 175"
                      />
                    </div>
                  </div>

                  {/* Weight Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      WEIGHT (KG)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                        <WeightIcon className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        min="20"
                        max="400"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                        placeholder="E.G. 78.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fitness Setup Section */}
              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">
                  [STEP 3] TARGETS & INTENSITY BLUEPRINTS
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fitness Goal Select */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      FITNESS GOAL
                    </label>
                    <select
                      value={fitnessGoal}
                      onChange={(e) => setFitnessGoal(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      <option value="">SELECT FIT TARGET</option>
                      <option value="Build Muscle">BUILD MUSCLE</option>
                      <option value="Lose Fat">LOSE BODY FAT</option>
                      <option value="Increase Strength">INCREASE STRENGTH (1RM)</option>
                      <option value="Improve Endurance">IMPROVE ENDURANCE</option>
                      <option value="General Health">GENERAL HEALTH & FITNESS</option>
                    </select>
                  </div>

                  {/* Experience Level Select */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      EXPERIENCE LEVEL
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      <option value="">SELECT WORKOUT LEVEL</option>
                      <option value="Beginner">BEGINNER (0-1 YEARS)</option>
                      <option value="Intermediate">INTERMEDIATE (1-3 YEARS)</option>
                      <option value="Advanced">ADVANCED (3-5 YEARS)</option>
                      <option value="Elite">ELITE (5+ YEARS)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Avatar Preset Presets Block */}
              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
                  <span>OR SWAP WITH AN AVATAR PRESET</span>
                  <span className="text-[10px] text-indigo-500 font-bold flex items-center tracking-widest">
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> VECTOR RIGS
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
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                            : 'bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
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
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-widest uppercase py-4 px-6 rounded-xl shadow-lg shadow-indigo-600/15 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
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
          </div>
        </div>

      </div>
    </div>
  );
};
