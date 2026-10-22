import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, CalendarDays, ShieldCheck } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';

const points = [
  { icon: BrainCircuit, label: 'Understand context' },
  { icon: CalendarDays, label: 'Recognize responsibilities and deadlines' },
  { icon: ShieldCheck, label: 'Make risks easier to see' },
];

export default function About() {
  return (
    <section id="about" className="scroll-mt-20 bg-white py-16 lg:py-24">
      <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeading centered={false} badge="About MailMate AI" title="More Than an" highlight="Email Assistant" />
          <p className="mt-6 text-base leading-8 text-[#61728F]">
            MailMate AI is more than an email summarizer. It turns email communication into actionable intelligence by understanding context, identifying responsibilities, detecting deadlines, recognizing risks, and recommending what to do next.
          </p>
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .55 }} className="mt-8 flex items-center gap-3 rounded-2xl border border-[#DCE8F5] bg-[#F5F9FF] p-5 text-base font-bold text-[#0F1F3D]">
            From reading emails <ArrowRight className="shrink-0 text-[#1677FF]" size={20} /> to understanding what needs to happen next.
          </motion.div>
        </div>
        <div className="rounded-[1.75rem] border border-[#DCE8F5] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(22,119,255,.25)] sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#1677FF]"><BrainCircuit size={22} /></span>
            <div><p className="text-xs font-bold uppercase tracking-wider text-[#1677FF]">The bigger picture</p><h3 className="text-xl font-bold text-[#0F1F3D]">Clarity after the inbox</h3></div>
          </div>
          <div className="space-y-3">
            {points.map(({ icon: Icon, label }, index) => (
              <motion.div key={label} initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .5, delay: index * .1 }} className="group flex items-center gap-4 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#1677FF] transition-transform duration-300 group-hover:scale-105"><Icon size={20} /></span>
                <p className="font-semibold text-[#334155]">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
