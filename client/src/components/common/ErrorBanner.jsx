import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, X, Terminal } from 'lucide-react';

export const ErrorBanner = ({
  error,
  code = '',
  onClose,
  className = '',
}) => {
  const [showDebug, setShowDebug] = useState(false);

  if (!error) return null;

  // Extract message, code and debug details
  let displayMessage = '';
  let displayCode = code;
  let debugDetails = null;

  if (typeof error === 'string') {
    displayMessage = error;
    // Attempt to extract error code brackets like [AUTH_ERROR]
    const match = error.match(/^\[([^\]]+)\]/);
    if (match) {
      displayCode = match[1];
      displayMessage = error.replace(/^\[[^\]]+\]\s*/, '');
    }
  } else if (error && typeof error === 'object') {
    displayMessage = error.message || 'An unexpected error occurred.';
    if (error.code) displayCode = error.code;
    
    // Check if it's an Axios/Network error
    if (error.response) {
      displayMessage = error.response.data?.message || displayMessage;
      displayCode = `${error.response.status} (${error.response.statusText || displayCode || 'HTTP_ERROR'})`;
      debugDetails = {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        headers: error.config?.headers,
        responseData: error.response.data,
      };
    } else if (error.request) {
      displayCode = displayCode || 'ERR_CONNECTION_REFUSED';
      displayMessage = `Connection refused or network unreachable. Ensure the backend server is active.`;
      debugDetails = {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        message: error.message,
      };
    } else {
      debugDetails = {
        stack: error.stack,
        raw: error.toString(),
      };
    }
  }

  // Format the display title / code
  const errorHeader = displayCode ? `[ ${displayCode.toUpperCase()} ]` : `[ ERROR ]`;

  return (
    <div className={`bg-[#C84B31] text-white border-2 border-[#212121] p-4 font-mono text-xs shadow-[4px_4px_0px_#212121] flex flex-col gap-3 transition-all select-none ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2.5">
          <AlertCircle size={18} className="shrink-0 text-yellow-300 animate-pulse" />
          <div className="space-y-0.5">
            <span className="font-bold tracking-wider uppercase text-yellow-300 block text-[10px]">{errorHeader}</span>
            <span className="font-sans font-bold text-white tracking-wide text-sm">{displayMessage}</span>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-white hover:text-yellow-300 bg-transparent border-0 cursor-pointer p-0.5 ml-2 transition-colors flex items-center justify-center"
            aria-label="Dismiss Alert"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {debugDetails && (
        <div className="border-t border-white/20 pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowDebug(!showDebug)}
            className="w-fit flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2 py-1 text-[10px] uppercase font-bold border border-white/20 transition-all cursor-pointer select-none"
          >
            <Terminal size={12} />
            <span>{showDebug ? 'Hide Debug Details' : 'Show Debug Details'}</span>
            {showDebug ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showDebug && (
            <pre className="bg-[#212121] text-emerald-400 p-3 overflow-x-auto text-[10px] leading-relaxed border border-[#212121] max-h-48 shadow-inner select-text">
              {JSON.stringify(debugDetails, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorBanner;
