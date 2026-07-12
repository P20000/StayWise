import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

const INITIAL_MESSAGES = [
  {
    sender: 'agent',
    text: 'Welcome to Vendor Business Support. Business hours: 09:00 - 18:00 JST. How can I help you today?',
  },
];

/**
 * VendorChatWidget — floating bottom-right live-chat toggle for the vendor
 * dashboard. Self-contained: owns its own open/close and message state.
 */
const VendorChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputText('');

    // Simulated agent auto-reply
    setTimeout(() => {
      let reply =
        "Support Agent: I've logged this request with your partner account details. We will respond via email shortly.";
      if (/map|location/i.test(text)) {
        reply =
          "Support Agent: To set up geolocation, pick coordinates directly from Leaflet, type search area, and hit 'Save Location'.";
      } else if (/price|tier/i.test(text)) {
        reply =
          'Support Agent: Double click a room tier box inside Step 2 grid constructor to customize rates and toggle available services.';
      }
      setMessages((prev) => [...prev, { sender: 'agent', text: reply }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 font-mono text-xs">
      {isOpen ? (
        <div className="w-80 h-96 bg-[#F1EDEA] border-3 border-[#212121] shadow-[5px_5px_0px_#212121] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#212121] text-white p-3 flex justify-between items-center border-b border-[#212121]">
            <span className="font-bold flex items-center gap-1.5 uppercase">
              <MessageSquare size={14} className="text-amber-500" />
              Live Business Assistance
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-[#C84B31] bg-transparent border-0 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow p-3 space-y-2 overflow-y-auto bg-white font-sans text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] p-2.5 border-2 border-[#212121] shadow-[1px_1px_0px_#212121] ${
                  m.sender === 'user' ? 'bg-[#F1EDEA] self-end ml-auto' : 'bg-stone-50'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Input footer */}
          <div className="p-2 border-t-2 border-[#212121] bg-[#F1EDEA] flex gap-2">
            <input
              type="text"
              placeholder="Ask about maps, billing, etc..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              className="flex-grow border-2 border-[#212121] p-1.5 text-xs outline-none bg-white font-sans"
            />
            <button
              onClick={handleSend}
              className="bg-[#212121] hover:bg-[#C84B31] text-white border-2 border-[#212121] px-2 py-1 cursor-pointer font-bold"
            >
              SEND
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#C84B31] hover:bg-[#b53a20] text-white border-2 border-[#212121] p-3 font-bold shadow-[3px_3px_0px_#212121] flex items-center gap-2 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none uppercase tracking-wider"
        >
          <MessageSquare size={16} />
          <span>BUSINESS CHAT</span>
        </button>
      )}
    </div>
  );
};

export default VendorChatWidget;
