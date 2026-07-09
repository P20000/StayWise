import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' (Terracotta), 'secondary' (Charcoal), 'outline'
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'font-mono uppercase tracking-wider font-bold transition-all duration-100 select-none border-2 border-[#212121] flex items-center justify-center gap-2 cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const variantStyles = {
    // Signature Terracotta #C84B31 exclusively for conversion / high-intent CTAs
    primary:
      'bg-[#C84B31] text-white shadow-[4px_4px_0px_#212121] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#212121] active:translate-x-1 active:translate-y-1 active:shadow-none',
    secondary:
      'bg-[#212121] text-[#F1EDEA] shadow-[4px_4px_0px_#212121] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#212121] active:translate-x-1 active:translate-y-1 active:shadow-none',
    outline:
      'bg-[#F1EDEA] text-[#212121] shadow-[4px_4px_0px_#212121] hover:bg-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#212121] active:translate-x-1 active:translate-y-1 active:shadow-none',
  };

  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed shadow-none hover:translate-x-0 hover:translate-y-0'
    : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${disabledStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
