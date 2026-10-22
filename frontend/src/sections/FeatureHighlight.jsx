import React from 'react';
import { motion } from 'framer-motion';
import { Mail, BrainCircuit, ListFilter, ListChecks, Lightbulb, ArrowRight, Check } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';

const flow = [
  { label: 'Email', icon: Mail, detail: 'A new message arrives' },
  { label: 'Understand', icon: BrainCircuit, detail: 'Find the meaning' },
  { label: 'Prioritize', icon: ListFilter, detail: 'Surface what matters' },
  { label: 'Extract', icon: ListChecks, detail: 'Capture the next step' },
  { label: 'Recommend', icon: Lightbulb, detail: 'Make it actionable' },
  { label: 'Act', icon: Check, detail: 'Move forward' },
];

export default function FeatureHighlight() {
  return (
    <section id="workflow" className="relative overflow-hidden bg-[#F7FAFF] py-16 lg:py-24 scroll-mt-20">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <SectionHeading badge="One clear workflow" title="From Email Understanding to" highlight="Intelligent Action" subtitle="Each message becomes a clear, useful next step." className="mb-12" />
        <div className="relative rounded-[2rem] border border-blue-100 bg-white p-5 shadow-[0_18px_50px_-30px_rgba(22,119,255,.35)] sm:p-8 lg:p-10">
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.1 }} className="absolute left-[11%] right-[11%] top-[4.7rem] hidden h-px origin-left bg-gradient-to-r from-blue-100 via-[#1677FF]/50 to-blue-100 lg:block" aria-hidden="true" />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-6 lg:gap-2">
            {flow.map(({ label, icon: Icon, detail }, index) => (
              <React.Fragment key={label}>
                <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .55, delay: index * .1 }} className="relative z-10 flex items-center gap-4 rounded-2xl border border-[#DCE8F5] bg-[#FBFDFF] p-4 lg:flex-col lg:gap-3 lg:border-0 lg:bg-transparent lg:text-center">
                  <motion.div initial={{ boxShadow: '0 0 0 0 rgba(22,119,255,0)' }} whileInView={{ boxShadow: '0 0 0 7px rgba(22,119,255,0.07)' }} viewport={{ once: true }} transition={{ duration: .55, delay: index * .1 + .2 }} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#1677FF] ring-4 ring-white lg:h-16 lg:w-16"><Icon className="h-6 w-6" aria-hidden="true" /></motion.div>
                  <div><div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[.16em] text-[#1677FF] lg:justify-center"><span className="h-1.5 w-1.5 rounded-full bg-[#1677FF]" aria-hidden="true" />0{index + 1}</div><h3 className="font-bold text-[#0F1F3D]">{label}</h3><p className="mt-1 text-xs text-[#61728F]">{detail}</p></div>
                </motion.div>
                {index < flow.length - 1 && <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-[#1677FF]/40 lg:hidden" aria-hidden="true" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
