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
  const { user, profile, logout, refreshProfile } = useAuth();
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
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Title block */}
      <div className="border-b-4 border-black pb-5">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-zinc-950 flex items-center space-x-3">
          <Settings className="w-8 h-8 text-blue-600" />
          <span>MY ATHLETE BLUEPRINT</span>
        </h1>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider mt-1">
          MANAGE YOUR BIOMETRICS, DEFINE TRAINING LEVEL, AND UPDATE ACCESS CREDENTIALS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Account Metadata & Profile Picture Upload */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center">
            
            {/* Profile Picture */}
            <div className="relative group mb-4">
              <img
                src={customPhotoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.uid}`}
                alt={profile?.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-none object-cover border-4 border-black bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={triggerFileUpload}
                className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-500 text-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
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

            <h3 className="text-xl font-black tracking-tight text-zinc-950 uppercase mt-2">
              {profile?.name || 'GYM ATHLETE'}
            </h3>

            <span className="text-[10px] font-black uppercase bg-blue-100 border-2 border-black text-zinc-900 px-3 py-1 mt-2.5 font-mono tracking-widest inline-block">
              LEVEL 14 ATHLETE
            </span>

            {/* Quick action to upload */}
            <button
              type="button"
              onClick={triggerFileUpload}
              className="mt-4 inline-flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest border-2 border-black px-3 py-1.5 bg-zinc-50 hover:bg-zinc-150 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>UPLOAD PHOTO</span>
            </button>

            {/* Account Details */}
            <div className="w-full border-t-2 border-black/10 mt-6 pt-5 space-y-3.5 text-left">
              <div>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block font-mono">
                  EMAIL ADDRESS
                </span>
                <span className="text-xs font-bold text-zinc-900 flex items-center mt-1 truncate">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-blue-600 shrink-0" />
                  <span className="truncate">{profile?.email || 'N/A'}</span>
                </span>
              </div>

              <div>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block font-mono">
                  REGISTRATION DATE
                </span>
                <span className="text-xs font-bold text-zinc-900 flex items-center mt-1">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-600 shrink-0" />
                  <span>{formattedCreationDate}</span>
                </span>
              </div>
            </div>

            {/* Logout block */}
            <div className="w-full pt-5 mt-4 border-t-2 border-black/10">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border-3 border-black shadow-[4px_4px_0px_0px_rgba(225,29,72,1)] hover:translate-y-0.5 text-xs font-black tracking-widest uppercase py-3 px-4 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>SIGN OUT SYSTEM</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Update Biometrics & Level Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black text-zinc-950 uppercase tracking-tight pb-4 border-b-2 border-black/10 mb-6 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>BIOMETRICS & WORKOUT CONFIGURATION</span>
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Notifications */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-100 border-4 border-black text-emerald-950 text-xs font-black uppercase tracking-wider flex items-center space-x-2"
                >
                  <Check className="w-5 h-5 text-emerald-700" />
                  <span>ATHLETE BLUEPRINT UPDATED SUCCESSFULLY!</span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-rose-100 border-4 border-black text-rose-950 text-xs font-black uppercase tracking-wider"
                >
                  {error}
                </motion.div>
              )}

              {/* Basic Details Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest block font-mono">
                  [STEP 1] PRIMARY IDENTITY
                </h3>
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-900">
                    DISPLAY NAME / FULL NAME
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-900">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border-3 border-black text-zinc-900 font-bold uppercase text-xs tracking-widest py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="ENTER NAME"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Biometrics Section */}
              <div className="space-y-4 pt-4 border-t-2 border-black/5">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest block font-mono">
                  [STEP 2] BIOMETRICS DATA DECK
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Age Input */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-900">
                      AGE (YEARS)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-900">
                        <Smile className="w-4 h-4" />
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full bg-white border-3 border-black text-zinc-900 font-bold uppercase text-xs tracking-widest py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="E.G. 28"
                      />
                    </div>
                  </div>

                  {/* Gender Select */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-900">
                      GENDER
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-white border-3 border-black text-zinc-900 font-bold uppercase text-xs tracking-widest py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
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
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-900">
                      HEIGHT (CM)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-900">
                        <Ruler className="w-4 h-4" />
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        min="50"
                        max="250"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full bg-white border-3 border-black text-zinc-900 font-bold uppercase text-xs tracking-widest py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="E.G. 175"
                      />
                    </div>
                  </div>

                  {/* Weight Input */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-900">
                      WEIGHT (KG)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-900">
                        <WeightIcon className="w-4 h-4" />
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        min="20"
                        max="400"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-white border-3 border-black text-zinc-900 font-bold uppercase text-xs tracking-widest py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="E.G. 78.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fitness Setup Section */}
              <div className="space-y-4 pt-4 border-t-2 border-black/5">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest block font-mono">
                  [STEP 3] TARGETS & INTENSITY BLUEPRINTS
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fitness Goal Select */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-900">
                      FITNESS GOAL
                    </label>
                    <select
                      value={fitnessGoal}
                      onChange={(e) => setFitnessGoal(e.target.value)}
                      className="w-full bg-white border-3 border-black text-zinc-900 font-bold uppercase text-xs tracking-widest py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
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
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-900">
                      EXPERIENCE LEVEL
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full bg-white border-3 border-black text-zinc-900 font-bold uppercase text-xs tracking-widest py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
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
              <div className="space-y-3 pt-4 border-t-2 border-black/5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-900 flex items-center justify-between">
                  <span>OR SWAP WITH AN AVATAR PRESET</span>
                  <span className="text-[10px] text-blue-600 font-mono font-black flex items-center tracking-widest">
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
                          px-3 py-1.5 border-2 border-black text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer
                          ${isSelected 
                            ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(59,130,246,1)]' 
                            : 'bg-white text-zinc-800 hover:bg-zinc-50'
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
              <div className="pt-6 border-t-2 border-black/10">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-black text-white text-xs font-black tracking-widest uppercase py-4 px-6 border-3 border-black shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>SYNCHRONIZING PROFILE RECORD...</span>
                    </>
                  ) : (
                    <>
                      <span>SYNC ALL PROFILE CHANGES</span>
                      <ChevronRight className="w-4 h-4 text-blue-500" />
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
