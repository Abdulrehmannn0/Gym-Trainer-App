import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      {/* Main Content Pane */}
      <main className="flex-1 md:pl-64 min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col transition-colors duration-300">
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
