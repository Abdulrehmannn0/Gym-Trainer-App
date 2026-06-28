import React, { useState, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dumbbell, Loader2, Compass, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy loading all pages for code-splitting and production chunk optimization
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ExerciseLibrary = React.lazy(() => import('./pages/ExerciseLibrary').then(m => ({ default: m.ExerciseLibrary })));
const ExerciseDetails = React.lazy(() => import('./pages/ExerciseDetails').then(m => ({ default: m.ExerciseDetails })));
const Profile = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const WorkoutPlans = React.lazy(() => import('./pages/WorkoutPlans').then(m => ({ default: m.WorkoutPlans })));
const Progress = React.lazy(() => import('./pages/Progress').then(m => ({ default: m.Progress })));
const Nutrition = React.lazy(() => import('./pages/Nutrition').then(m => ({ default: m.Nutrition })));
const AICoach = React.lazy(() => import('./pages/AICoach').then(m => ({ default: m.AICoach })));
const Favorites = React.lazy(() => import('./pages/Favorites').then(m => ({ default: m.Favorites })));
const Achievements = React.lazy(() => import('./pages/Achievements').then(m => ({ default: m.Achievements })));
const Settings = React.lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const SupportFAQ = React.lazy(() => import('./pages/SupportFAQ').then(m => ({ default: m.SupportFAQ })));

// Inline Loading component for chunk transitions
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center p-12 min-h-[50vh]">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-500 shadow-md border border-indigo-500/10 mb-4"
    >
      <Loader2 className="w-6 h-6 shrink-0" />
    </motion.div>
    <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold tracking-widest uppercase">Initializing training segment...</p>
  </div>
);

// PWA 404 Page Component
interface NotFoundProps {
  onNavigate: (page: string) => void;
}
const NotFoundPage: React.FC<NotFoundProps> = ({ onNavigate }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-500/15 text-indigo-500 flex items-center justify-center mb-6">
      <Compass className="w-7 h-7" />
    </div>
    <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-wider uppercase mb-2">ATHLETIC VECTOR LOST (404)</h1>
    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed mb-6 uppercase tracking-wider font-semibold">
      The telemetry coordinates you entered do not exist inside GymTrainer Pro's digital simulator.
    </p>
    <button
      onClick={() => onNavigate('dashboard')}
      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-indigo-600/15"
    >
      Return to Dashboard
    </button>
  </div>
);

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');

  const navigateTo = (page: string, exerciseId?: string) => {
    setCurrentPage(page);
    if (exerciseId) {
      setSelectedExerciseId(exerciseId);
    }
  };

  // Auth Loading splash screen
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="bg-indigo-600 p-4 rounded-3xl text-white shadow-2xl shadow-indigo-600/20 mb-4"
        >
          <Dumbbell className="w-8 h-8" />
        </motion.div>
        <p className="text-white font-extrabold tracking-wide uppercase text-sm">GymTrainer Pro</p>
        <p className="text-zinc-500 text-[10px] mt-1.5 font-bold tracking-widest uppercase">AUTHENTICATING ATHLETE PROFILES...</p>
      </div>
    );
  }

  // Auth Guards
  if (!user) {
    if (currentPage !== 'login' && currentPage !== 'register') {
      return <Login onNavigate={navigateTo} />;
    }
    return (
      <AnimatePresence mode="wait">
        {currentPage === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <Login onNavigate={navigateTo} />
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <Register onNavigate={navigateTo} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Route map switch
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case 'workout-plans':
        return <WorkoutPlans />;
      case 'library':
        return <ExerciseLibrary onNavigate={navigateTo} />;
      case 'details':
        return <ExerciseDetails exerciseId={selectedExerciseId} onNavigate={navigateTo} />;
      case 'progress':
        return <Progress />;
      case 'nutrition':
        return <Nutrition />;
      case 'ai-coach':
        return <AICoach />;
      case 'favorites':
        return <Favorites onNavigate={navigateTo} />;
      case 'achievements':
        return <Achievements />;
      case 'profile':
        return <Profile />;
      case 'support':
        return <SupportFAQ />;
      case 'settings':
        return <Settings />;
      default:
        return <NotFoundPage onNavigate={navigateTo} />;
    }
  };

  return (
    <Layout activePage={currentPage} onNavigate={navigateTo}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Wrap dynamic chunks in suspense with clean fallback loaders */}
          <Suspense fallback={<PageLoader />}>
            {renderPage()}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
