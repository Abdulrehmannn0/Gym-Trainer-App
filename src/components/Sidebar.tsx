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
  Sun,
  Moon,
  Monitor,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  onNavigate, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const { profile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="md:hidden flex items-center justify-between bg-[#111827]/90 backdrop-blur-md border-b border-white/[0.08] text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] rounded-xl text-white shadow-md shadow-[#7C3AED]/20">
            <Dumbbell className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            GymTrainer<span className="text-[#7C3AED]">Pro</span>
          </span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)} 
          className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-all"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Sidebar & Mobile Drawer Navigation Container */}
      <aside
        className={`
          fixed top-[64px] md:top-0 left-0 bottom-0 z-40 bg-[#111827]/70 md:bg-[#111827]/65 backdrop-blur-xl text-[#FFFFFF] flex flex-col border-r border-white/[0.08] h-[calc(100vh-64px)] md:h-screen transition-all duration-300
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
        id="app-sidebar"
      >
        {/* App Brand Title (Desktop Only) */}
        <div className="hidden md:flex items-center justify-between px-6 py-6 border-b border-white/[0.08] relative">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2.5 bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] rounded-2xl text-white shadow-lg shadow-[#7C3AED]/20 shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="whitespace-nowrap"
              >
                <h1 className="text-lg font-extrabold tracking-tight text-white">
                  GymTrainer<span className="text-[#7C3AED]">Pro</span>
                </h1>
                <p className="text-[9px] text-[#A1A1AA] font-bold uppercase tracking-widest mt-0.5">PREMIUM SAAS</p>
              </motion.div>
            )}
          </div>

          {/* Collapse Trigger Toggle (Desktop only) */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#111827] border border-white/[0.08] items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-zinc-800 transition-all shadow-md z-50"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Profile Summary Widget */}
        {profile && (
          <div className={`px-4 py-4 border-b border-white/[0.08] flex items-center space-x-3 bg-white/[0.02] ${isCollapsed ? 'justify-center px-2' : ''}`}>
            <div className="relative shrink-0">
              <img
                src={profile.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.uid}`}
                alt={profile.name}
                className="w-10 h-10 rounded-xl object-cover border border-[#7C3AED]/30 bg-[#09090B]"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] border-2 border-[#111827] rounded-full" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-w-0 flex-1"
              >
                <span className="text-[9px] font-black uppercase text-[#7C3AED] tracking-widest block mb-0.5">ATHLETE DESK</span>
                <p className="text-xs font-bold text-white truncate">{profile.name}</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Navigation Menu Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id || (item.id === 'library' && activePage === 'details');
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  group relative w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 cursor-pointer
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white shadow-lg shadow-[#7C3AED]/20 after:absolute after:left-0 after:top-1/4 after:h-1/2 after:w-1 after:bg-white after:rounded-full' 
                    : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.05]'
                  }
                  ${isCollapsed ? 'justify-center px-0' : ''}
                `}
                id={`nav-${item.id}`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#A1A1AA] group-hover:text-[#7C3AED]'}`} />
                {!isCollapsed ? (
                  <span className="transition-opacity">{item.name}</span>
                ) : (
                  /* Tooltip for collapsed states */
                  <div className="pointer-events-none opacity-0 group-hover:opacity-100 absolute left-full ml-3 px-3 py-1.5 bg-[#111827] border border-white/[0.08] rounded-xl text-xs font-extrabold whitespace-nowrap shadow-xl z-50 transition-all translate-x-2 group-hover:translate-x-0">
                    {item.name}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick theme toggles inside Sidebar footer */}
        <div className={`px-4 py-3 border-t border-white/[0.08] flex justify-between gap-1 ${isCollapsed ? 'flex-col items-center py-2 px-1' : ''}`}>
          {[
            { id: 'light', icon: Sun, label: 'Light' },
            { id: 'dark', icon: Moon, label: 'Dark' },
            { id: 'system', icon: Monitor, label: 'System' }
          ].map((m) => {
            const I = m.icon;
            const active = theme === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setTheme(m.id as any)}
                title={m.label}
                className={`p-1.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                  isCollapsed ? 'w-8 h-8' : 'flex-1'
                } ${
                  active
                    ? 'bg-[#7C3AED]/15 border-[#7C3AED]/30 text-[#7C3AED]'
                    : 'border-transparent text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <I className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        {/* Logout Footer Button */}
        <div className="p-3 border-t border-white/[0.08]">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center space-x-2 py-2.5 bg-white/[0.02] hover:bg-[#EF4444]/15 border border-white/[0.06] hover:border-[#EF4444]/30 text-xs font-bold tracking-wider uppercase rounded-xl text-[#A1A1AA] hover:text-[#EF4444] transition-all duration-200 cursor-pointer ${
              isCollapsed ? 'px-0 justify-center' : ''
            }`}
            id="logout-button"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay Back Drop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}
    </>
  );
};
