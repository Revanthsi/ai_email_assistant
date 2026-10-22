import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function SectionHeading({ badge, title, highlight, subtitle, centered = true, className = '' }) {
  return (
    <div className={`flex flex-col ${centered ? 'items-center text-center' : 'items-start text-left'} ${className}`}>
      {badge && (
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }} className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#DCE8F5] bg-[#EAF4FF] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#1677FF]">
          <Sparkles size={13} aria-hidden="true" />{badge}
        </motion.div>
      )}
      <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .6, ease: 'easeOut' }} className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-[#0F1F3D] sm:text-4xl lg:text-5xl">
        {title} {highlight && <span className="bg-gradient-to-r from-[#1677FF] to-[#2D8CFF] bg-clip-text text-transparent">{highlight}</span>}
      </motion.h2>
      {subtitle && (
        <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .6, delay: .1, ease: 'easeOut' }} className="mt-4 max-w-2xl text-base leading-relaxed text-[#61728F] sm:text-lg">
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
