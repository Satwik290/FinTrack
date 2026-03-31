"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, CornerDownLeft, Sparkles, Volume2, VolumeX, ChevronDown, User, Bot } from "lucide-react";
import { useSpeechController, type CopilotState } from "./useSpeechController";

/* ═══════════════════════════════════════════════════════════════════
 *  DESIGN — "Neural Command Center"
 *  Deep space dark · teal bioluminescence · cinematic depth
 *  Inspired by: Bloomberg Terminal meets Jarvis
 * ═══════════════════════════════════════════════════════════════════ */
const C = {
  base:     '#060810',
  surface:  '#0D1120',
  card:     '#111827',
  border:   'rgba(255,255,255,0.06)',
  indigo:   '#818CF8',
  violet:   '#A78BFA',
  teal:     '#2DD4BF',
  gain:     '#34D399',
  loss:     '#F87171',
  warn:     '#FBBF24',
  text:     '#E2E8F0',
  muted:    '#64748B',
  dim:      '#1E293B',
} as const;

const MONO = "'Space Mono', monospace";

/* ── Status config ───────────────────────────────── */
const STATUS_META: Record<CopilotState, { label: string; color: string; pulseColor: string }> = {
  idle:      { label: "Ready for your command",       color: C.muted,   pulseColor: 'rgba(100,116,139,0.3)' },
  listening: { label: "Listening...",                  color: C.gain,    pulseColor: 'rgba(52,211,153,0.4)'  },
  thinking:  { label: "Analyzing your financials...", color: C.warn,    pulseColor: 'rgba(251,191,36,0.35)' },
  speaking:  { label: "Copilot speaking",             color: C.indigo,  pulseColor: 'rgba(129,140,248,0.4)' },
};

/* ── Animated waveform bars ──────────────────────── */
function Waveform({ active, color }: { active: boolean; color: string }) {
  const bars = 12;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          animate={active ? {
            scaleY: [0.2, Math.random() * 0.8 + 0.4, 0.2],
            opacity: [0.4, 1, 0.4],
          } : { scaleY: 0.15, opacity: 0.2 }}
          transition={active ? {
            duration: 0.5 + (i % 3) * 0.15,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.04,
          } : { duration: 0.3 }}
          style={{
            width: 3,
            height: '100%',
            borderRadius: 2,
            background: color,
            transformOrigin: 'center',
          }}
        />
      ))}
    </div>
  );
}

