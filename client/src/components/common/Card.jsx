import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  onClick,
  ...props
}) => {
  const baseStyles =
    'bg-white border-2 border-[#212121] shadow-[4px_4px_0px_#212121] p-5 overflow-hidden transition-all duration-150';

  const hoverStyles = hoverEffect
    ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[6px_6px_0px_#212121] active:translate-y-0 active:shadow-[2px_2px_0px_#212121]'
    : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
