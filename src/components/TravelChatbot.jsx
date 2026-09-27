import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, X, Send, Sparkles, ArrowRight, CornerDownRight, 
  MapPin, Clock, Train, Bus, Layers, RotateCcw, MessageSquare, ChevronDown
} from 'lucide-react';
import { api } from '../services/api.js';

export const TravelChatbot = ({ onPlanJourney }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm your TripPilot Route Assistant. Tell me where you are starting and where you want to travel across India, and I'll find direct or hub-connected routes for you.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'Sivakasi → Hyderabad', query: 'How can I go from Sivakasi to Hyderabad?' },
        { label: 'Chennai → Bengaluru', query: 'Chennai to Bengaluru tomorrow' },
        { label: 'Madurai → Mumbai', query: 'Madurai to Mumbai' },
        { label: 'Suggest a route', query: 'How can I reach Hyderabad?' },
      ],
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(query, context);
      
      if (res.context) {
        setContext(res.context);
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.message,
        routeType: res.routeType,
        viaHubs: res.viaHubs,
        topOption: res.topOption,
        suggestedActions: res.suggestedActions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: 'I could not connect to the route engine right now. Please check your query or try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    if (action.type === 'plan_journey' && action.payload) {
      if (onPlanJourney) {
        onPlanJourney(action.payload.from, action.payload.to, action.payload);
      }
      setIsOpen(false);
      return;
    }

    if (action.query) {
      handleSendMessage(action.query);
    }
  };

  const handleResetChat = () => {
    setContext({});
    setMessages([
      {
        id: 'reset',
        sender: 'assistant',
        text: 'Session reset. Where would you like to travel today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: 'Sivakasi → Hyderabad', query: 'How can I go from Sivakasi to Hyderabad?' },
          { label: 'Chennai → Bengaluru', query: 'Chennai to Bengaluru' },
          { label: 'Coimbatore → Chennai', query: 'Coimbatore to Chennai' },
        ],
      },
    ]);
  };

  return (
    <>
      {/* Floating Orange Assistant Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open TripPilot Route Assistant"
            className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Compass className="h-6 w-6 text-white transition-transform group-hover:rotate-45" />

            {/* Subtle glow / badge */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-600 border-2 border-white dark:border-neutral-900" />
            </span>

            {unreadCount > 0 && (
              <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white border border-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Route Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-sm rounded-3xl border border-neutral-200/90 bg-white shadow-2xl shadow-neutral-950/20 dark:border-neutral-800 dark:bg-neutral-900 flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-5 max-h-[580px] h-[520px]">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-3.5 text-white dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Compass className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold tracking-tight">
                  TripPilot Route Assistant
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] text-orange-100 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span>Graph Route Engine Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset conversation"
                className="rounded-lg p-1.5 text-orange-100 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close assistant"
                className="rounded-lg p-1.5 text-orange-100 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active Context Chip (if known) */}
          {(context.from || context.to) && (
            <div className="bg-orange-50 px-3.5 py-1.5 text-[11px] text-orange-900 dark:bg-orange-950/40 dark:text-orange-300 border-b border-orange-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="h-3 w-3 shrink-0 text-orange-600 dark:text-orange-400" />
                <span className="font-bold truncate">
                  {context.from || 'Origin'} → {context.to || 'Destination'}
                </span>
              </div>
              <button
                onClick={() => setContext({})}
                className="text-[10px] font-semibold text-orange-700 hover:underline dark:text-orange-400 ml-2 shrink-0 cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-orange-500 text-white rounded-br-xs font-medium'
                        : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 rounded-bl-xs border border-neutral-200/60 dark:border-neutral-700/60'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>

                  <span className="mt-1 px-1 text-[9px] text-neutral-400">
                    {m.timestamp}
                  </span>

                  {/* Assistant Suggested Action Buttons */}
                  {!isUser && m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[95%]">
                      {m.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            act.type === 'plan_journey'
                              ? 'bg-orange-500 text-white shadow-xs hover:bg-orange-600'
                              : 'bg-white text-neutral-800 border border-neutral-300 hover:border-orange-500 hover:text-orange-600 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700 dark:hover:border-neutral-600'
                          }`}
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-neutral-400 text-xs py-1">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
                <span className="text-neutral-600 dark:text-neutral-400">Checking verified route engine...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Ribbon */}
          <div className="px-3 py-1.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-neutral-400 shrink-0">Ask:</span>
            {[
              { label: 'Sivakasi → Hyderabad', text: 'How can I go from Sivakasi to Hyderabad?' },
              { label: 'Chennai → Bengaluru', text: 'Chennai to Bengaluru' },
              { label: 'Coimbatore → Hyderabad', text: 'Coimbatore to Hyderabad' },
              { label: 'Madurai → Delhi', text: 'Madurai to Delhi' },
            ].map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(s.text)}
                className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:border-orange-400 hover:text-orange-600 transition-colors cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* High Contrast Input Bar (Requirement 5) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about routes (e.g. Sivakasi to Hyderabad)..."
              disabled={loading}
              className="flex-1 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
