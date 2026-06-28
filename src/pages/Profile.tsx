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
  Bookmark
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
          <div className="bg-[#111827] border border-white/[0.08] rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-xl">
            {/* Soft decorative background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#7C3AED] opacity-10 rounded-full blur-3xl pointer-events-none" />

            {/* Profile image with camera upload button */}
            <div className="relative group mb-4 z-10">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#4F46E5] opacity-20 blur group-hover:opacity-40 transition-opacity" />
              <img
                src={customPhotoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.uid}`}
                alt={profile?.name}
                className="w-32 h-32 rounded-full object-cover border border-white/10 bg-[#09090B] relative z-10"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={triggerFileUpload}
                className="absolute bottom-1 right-1 bg-[#7C3AED] hover:bg-violet-600 text-white p-2.5 rounded-full shadow-lg transition-all cursor-pointer border border-[#111827] z-20"
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

            <h3 className="text-lg font-black text-white mt-2 z-10">
              {profile?.name || 'GYM ATHLETE'}
            </h3>

            <div className="flex items-center gap-1.5 mt-2.5 z-10">
              <span className="text-[9px] font-black uppercase bg-[#7C3AED]/15 text-[#7C3AED] px-3.5 py-1.5 rounded-full tracking-widest border border-[#7C3AED]/20">
                PRO ATHLETE
              </span>
            </div>

            {/* Account Info Details */}
            <div className="w-full border-t border-white/[0.06] mt-6 pt-5 space-y-4 text-left z-10">
              <div>
                <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                  EMAIL ADDRESS
                </span>
                <span className="text-xs font-semibold text-white flex items-center mt-1.5 truncate">
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
                <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                  MEMBER SINCE
                </span>
                <span className="text-xs font-semibold text-white flex items-center mt-1.5">
                  <Calendar className="w-4 h-4 mr-2 text-[#4F46E5] shrink-0" />
                  <span>{formattedCreationDate}</span>
                </span>
              </div>
            </div>

            {/* Logout block */}
            <div className="w-full pt-5 mt-4 border-t border-white/[0.06] z-10">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-[#09090B] hover:bg-white/[0.02] text-[#A1A1AA] hover:text-white text-xs font-bold tracking-widest uppercase py-3.5 px-4 rounded-xl border border-white/[0.06] transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>SIGN OUT SYSTEM</span>
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL - FORM FIELDS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-lg font-bold text-white pb-4 border-b border-white/[0.06] mb-6 flex items-center gap-2">
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
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">
                    DISPLAY NAME / FULL NAME
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#A1A1AA]">
                      <User className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#09090B] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#7C3AED] text-white"
                      placeholder="ENTER NAME"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Biometrics Data */}
              <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                <span className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest block">
                  [STEP 2] BIOMETRICS DATA DECK
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Age */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">
                      AGE (YEARS)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#A1A1AA]">
                        <Smile className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full bg-[#09090B] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#7C3AED] text-white"
                        placeholder="E.G. 28"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">
                      GENDER
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-[#09090B] border border-white/[0.08] rounded-xl py-3 px-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#7C3AED] text-zinc-300 cursor-pointer"
                    >
                      <option value="" className="bg-[#111827]">SELECT GENDER</option>
                      <option value="Male" className="bg-[#111827]">MALE</option>
                      <option value="Female" className="bg-[#111827]">FEMALE</option>
                      <option value="Non-binary" className="bg-[#111827]">NON-BINARY</option>
                      <option value="Other" className="bg-[#111827]">OTHER</option>
                      <option value="Prefer not to say" className="bg-[#111827]">PREFER NOT TO SAY</option>
                    </select>
                  </div>

                  {/* Height */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">
                      HEIGHT (CM)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#A1A1AA]">
                        <Ruler className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        min="50"
                        max="250"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full bg-[#09090B] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#7C3AED] text-white"
                        placeholder="E.G. 175"
                      />
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">
                      WEIGHT (KG)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#A1A1AA]">
                        <WeightIcon className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        min="20"
                        max="400"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-[#09090B] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#7C3AED] text-white"
                        placeholder="E.G. 78.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fitness Setup */}
              <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                <span className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest block">
                  [STEP 3] TARGETS & EXPERIENCE BLUEPRINTS
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fitness Goal */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">
                      FITNESS GOAL
                    </label>
                    <select
                      value={fitnessGoal}
                      onChange={(e) => setFitnessGoal(e.target.value)}
                      className="w-full bg-[#09090B] border border-white/[0.08] rounded-xl py-3 px-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#7C3AED] text-zinc-300 cursor-pointer"
                    >
                      <option value="" className="bg-[#111827]">SELECT FIT TARGET</option>
                      <option value="Build Muscle" className="bg-[#111827]">BUILD MUSCLE</option>
                      <option value="Lose Fat" className="bg-[#111827]">LOSE BODY FAT</option>
                      <option value="Increase Strength" className="bg-[#111827]">INCREASE STRENGTH (1RM)</option>
                      <option value="Improve Endurance" className="bg-[#111827]">IMPROVE ENDURANCE</option>
                      <option value="General Health" className="bg-[#111827]">GENERAL HEALTH & FITNESS</option>
                    </select>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">
                      EXPERIENCE LEVEL
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full bg-[#09090B] border border-white/[0.08] rounded-xl py-3 px-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#7C3AED] text-zinc-300 cursor-pointer"
                    >
                      <option value="" className="bg-[#111827]">SELECT WORKOUT LEVEL</option>
                      <option value="Beginner" className="bg-[#111827]">BEGINNER (0-1 YEARS)</option>
                      <option value="Intermediate" className="bg-[#111827]">INTERMEDIATE (1-3 YEARS)</option>
                      <option value="Advanced" className="bg-[#111827]">ADVANCED (3-5 YEARS)</option>
                      <option value="Elite" className="bg-[#111827]">ELITE (5+ YEARS)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Avatar presets */}
              <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] flex items-center justify-between">
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
                            : 'bg-[#09090B] border-white/[0.08] text-[#A1A1AA] hover:bg-white/[0.02]'
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
              <div className="pt-6 border-t border-white/[0.06]">
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
          </div>
        </div>

      </div>
    </div>
  );
};
