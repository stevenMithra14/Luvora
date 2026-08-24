import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Menu, X, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem('luvora_mode') === 'light';
  });

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('luvora_mode', 'light');
    } else {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('luvora_mode', 'dark');
    }
  }, [isLightMode]);

  const toggleThemeMode = () => {
    setIsLightMode((prev) => !prev);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');

    if (location.pathname === '/') {
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const navLinks = [
    { name: 'Create', href: '#create' },
    { name: 'Occasions', href: '#occasions' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'About', href: '#about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-500 shadow-lg shadow-pink-500/25 transition-transform duration-300 group-hover:scale-105">
            <Heart className="h-5.5 w-5.5 text-white fill-white/20 transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-pink-400"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-pink-300 bg-clip-text text-transparent">
              Luvora
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-pink-400/90 uppercase -mt-1">
              Digital Experiences
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-slate-300 transition-colors duration-200 hover:text-pink-300 cursor-pointer"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Controls Right Column */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Top Right Corner Bright / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleThemeMode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 hover:border-pink-500/50 hover:bg-slate-850 cursor-pointer transition-all shadow-md"
            title="Toggle Light & Dark Mode"
          >
            {isLightMode ? (
              <>
                <Sun className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-pink-400 fill-pink-400/20" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-300">
            <Sparkles className="h-3.5 w-3.5 text-pink-400" />
            100% Free
          </span>
        </div>

        {/* Mobile Controls Right Area */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleThemeMode}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300"
            aria-label="Toggle theme mode"
          >
            {isLightMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-pink-400" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl md:hidden px-6 py-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleNavClick(e, link.href);
                  }}
                  className="text-base font-medium text-slate-200 transition-colors hover:text-pink-400"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