/* ── Central orb ─────────────────────────────────── */
function CopilotOrb({ status }: { status: CopilotState }) {
  const meta = STATUS_META[status];

  return (
    <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
      {/* Outer pulse ring */}
      <motion.div
        animate={status !== 'idle' ? {
          scale: [1, 1.35, 1],
          opacity: [0.15, 0.4, 0.15],
        } : { scale: 1, opacity: 0 }}
        transition={{ duration: status === 'speaking' ? 0.7 : 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: -24, borderRadius: '50%',
          background: `radial-gradient(circle, ${meta.pulseColor} 0%, transparent 70%)`,
        }}
      />
      {/* Middle ring */}
      <motion.div
        animate={status !== 'idle' ? {
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.5, 0.2],
        } : { scale: 1, opacity: 0.1 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          border: `1px solid ${meta.color}`,
        }}
      />

      {/* Thinking spinner */}
      {status === 'thinking' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: `1.5px dashed ${C.warn}60`,
          }}
        />
      )}

      {/* Core orb */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(135deg at 35% 35%, ${
          status === 'listening' ? '#0f3d2e' :
          status === 'thinking'  ? '#2d2000' :
          status === 'speaking'  ? '#1a1040' :
          '#0d1525'
        } 0%, #070b15 65%)`,
        border: `1.5px solid ${meta.color}30`,
        boxShadow: `0 0 40px ${meta.pulseColor}, inset 0 1px 0 rgba(255,255,255,0.06)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Inner glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '20%',
          width: '40%', height: '40%', borderRadius: '50%',
          background: `radial-gradient(circle, ${meta.color}25 0%, transparent 70%)`,
        }}/>

        {/* Icon */}
        <motion.div
          animate={{ scale: status === 'speaking' ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          {status === 'thinking' ? (
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles size={36} color={C.warn} strokeWidth={1.5}/>
            </motion.div>
          ) : (
            <Sparkles
              size={36}
              color={meta.color}
              strokeWidth={1.5}
              style={{ filter: `drop-shadow(0 0 10px ${meta.color})` }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Message bubble ──────────────────────────────── */
function MessageBubble({
  role, text, isNew,
}: { role: 'user' | 'copilot'; text: string; isNew?: boolean }) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        gap: 10,
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: isUser
          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
          : `radial-gradient(circle, ${C.indigo}30 0%, #1a1f35 100%)`,
        border: `1px solid ${isUser ? '#6366f140' : C.indigo + '30'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isUser
          ? <User size={14} color="#fff"/>
          : <Sparkles size={13} color={C.indigo}/>
        }
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '78%',
        padding: '11px 16px',
        borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        background: isUser
          ? 'linear-gradient(135deg, #3730a3, #4c1d95)'
          : C.surface,
        border: `1px solid ${isUser ? '#4338ca40' : C.border}`,
        boxShadow: isUser
          ? '0 4px 20px rgba(99,102,241,0.25)'
          : '0 2px 12px rgba(0,0,0,0.3)',
      }}>
        {!isUser && (
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: C.indigo, textTransform: 'uppercase', marginBottom: 5 }}>
            COPILOT
          </p>
        )}
        <p style={{
          fontSize: 14, lineHeight: 1.65, color: C.text,
          fontFamily: isUser ? 'inherit' : 'inherit',
        }}>
          {text}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Typing indicator ────────────────────────────── */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}
    >
      <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: `radial-gradient(circle, ${C.indigo}30 0%, #1a1f35 100%)`, border: `1px solid ${C.indigo}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Sparkles size={13} color={C.indigo}/>
      </div>
      <div style={{ padding: '12px 16px', borderRadius: '4px 18px 18px 18px', background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: C.indigo }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Suggested prompts ───────────────────────────── */
const SUGGESTIONS = [
  "How is my portfolio doing this month?",
  "Am I on track with my budget?",
  "What's my savings rate?",
  "Which investment is my best performer?",
  "How much should I invest monthly for my goals?",
  "Analyze my debt situation",
];

/* ═══════════════════════════════════════════════════════════════════
 *  MAIN PAGE
 * ═══════════════════════════════════════════════════════════════════ */
export default function CopilotPage() {
  const { status, transcript, response, startListening, stopInteraction, submitTextQuery } =
    useSpeechController();

  const [textInput, setTextInput]         = useState("");
  const [messages, setMessages]           = useState<{ role: 'user' | 'copilot'; text: string }[]>([]);
  const [muted, setMuted]                 = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef                    = useRef<HTMLDivElement>(null);
  const inputRef                          = useRef<HTMLInputElement>(null);

  // Track previous response to detect new ones
  const prevResponseRef = useRef("");

  // Add copilot messages when response changes
  useEffect(() => {
    if (response && response !== prevResponseRef.current && status !== 'thinking') {
      prevResponseRef.current = response;
      // Initial greeting — add as first copilot message
      setMessages(prev => {
        // Don't re-add the default greeting
        if (prev.length === 0 && response.startsWith("Hello! I am")) {
          return [{ role: 'copilot', text: response }];
        }
        // Don't double-add
        const last = prev[prev.length - 1];
        if (last?.role === 'copilot' && last.text === response) return prev;
        return [...prev, { role: 'copilot', text: response }];
      });
    }
  }, [response, status]);

  // Add initial greeting once
  useEffect(() => {
    setMessages([{
      role: 'copilot',
      text: "Hello! I'm your AI Wealth Copilot — a CA and CFA rolled into one. I can analyze your portfolio performance, flag budget anomalies, and help you plan for your goals. What would you like to know?",
    }]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleSend = () => {
    const text = textInput.trim();
    if (!text) return;
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', text }]);
    submitTextQuery(text);
    setTextInput("");
  };

  const handleSuggestion = (s: string) => {
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', text: s }]);
    submitTextQuery(s);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoice = () => {
    if (status !== 'idle') {
      stopInteraction();
    } else {
      setShowSuggestions(false);
      startListening();
    }
  };

  const meta = STATUS_META[status];
  const isActive = status !== 'idle';

  return (
    <>
      <style>{`
        @keyframes grid-pan {
          from { transform: translateY(0); }
          to   { transform: translateY(40px); }
        }
        .copilot-input::placeholder { color: rgba(100,116,139,0.7); }
        .copilot-input:focus { outline: none; }
        .suggestion-chip:hover {
          background: rgba(129,140,248,0.15) !important;
          border-color: rgba(129,140,248,0.4) !important;
          color: #c4b5fd !important;
        }
        .msg-scroll::-webkit-scrollbar { width: 4px; }
        .msg-scroll::-webkit-scrollbar-track { background: transparent; }
        .msg-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
      `}</style>

      {/* Full-bleed dark background */}
      <div style={{
        margin: '-28px -32px', minHeight: 'calc(100vh - 64px)',
        background: C.base, padding: '28px 32px',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient grid background */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(129,140,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          animation: 'grid-pan 8s linear infinite',
        }}/>

        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: '-20%', left: '10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: '-10%', right: '5%',  width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.04) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, position: 'relative', zIndex: 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14,
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(99,102,241,0.5)',
            }}>
              <Sparkles size={22} color="#fff" strokeWidth={1.5}/>
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>
                AI Wealth Copilot
              </h1>
              <p style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                Powered by Gemini 1.5 Flash · CA + CFA intelligence
              </p>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Mute toggle */}
            <button
              onClick={() => setMuted(m => !m)}
              style={{
                width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`,
                background: muted ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.04)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: muted ? C.loss : C.muted, transition: 'all 0.2s',
              }}
              title={muted ? 'Unmute copilot' : 'Mute copilot'}
            >
              {muted ? <VolumeX size={15}/> : <Volume2 size={15}/>}
            </button>

            {/* Live status pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 14px', borderRadius: 99,
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
            }}>
              <motion.div
                animate={{ opacity: isActive ? [1, 0.3, 1] : 1 }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, boxShadow: `0 0 6px ${meta.color}` }}
              />
              <span style={{ fontSize: 11, fontWeight: 600, color: meta.color }}>{meta.label}</span>
            </div>
          </div>
        </motion.div>

        {/* ── MAIN LAYOUT ── */}
        <div style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: 20, minHeight: 0, position: 'relative', zIndex: 1,
        }}>

          {/* ── LEFT: Orb + waveform ── */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'flex-start', gap: 20, paddingTop: 24,
          }}>
            {/* Orb */}
            <CopilotOrb status={status}/>

            {/* Waveform */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Waveform active={status === 'listening' || status === 'speaking'} color={meta.color}/>
              <AnimatePresence mode="wait">
                <motion.p
                  key={status}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 11, fontWeight: 600, color: meta.color, textAlign: 'center', letterSpacing: 0.3 }}
                >
                  {status === 'listening' ? '🎙 Listening' :
                   status === 'thinking'  ? '⚡ Processing' :
                   status === 'speaking'  ? '🔊 Speaking' : '● Standby'}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Persona badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
              {[
                { label: 'CA Mode', sub: 'Defense', color: C.teal,   icon: '🛡' },
                { label: 'CFA Mode', sub: 'Offense', color: C.indigo, icon: '📈' },
              ].map(p => (
                <div key={p.label} style={{
                  padding: '8px 12px', borderRadius: 10, border: `1px solid ${p.color}20`,
                  background: `${p.color}08`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{p.icon}</span>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.label}</p>
                      <p style={{ fontSize: 9, color: C.muted }}>{p.sub} intelligence</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Chat + input ── */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            borderRadius: 20, border: `1px solid ${C.border}`,
            background: 'rgba(13,17,32,0.8)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden', minHeight: 0,
          }}>
            {/* Message list */}
            <div
              className="msg-scroll"
              style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}
            >
              {messages.map((m, i) => (
                <MessageBubble key={i} role={m.role} text={m.text} isNew={i === messages.length - 1}/>
              ))}

              {/* Typing indicator */}
              {status === 'thinking' && <TypingIndicator/>}

              {/* Listening transcript */}
              <AnimatePresence>
                {status === 'listening' && transcript && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}
                  >
                    <div style={{
                      padding: '8px 14px', borderRadius: '18px 4px 18px 18px',
                      background: 'rgba(55,48,163,0.3)', border: '1px dashed rgba(99,102,241,0.4)',
                      fontSize: 13, color: `${C.text}80`, fontStyle: 'italic',
                    }}>
                      "{transcript}"
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef}/>
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ padding: '0 24px 12px', overflow: 'hidden' }}
                >
                  <p style={{ fontSize: 10, color: C.muted, marginBottom: 8, letterSpacing: 0.5 }}>SUGGESTED QUERIES</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {SUGGESTIONS.map((s, i) => (
                      <motion.button
                        key={s}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="suggestion-chip"
                        onClick={() => handleSuggestion(s)}
                        style={{
                          padding: '5px 11px', borderRadius: 99, fontSize: 11, fontWeight: 500,
                          background: 'rgba(129,140,248,0.08)', border: `1px solid rgba(129,140,248,0.2)`,
                          color: C.muted, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                        }}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input bar */}
            <div style={{
              padding: '12px 16px',
              borderTop: `1px solid ${C.border}`,
              background: 'rgba(6,8,16,0.5)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 14px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${status === 'listening' ? `${C.gain}50` : C.border}`,
                transition: 'border-color 0.2s',
                boxShadow: status === 'listening' ? `0 0 20px ${C.gain}15` : 'none',
              }}>
                <input
                  ref={inputRef}
                  className="copilot-input"
                  type="text"
                  placeholder={
                    status === 'listening' ? "Listening via microphone..." :
                    status === 'thinking'  ? "Processing your query..." :
                    status === 'speaking'  ? "Copilot is speaking..." :
                    "Ask anything about your finances..."
                  }
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={status === 'listening' || status === 'thinking'}
                  style={{
                    flex: 1, background: 'transparent', border: 'none',
                    color: C.text, fontSize: 14, padding: '6px 0',
                    opacity: (status === 'listening' || status === 'thinking') ? 0.5 : 1,
                  }}
                />

                {/* Send / Mic button */}
                <AnimatePresence mode="popLayout">
                  {textInput.trim() ? (
                    <motion.button
                      key="send"
                      initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                      onClick={handleSend}
                      style={{
                        width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 16px rgba(99,102,241,0.4)', flexShrink: 0,
                      }}
                    >
                      <CornerDownLeft size={15} color="#fff"/>
                    </motion.button>
                  ) : (
                    <motion.button
                      key="mic"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      onClick={handleVoice}
                      style={{
                        width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: isActive
                          ? 'rgba(248,113,113,0.15)'
                          : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isActive
                          ? '0 0 16px rgba(248,113,113,0.3)'
                          : '0 0 16px rgba(99,102,241,0.4)',
                        flexShrink: 0, transition: 'all 0.2s',
                      }}
                    >
                      {isActive
                        ? <Square size={14} color={C.loss} fill={C.loss}/>
                        : <Mic size={15} color="#fff"/>
                      }
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <p style={{ fontSize: 10, color: `${C.muted}80`, textAlign: 'center', marginTop: 8 }}>
                Your financial data is processed securely. Press <kbd style={{ fontFamily: MONO, fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}` }}>Enter</kbd> to send · <kbd style={{ fontFamily: MONO, fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}` }}>Mic</kbd> for voice
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}