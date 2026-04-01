"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import {
  Mic, Square, CornerDownLeft, Sparkles,
  Volume2, VolumeX, User, Trash2,
} from "lucide-react";
import { useSpeechController, type CopilotState } from "./useSpeechController";

/* ═══════════════════════════════════════════════════════════════════
 *  TOKEN CONSTANTS — all colours use CSS vars for theme support
 * ═══════════════════════════════════════════════════════════════════ */
const ACCENT  = '#6366f1';
const ACCENT2 = '#8b5cf6';
const GAIN    = '#10b981';
const WARN    = '#f59e0b';
const LOSS    = '#ef4444';
const MONO    = "'Space Mono', monospace";

const STATUS_META: Record<CopilotState, { label: string; color: string; pulse: string }> = {
  idle:      { label: "Ready for your command",       color: 'var(--text-muted)', pulse: 'rgba(148,163,184,0.12)' },
  listening: { label: "Listening...",                  color: GAIN,                pulse: 'rgba(16,185,129,0.18)'  },
  thinking:  { label: "Analyzing your financials...", color: WARN,                pulse: 'rgba(245,158,11,0.18)'  },
  speaking:  { label: "Copilot speaking",             color: ACCENT,              pulse: 'rgba(99,102,241,0.18)'  },
};

type Message = { role: 'user' | 'copilot'; text: string };

const INITIAL_MESSAGE: Message = {
  role: 'copilot',
  text: "Hello! I'm your AI Wealth Copilot — a CA and CFA rolled into one. I can analyze your portfolio, flag budget anomalies, and help you plan your goals. What would you like to know?",
};

const LOADING_MESSAGE: Message = {
  role: 'copilot',
  text: "Analyzing your latest financial snapshot...",
};

/* ── Waveform ────────────────────────────────────── */
function Waveform({ active, color }: { active: boolean; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          animate={active
            ? { scaleY: [0.15, 0.55 + (i % 3) * 0.28, 0.15], opacity: [0.5, 1, 0.5] }
            : { scaleY: 0.15, opacity: 0.22 }}
          transition={active
            ? { duration: 0.5 + (i % 3) * 0.13, repeat: Infinity, ease: 'easeInOut', delay: i * 0.05 }
            : { duration: 0.3 }}
          style={{ width: 3, height: '100%', borderRadius: 2, background: color, transformOrigin: 'center' }}
        />
      ))}
    </div>
  );
}

