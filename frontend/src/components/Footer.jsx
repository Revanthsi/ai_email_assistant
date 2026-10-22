import React from 'react';
import { ArrowUp, Mail, Sparkles } from 'lucide-react';

const columns = [
  {
    title: 'Product',
    links: [['Features', '#features'], ['How It Works', '#how-it-works'], ['Security', '#security']],
  },
  {
    title: 'Company',
    links: [['About', '#about'], ['Contact', '#contact']],
  },
];

export default function Footer() {
  return (
    <footer id="contact" className="scroll-mt-20 border-t border-[#DCE8F5] bg-white pt-16 text-[#0F1F3D]">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-[#DCE8F5] pb-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <a href="#home" className="inline-flex min-h-11 items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1677FF]">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#1677FF] text-white"><Mail size={20} /><Sparkles className="absolute -right-1 -top-1 text-[#1677FF]" size={13} /></span>
              <span className="text-xl font-bold">MailMate <span className="text-[#1677FF]">AI</span></span>
            </a>
            <p className="mt-5 max-w-xs text-sm font-semibold leading-relaxed text-[#0F1F3D]">AI-Powered Email Intelligence &amp; Action Assistant</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#61728F]">Your intelligent email companion.</p>
          </div>
          {columns.map((column) => (
            <div key={column.title} className="md:col-span-2">
              <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-[#0F1F3D]">{column.title}</h3>
              <ul>
                {column.links.map(([label, href]) => (
                  <li key={label}><a href={href} className="inline-flex min-h-11 items-center rounded text-sm text-[#61728F] transition-colors hover:text-[#1677FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1677FF]">{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
          <div className="md:col-span-3">
            <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-[#0F1F3D]">Legal</h3>
            <ul className="space-y-1 text-sm text-[#61728F]">
              <li className="flex min-h-11 items-center gap-2">Privacy <span className="text-xs text-[#64748B]">(coming soon)</span></li>
              <li className="flex min-h-11 items-center gap-2">Terms <span className="text-xs text-[#64748B]">(coming soon)</span></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 py-7 text-xs text-[#61728F] sm:flex-row">
          <p>© 2026 MailMate AI. All rights reserved.</p>
          <a href="#home" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-[#1677FF] hover:underline">Back to top <ArrowUp size={14} /></a>
        </div>
      </div>
    </footer>
  );
}
