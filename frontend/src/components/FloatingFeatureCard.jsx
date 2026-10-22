import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const FloatingFeatureCard = ({
  icon: Icon,
  title,
  subtitle,
  variant = 'blue', // 'blue', 'teal', 'red', 'purple'
  className = '',
  delay = 0,
  duration = 4,
  yOffset = 8,
}) => {
  const reducedMotion = useReducedMotion();
  const variantStyles = {
    blue: {
      bg: 'bg-white',
      border: 'border-blue-100',
      iconBg: 'bg-[#EAF4FF] text-[#1677FF]',
      shadow: 'shadow-[0_12px_30px_-5px_rgba(22,119,255,0.14)]',
    },
    teal: {
      bg: 'bg-white',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-50 text-emerald-600',
      shadow: 'shadow-[0_12px_30px_-5px_rgba(16,185,129,0.12)]',
    },
    red: {
      bg: 'bg-white',
      border: 'border-rose-100',
      iconBg: 'bg-rose-50 text-rose-600',
      shadow: 'shadow-[0_12px_30px_-5px_rgba(244,63,94,0.14)]',
    },
    purple: {
      bg: 'bg-white',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-50 text-indigo-600',
      shadow: 'shadow-[0_12px_30px_-5px_rgba(99,102,241,0.14)]',
    },
  };

  const style = variantStyles[variant] || variantStyles.blue;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: reducedMotion ? 0 : [-Math.min(yOffset, 4), Math.min(yOffset, 4), -Math.min(yOffset, 4)],
      }}
      transition={{
        opacity: { duration: 0.6, delay },
        scale: { duration: 0.6, delay },
        y: reducedMotion ? { duration: 0 } : {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        },
      }}
      className={`glass-panel z-20 rounded-2xl p-3.5 border ${style.border} ${style.shadow} ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${style.iconBg} shrink-0`}>
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-[#0F1F3D] leading-tight">
            {title}
          </h4>
          {subtitle && (
            <p className="text-[11px] text-[#64748B] mt-0.5 font-medium leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingFeatureCard;
