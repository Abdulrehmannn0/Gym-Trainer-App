import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  Dumbbell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Flame,
  Calendar,
  TrendingUp,
  Utensils,
  BrainCircuit,
  Heart,
  Award,
  Settings,
  ShieldAlert,
  Sun,
  Moon,
  Monitor,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const { profile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'workout-plans', name: 'Workout Plans', icon: Calendar },
    { id: 'library', name: 'Exercise Library', icon: Dumbbell },
    { id: 'progress', name: 'Progress Analytics', icon: TrendingUp },
    { id: 'nutrition', name: 'Nutrition Hub', icon: Utensils },
    { id: 'ai-coach', name: 'AI Coach Chat', icon: BrainCircuit },
    { id: 'favorites', name: 'Favorites', icon: Heart },
    { id: 'achievements', name: 'Achievements', icon: Award },
    { id: 'profile', name: 'Athlete Profile', icon: User },
    { id: 'support', name: 'Support & FAQs', icon: HelpCircle },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      onNavigate('login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900 text-zinc-900 dark:text-white p-4 sticky top-0 z-50 shadow-sm transition-colors">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl text-white shadow-md shadow-indigo-500/10">
            <Dumbbell className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white">
            GymTrainer<span className="text-indigo-500">Pro</span>
          </span>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
          id="mobile-menu-toggle"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Sidebar & Mobile Drawer Navigation Container */}
      <AnimatePresence>
        {(isOpen || true) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed top-[64px] md:top-0 left-0 bottom-0 z-40 w-64 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md text-zinc-900 dark:text-zinc-100 flex flex-col border-r border-zinc-100 dark:border-zinc-900 h-[calc(100vh-64px)] md:h-screen
              ${isOpen ? 'translate-x-0' : 'hidden md:flex'}
              md:translate-x-0 transition-none
            `}
            id="app-sidebar"
          >
            {/* App Brand Title (Desktop Only) */}
            <div className="hidden md:flex items-center space-x-3 px-6 py-6 border-b border-zinc-100 dark:border-zinc-900">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl text-white shadow-lg shadow-indigo-500/15">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  GymTrainer<span className="text-indigo-500">Pro</span>
                </h1>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-0.5">ATHLETIC BLUEPRINTS</p>
              </div>
            </div>

            {/* Profile Summary Widget */}
            {profile && (
              <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-900 flex items-center space-x-3 bg-zinc-50/50 dark:bg-zinc-900/10">
                <img
                  src={profile.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.uid}`}
                  alt={profile.name}
                  className="w-10 h-10 rounded-full object-cover border border-indigo-500/20 bg-zinc-100 dark:bg-zinc-900"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-extrabold uppercase text-indigo-500 leading-none mb-1">Active Athlete</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{profile.name}</p>
                </div>
              </div>
            )}

            {/* Navigation Menu Links */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-none">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id || (item.id === 'library' && activePage === 'details');
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer
                      ${isActive 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                      }
                    `}
                    id={`nav-${item.id}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400 dark:text-zinc-500'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick theme toggles inside Sidebar footer */}
            <div className="px-6 py-2 border-t border-zinc-100 dark:border-zinc-900 flex justify-between gap-1">
              {[
                { id: 'light', icon: Sun },
                { id: 'dark', icon: Moon },
                { id: 'system', icon: Monitor }
              ].map((m) => {
                const I = m.icon;
                const active = theme === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setTheme(m.id as any)}
                    className={`p-1.5 flex-1 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                        : 'border-transparent text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <I className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>

            {/* Logout Footer Button */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-900">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold tracking-wider uppercase rounded-xl text-zinc-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 transition-all duration-200 border border-zinc-100 dark:border-zinc-900/60 cursor-pointer"
                id="logout-button"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Overlay Back Drop */}
      {isOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          id="sidebar-overlay"
        />
      )}
    </>
  );
};
