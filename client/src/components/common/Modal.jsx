import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#212121]/70 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-white border-3 border-[#212121] shadow-[6px_6px_0px_#212121] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${className}`}
      >
        {/* Modal Header Bar */}
        <div className="bg-[#F1EDEA] border-b-2 border-[#212121] px-5 py-3.5 flex items-center justify-between">
          <h3
            id="modal-title"
            className="font-mono text-sm font-bold uppercase tracking-wider text-[#212121]"
          >
            {title || '[ DIALOG WINDOW ]'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[#212121] hover:bg-[#212121] hover:text-white transition-colors border border-transparent hover:border-[#212121] cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
