import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ArrowRight, Sparkles, Mail } from 'lucide-react';
import Button from './Button';

const Navbar = ({ onOpenGetStarted }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const sections = ['home', 'features', 'how-it-works', 'about', 'contact'];
      const current = sections.filter((id) => document.getElementById(id)?.getBoundingClientRect().top <= 150).at(-1);
      setActiveSection(current || 'home');
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'Features', href: '#features', id: 'features' },
    { name: 'How It Works', href: '#how-it-works', id: 'how-it-works' },
    { name: 'About', href: '#about', id: 'about' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setActiveSection(href.slice(1));
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'glass-nav shadow-sm py-3.5'
          : 'border-b border-[#DCE8F5] bg-white/90 backdrop-blur-md py-4'
      }`}
    >
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr]">
          {/* Logo */}
          <a
            href="#home"
            onClick={(event) => handleNavClick(event, '#home')}
            className="flex min-h-11 items-center gap-2.5 group cursor-pointer rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1677FF]"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1677FF] to-[#2D8CFF] text-white shadow-md shadow-[#1677FF]/20 group-hover:scale-105 transition-transform duration-200">
              <Mail className="w-5 h-5 fill-white/20 stroke-[2.2]" />
              <Sparkles className="w-3.5 h-3.5 text-amber-200 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0F1F3D]">
              MailMate <span className="text-[#1677FF]">AI</span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 lg:gap-2" aria-label="Primary navigation">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex min-h-11 items-center px-3.5 text-sm font-medium transition-colors duration-200 rounded-lg ${
                    isActive
                      ? 'text-[#1677FF] font-semibold'
                      : 'text-[#64748B] hover:text-[#0F1F3D] hover:bg-[#EAF4FF]/40'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span layoutId="active-nav-underline" className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#1677FF] rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action Button */}
          <div className="hidden lg:flex items-center justify-self-end gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={onOpenGetStarted}
              icon={ArrowRight}
              iconPosition="right"
              className="text-sm font-medium"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-[#64748B] hover:text-[#0F1F3D] hover:bg-[#EAF4FF] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1677FF]"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
      {mobileMenuOpen && (
        <motion.nav id="mobile-navigation" aria-label="Mobile navigation" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="lg:hidden glass-panel border-b border-slate-200 px-4 pt-3 pb-6 shadow-xl">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`flex min-h-11 items-center px-3 rounded-lg text-base font-medium ${
                  activeSection === link.id
                    ? 'bg-[#EAF4FF] text-[#1677FF] font-semibold'
                    : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F1F3D]'
                }`}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGetStarted();
                }}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full justify-center"
              >
                Get Started
              </Button>
            </div>
          </div>
        </motion.nav>
      )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
