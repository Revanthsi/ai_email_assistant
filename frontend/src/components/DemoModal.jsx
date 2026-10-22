import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Copy, Mail, RotateCcw, Sparkles, X } from 'lucide-react';
import Button from './Button';

const professorReplies = [
  'Dear Professor,\n\nThank you for the update. I will complete and submit the final project report by Friday.\n\nBest regards,\nStudent',
  'Dear Professor,\n\nThank you for the reminder. I confirm that I will submit the final project report before Friday.\n\nBest regards,\nStudent',
  'Dear Professor,\n\nI appreciate the update. I am finalizing the report and will send it by Friday.\n\nBest regards,\nStudent',
];
const exampleAnalysis = [['Intent', 'Project Submission'], ['Priority', 'High'], ['Action', 'Submit final report'], ['Deadline', 'Friday']];

export default function DemoModal({ isOpen, onClose, type = 'getStarted', emailData }) {
  const dialogRef = useRef(null);
  const [replyIndex, setReplyIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const draft = emailData?.analysis?.replyDraft && emailData.id !== '1' ? emailData.analysis.replyDraft : professorReplies[replyIndex];

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; previousFocus?.focus?.(); };
  }, [isOpen, onClose]);

  const copyReply = async () => {
    try { await navigator.clipboard.writeText(draft); setCopied(true); window.setTimeout(() => setCopied(false), 2200); }
    catch { setCopied(false); }
  };
  const explore = () => { onClose(); window.setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100); };

  return <AnimatePresence>{isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-[#0F1F3D]/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
    <motion.div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="modal-title" initial={{opacity:0,scale:.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.95,y:20}} transition={{duration:.22}} className="relative z-10 my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl outline-none">
      <div className="flex items-center justify-between bg-gradient-to-r from-[#1677FF] to-[#2D8CFF] px-6 py-5 text-white"><div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20"><Sparkles size={18}/></span><div><h2 id="modal-title" className="text-lg font-bold">{type === 'getStarted' ? 'MailMate AI Workspace' : type === 'seeDemo' ? 'MailMate AI Demo' : 'Generated Reply'}</h2><p className="text-xs text-white/85">Frontend preview</p></div></div><button type="button" onClick={onClose} aria-label="Close dialog" className="flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><X size={20}/></button></div>
      <div className="p-6 sm:p-7">
        {type === 'getStarted' && <div className="text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#1677FF]"><Mail size={30}/></span><h3 className="mt-5 text-xl font-bold text-[#0F1F3D]">Your intelligent inbox is coming soon.</h3><p className="mt-2 text-sm leading-relaxed text-[#64748B]">Explore the MailMate AI preview while the workspace is being prepared.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Button onClick={explore} icon={ArrowRight}>Continue Exploring</Button><Button variant="outline" onClick={onClose}>Close</Button></div></div>}
        {type === 'seeDemo' && <div className="space-y-5"><div className="rounded-2xl border border-slate-200 bg-[#F7FAFF] p-4"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#64748B]">Example Email · Prof. Sharma</p><p className="text-sm text-[#0F1F3D]">“Please submit the final project report by Friday.”</p></div><div><p className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1677FF]"><Sparkles size={16}/> AI Analysis</p><div className="grid gap-2 sm:grid-cols-2">{exampleAnalysis.map(([label,value])=><div key={label} className="rounded-xl border border-blue-100 bg-[#F7FAFF] p-3"><p className="text-xs text-[#64748B]">{label}</p><p className="mt-1 text-sm font-bold text-[#0F1F3D]">{value}</p></div>)}</div></div><div className="rounded-xl bg-[#EAF4FF] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#1677FF]">Recommendation</p><p className="mt-1 text-sm text-[#0F1F3D]">Prepare and submit the report before the deadline.</p></div><Button onClick={onClose} className="w-full">Close</Button></div>}
        {type === 'generateReply' && <div><p className="mb-3 text-sm text-[#64748B]">A sample reply for {emailData?.sender || 'Prof. Sharma'}:</p><div className="whitespace-pre-wrap rounded-2xl border border-blue-100 bg-[#F7FAFF] p-5 text-sm leading-relaxed text-[#0F1F3D]">{draft}</div><div className="mt-5 flex flex-wrap gap-2"><Button onClick={copyReply} icon={copied?Check:Copy}>{copied?'Copied':'Copy Reply'}</Button><Button variant="outline" icon={RotateCcw} iconPosition="left" onClick={()=>{setReplyIndex((index)=>(index+1)%professorReplies.length);setCopied(false);}}>Regenerate</Button><Button variant="ghost" onClick={onClose}>Close</Button></div></div>}
      </div>
    </motion.div>
  </div>}</AnimatePresence>;
}
