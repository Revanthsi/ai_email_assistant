import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, CheckCircle2, Inbox, Lightbulb } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';

const steps = [
  { label: 'Receive', description: 'Your emails enter the MailMate AI workspace.', icon: Inbox },
  { label: 'Understand', description: 'AI identifies intent, context, priority and key information.', icon: BrainCircuit },
  { label: 'Recommend', description: 'MailMate AI identifies actions, deadlines and potential risks.', icon: Lightbulb },
  { label: 'Act', description: 'Generate replies, create tasks or follow the recommended action.', icon: CheckCircle2 },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-20 overflow-hidden bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <SectionHeading badge="Simple by design" title="How MailMate AI" highlight="Works" subtitle="Turn every email into a clear next step." className="mb-12" />
        <div className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: .9, ease: 'easeOut' }} className="absolute left-[8%] right-[8%] top-14 hidden h-0.5 origin-left bg-gradient-to-r from-[#1677FF]/15 via-[#1677FF]/45 to-[#1677FF]/15 lg:block" aria-hidden="true" />
          {steps.map(({ label, description, icon: Icon }, index) => (
            <motion.article
              key={label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: .55, delay: index * .12 }}
              className="relative rounded-2xl border border-[#DCE8F5] bg-white p-6 shadow-[0_16px_35px_-28px_rgba(15,31,61,.3)]"
            >
              <div className="mb-5 flex items-center justify-between">
                <motion.span initial={{ boxShadow: '0 0 0 0 rgba(22,119,255,0)' }} whileInView={{ boxShadow: '0 0 0 7px rgba(22,119,255,0.07)' }} viewport={{ once: true }} transition={{ delay: index * .12 + .2, duration: .5 }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#1677FF] ring-8 ring-white"><Icon size={26} /></motion.span>
                <span className="text-xs font-bold uppercase tracking-[.15em] text-[#1677FF]">Step 0{index + 1}</span>
              </div>
              <h3 className="text-xl font-bold text-[#0F1F3D]">{label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#61728F]">{description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