/* ── Orb ─────────────────────────────────────────── */
function CopilotOrb({ status }: { status: CopilotState }) {
  const meta     = STATUS_META[status];
  const isActive = status !== 'idle';

  return (
    <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
      {/* outer pulse */}
      <motion.div
        animate={isActive
          ? { scale: [1, 1.45, 1], opacity: [0.1, 0.3, 0.1] }
          : { scale: 1, opacity: 0 }}
        transition={{ duration: status === 'speaking' ? 0.75 : 1.6, repeat: Infinity }}
        style={{ position: 'absolute', inset: -22, borderRadius: '50%',
          background: `radial-gradient(circle, ${meta.pulse} 0%, transparent 70%)` }}
      />
      {/* border ring */}
      <motion.div
        animate={isActive
          ? { scale: [1, 1.1, 1], opacity: [0.25, 0.65, 0.25] }
          : { opacity: 0.12 }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        style={{ position: 'absolute', inset: -4, borderRadius: '50%',
          border: `1.5px solid ${meta.color}` }}
      />
      {/* thinking dash */}
      {status === 'thinking' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: -2, borderRadius: '50%',
            border: `1.5px dashed ${WARN}55` }}
        />
      )}
      {/* core */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'var(--bg-surface-2)',
        border: `1.5px solid var(--border)`,
        boxShadow: `0 0 28px ${meta.pulse}, var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.07)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '15%', left: '15%', width: '38%', height: '38%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${meta.color}22 0%, transparent 70%)`,
        }}/>
        <motion.div animate={{ scale: status === 'speaking' ? [1, 1.18, 1] : 1 }}
          transition={{ duration: 0.7, repeat: Infinity }}>
          {status === 'thinking' ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
              <Sparkles size={32} color={WARN} strokeWidth={1.5}/>
            </motion.div>
          ) : (
            <Sparkles size={32} color={meta.color} strokeWidth={1.5}
              style={{ filter: `drop-shadow(0 0 8px ${meta.color}80)` }}/>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Message bubble ──────────────────────────────── */
function MessageBubble({ role, text }: Message) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: 10, marginBottom: 14,
      }}
    >
      {/* avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0, marginTop: 2,
        background: isUser ? `linear-gradient(135deg,${ACCENT},${ACCENT2})` : 'var(--bg-surface-2)',
        border: isUser ? 'none' : '1.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isUser ? `0 2px 10px ${ACCENT}40` : 'none',
      }}>
        {isUser
          ? <User size={14} color="#fff" strokeWidth={2}/>
          : <Sparkles size={13} color={ACCENT} strokeWidth={1.5}/>}
      </div>

      {/* bubble */}
      <div style={{
        maxWidth: '76%', padding: '11px 16px',
        borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        background: isUser ? `linear-gradient(135deg,${ACCENT},${ACCENT2})` : 'var(--bg-surface-2)',
        border: isUser ? 'none' : '1px solid var(--border)',
        boxShadow: isUser ? `0 4px 16px ${ACCENT}30` : 'var(--shadow-sm)',
      }}>
        {!isUser && (
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
            color: ACCENT, textTransform: 'uppercase', marginBottom: 5 }}>
            COPILOT
          </p>
        )}
        <p style={{
          fontSize: 14, lineHeight: 1.65, margin: 0,
          color: isUser ? '#fff' : 'var(--text-primary)',
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: 'var(--bg-surface-2)', border: '1.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Sparkles size={13} color={ACCENT} strokeWidth={1.5}/>
      </div>
      <div style={{
        padding: '12px 16px', borderRadius: '4px 18px 18px 18px',
        background: 'var(--bg-surface-2)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            animate={{ scale: [1, 1.55, 1], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }}
          />
        ))}
      </div>
    </motion.div>
  );
}

const SUGGESTIONS = [
  "How is my portfolio doing?",
  "Am I on track with my budget?",
  "What's my savings rate?",
  "Best performing investment?",
  "Analyze my debt situation",
  "How much should I invest monthly?",
];

/* ═══════════════════════════════════════════════════════════════════
 *  PAGE
 * ═══════════════════════════════════════════════════════════════════ */
