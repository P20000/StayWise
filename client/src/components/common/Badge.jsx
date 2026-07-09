import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // 'default', 'ai', 'highlight', 'terracotta'
  className = '',
  ...props
}) => {
  const baseStyles =
    'font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-1 border border-[#212121] inline-flex items-center gap-1.5 select-none';

  const variantStyles = {
    default: 'bg-[#F1EDEA] text-[#212121] shadow-[2px_2px_0px_#212121]',
    ai: 'bg-white text-[#212121] border-2 shadow-[2px_2px_0px_#212121]',
    highlight: 'bg-[#212121] text-[#F1EDEA] shadow-[2px_2px_0px_#C84B31]',
    terracotta: 'bg-[#C84B31] text-white shadow-[2px_2px_0px_#212121]',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
