import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ExerciseLibrary } from './pages/ExerciseLibrary';
import { ExerciseDetails } from './pages/ExerciseDetails';
import { Profile } from './pages/Profile';
import { Flame, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

  // If auth is loading, show a beautiful branding spinner screen
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="bg-rose-500 p-4 rounded-3xl text-white shadow-xl shadow-rose-500/20 mb-4"
        >
          <Dumbbell className="w-8 h-8" />
        </motion.div>
        <p className="text-white font-bold tracking-wide">GymTrainer Pro</p>
        <p className="text-zinc-500 text-xs mt-1 font-mono">AUTHENTICATING ATHLETE...</p>
      </div>
    );
  }

  // Auth Guards for Unauthenticated Users
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

  // Render Protected Pages wrapped in Sidebar Layout
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case 'library':
        return <ExerciseLibrary onNavigate={navigateTo} />;
      case 'details':
        return <ExerciseDetails exerciseId={selectedExerciseId} onNavigate={navigateTo} />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onNavigate={navigateTo} />;
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
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
