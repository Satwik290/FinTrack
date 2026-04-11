'use client';
import { motion, useInView } from 'framer-motion';
import { Bot, Sparkles, Send, Mic, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const initialMessages = [
  {
    sender: 'bot',
    text: 'FinTrack Copilot initialized. I have analyzed your portfolio across 4 asset classes. What would you like to model today?',
  },
];

const responses: Record<string, string> = {
  'Am I over budget this month?':
    '🛡️ CA Mode active.\n\nYou are ₹12,500 over budget in "Dining Out" (₹17,500 / ₹5,000 limit). However, your overall cash flow remains positive at +₹45,000 this month.\n\n→ Recommendation: Reallocate ₹8,000 from your surplus "Entertainment" budget to cover the deficit.',
  'Rebalance my portfolio':
    '📈 CFA Mode active.\n\nBased on the 10Y-2Y yield curve inversion and your current risk profile (Aggressive):\n\n• Shift 15% from Tech Equities → Short-term AAA Bonds\n• Estimated risk reduction: 22%\n• Expected return impact: -1.2% annualized\n\nShall I execute this rebalance simulation?',
};

export default function CopilotShowcase() {
  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSuggestionClick = (query: string) => {
    if (isTyping) return;
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: responses[query] || 'Processing your request...' },
      ]);
      setIsTyping(false);
    }, 1800);
  };

  const suggestions = ['Am I over budget this month?', 'Rebalance my portfolio'];

  return (
    <section id="copilot" ref={sectionRef} className="py-28 md:py-36 bg-[#0F121C] relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/[0.06] blur-[150px] rounded-full pointer-events-none" />

      {/* FIXED: Proper max-width container */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        {/* FIXED: Two-column layout with proper min-width control */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex flex-col space-y-8 lg:sticky lg:top-32 min-w-0"
          >
            <div className="space-y-5">
              <p className="text-[12px] font-mono text-violet-400 tracking-[0.12em] uppercase">◇ AI Wealth Engine</p>

              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                Chat with your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                  Wealth Copilot.
                </span>
              </h2>

              <p className="text-base text-slate-400 leading-relaxed">
                A powerful Retrieval-Augmented Generation pipeline connects Gemini 2.5 Flash directly to your financial
                database. Dual personas — the meticulous{' '}
                <span className="text-slate-200 font-semibold">CA</span> and the strategic{' '}
                <span className="text-slate-200 font-semibold">CFA</span> — deliver context-aware insights with zero
                hallucinations.
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-col gap-3">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestionClick(s)}
                  disabled={isTyping}
                  className="text-left w-full px-5 py-4 rounded-xl bg-[#1E2538] border border-white/[0.08] hover:border-violet-500/30 hover:bg-[#232A40] transition-all duration-300 group flex justify-between items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-slate-200 font-medium group-hover:text-white transition-colors text-sm min-w-0">
                    "{s}"
                  </span>
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-violet-500 transition-all duration-300 flex-shrink-0">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-slate-400 group-hover:text-white transition-colors"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>

            {/* Tech badges */}
            <div className="flex flex-wrap gap-2">
              {['Gemini 2.5 Flash', 'RAG Pipeline', 'Web Speech API', 'TTS Output'].map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[11px] font-mono text-slate-400 font-medium tracking-wider uppercase"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="w-full min-w-0"
          >
            <div className="bg-[#161B29] border border-white/[0.08] rounded-[20px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.6),0_0_0_1px_rgba(108,116,255,0.06)] flex flex-col h-[520px]">
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between bg-[#161B29] flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] flex-shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-semibold text-sm truncate">AI Wealth Copilot</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0DDC9B] opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#0DDC9B]" />
                      </span>
                      Active · Gemini 2.5
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-[3px] h-5 flex-shrink-0">
                  {[0, 0.15, 0.3, 0.45, 0.3].map((delay, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 14, 4] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay, ease: 'easeInOut' }}
                      className="w-[3px] bg-gradient-to-t from-indigo-500 to-violet-400 rounded-full"
                    />
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    className={`flex gap-2.5 max-w-[90%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs ${
                        msg.sender === 'bot' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-slate-700/50 text-white'
                      }`}
                    >
                      {msg.sender === 'bot' ? <Sparkles size={12} /> : <User size={12} />}
                    </div>
                    <div
                      className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-[#1E2435] text-white border border-white/[0.06] rounded-tr-md'
                          : 'bg-gradient-to-br from-indigo-500/8 to-violet-600/8 border border-indigo-500/15 text-slate-200 rounded-tl-md'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="self-start flex gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={12} />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-[#1E2435] border border-white/[0.06] rounded-tl-md flex items-center gap-1.5">
                      {[0, 0.15, 0.3].map((d) => (
                        <motion.div
                          key={d}
                          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 0.7, delay: d }}
                          className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/[0.06] bg-[#161B29] flex-shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    placeholder="Ask anything about your wealth..."
                    className="w-full bg-[#0F121C] border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none pr-24 placeholder:text-slate-600"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                      <Mic size={14} />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white hover:bg-indigo-400 transition-all shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                      <Send size={14} className="-ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}