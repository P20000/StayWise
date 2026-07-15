import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

export const ItineraryBuilderPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: `### 👋 Welcome to StayWise Concierge!\n\nI am your personal travel and architectural stay advisor. Whether you are planning a weekend retreat or a multi-country expedition, I can help you with:\n\n* 🏛️ **Curated Architectural Stays:** From Portuguese coastal villas to heritage Kathkunia stone lodges.\n* 🗺️ **Bespoke Itinerary Planning:** Tailored recommendations matching your travel vibe and pace.\n* ✈️ **Practical Travel Insights:** Best times to visit, local culinary gems, and neighborhood guides.\n\n**Where would you like to explore today?**`,
      thinking: `1. Connected with StayWise curated travel registry.\n2. Retrieved regional guides and property architectural portfolios.\n3. Ready to tailor your travel plans and accommodations.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState({});
  const chatEndRef = useRef(null);

  const quickPrompts = [
    { label: '🌴 Coastal Luxury in Goa', query: 'Suggest a relaxing 3-day architectural stay in Goa with private villa recommendations.' },
    { label: '🏛️ Historic Elegance in Rome', query: 'Recommend historic boutique hotels and heritage stays near Piazza Navona in Rome.' },
    { label: '🏔️ Alpine Wood Lodge in Manali', query: 'I want a peaceful mountain getaway in Manali in a traditional wood and stone lodge.' },
    { label: '🛶 Backwater Heritage in Kochi', query: 'Plan a culturally rich trip to Fort Kochi and Kerala backwaters featuring Nalukettu architecture.' },
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleReasoning = (id) => {
    setExpandedReasoning((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSend = async (customQuery) => {
    const queryToSend = typeof customQuery === 'string' ? customQuery : input;
    if (!queryToSend || !queryToSend.trim() || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (typeof customQuery !== 'string') setInput('');
    setLoading(true);

    try {
      // Format history for API
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const response = await api.post('/itinerary/chat', {
        message: queryToSend,
        history,
      });

      const data = response.data;

      if (data && data.success) {
        const aiMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply || 'I am ready to help you plan your ideal architectural getaway!',
          thinking: data.thinking || null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.message || 'Unexpected AI response format');
      }
    } catch (err) {
      console.error('[CONCIERGE] Error communicating with StayWise Concierge:', err);
      const errorMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `### ✨ StayWise Concierge Tip\n\nI'm having trouble connecting to the StayWise Concierge service right now, but you can explore our curated collection of architectural stays on our **Explore Page**!\n\n*(Connection details: ${err.message || 'Network Timeout'})*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: `### 👋 StayWise Concierge Reset\n\nHow else can I assist you with your architectural stays or travel plans today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Helper to render simple markdown bullet points and headings
  const renderFormattedText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="font-mono text-lg font-extrabold text-[#C84B31] mt-3 mb-1.5 uppercase tracking-wide">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="font-mono text-xl font-extrabold text-[#212121] mt-4 mb-2 uppercase tracking-wide border-b-2 border-[#212121] pb-1">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const content = trimmed.replace(/^[\*\-]\s+/, '');
        return (
          <li key={idx} className="ml-5 list-disc my-1 text-[#212121] leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
          </li>
        );
      }
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="my-1.5 leading-relaxed text-[#212121]" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
      );
    });
  };

  const formatInlineMarkdown = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#212121] bg-[#F1EDEA] px-1 py-0.5 border border-[#212121] text-xs shadow-[1px_1px_0px_#212121]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-[#C84B31]">$1</em>');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F1EDEA] p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl bg-[#F1EDEA] border-4 border-[#212121] shadow-[8px_8px_0px_#212121] flex flex-col overflow-hidden h-[85vh]">
        
        {/* Top Brutalist Header */}
        <div className="bg-[#212121] text-[#F1EDEA] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-4 border-[#212121]">
          <div className="flex items-center gap-3">
            <div className="bg-[#C84B31] text-[#F1EDEA] font-mono text-xl font-extrabold px-3 py-1 border-2 border-[#F1EDEA] shadow-[3px_3px_0px_#F1EDEA]">
              CONCIERGE
            </div>
            <div>
              <h1 className="font-mono text-xl md:text-2xl font-black uppercase tracking-wider text-[#F1EDEA] m-0">
                StayWise Concierge
              </h1>
              <p className="font-mono text-xs text-[#F1EDEA]/80 m-0 uppercase tracking-widest">
                Architectural Stays &bull; Curated Stays & Experiences
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-[#F1EDEA] text-[#212121] font-mono text-xs font-bold px-3 py-1 border-2 border-[#212121] flex items-center gap-1.5 shadow-[2px_2px_0px_#C84B31]">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              CONCIERGE ONLINE
            </span>
            <button
              onClick={clearChat}
              className="bg-[#212121] text-[#F1EDEA] hover:bg-[#C84B31] font-mono text-xs font-bold px-3 py-1 border-2 border-[#F1EDEA] transition-colors shadow-[2px_2px_0px_#F1EDEA]"
              title="Clear Chat History"
            >
              🗑️ RESET
            </button>
          </div>
        </div>

        {/* Quick Prompt Suggestion Chips */}
        <div className="bg-[#F1EDEA] p-3 border-b-2 border-[#212121] flex flex-wrap gap-2 items-center">
          <span className="font-mono text-xs font-black uppercase text-[#212121] mr-1">
            ⚡ Quick Prompts:
          </span>
          {quickPrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.query)}
              disabled={loading}
              className="bg-white hover:bg-[#212121] text-[#212121] hover:text-[#F1EDEA] font-mono text-xs font-bold px-2.5 py-1 border border-[#212121] shadow-[2px_2px_0px_#212121] hover:shadow-[2px_2px_0px_#C84B31] transition-all disabled:opacity-50 text-left"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Chat Feed Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#F1EDEA] font-sans">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="font-mono text-xs font-extrabold uppercase tracking-wide text-[#212121]">
                  {msg.sender === 'user' ? '👤 You' : '🛎️ StayWise Concierge'}
                </span>
                <span className="font-mono text-[10px] text-gray-500">{msg.timestamp}</span>
              </div>

              {msg.sender === 'user' ? (
                <div className="bg-[#212121] text-[#F1EDEA] border-2 border-[#212121] shadow-[4px_4px_0px_#C84B31] px-5 py-3.5 rounded-none max-w-[85%] md:max-w-[70%] font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>
              ) : (
                <div className="bg-white text-[#212121] border-2 border-[#212121] shadow-[4px_4px_0px_#212121] p-5 rounded-none max-w-[92%] md:max-w-[80%] w-full">
                  {/* AI Reasoning / Thinking Accordion */}
                  {msg.thinking && (
                    <div className="mb-4 border-2 border-[#212121] bg-[#F1EDEA] p-2.5 shadow-[2px_2px_0px_#212121]">
                      <button
                        onClick={() => toggleReasoning(msg.id)}
                        className="w-full flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-[#212121] hover:text-[#C84B31] transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          💭 Curator Insights & Strategy
                        </span>
                        <span>{expandedReasoning[msg.id] ? '▲ HIDE' : '▼ VIEW'}</span>
                      </button>
                      {expandedReasoning[msg.id] && (
                        <div className="mt-2.5 pt-2 border-t border-[#212121] font-mono text-xs text-[#212121]/90 whitespace-pre-wrap leading-relaxed bg-white p-2.5 border border-[#212121]">
                          {msg.thinking}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Response Content */}
                  <div className="text-sm md:text-base">
                    {renderFormattedText(msg.text)}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="font-mono text-xs font-extrabold uppercase tracking-wide text-[#212121]">
                  🛎️ StayWise Concierge
                </span>
              </div>
              <div className="bg-white border-2 border-[#212121] shadow-[4px_4px_0px_#C84B31] px-5 py-3.5 flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-[#C84B31] animate-ping rounded-full"></span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#212121]">
                  Consulting Local Guides & Tailoring Your Stay...
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Brutalist Input Area */}
        <div className="bg-[#212121] p-4 border-t-4 border-[#212121]">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about architectural stays, coastal retreats, or custom itineraries... (Press Enter to send)"
              disabled={loading}
              rows={2}
              className="flex-1 bg-white text-[#212121] font-mono text-sm p-3 border-2 border-[#F1EDEA] focus:outline-none focus:ring-2 focus:ring-[#C84B31] resize-none shadow-[4px_4px_0px_#F1EDEA] placeholder:text-gray-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-[#C84B31] hover:bg-white text-[#F1EDEA] hover:text-[#212121] font-mono font-black uppercase tracking-widest px-6 py-2 border-2 border-[#F1EDEA] shadow-[4px_4px_0px_#F1EDEA] hover:shadow-[4px_4px_0px_#C84B31] transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            >
              {loading ? '...' : 'SEND 💬'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ItineraryBuilderPage;
