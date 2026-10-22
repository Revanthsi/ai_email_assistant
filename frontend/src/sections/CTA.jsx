import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';

const CTA = ({ onOpenGetStarted }) => {
  const reducedMotion = useReducedMotion();
  return (
    <section className="py-16 lg:py-24 bg-[#F5F9FF] relative overflow-hidden">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1677FF] to-[#2D8CFF] text-white p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_rgba(22,119,255,0.25)] text-center"
        >
          {/* Subtle background decorative shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          {/* Dotted pattern overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none hero-dot-pattern" />
          {[['left-[13%] top-[23%]', 0], ['right-[16%] top-[28%]', 1], ['bottom-[18%] right-[27%]', 2]].map(([position, index]) => (
            <motion.span key={position} aria-hidden="true" className={`pointer-events-none absolute hidden h-1.5 w-1.5 rounded-full bg-white/70 sm:block ${position}`} animate={reducedMotion ? undefined : { y: [0, -4, 0], opacity: [.35, .8, .35] }} transition={{ duration: 5 + index, repeat: Infinity, ease: 'easeInOut', delay: index * .6 }} />
          ))}

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ready to transform your inbox?</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Turn Your Inbox Into an Intelligent Workspace
            </h2>

            <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-normal">
              Understand your emails. Prioritize what matters. Take action faster.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="white"
                size="lg"
                onClick={onOpenGetStarted}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full sm:w-auto text-[#1677FF] font-bold shadow-lg"
              >
                Get Started
              </Button>
            </div>

            <div className="pt-6 border-t border-white/20 flex flex-wrap items-center justify-center gap-6 text-xs text-white/90">
              {['Understand', 'Prioritize', 'Act'].map(item => <span key={item} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-white" /> {item}</span>)}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
