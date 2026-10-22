import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, Check, CheckCircle2, Mail, Sparkles } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';

const analysisStages = [
  'Analyzing...',
  'Understanding context...',
  'Detecting intent...',
  'Checking priority...',
  'Extracting action...',
  'Generating recommendation...',
];

const results = [
  ['Intent', 'Project Submission'],
  ['Priority', 'High'],
  ['Deadline', 'Friday'],
  ['Action', 'Submit final report'],
  ['Risk', 'Low'],
];

export default function InteractiveDemo() {
  const [stage, setStage] = useState(-1);
  const [run, setRun] = useState(0);
  const reducedMotion = useReducedMotion();
  const isRunning = stage >= 0 && stage < analysisStages.length;
  const complete = stage === analysisStages.length;

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = window.setTimeout(() => setStage((value) => value + 1), reducedMotion ? 80 : 390);
    return () => window.clearTimeout(timer);
  }, [stage, isRunning, reducedMotion]);

  const analyze = () => {
    setRun((value) => value + 1);
    setStage(0);
  };

  return (
    <section id="interactive-demo" className="scroll-mt-20 bg-[#F5F9FF] py-16 lg:py-24">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Interactive preview"
          title="See AI Email Intelligence"
          highlight="in Action"
          subtitle="Explore how one email becomes a clear plan. This is a sample demonstration."
          className="mb-12"
        />
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          <article className="overflow-hidden rounded-[1.75rem] border border-[#DCE8F5] bg-white shadow-[0_16px_45px_-28px_rgba(15,31,61,.28)]">
            <div className="flex items-center gap-3 border-b border-[#DCE8F5] bg-[#F7FAFF] px-6 py-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#1677FF]"><Mail size={20} /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#61728F]">Example email</p>
                <h3 className="font-bold text-[#0F1F3D]">Project Report Submission</h3>
              </div>
            </div>
            <div className="space-y-6 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-[#1677FF]">PS</span>
                <div><p className="font-bold text-[#0F1F3D]">Prof. Sharma</p><p className="text-sm text-[#61728F]">To: you</p></div>
                <span className="ml-auto text-xs text-[#61728F]">10:24 AM</span>
              </div>
              <div className="rounded-2xl border border-[#DCE8F5] bg-[#FBFDFF] p-5 text-[15px] leading-7 text-[#334155]">
                Please submit the final project report by Friday and confirm once completed.
              </div>
              <Button onClick={analyze} disabled={isRunning} icon={isRunning ? undefined : ArrowRight} className="w-full sm:w-auto">
                {isRunning ? 'Analyzing...' : complete ? 'Analyze Again' : 'Analyze Email'}
              </Button>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[#DCE8F5] bg-gradient-to-br from-white to-[#EAF4FF] p-6 shadow-[0_16px_45px_-28px_rgba(22,119,255,.28)] sm:p-8" aria-live="polite" aria-busy={isRunning}>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1677FF] shadow-sm"><Sparkles size={20} /></span>
              <div><p className="text-xs font-semibold uppercase tracking-widest text-[#1677FF]">MailMate AI</p><h3 className="text-xl font-bold text-[#0F1F3D]">AI Analysis</h3></div>
            </div>
            <AnimatePresence mode="wait">
              {isRunning && (
                <motion.div key={`progress-${run}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[278px] rounded-2xl border border-blue-100 bg-white p-5">
                  <p className="text-sm font-bold text-[#0F1F3D]">{analysisStages[stage]}</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#EAF4FF]" role="progressbar" aria-valuenow={stage + 1} aria-valuemin={0} aria-valuemax={analysisStages.length} aria-label="Sample analysis progress">
                    <motion.div animate={{ width: `${((stage + 1) / analysisStages.length) * 100}%` }} transition={{ duration: .3 }} className="h-full rounded-full bg-[#1677FF]" />
                  </div>
                  <ol className="mt-5 space-y-2">
                    {analysisStages.map((label, index) => (
                      <li key={label} className={`flex items-center gap-2 text-xs ${index <= stage ? 'text-[#0F1F3D]' : 'text-[#94A3B8]'}`}>
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${index < stage ? 'bg-[#1677FF] text-white' : index === stage ? 'bg-[#EAF4FF] text-[#1677FF]' : 'bg-slate-100'}`}>
                          {index < stage ? <Check size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                        </span>
                        {label}
                      </li>
                    ))}
                  </ol>
                </motion.div>
              )}
              {complete && (
                <motion.div key={`result-${run}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {results.map(([label, value], index) => (
                      <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .08 }} className="rounded-xl border border-blue-100 bg-white p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#61728F]">{label}</p>
                        <p className={`mt-1 font-bold ${label === 'Priority' ? 'text-rose-600' : 'text-[#0F1F3D]'}`}>{value}</p>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45 }} className="rounded-2xl bg-[#1677FF] p-4 text-white">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold"><CheckCircle2 size={17} /> AI Recommendation</div>
                    <p className="text-sm leading-relaxed text-white/95">Confirm the deadline and submit the report before Friday.</p>
                  </motion.div>
                </motion.div>
              )}
              {stage === -1 && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[278px] flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-white/70 p-8 text-center">
                  <CalendarDays className="mb-4 text-[#1677FF]" size={30} />
                  <p className="font-bold text-[#0F1F3D]">Ready when you are</p>
                  <p className="mt-2 max-w-xs text-sm text-[#61728F]">Select Analyze Email to reveal intent, priority, deadline and next action.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        </div>
      </div>
    </section>
  );
}
