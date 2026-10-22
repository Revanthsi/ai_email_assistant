import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Link2Off, MailWarning, ShieldAlert, ShieldCheck } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';

const reasons = ['Suspicious sender', 'Urgent language', 'Suspicious link', 'Request for sensitive information'];

export default function SecurityShowcase() {
  return <section id="security" className="bg-white py-16 lg:py-24 scroll-mt-20"><div className="mx-auto grid max-w-[90rem] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
    <div><SectionHeading centered={false} badge="Security preview" title="Stay Ahead of" highlight="Suspicious Emails" subtitle="See the signals behind a potential phishing warning, then decide what to do next." /><div className="mt-8 flex items-start gap-3 rounded-2xl border border-blue-100 bg-white p-5 text-sm text-[#334155]"><ShieldCheck className="mt-0.5 shrink-0 text-[#1677FF]" size={20} /><p>Clear reasons make every warning easier to understand. This example is for demonstration only.</p></div></div>
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="overflow-hidden rounded-[1.75rem] border border-rose-100 bg-white shadow-[0_22px_55px_-30px_rgba(15,31,61,.25)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 bg-rose-50 px-6 py-5"><div className="flex items-center gap-2 font-bold text-rose-700"><ShieldAlert size={20} /> Security Risk Detected</div><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold tracking-wide text-rose-700">HIGH RISK</span></div>
      <div className="space-y-5 p-6"><div className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><MailWarning size={20} /></span><div><p className="text-xs font-bold text-[#64748B]">SAMPLE MESSAGE</p><p className="font-semibold text-[#0F1F3D]">Verify your account immediately</p></div></div><div><p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#64748B]">Why this was flagged</p><ul className="grid gap-2 sm:grid-cols-2">{reasons.map(reason => <li key={reason} className="flex items-start gap-2 rounded-lg bg-[#F7FAFF] p-3 text-sm text-[#334155]"><AlertTriangle className="mt-0.5 shrink-0 text-rose-500" size={15} />{reason}</li>)}</ul></div><div className="flex items-start gap-3 rounded-xl bg-[#EAF4FF] p-4"><Link2Off className="mt-0.5 shrink-0 text-[#1677FF]" size={20} /><div><p className="text-xs font-bold uppercase tracking-wider text-[#1677FF]">Recommendation</p><p className="mt-1 text-sm font-semibold text-[#0F1F3D]">Verify the sender before taking action.</p></div></div></div>
    </motion.div>
  </div></section>;
}
