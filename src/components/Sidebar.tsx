import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Dumbbell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Flame 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const { profile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'library', name: 'LIBRARY', icon: Dumbbell },
    { id: 'profile', name: 'PROFILE', icon: User },
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
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-zinc-950 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-2">
          <span className="font-black text-2xl tracking-tighter italic">GYMTRAINER<span className="text-blue-500 underline">PRO</span></span>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          id="mobile-menu-toggle"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sidebar & Mobile Drawer */}
      <AnimatePresence>
        {(isOpen || true) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed top-[64px] md:top-0 left-0 bottom-0 z-40 w-64 bg-zinc-950 text-zinc-100 flex flex-col border-r border-zinc-900 h-[calc(100vh-64px)] md:h-screen
              ${isOpen ? 'translate-x-0' : 'hidden md:flex'}
              md:translate-x-0 transition-none
            `}
            id="app-sidebar"
          >
            {/* App Brand (Desktop Only) */}
            <div className="hidden md:flex items-center space-x-3 px-6 py-8 border-b border-zinc-900">
              <div>
                <h1 className="text-3xl font-black tracking-tighter italic text-white">GYMTRAINER<span className="text-blue-500 underline">PRO</span></h1>
                <p className="text-[10px] text-zinc-500 font-black tracking-widest mt-1">STRENGTH & HYPERTROPHY</p>
              </div>
            </div>

            {/* Profile Summary Widget */}
            {profile && (
              <div className="px-6 py-6 border-b border-zinc-900 flex items-center space-x-3 bg-zinc-900/20">
                <img
                  src={profile.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.uid}`}
                  alt={profile.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 bg-zinc-900"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase text-zinc-400 leading-none mb-1">Level 14</p>
                  <p className="text-sm font-bold text-white truncate">{profile.name}</p>
                </div>
              </div>
            )}

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id || (item.id === 'library' && activePage === 'details');
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-bold text-sm tracking-wide transition-all duration-200
                      ${isActive 
                        ? 'bg-zinc-900 text-white border-l-4 border-blue-500 shadow-md' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }
                    `}
                    id={`nav-${item.id}`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-zinc-400'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Logout Footer */}
            <div className="p-4 border-t border-zinc-900">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-black tracking-widest uppercase rounded-lg text-zinc-300 hover:text-white transition-all duration-200 border border-zinc-800"
                id="logout-button"
              >
                <LogOut className="w-3.5 h-3.5 text-zinc-400" />
                <span>LOGOUT</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          id="sidebar-overlay"
        />
      )}
    </>
  );
};