export default function CopilotPage() {
  const [messages, setMessages]     = useState<Message[]>([LOADING_MESSAGE]);
  const [muted, setMuted]           = useState(false);
  const [textInput, setTextInput]   = useState("");
  const [showSugg, setShowSugg]     = useState(true);
  const messagesEndRef              = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLInputElement>(null);

  /* ── onReply — stable via useCallback, appends copilot message ── */
  const onReply = useCallback((text: string) => {
    setMessages(prev => [...prev, { role: 'copilot', text }]);
  }, []);

  /* ── Fetch Proactive Greeting ── */
  useEffect(() => {
    let active = true;
    api.get("/copilot/greeting")
      .then(res => {
        if (!active) return;
        const text = res.data?.data?.response ?? res.data?.response ?? INITIAL_MESSAGE.text;
        setMessages([{ role: 'copilot', text }]);
      })
      .catch(() => {
        if (!active) return;
        setMessages([INITIAL_MESSAGE]);
      });
    return () => { active = false; };
  }, []);

  /* ── Hook — no longer exposes response/status as paired state ─── */
  const { status, transcript, startListening, stopInteraction, submitTextQuery } =
    useSpeechController({ onReply, muted });

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]); // these two are fine — fixed size array, both are always present

  /* ── Send handlers ── */
  const handleSend = useCallback(() => {
    const text = textInput.trim();
    if (!text || status === 'thinking' || status === 'listening') return;
    setShowSugg(false);
    setMessages(prev => [...prev, { role: 'user', text }]);
    submitTextQuery(text);
    setTextInput("");
  }, [textInput, status, submitTextQuery]);

  const handleSuggestion = useCallback((s: string) => {
    setShowSugg(false);
    setMessages(prev => [...prev, { role: 'user', text: s }]);
    submitTextQuery(s);
  }, [submitTextQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleVoice = () => {
    if (status !== 'idle') stopInteraction();
    else { setShowSugg(false); startListening(); }
  };

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setShowSugg(true);
  };

  const meta     = STATUS_META[status];
  const isActive = status !== 'idle';

  return (
    <>
      <style>{`
        .copilot-input::placeholder { color: var(--text-muted); opacity: 0.7; }
        .copilot-input:focus        { outline: none; }
        .copilot-input:disabled     { opacity: 0.4; cursor: not-allowed; }
        .sugg-chip {
          padding: 5px 12px; border-radius: 99px; font-size: 12px; font-weight: 500;
          background: var(--bg-surface-2); border: 1px solid var(--border);
          color: var(--text-secondary); cursor: pointer; font-family: inherit;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .sugg-chip:hover {
          background: rgba(99,102,241,0.1);
          border-color: rgba(99,102,241,0.35);
          color: #818cf8;
        }
        .msg-scroll::-webkit-scrollbar       { width: 4px; }
        .msg-scroll::-webkit-scrollbar-track { background: transparent; }
        .msg-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
        @media (max-width: 768px) {
          .copilot-layout { grid-template-columns: 1fr !important; }
          .copilot-sidebar { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="page-header" style={{ marginBottom: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14, flexShrink: 0,
              background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 18px ${ACCENT}50`,
            }}>
              <Sparkles size={22} color="#fff" strokeWidth={1.5}/>
            </div>
            <div>
              <h1 className="page-title">AI Wealth Copilot</h1>
              <p className="page-subtitle">Gemini 1.5 Flash · CA + CFA dual-persona intelligence</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Mute */}
            <button onClick={() => setMuted(m => !m)} className="btn btn-icon"
              style={{
                color: muted ? LOSS : undefined,
                background: muted ? 'rgba(239,68,68,0.1)' : undefined,
                borderColor: muted ? 'rgba(239,68,68,0.28)' : undefined,
              }}
              title={muted ? 'Unmute voice' : 'Mute voice'}>
              {muted ? <VolumeX size={16}/> : <Volume2 size={16}/>}
            </button>

            {/* Status pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 14px', borderRadius: 99,
              background: 'var(--bg-surface-2)', border: '1px solid var(--border)',
            }}>
              <motion.div
                animate={{ opacity: isActive ? [1, 0.3, 1] : 1 }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: '50%',
                  background: meta.color, boxShadow: `0 0 6px ${meta.color}` }}
              />
              <span style={{ fontSize: 11, fontWeight: 600, color: meta.color, whiteSpace: 'nowrap' }}>
                {meta.label}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── BODY ── */}
        <div
          className="copilot-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            gap: 20,
            alignItems: 'start',
            minHeight: 'calc(100vh - 230px)',
          }}
        >
          {/* ══ SIDEBAR ══ */}
          <motion.div
            className="copilot-sidebar"
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, paddingTop: 24 }}
          >
            {/* Orb */}
            <CopilotOrb status={status}/>

            {/* Waveform + label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
              <Waveform active={status === 'listening' || status === 'speaking'} color={meta.color}/>
              <AnimatePresence mode="wait">
                <motion.p key={status}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 11, fontWeight: 600, color: meta.color, textAlign: 'center' }}>
                  {status === 'listening' ? '🎙 Listening'  :
                   status === 'thinking'  ? '⚡ Processing' :
                   status === 'speaking'  ? '🔊 Speaking'   : '● Standby'}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Persona cards */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'CA Mode',  sub: 'Defense · Budget & Risk', color: GAIN,   icon: '🛡️' },
                { label: 'CFA Mode', sub: 'Offense · Growth & Goals', color: ACCENT, icon: '📈' },
              ].map(p => (
                <div key={p.label} className="card" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{p.icon}</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: p.color, marginBottom: 1 }}>{p.label}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tip box */}
            <div style={{
              width: '100%', padding: '12px 13px', borderRadius: 12,
              background: 'var(--bg-surface-2)', border: '1px solid var(--border)',
            }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)',
                letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                Quick tips
              </p>
              {[
                ['🎙', 'Tap mic for voice'],
                ['↩', 'Enter to send text'],
                ['🔇', 'Toggle voice output'],
              ].map(([icon, tip]) => (
                <div key={tip} style={{ display: 'flex', gap: 7, marginBottom: 5, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 11 }}>{icon}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{tip}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ══ CHAT PANEL ══ */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="card"
            style={{
              display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden',
              height: 'calc(100vh - 230px)', minHeight: 480,
            }}
          >
            {/* Chat header bar */}
            <div style={{
              padding: '13px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <motion.div
                  animate={{ opacity: isActive ? [1, 0.3, 1] : 1 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ width: 8, height: 8, borderRadius: '50%',
                    background: isActive ? meta.color : GAIN,
                    boxShadow: `0 0 7px ${isActive ? meta.color : GAIN}` }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Conversation
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  · {messages.length} message{messages.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button onClick={clearChat} className="btn btn-ghost btn-sm"
                style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Trash2 size={12}/> Clear
              </button>
            </div>

            {/* Message list */}
            <div className="msg-scroll"
              style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }}>
              {messages.map((m, i) => (
                <MessageBubble key={i} role={m.role} text={m.text}/>
              ))}

              {status === 'thinking' && <TypingIndicator/>}

              {/* Live voice transcript preview */}
              <AnimatePresence>
                {status === 'listening' && transcript && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                    <div style={{
                      padding: '8px 14px',
                      borderRadius: '18px 4px 18px 18px',
                      background: 'var(--bg-surface-2)',
                      border: `1px dashed ${ACCENT}55`,
                      fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic',
                    }}>
                      &quot;{transcript}&quot;
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef}/>
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {showSugg && messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ padding: '6px 20px 12px', overflow: 'hidden', flexShrink: 0 }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)',
                    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 7 }}>
                    Try asking
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {SUGGESTIONS.map((s, i) => (
                      <motion.button key={s} className="sugg-chip"
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 + 0.05 }}
                        onClick={() => handleSuggestion(s)}>
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input bar ── */}
            <div style={{
              padding: '11px 16px 14px', borderTop: '1px solid var(--border)',
              flexShrink: 0, background: 'var(--bg-surface)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 14px', borderRadius: 14,
                background: 'var(--bg-surface-2)',
                border: `1.5px solid ${status === 'listening' ? `${GAIN}55` : 'var(--border-strong)'}`,
                boxShadow: status === 'listening' ? `0 0 14px ${GAIN}12` : 'var(--shadow-sm)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}>
                <input
                  ref={inputRef}
                  className="copilot-input"
                  type="text"
                  placeholder={
                    status === 'listening' ? "Listening via microphone..." :
                    status === 'thinking'  ? "Processing your query..."   :
                    status === 'speaking'  ? "Copilot is speaking..."     :
                    "Ask anything about your finances..."
                  }
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={status === 'listening' || status === 'thinking'}
                  style={{
                    flex: 1, background: 'transparent', border: 'none',
                    color: 'var(--text-primary)', fontSize: 14,
                    padding: '5px 0', fontFamily: 'inherit',
                  }}
                />

                <AnimatePresence mode="popLayout">
                  {textInput.trim() ? (
                    <motion.button key="send"
                      initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                      onClick={handleSend}
                      className="btn btn-primary btn-icon"
                      style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, padding: 0 }}
                      title="Send (Enter)">
                      <CornerDownLeft size={15}/>
                    </motion.button>
                  ) : isActive ? (
                    <motion.button key="stop"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      onClick={stopInteraction}
                      style={{
                        width: 36, height: 36, borderRadius: 10, border: `1px solid ${LOSS}35`,
                        background: `${LOSS}12`, cursor: 'pointer', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      title="Stop">
                      <Square size={14} color={LOSS} fill={LOSS}/>
                    </motion.button>
                  ) : (
                    <motion.button key="mic"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      onClick={handleVoice}
                      className="btn btn-primary btn-icon"
                      style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, padding: 0 }}
                      title="Voice input">
                      <Mic size={15}/>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 7, opacity: 0.65 }}>
                Financial data is processed securely ·{' '}
                <kbd style={{ fontFamily: MONO, fontSize: 9, padding: '1px 5px', borderRadius: 4,
                  background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  Enter
                </kbd>{' '}to send ·{' '}
                <kbd style={{ fontFamily: MONO, fontSize: 9, padding: '1px 5px', borderRadius: 4,
                  background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  Mic
                </kbd>{' '}for voice
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}