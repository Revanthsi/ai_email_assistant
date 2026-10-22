import React from 'react';
import { Mail, ListChecks, ShieldAlert, MessageSquareText, CalendarClock, BrainCircuit } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import FeatureCard from '../components/FeatureCard';

const features = [
  { icon: Mail, title: 'AI Email Understanding', description: 'Understands intent, priority and key information.' },
  { icon: ListChecks, title: 'Action Item Extraction', description: 'Automatically extracts tasks and deadlines.' },
  { icon: ShieldAlert, title: 'Security Risk Detection', description: 'Detects potential phishing and suspicious emails.' },
  { icon: MessageSquareText, title: 'Context-Aware Reply Generation', description: 'Creates personalized and professional replies.' },
  { icon: CalendarClock, title: 'Smart Reminders', description: 'Helps you never miss important deadlines.' },
  { icon: BrainCircuit, title: 'Explainable AI', description: 'Shows why an email is important or risky.' },
];

export default function Features() {
  return <section id="features" className="relative bg-white py-16 lg:py-24 scroll-mt-20"><div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8"><SectionHeading badge="Built for clarity" title="Everything You Need to" highlight="Master Your Inbox" subtitle="MailMate AI turns your inbox into an intelligent action center." className="mb-12" /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{features.map((feature,index)=><FeatureCard key={feature.title} {...feature} index={index}/>)}</div></div></section>;
}
