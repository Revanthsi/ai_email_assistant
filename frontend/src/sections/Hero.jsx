import React from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Play,
  CheckCircle2,
  FileText,
  CalendarCheck,
  Calendar,
  AlertTriangle,
  PenTool,
  Sparkles
} from 'lucide-react';
import Button from '../components/Button';
import EmailDashboardMockup from '../components/EmailDashboardMockup';
import FloatingFeatureCard from '../components/FloatingFeatureCard';

const Hero = ({ onOpenGetStarted, onOpenSeeDemo }) => {
  const reducedMotion = useReducedMotion();
  const parallaxX = useSpring(0, { stiffness: 100, damping: 22 });
  const parallaxY = useSpring(0, { stiffness: 100, damping: 22 });
  const reverseX = useTransform(parallaxX, (value) => value * -0.6);
  const moveCards = (event) => {
    if (reducedMotion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    parallaxX.set(((event.clientX - rect.left) / rect.width - 0.5) * 10);
    parallaxY.set(((event.clientY - rect.top) / rect.height - 0.5) * 6);
  };
  const resetCards = () => { parallaxX.set(0); parallaxY.set(0); };
  return (
    <section
      id="home"
      className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-[#F7FAFF]"
    >
      {/* Abstract Background Elements (Section 11) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Soft Radial Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#1677FF]/15 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[30rem] h-[30rem] rounded-full bg-gradient-to-bl from-[#2D8CFF]/12 to-[#EAF4FF]/40 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-[#EAF4FF]/60 blur-2xl" />

        {/* Dotted Grid Pattern Overlay */}
        <div className="absolute inset-0 hero-dot-pattern opacity-40" />

        {/* Curved organic SVG wave lines */}
        <svg
          className="absolute top-20 right-10 w-[600px] h-[400px] text-blue-200/40"
          viewBox="0 0 600 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 350C150 200 350 400 550 150"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
          <path
            d="M10 280C200 320 380 180 580 80"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            opacity="0.6"
          />
        </svg>

        {/* Origami Paper Airplane Flying (as in reference image) */}
        <motion.div
          animate={reducedMotion ? undefined : {
            x: [0, 8, 0],
            y: [0, -10, 0],
            rotate: [0, 2, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="hidden xl:block absolute top-28 right-[38%] z-10"
        >
          <svg
            className="w-24 h-24 drop-shadow-md text-[#2D8CFF]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Paper plane body */}
            <path
              d="M15 50L85 20L45 80L40 55L15 50Z"
              fill="#2D8CFF"
              fillOpacity="0.85"
            />
            <path
              d="M85 20L40 55L45 80L85 20Z"
              fill="#1677FF"
              fillOpacity="0.95"
            />
            <path
              d="M40 55L50 65L45 80L40 55Z"
              fill="#0F1F3D"
              fillOpacity="0.3"
            />
          </svg>
        </motion.div>
      </div>

      <div className="relative max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT SIDE (5 or 6 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col items-start text-left z-10"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF4FF] text-[#1677FF] border border-[#1677FF]/20 text-xs sm:text-sm font-semibold tracking-wide shadow-xs mb-5"
            >
              <Sparkles className="w-3.5 h-3.5 fill-[#1677FF]" />
              <span>Your Smart Email Companion</span>
            </motion.div>

            {/* Main Tagline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-[#0F1F3D] tracking-tight leading-[1.12]"
            >
              Smarter Emails,
              <br />
              <span className="bg-gradient-to-r from-[#1677FF] via-[#2D8CFF] to-[#1677FF] bg-clip-text text-transparent">
                A More Productive You
              </span>
            </motion.h1>

            {/* Supporting Text */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-5 text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl"
            >
              An AI-powered email assistant that understands, prioritizes, summarizes, and helps you take action — so you can focus on what truly matters.
            </motion.p>

            {/* Call To Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-3.5 w-full sm:w-auto"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={onOpenGetStarted}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full sm:w-auto"
              >
                Get Started
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={onOpenSeeDemo}
                icon={Play}
                iconPosition="left"
                className="w-full sm:w-auto text-[#0F1F3D] hover:text-[#1677FF] hover:border-[#1677FF]/40"
              >
                See Demo
              </Button>
            </motion.div>

            {/* Checkmarks Row Below */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 pt-6 border-t border-slate-200/80 w-full grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs sm:text-sm font-semibold text-[#0F1F3D]"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1677FF] fill-[#EAF4FF] shrink-0" />
                <span>Analyze Emails</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1677FF] fill-[#EAF4FF] shrink-0" />
                <span>Extract Action Items</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1677FF] fill-[#EAF4FF] shrink-0" />
                <span>Generate Replies</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1677FF] fill-[#EAF4FF] shrink-0" />
                <span>Stay Secure</span>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE: EMAIL DASHBOARD MOCKUP & FLOATING CARDS (7 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-7 relative w-full pt-6 lg:pt-0"
            onPointerMove={moveCards}
            onPointerLeave={resetCards}
          >
            {/* Floating Card 1: Summarizes Long Emails (Top-Left of Mockup) */}
            <motion.div style={{ x: parallaxX, y: parallaxY }} className="hidden sm:block absolute -top-8 -left-4 z-20">
              <FloatingFeatureCard
                icon={FileText}
                title="Summarizes"
                subtitle="Long Emails"
                variant="blue"
                delay={0.2}
                yOffset={8}
                duration={4.2}
              />
            </motion.div>

            {/* Floating Card 2: Extracts Action Items (Top-Right of Mockup) */}
            <motion.div style={{ x: reverseX }} className="hidden sm:block absolute -top-10 -right-2 z-20">
              <FloatingFeatureCard
                icon={CalendarCheck}
                title="Extracts"
                subtitle="Action Items"
                variant="blue"
                delay={0.4}
                yOffset={7}
                duration={3.8}
              />
            </motion.div>

            {/* Floating Card 3: Detects Deadlines (Right Center) */}
            <motion.div style={{ x: parallaxX }} className="hidden md:block absolute top-[42%] -right-8 z-20">
              <FloatingFeatureCard
                icon={Calendar}
                title="Detects"
                subtitle="Deadlines"
                variant="teal"
                delay={0.6}
                yOffset={6}
                duration={4.6}
              />
            </motion.div>

            {/* Floating Card 4: Detects Security Risks (Bottom-Left) */}
            <motion.div style={{ x: reverseX }} className="hidden sm:block absolute -bottom-6 -left-4 z-20">
              <FloatingFeatureCard
                icon={AlertTriangle}
                title="Detects"
                subtitle="Security Risks"
                variant="red"
                delay={0.8}
                yOffset={8}
                duration={4.4}
              />
            </motion.div>

            {/* Floating Card 5: Generates Smart Replies (Bottom-Right) */}
            <motion.div style={{ x: parallaxX }} className="hidden sm:block absolute -bottom-8 -right-4 z-20">
              <FloatingFeatureCard
                icon={PenTool}
                title="Generates"
                subtitle="Smart Replies"
                variant="purple"
                delay={1.0}
                yOffset={7}
                duration={4.0}
              />
            </motion.div>

            {/* Realistic React Dashboard Mockup */}
            <motion.div animate={reducedMotion ? undefined : { y: [0, -4, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
              <EmailDashboardMockup onOpenGetStarted={onOpenGetStarted} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
