import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  BrainCircuit, 
  Dumbbell, 
  Plus, 
  ChevronRight,
  RefreshCw,
  Clock,
  Flame,
  Utensils,
  BookOpen,
  Info,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Moon,
  Trash2,
  FileText,
  Weight,
  Award,
  Sparkle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAIChatMessages, 
  saveAIChatMessage, 
  clearAIChatHistory, 
  getAIRecommendations, 
  saveAIRecommendation, 
  AIChatMessage, 
  AIRecommendation 
} from '../services/aiCoachService';
import { 
  createCustomWorkoutPlan, 
  getWorkoutLogs, 
  getSleepLogs,
  addNotification
} from '../services/fitnessService';
import { getExercises } from '../services/exerciseService';
import { Exercise } from '../types';

// Simple Inline Markdown Parser to render markdown formatted text cleanly without external libraries
const renderInlineMarkdown = (text: string) => {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} className="font-bold text-white">{match[1]}</strong>);
    lastIndex = boldRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts.length > 0 ? parts : text;
};

const MarkdownText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-xs text-[#A1A1AA]">
      {lines.map((line, idx) => {
        if (line.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-xs font-black text-white mt-4 first:mt-0 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/[0.06] pb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-sm font-black text-[#7C3AED] mt-5 first:mt-0">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={idx} className="text-base font-black text-white mt-6 first:mt-0">{line.slice(2)}</h1>;
        }
        if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 ml-3">
              <span className="text-[#7C3AED] mt-1 shrink-0">•</span>
              <p className="leading-relaxed">{renderInlineMarkdown(line.slice(2))}</p>
            </div>
          );
        }
        if (line.trim() === '') return <div key={idx} className="h-2" />;
        return <p key={idx} className="leading-relaxed">{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
};

export const AICoach: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'workout' | 'meal' | 'form' | 'progress'>('chat');
  
  // Chat States
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [clearingChat, setClearingChat] = useState(false);
  
  // Workout Generator States
  const [workoutPrompt, setWorkoutPrompt] = useState('Create a 5 day split');
  const [daysCount, setDaysCount] = useState(4);
  const [workoutEquipment, setWorkoutEquipment] = useState('Full Gym');
  const [workoutRestriction, setWorkoutRestriction] = useState('');
  const [generatingWorkout, setGeneratingWorkout] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);
  const [savingWorkout, setSavingWorkout] = useState(false);
  const [workoutSavedSuccess, setWorkoutSavedSuccess] = useState(false);

  // Meal Planner States
  const [mealPrompt, setMealPrompt] = useState('High protein split for clean bulking');
  const [dietGoal, setDietGoal] = useState('Build Muscle');
  const [dietRestrictions, setDietRestrictions] = useState('');
  const [generatingMeal, setGeneratingMeal] = useState(false);
  const [generatedMeal, setGeneratedMeal] = useState<any>(null);
  const [savingMeal, setSavingMeal] = useState(false);
  const [mealSavedSuccess, setMealSavedSuccess] = useState(false);

  // Form Correction States
  const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
  const [selectedExName, setSelectedExName] = useState('Squat');
  const [formDescription, setFormDescription] = useState('My knees cave inward slightly when coming out of the hole.');
  const [analyzingForm, setAnalyzingForm] = useState(false);
  const [formCorrectionResult, setFormCorrectionResult] = useState<string>('');

  // Progress Reports States
  const [analyzingProgress, setAnalyzingProgress] = useState(false);
  const [progressReport, setProgressReport] = useState<string>('');
  const [savedReports, setSavedReports] = useState<AIRecommendation[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chats & suggestions on load
  useEffect(() => {
    if (profile?.uid) {
      loadChats();
      loadRecommendations();
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'form') {
      loadExercises();
    }
  }, [activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadChats = async () => {
    if (!profile?.uid) return;
    const history = await getAIChatMessages(profile.uid);
    if (history.length > 0) {
      setMessages(history);
    } else {
      // Setup Initial Greeting
      const goal = profile?.fitnessGoal || 'Build Muscle';
      const experience = profile?.experienceLevel || 'Intermediate';
      const greeting1: AIChatMessage = {
        sender: 'ai',
        text: `Hello ${profile?.name || 'Athlete'}! I am Coach GymTrainer, your dedicated performance counselor and metabolic conditioning AI Coach.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'general'
      };
      const greeting2: AIChatMessage = {
        sender: 'ai',
        text: `I've analyzed your athlete file: active goal is **${goal}** with an **${experience}** conditioning profile.\n\nType any natural prompt in the input below, or use the dedicated generator panels above to formulate structured splits, meal calculations, and form guides!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'general'
      };
      setMessages([greeting1, greeting2]);
    }
  };

  const loadRecommendations = async () => {
    if (!profile?.uid) return;
    const recs = await getAIRecommendations(profile.uid);
    setSavedReports(recs.filter(r => r.type === 'report'));
  };

  const loadExercises = async () => {
    const list = await getExercises();
    setExercisesList(list);
    if (list.length > 0) {
      setSelectedExName(list[0].name);
    }
  };

  // 1. CHAT COMPLETION
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !profile?.uid) return;

    const userText = inputValue;
    setInputValue('');

    const userMsg: AIChatMessage = {
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Save user message to Firestore
    const savedUser = await saveAIChatMessage(profile.uid, userMsg);
    setMessages(prev => [...prev, savedUser]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, savedUser],
          profile: profile
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        const aiMsg: AIChatMessage = {
          sender: 'ai',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'general'
        };
        // Save AI response to Firestore
        const savedAi = await saveAIChatMessage(profile.uid, aiMsg);
        setMessages(prev => [...prev, savedAi]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: AIChatMessage = {
        sender: 'ai',
        text: `Sorry, I encountered a physical performance barrier: ${err.message || 'connection issue'}. Let's try that rep again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // CLEAR CHAT HISTORY
  const handleClearHistory = async () => {
    if (!profile?.uid) return;
    setClearingChat(true);
    await clearAIChatHistory(profile.uid);
    setMessages([]);
    setClearingChat(false);
    loadChats();
  };

  // 2. WORKOUT GENERATOR
  const handleGenerateWorkout = async () => {
    if (!profile?.uid) return;
    setGeneratingWorkout(true);
    setGeneratedWorkout(null);
    setWorkoutSavedSuccess(false);

    const fullPrompt = `${workoutPrompt}. Format it cleanly with ${daysCount} days targeting equipment: ${workoutEquipment}. ${workoutRestriction ? 'Note physical restriction: ' + workoutRestriction : ''}`;

    try {
      const response = await fetch('/api/coach/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          profile: profile
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedWorkout(data);
      } else {
        throw new Error('Inference error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingWorkout(false);
    }
  };

  // SAVE WORKOUT PLAN TO FIRESTORE
  const handleSaveWorkoutToMyPlans = async () => {
    if (!profile?.uid || !generatedWorkout) return;
    setSavingWorkout(true);
    try {
      // Save as Custom Workout Plan
      await createCustomWorkoutPlan(profile.uid, {
        title: generatedWorkout.title,
        description: generatedWorkout.description,
        duration: generatedWorkout.duration || 45,
        calories: generatedWorkout.calories || 350,
        difficulty: generatedWorkout.difficulty || 'Intermediate',
        category: generatedWorkout.category || 'Strength',
        exercises: generatedWorkout.exercises || [],
        createdAt: new Date().toISOString()
      });

      // Save as Recommendation Log
      await saveAIRecommendation(profile.uid, {
        type: 'workout',
        title: generatedWorkout.title,
        content: generatedWorkout,
        createdAt: new Date().toISOString(),
        prompt: workoutPrompt
      });

      // Notify
      await addNotification(profile.uid, {
        title: 'New AI Workout Plan Generated!',
        body: `"${generatedWorkout.title}" has been added directly to your Workout Planner.`,
        type: 'achievement'
      });

      setWorkoutSavedSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingWorkout(false);
    }
  };

  // 3. MEAL PLANNER
  const handleGenerateMeal = async () => {
    if (!profile?.uid) return;
    setGeneratingMeal(true);
    setGeneratedMeal(null);
    setMealSavedSuccess(false);

    const fullPrompt = `${mealPrompt}. Balanced for goal: ${dietGoal}. Exclude/Allergies: ${dietRestrictions || 'None'}`;

    try {
      const response = await fetch('/api/coach/generate-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          profile: profile
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedMeal(data);
      } else {
        throw new Error('Inference error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingMeal(false);
    }
  };

  // SAVE MEAL PLAN TO RECS
  const handleSaveMealPlan = async () => {
    if (!profile?.uid || !generatedMeal) return;
    setSavingMeal(true);
    try {
      await saveAIRecommendation(profile.uid, {
        type: 'meal',
        title: generatedMeal.title,
        content: generatedMeal,
        createdAt: new Date().toISOString(),
        prompt: mealPrompt
      });

      await addNotification(profile.uid, {
        title: 'AI Meal Plan Logged!',
        body: `Successfully recorded "${generatedMeal.title}" into your Nutrition Coach logs.`,
        type: 'reminder'
      });

      setMealSavedSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingMeal(false);
    }
  };

  // 4. FORM CORRECTION GUIDE
  const handleAnalyzeForm = async () => {
    if (!profile?.uid) return;
    setAnalyzingForm(true);
    setFormCorrectionResult('');

    try {
      const response = await fetch('/api/coach/form-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseName: selectedExName,
          description: formDescription
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFormCorrectionResult(data.correction);

        // Also save to recommendations
        await saveAIRecommendation(profile.uid, {
          type: 'correction',
          title: `Form Adjustments: ${selectedExName}`,
          content: data.correction,
          createdAt: new Date().toISOString(),
          prompt: `Biomechanical analysis of ${selectedExName}: ${formDescription}`
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingForm(false);
    }
  };

  // 5. BIOMETRIC PROGRESS ANALYZER
  const handleAnalyzeProgress = async () => {
    if (!profile?.uid) return;
    setAnalyzingProgress(true);
    setProgressReport('');

    try {
      // Gather actual logs from profile / db
      const workoutLogs = await getWorkoutLogs(profile.uid);
      const sleepLogs = await getSleepLogs(profile.uid);

      const logsPayload = {
        weightHistory: profile.weightHistory || [],
        sleepLogs: sleepLogs,
        completedWorkoutsCount: profile.completedWorkoutsCount || workoutLogs.length,
        streak: profile.streak || 0
      };

      const response = await fetch('/api/coach/analyze-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs: logsPayload,
          profile: profile
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProgressReport(data.report);

        // Save report to database
        const saved = await saveAIRecommendation(profile.uid, {
          type: 'report',
          title: `Athlete Biometric Report: ${new Date().toLocaleDateString()}`,
          content: data.report,
          createdAt: new Date().toISOString(),
          prompt: 'Biometric Progress Scan'
        });

        setSavedReports(prev => [saved, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProgressReport(prev => prev || 'No response parseable from server.');
      setAnalyzingProgress(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] text-white rounded-3xl p-6 shadow-xl border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C3AED]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="z-10">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <BrainCircuit className="w-7 h-7 text-[#7C3AED] animate-pulse" />
            <span>AI ELITE COACH HUB</span>
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-xl font-medium">
            Leverage Gemini 3.5 biometric neural networks to optimize splits, macro-nutritional plans, and active orthopedic movement cues.
          </p>
        </div>
        <div className="flex items-center gap-2 z-10 shrink-0">
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            Gemini Active
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="grid grid-cols-5 gap-1.5 bg-[#111827] border border-white/[0.08] p-1.5 rounded-2xl">
        {[
          { id: 'chat', label: 'AI Chat Coach', icon: Bot },
          { id: 'workout', label: 'Workout Gen', icon: Dumbbell },
          { id: 'meal', label: 'Nutrition', icon: Utensils },
          { id: 'form', label: 'Form Assist', icon: ShieldCheck },
          { id: 'progress', label: 'Progress Scan', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#7C3AED] text-white shadow-md'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Container Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {/* TAB 1: CHAT INTERFACE */}
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-270px)] min-h-[500px]">
              
              {/* Main Chat Box */}
              <div className="lg:col-span-2 bg-[#111827] border border-white/[0.08] rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl h-full">
                
                {/* Header info */}
                <div className="px-6 py-4 border-b border-white/[0.06] bg-[#09090B] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] flex items-center justify-center">
                      <Bot className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">Coach GymTrainer</h3>
                      <span className="text-[9px] text-emerald-400 font-bold block">● SYNCED PERFORMANCE AGENT</span>
                    </div>
                  </div>
                  <button
                    onClick={handleClearHistory}
                    disabled={clearingChat}
                    title="Clear chat history"
                    className="p-2 text-[#A1A1AA] hover:text-[#EF4444] transition-colors rounded-xl hover:bg-white/[0.02] disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Message Log */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-none bg-[#09090B]/30">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.sender === 'user' 
                          ? 'bg-zinc-800 border border-zinc-700 text-white' 
                          : 'bg-[#7C3AED]/15 border border-[#7C3AED]/25 text-[#7C3AED]'
                      }`}>
                        {msg.sender === 'user' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className={`px-4 py-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#7C3AED] text-white rounded-tr-none shadow-md font-bold'
                            : 'bg-[#111827] border border-white/[0.06] text-white rounded-tl-none font-medium'
                        }`}>
                          <MarkdownText text={msg.text} />
                        </div>
                        <span className={`text-[8px] text-[#A1A1AA] font-bold block ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-3 max-w-[80%] mr-auto">
                      <div className="w-8 h-8 rounded-full bg-[#7C3AED]/15 border border-[#7C3AED]/25 text-[#7C3AED] flex items-center justify-center shrink-0">
                        <Bot className="w-4.5 h-4.5 animate-pulse" />
                      </div>
                      <div className="bg-[#111827] border border-white/[0.06] px-4 py-3.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Form Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/[0.06] bg-[#09090B]/50 flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type natural queries: 'I want to lose 10 kg' or 'I have knee pain'..."
                    className="flex-1 bg-[#09090B] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-xs text-white font-bold outline-none focus:ring-1 focus:ring-[#7C3AED] transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-[#7C3AED] hover:bg-violet-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer shrink-0 transition-all"
                  >
                    <Send className="w-4.5 h-4.5 fill-white" />
                  </button>
                </form>
              </div>

              {/* Suggestions Side Bar */}
              <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
                <div className="bg-[#111827] border border-white/[0.08] rounded-3xl p-5 shadow-xl space-y-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Sparkle className="w-4 h-4 text-[#7C3AED]" />
                    <span>Quick Coaching Queries</span>
                  </h3>
                  <div className="space-y-3">
                    {[
                      { q: 'I want to lose 10 kg.', desc: 'Construct a metabolic composition strategy.' },
                      { q: 'I have only dumbbells.', desc: 'Formulate an intense free weight split.' },
                      { q: 'I have knee pain.', desc: 'Orthopedic modifications for leg splits.' },
                      { q: 'Create a 5 day workout.', desc: 'Generate a professional hypertrophy schedule.' }
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputValue(prompt.q)}
                        className="w-full text-left bg-[#09090B] border border-white/[0.04] p-3 rounded-xl hover:border-[#7C3AED] hover:bg-white/[0.02] transition-all flex items-start gap-3 cursor-pointer group"
                      >
                        <div className="p-1.5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-lg text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white transition-all">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[11px] font-bold text-white transition-colors">{prompt.q}</h4>
                          <p className="text-[9px] text-[#A1A1AA] mt-0.5">{prompt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-tr from-[#7C3AED] to-[#4F46E5] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
                  <Award className="w-8 h-8 text-white/40 mb-2" />
                  <h4 className="text-xs font-black tracking-wide uppercase">Profile Records Synced</h4>
                  <p className="text-[10px] text-white/80 mt-1 leading-relaxed">
                    All conversations, custom workout splits, and dietary logs synchronize directly with your athlete file to preserve your physical trajectory.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKOUT GENERATOR */}
          {activeTab === 'workout' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Input Parameters */}
              <div className="lg:col-span-5 bg-[#111827] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-5">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-[#7C3AED]" />
                  <span>AI Workout Generator</span>
                </h2>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                  Design structured compound programs utilizing advanced hyper-targeting. Output parses natively to your planner list.
                </p>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#A1A1AA]">Workout Focus / Goal</label>
                    <input
                      type="text"
                      value={workoutPrompt}
                      onChange={(e) => setWorkoutPrompt(e.target.value)}
                      placeholder="e.g. Hypertrophy, Powerlifting split, HIIT cardio..."
                      className="w-full bg-[#09090B] border border-white/[0.08] rounded-xl px-3.5 py-3 text-xs text-white font-bold outline-none focus:ring-1 focus:ring-[#7C3AED]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#A1A1AA] block">Weekly Frequency ({daysCount} Days)</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDaysCount(d)}
                          className={`py-2 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                            daysCount === d
                              ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-md'
                              : 'bg-[#09090B] border-white/[0.08] text-[#A1A1AA] hover:bg-white/[0.02]'
                          }`}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#A1A1AA] block">Available Equipment</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Full Gym', 'Dumbbells Only', 'Bodyweight'].map((eq) => (
                        <button
                          key={eq}
                          onClick={() => setWorkoutEquipment(eq)}
                          className={`py-2 px-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer truncate ${
                            workoutEquipment === eq
                              ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-md'
                              : 'bg-[#09090B] border-white/[0.08] text-[#A1A1AA] hover:bg-white/[0.02]'
                          }`}
                        >
                          {eq}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#A1A1AA]">Physical Restrictions / Pain</label>
                    <input
                      type="text"
                      value={workoutRestriction}
                      onChange={(e) => setWorkoutRestriction(e.target.value)}
                      placeholder="e.g. Knee pain, Lower back injury..."
                      className="w-full bg-[#09090B] border border-white/[0.08] rounded-xl px-3.5 py-3 text-xs text-white font-bold outline-none focus:ring-1 focus:ring-[#7C3AED]"
                    />
                  </div>

                  <button
                    onClick={handleGenerateWorkout}
                    disabled={generatingWorkout || !workoutPrompt.trim()}
                    className="w-full bg-[#7C3AED] hover:bg-violet-600 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {generatingWorkout ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Calculating Sets & Reps Biometrics...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-violet-200" />
                        Synthesize Customized Split
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Output Panel display */}
              <div className="lg:col-span-7 space-y-4">
                {generatingWorkout && (
                  <div className="bg-[#111827] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4 animate-pulse">
                    <div className="h-4 bg-zinc-800 rounded w-1/3" />
                    <div className="h-3 bg-zinc-800 rounded w-2/3" />
                    <div className="space-y-2.5 pt-4">
                      <div className="h-10 bg-[#09090B] rounded-xl" />
                      <div className="h-10 bg-[#09090B] rounded-xl" />
                      <div className="h-10 bg-[#09090B] rounded-xl" />
                    </div>
                  </div>
                )}

                {!generatingWorkout && !generatedWorkout && (
                  <div className="bg-[#111827] border border-white/[0.08] rounded-3xl p-12 text-center space-y-3 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-[#09090B] border border-white/[0.04] text-zinc-600 flex items-center justify-center mx-auto">
                      <Dumbbell className="w-6 h-6 text-[#7C3AED]" />
                    </div>
                    <h4 className="text-xs font-black text-white">Awaiting Program Parameters</h4>
                    <p className="text-[10px] text-[#A1A1AA] max-w-xs mx-auto leading-relaxed">
                      Formulate a prompt or configure variables on the left, then click Synthesize to construct a custom physical regimen.
                    </p>
                  </div>
                )}

                {!generatingWorkout && generatedWorkout && (
                  <div className="bg-[#111827] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-6">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] bg-[#7C3AED]/15 border border-[#7C3AED]/20 text-[#7C3AED] px-2.5 py-1 rounded-full font-extrabold tracking-widest uppercase inline-block mb-2">
                          {generatedWorkout.category || 'Strength'}
                        </span>
                        <h3 className="text-sm font-black text-white">{generatedWorkout.title}</h3>
                        <p className="text-[11px] text-[#A1A1AA] mt-1 leading-relaxed">{generatedWorkout.description}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 bg-[#09090B] px-3 py-1.5 rounded-xl border border-white/[0.04]">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-[10px] font-black text-white">{generatedWorkout.calories || 380} kcal</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 border-y border-white/[0.06] py-3.5">
                      <div className="text-center">
                        <span className="block text-[8px] text-[#A1A1AA] uppercase font-black tracking-widest">Duration</span>
                        <span className="text-xs font-extrabold text-white mt-0.5 block">{generatedWorkout.duration || 45} mins</span>
                      </div>
                      <div className="text-center border-x border-white/[0.06]">
                        <span className="block text-[8px] text-[#A1A1AA] uppercase font-black tracking-widest">Difficulty</span>
                        <span className="text-xs font-extrabold text-white mt-0.5 block">{generatedWorkout.difficulty || 'Intermediate'}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-[8px] text-[#A1A1AA] uppercase font-black tracking-widest">Equipment</span>
                        <span className="text-xs font-extrabold text-white mt-0.5 block truncate">{workoutEquipment}</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="text-[10px] uppercase font-black tracking-widest text-[#A1A1AA]">Prescribed Biomechanical Movements</h4>
                      <div className="space-y-2">
                        {generatedWorkout.exercises?.map((ex: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-[#09090B] border border-white/[0.04] p-3 rounded-xl flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-[#7C3AED]/15 border border-[#7C3AED]/20 text-[#7C3AED] text-[10px] font-black flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <h5 className="text-[11px] font-bold text-white">{ex.name}</h5>
                            </div>
                            <div className="flex items-center gap-2.5 font-mono">
                              <span className="text-[10px] bg-white/[0.02] px-2.5 py-1 rounded-lg text-[#A1A1AA] border border-white/[0.04]">
                                {ex.sets} Sets
                              </span>
                              <span className="text-[10px] text-[#7C3AED] font-black">
                                {ex.reps}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {workoutSavedSuccess ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-400">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold">Routines synchronized successfully!</p>
                          <p className="text-[10px] text-emerald-400/80 mt-0.5">This custom split has been compiled directly into your active Workout Plans list.</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleSaveWorkoutToMyPlans}
                        disabled={savingWorkout}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {savingWorkout ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Synchronizing databases...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4.5 h-4.5" />
                            Save to My Plans & Calendar
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MEAL PLANNER */}
          {activeTab === 'meal' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Input Parameters */}
              <div className="lg:col-span-5 bg-[#111827] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-5">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-rose-400" />
                  <span>AI Nutrition Coach</span>
                </h2>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                  Generate complete structured daily menus with target macronutrient and calorie allocations matching your specific lean mass goals.
                </p>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#A1A1AA]">Diet Focus / Flavor Profile</label>
                    <input
                      type="text"
                      value={mealPrompt}
                      onChange={(e) => setMealPrompt(e.target.value)}
                      placeholder="e.g. High protein lean cut, Keto diet..."
                      className="w-full bg-[#09090B] border border-white/[0.08] rounded-xl px-3.5 py-3 text-xs text-white font-bold outline-none focus:ring-1 focus:ring-[#7C3AED]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#A1A1AA] block">Lean Mass Target Goal</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Build Muscle', 'Lose Fat', 'Stay Fit'].map((tg) => (
                        <button
                          key={tg}
                          onClick={() => setDietGoal(tg)}
                          className={`py-2 px-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer truncate ${
                            dietGoal === tg
                              ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                              : 'bg-[#09090B] border-white/[0.08] text-[#A1A1AA] hover:bg-white/[0.02]'
                          }`}
                        >
                          {tg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#A1A1AA]">Exclusions / Allergies</label>
                    <input
                      type="text"
                      value={dietRestrictions}
                      onChange={(e) => setDietRestrictions(e.target.value)}
                      placeholder="e.g. Nut allergies, Dairy-free..."
                      className="w-full bg-[#09090B] border border-white/[0.08] rounded-xl px-3.5 py-3 text-xs text-white font-bold outline-none focus:ring-1 focus:ring-[#7C3AED]"
                    />
                  </div>

                  <button
                    onClick={handleGenerateMeal}
                    disabled={generatingMeal || !mealPrompt.trim()}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {generatingMeal ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Calculating Macros & Calorie Tables...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-rose-200" />
                        Generate Meal Schedule
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Output Display */}
              <div className="lg:col-span-7 space-y-4">
                {generatingMeal && (
                  <div className="bg-[#111827] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4 animate-pulse">
                    <div className="h-4 bg-zinc-850 rounded w-1/3" />
                    <div className="h-3 bg-zinc-850 rounded w-2/3" />
                    <div className="grid grid-cols-4 gap-2 py-4">
                      <div className="h-12 bg-[#09090B] rounded-xl" />
                      <div className="h-12 bg-[#09090B] rounded-xl" />
                      <div className="h-12 bg-[#09090B] rounded-xl" />
                      <div className="h-12 bg-[#09090B] rounded-xl" />
                    </div>
                  </div>
                )}

                {!generatingMeal && !generatedMeal && (
                  <div className="bg-[#111827] border border-white/[0.08] rounded-3xl p-12 text-center space-y-3 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-[#09090B] text-zinc-600 flex items-center justify-center mx-auto">
                      <Utensils className="w-6 h-6 text-rose-400" />
                    </div>
                    <h4 className="text-xs font-black text-white">Awaiting Dietary Specifications</h4>
                    <p className="text-[10px] text-[#A1A1AA] max-w-xs mx-auto leading-relaxed">
                      Configure your bulking or cutting macro variables on the left, then click Generate to output a tailored meal plan schedule.
                    </p>
                  </div>
                )}

                {!generatingMeal && generatedMeal && (
                  <div className="bg-[#111827] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-6">
                    <div>
                      <span className="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2.5 py-1 rounded-full font-extrabold tracking-widest uppercase inline-block mb-2">
                        Nutrition Blueprint
                      </span>
                      <h3 className="text-sm font-black text-white">{generatedMeal.title}</h3>
                      <p className="text-[11px] text-[#A1A1AA] mt-1 leading-relaxed">{generatedMeal.description}</p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 bg-[#09090B] p-3 rounded-2xl border border-white/[0.04]">
                      <div className="text-center p-1">
                        <span className="block text-[8px] text-[#A1A1AA] uppercase font-black tracking-widest">Calories</span>
                        <span className="text-[11px] font-black text-white mt-0.5 block">{generatedMeal.caloriesTarget || 2200} kcal</span>
                      </div>
                      <div className="text-center p-1 border-l border-white/[0.06]">
                        <span className="block text-[8px] text-[#A1A1AA] uppercase font-black tracking-widest">Protein</span>
                        <span className="text-[11px] font-black text-white mt-0.5 block">{generatedMeal.proteinTarget || 160}g</span>
                      </div>
                      <div className="text-center p-1 border-l border-white/[0.06]">
                        <span className="block text-[8px] text-[#A1A1AA] uppercase font-black tracking-widest">Carbs</span>
                        <span className="text-[11px] font-black text-white mt-0.5 block">{generatedMeal.carbsTarget || 200}g</span>
                      </div>
                      <div className="text-center p-1 border-l border-white/[0.06]">
                        <span className="block text-[8px] text-[#A1A1AA] uppercase font-black tracking-widest">Fats</span>
                        <span className="text-[11px] font-black text-white mt-0.5 block">{generatedMeal.fatsTarget || 70}g</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-black tracking-widest text-[#A1A1AA]">Custom Meal Schedule</h4>
                      <div className="space-y-2">
                        {generatedMeal.meals?.map((meal: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-[#09090B] border border-white/[0.04] p-3.5 rounded-2xl flex items-center justify-between gap-4"
                          >
                            <div className="min-w-0">
                              <span className="text-[8px] bg-rose-500/15 text-rose-400 font-extrabold uppercase px-2 py-0.5 rounded-md inline-block mb-1">
                                {meal.type}
                              </span>
                              <h5 className="text-[11px] font-bold text-white truncate">{meal.name}</h5>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded-lg text-white font-extrabold">
                                {meal.calories} kcal
                              </span>
                              <span className="text-[9px] text-[#A1A1AA] font-bold hidden sm:inline font-mono">
                                P:{meal.protein}g / C:{meal.carbs}g / F:{meal.fats}g
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {mealSavedSuccess ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-400">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold">Meal Recommendations Saved!</p>
                          <p className="text-[10px] text-emerald-400/80 mt-0.5">This plan has been permanently synced to your secure profile logs.</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleSaveMealPlan}
                        disabled={savingMeal}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {savingMeal ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Synchronizing logs...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4.5 h-4.5" />
                            Log & Save AI Meal Plan
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FORM CORRECTION GUIDE */}
          {activeTab === 'form' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Input Variables */}
              <div className="lg:col-span-5 bg-[#111827] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-5">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#7C3AED]" />
                  <span>AI Form Correction Guide</span>
                </h2>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                  Address structural weaknesses, joint pain, or movement deviations. Select your lift, describe your form, and get tailored orthopedic corrections.
                </p>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#A1A1AA] block">Select Exercise Movement</label>
                    <select
                      value={selectedExName}
                      onChange={(e) => setSelectedExName(e.target.value)}
                      className="w-full bg-[#09090B] border border-white/[0.08] rounded-xl px-3.5 py-3 text-xs text-white font-bold outline-none focus:ring-1 focus:ring-[#7C3AED]"
                    >
                      {exercisesList.map((ex) => (
                        <option key={ex.id} value={ex.name} className="bg-[#111827]">
                          {ex.name} ({ex.muscleGroup})
                        </option>
                      ))}
                      {exercisesList.length === 0 && (
                        <>
                          <option value="Squat" className="bg-[#111827]">Squat</option>
                          <option value="Deadlift" className="bg-[#111827]">Deadlift</option>
                          <option value="Bench Press" className="bg-[#111827]">Bench Press</option>
                          <option value="Overhead Press" className="bg-[#111827]">Overhead Press</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#A1A1AA] block">Describe technique / pain points</label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={4}
                      placeholder="e.g. My knees cave inward slightly when coming out of the hole."
                      className="w-full bg-[#09090B] border border-white/[0.08] rounded-xl px-3.5 py-3 text-xs text-white font-semibold outline-none focus:ring-1 focus:ring-[#7C3AED] resize-none"
                    />
                  </div>

                  <button
                    onClick={handleAnalyzeForm}
                    disabled={analyzingForm || !formDescription.trim()}
                    className="w-full bg-[#7C3AED] hover:bg-violet-600 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {analyzingForm ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing Biomechanical Physics...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-violet-200" />
                        Analyze Technique
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Analysis Output display */}
              <div className="lg:col-span-7 space-y-4">
                {analyzingForm && (
                  <div className="bg-[#111827] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4 animate-pulse">
                    <div className="h-4 bg-zinc-850 rounded w-1/4" />
                    <div className="h-2.5 bg-zinc-850 rounded w-full" />
                    <div className="h-2.5 bg-zinc-850 rounded w-3/4" />
                    <div className="h-2.5 bg-zinc-850 rounded w-5/6" />
                  </div>
                )}

                {!analyzingForm && !formCorrectionResult && (
                  <div className="bg-[#111827] border border-white/[0.08] rounded-3xl p-12 text-center space-y-3 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-[#09090B] text-zinc-600 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-6 h-6 text-[#7C3AED]" />
                    </div>
                    <h4 className="text-xs font-black text-white">Awaiting Technique Input</h4>
                    <p className="text-[10px] text-[#A1A1AA] max-w-xs mx-auto leading-relaxed">
                      Select your lift, describe mechanical hitches on the left, and click Analyze to receive tactical physical adjustments.
                    </p>
                  </div>
                )}

                {!analyzingForm && formCorrectionResult && (
                  <div className="bg-[#111827] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.06]">
                      <div className="p-1.5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] rounded-lg">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">Form Correction: {selectedExName}</h4>
                        <span className="text-[8px] text-[#7C3AED] font-extrabold uppercase tracking-wider block">Orthopedic Cue Protocol</span>
                      </div>
                    </div>

                    <div className="bg-[#09090B] p-4 rounded-2xl border border-white/[0.04]">
                      <MarkdownText text={formCorrectionResult} />
                    </div>

                    <div className="bg-[#7C3AED]/5 border border-[#7C3AED]/10 p-4 rounded-xl flex items-start gap-2.5 text-[#7C3AED] text-[10px] font-semibold leading-relaxed">
                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#7C3AED]" />
                      <div>
                        These corrections are stored in your Coaching Logs. Review them before your next lift to ensure high neuromuscular recruitment and safety.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: BIOMETRIC PROGRESS ANALYZER */}
          {activeTab === 'progress' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Scan Trigger */}
              <div className="lg:col-span-4 bg-[#111827] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-5">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#7C3AED]" />
                  <span>Biometric Scanner</span>
                </h2>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                  Trigger an instantaneous scan of your registered weight history, sleep depth, workout frequency, and active streak to compile an executive coaching feedback report.
                </p>

                <button
                  onClick={handleAnalyzeProgress}
                  disabled={analyzingProgress}
                  className="w-full bg-[#7C3AED] hover:bg-violet-600 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {analyzingProgress ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Scanning Biometrics...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-violet-200" />
                      Compile Biometric Report
                    </>
                  )}
                </button>

                {/* Saved Reports */}
                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-[#A1A1AA]">Previous Coach Reports</h4>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto scrollbar-none">
                    {savedReports.map((rep) => (
                      <button
                        key={rep.id}
                        onClick={() => setProgressReport(rep.content)}
                        className="w-full text-left bg-[#09090B] border border-white/[0.04] p-3 rounded-xl hover:border-[#7C3AED] hover:bg-white/[0.02] transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <h5 className="text-[10px] font-bold text-white truncate">{rep.title}</h5>
                          <span className="text-[8px] text-[#A1A1AA] block mt-0.5">{new Date(rep.createdAt).toLocaleDateString()}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#7C3AED] transition-colors shrink-0" />
                      </button>
                    ))}
                    {savedReports.length === 0 && (
                      <p className="text-[9px] text-[#A1A1AA] text-center py-4">No logged reports available yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Scan Output display */}
              <div className="lg:col-span-8 space-y-4">
                {analyzingProgress && (
                  <div className="bg-[#111827] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4 animate-pulse">
                    <div className="h-4 bg-zinc-850 rounded w-1/4" />
                    <div className="space-y-3 pt-4">
                      <div className="h-3 bg-zinc-850 rounded w-full" />
                      <div className="h-3 bg-zinc-850 rounded w-5/6" />
                      <div className="h-3 bg-zinc-850 rounded w-4/5" />
                    </div>
                  </div>
                )}

                {!analyzingProgress && !progressReport && (
                  <div className="bg-[#111827] border border-white/[0.08] rounded-3xl p-12 text-center space-y-3 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-[#09090B] text-zinc-600 flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6 text-[#7C3AED]" />
                    </div>
                    <h4 className="text-xs font-black text-white">Awaiting Biometric Compilation</h4>
                    <p className="text-[10px] text-[#A1A1AA] max-w-xs mx-auto leading-relaxed">
                      Click the compilation button on the left to analyze your logged progress statistics and synthesize an executive report.
                    </p>
                  </div>
                )}

                {!analyzingProgress && progressReport && (
                  <div className="bg-[#111827] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.06]">
                      <div className="p-1.5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] rounded-lg">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">Coach Performance Critique</h4>
                        <span className="text-[8px] text-[#7C3AED] font-extrabold uppercase tracking-wider block">Biometric Trajectory Feedback</span>
                      </div>
                    </div>

                    <div className="bg-[#09090B] p-5 rounded-2xl border border-white/[0.04] max-h-[500px] overflow-y-auto">
                      <MarkdownText text={progressReport} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};
