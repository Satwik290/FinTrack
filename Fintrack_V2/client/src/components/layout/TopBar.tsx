'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, Sun, Moon, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

export function TopBar() {
  const user = useAppStore((s) => s.user);
  const isDark = useAppStore((s) => s.isDarkMode);
  const toggleDark = useAppStore((s) => s.toggleDarkMode);
  
  // State to track scroll position for the glass effect
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'FT';

  return (
    <header
      className={`sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 px-6 transition-all duration-200 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-background border-b border-transparent'
      }`}
    >
      {/* Search / Command Palette Trigger */}
      <div className="flex-1 max-w-md relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Search transactions, assets..."
          className="w-full h-9 pl-9 pr-12 bg-muted/50 border border-transparent hover:border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all outline-none text-foreground placeholder:text-muted-foreground"
        />
        {/* Keyboard Shortcut Hint */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-60 group-focus-within:opacity-0 transition-opacity pointer-events-none">
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
            <Command size={10} /> K
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle with Framer Motion Transition */}
        <button
          onClick={toggleDark}
          className="relative p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isDark ? 'dark' : 'light'}
              initial={{ y: -20, opacity: 0, rotate: -90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 20, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? <Moon size={18} /> : <Sun size={18} />}
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Notification Bell with Ping Animation */}
        <button
          className="relative p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {/* Active indicator */}
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border-2 border-background"></span>
          </span>
        </button>

        {/* Subtle Separator */}
        <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

        {/* User Avatar - Interactive */}
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all hover:scale-105 active:scale-95">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner ring-1 ring-border/10">
            {initials}
          </div>
        </button>
      </div>
    </header>
  );
}