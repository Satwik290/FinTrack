'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bot, ArrowUpRight, Menu, X } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#hero', label: 'Platform' },
    { href: '#features', label: 'Intelligence' },
    { href: '#copilot', label: 'AI Copilot' },
    { href: '#testimonials', label: 'Customers' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-2.5' : 'py-4'}`}>
        <motion.div
          className="absolute inset-0 z-[-1] backdrop-blur-xl border-b border-white/[0.06]"
          style={{
            opacity: bgOpacity,
            background: 'linear-gradient(180deg, rgba(15,18,28,0.95) 0%, rgba(15,18,28,0.85) 100%)',
          }}
        />

        {/* FIXED: Use consistent max-w-7xl to match all other sections */}
        <div className="max-w-7xl w-full mx-auto px-6 md:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C74FF] to-[#7E5BFB] flex items-center justify-center text-white shadow-[0_0_20px_rgba(108,116,255,0.4)]"
            >
              <Bot size={18} strokeWidth={2.5} />
            </motion.div>
            <span className="font-bold text-[20px] tracking-tight text-white">
              FinTrack <span className="font-normal text-slate-500 text-sm">v2</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-5 py-2.5 text-[13px] font-medium text-slate-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/[0.05] group"
              >
                {link.label}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#6C74FF] to-[#7E5BFB] rounded-full group-hover:w-1/2 transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* CTA Group */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/auth" className="hidden md:block text-[13px] font-medium text-slate-400 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link
              href="/auth"
              className="relative inline-flex items-center gap-2 bg-[#7E5BFB] text-white px-5 py-2.5 rounded-full text-[13px] font-bold shadow-[0_4px_20px_rgba(126,91,251,0.5)] hover:shadow-[0_6px_28px_rgba(126,91,251,0.65)] hover:bg-[#8B6BFF] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group"
            >
              <span className="relative z-10">Initialize Copilot</span>
              <ArrowUpRight size={14} className="relative z-10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-4 right-4 z-50 bg-[#161B29]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-1 shadow-2xl lg:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-white/5 my-2" />
            <Link
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-semibold text-center bg-[#7E5BFB] text-white"
            >
              Initialize Copilot
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}