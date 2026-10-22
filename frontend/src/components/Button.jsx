import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  icon: Icon,
  iconPosition = 'right',
  type = 'button',
  disabled = false,
  ...props
}) => {
  const baseStyles = 'inline-flex min-h-11 items-center justify-center font-semibold rounded-full transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[#1677FF] hover:bg-[#0e5ad1] text-white shadow-[0_4px_14px_0_rgba(22,119,255,0.35)] hover:shadow-[0_6px_20px_0_rgba(22,119,255,0.45)] focus:ring-[#1677FF]',
    secondary: 'bg-[#EAF4FF] hover:bg-[#d5ebff] text-[#1677FF] border border-[#1677FF]/20 focus:ring-[#1677FF]',
    outline: 'bg-white hover:bg-slate-50 text-[#0F1F3D] border border-slate-200 hover:border-slate-300 shadow-sm focus:ring-[#1677FF]',
    ghost: 'bg-transparent hover:bg-[#EAF4FF]/50 text-[#64748B] hover:text-[#0F1F3D] focus:ring-[#1677FF]',
    white: 'bg-white hover:bg-slate-50 text-[#1677FF] shadow-md hover:shadow-lg focus:ring-white',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  return (
    <motion.button
      type={type}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </motion.button>
  );
};

export default Button;
