import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock3, ShieldAlert, Sparkles } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';

const panels = [
  {
    title: 'Priority',
    value: 'HIGH',
    icon: Clock3,
    tone: 'blue',
    reasons: ['Contains a deadline', 'Requires user action', 'Sender is important', 'Time-sensitive request'],
  },
  {
    title: 'Security Risk',
    value: 'HIGH',
    icon: ShieldAlert,
    tone: 'rose',
    reasons: ['Suspicious link', 'Urgent request', 'Unknown sender'],
  },
];

export default function ExplainableAI() {
  return (
    <section id="ai-intelligence" className="scroll-mt-20 bg-[#F5F9FF] py-16 lg:py-24">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Clear reasoning"
          title="AI That Explains"
          highlight="Its Decisions"
          subtitle="An important signal means more when you can see the reasons behind it."
          className="mb-12"
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {panels.map(({ title, value, icon: Icon, tone, reasons }, panelIndex) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: .6, delay: panelIndex * .12 }}
              className="rounded-[1.75rem] border border-[#DCE8F5] bg-white p-6 shadow-[0_16px_40px_-28px_rgba(15,31,61,.25)] sm:p-8"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-[#EAF4FF] text-[#1677FF]'}`}><Icon size={21} /></span>
                  <h3 className="text-xl font-bold text-[#0F1F3D]">{title}</h3>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-extrabold tracking-wide ${tone === 'rose' ? 'bg-rose-50 text-rose-700' : 'bg-[#EAF4FF] text-[#1677FF]'}`}>{value}</span>
              </div>
              <div className="my-6 h-px bg-[#DCE8F5]" />
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: panelIndex * .12 + .2 }} className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0F1F3D]"><Sparkles size={16} className="text-[#1677FF]" />Why?</motion.p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {reasons.map((reason, reasonIndex) => (
                  <motion.li key={reason} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .4, delay: panelIndex * .12 + reasonIndex * .09 + .2 }} className="flex items-center gap-2 rounded-xl border border-[#DCE8F5] bg-[#FBFDFF] p-3 text-sm text-[#334155]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF4FF] text-[#1677FF]"><Check size={13} /></span>
                    {reason}
                  </motion.li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
