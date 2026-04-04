'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Command, Send, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { C, MONO, SYNE, SANS } from '../../../utils/dashboard/tokens';

/* ── Border Beam — rotating conic gradient like Google AI ── */
function BorderBeam({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    let angle = 0;
    let raf: number;
    const tick = () => {
      angle = (angle + 1.4) % 360;
      if (ref.current) {
        ref.current.style.background =
          `conic-gradient(from ${angle}deg at 50% 50%,` +
          `transparent 0deg,` +
          `${C.indigo} 60deg,` +
          `${C.violet} 120deg,` +
          `#0DDC9B 180deg,` +
          `${C.indigo} 240deg,` +
          `transparent 300deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    if (active) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <div style={{
      position: 'absolute', inset: -1, borderRadius: 21,
      padding: 1.5, zIndex: -1,
      opacity: active ? 1 : 0,
      transition: 'opacity 0.4s ease',
    }}>
      <div ref={ref} style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: `conic-gradient(from 0deg at 50% 50%, transparent, ${C.indigo}, ${C.violet}, #0DDC9B, transparent)`,
      }} />
      {/* Inner mask to show only the border strip */}
      <div style={{
        position: 'absolute', inset: 1.5, borderRadius: 20,
        background: C.surface,
      }} />
    </div>
  );
}

/* ── ButtonBeam — always spinning, tuned for small button ── */
function ButtonBeam() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let angle = 0;
    let raf: number;
    const tick = () => {
      angle = (angle + 2.2) % 360;  // faster than modal beam
      if (ref.current) {
        ref.current.style.background =
          `conic-gradient(from ${angle}deg at 50% 50%,` +
          `transparent 0deg,` +
          `${C.indigo} 40deg,` +
          `${C.violet} 80deg,` +
          `#0DDC9B 130deg,` +
          `transparent 170deg)`;  // tighter arc = sharper comet
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: -1, borderRadius: 11, zIndex: 0 }}>
      <div ref={ref} style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
      }} />
      {/* inner mask — matches button bg */}
      <div style={{
        position: 'absolute', inset: 1.5, borderRadius: 9,
        background: C.raised,
      }} />
    </div>
  );
}


export function CopilotOmnibar() {
  const [open,       setOpen]      = useState(false);
  const [query,      setQuery]     = useState('');
  const [reply,      setReply]     = useState('');
  const [loading,    setLoading]   = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  const suggestions = [
    'How is my net worth trending?',
    'Which investment is performing best?',
    'Am I overspending this month?',
    'Show my savings rate',
  ];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 80); }, [open]);

  const submit = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setLoading(true); setReply('');
    try {
      const res = await api.post('/copilot/chat', { transcript: text });
      setReply(res.data?.data?.response ?? res.data?.response ?? 'No response.');
    } catch {
      setReply("Couldn't reach Copilot. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      {/* Trigger button with always-on beam */}
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <ButtonBeam />
        <motion.button
          onClick={() => setOpen(true)}
          onHoverStart={() => setBtnHovered(true)}
          onHoverEnd={() => setBtnHovered(false)}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, border: 'none', background: C.raised, cursor: 'pointer', fontFamily: SANS, color: btnHovered ? C.text0 : C.text1, fontSize: 12, transition: 'color 0.2s', position: 'relative', zIndex: 1 }}>
          <Sparkles size={13} color={C.indigo} />
          <span>Ask Copilot</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 4, padding: '2px 6px', borderRadius: 5, background: 'rgba(255,255,255,0.05)', fontSize: 10, color: C.text2, fontFamily: MONO }}>
            <Command size={9} /> K
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setOpen(false); setQuery(''); setReply(''); }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', zIndex: 900 }}
            />
            <motion.div
              initial={{ opacity: 0, y: -24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'fixed', top: '18%', left: '50%', transform: 'translateX(-50%)', width: 'min(640px,92vw)', zIndex: 901, background: C.surface, border: `1px solid transparent`, borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,0.8)', overflow: 'visible' }}>

              {/* Animated border beam */}
              <BorderBeam active={open} />

              {/* Inner clipped content */}
              <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', zIndex: 1 }}>

              {/* Input row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', borderBottom: `1px solid ${C.border}` }}>
                <Sparkles size={16} color={C.indigo} />
                <input
                  ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(query); } }}
                  placeholder="Ask anything about your finances..."
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: C.text0, fontSize: 14, fontFamily: SANS }}
                />
                {loading
                  ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${C.indigo}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                  : <motion.button onClick={() => submit(query)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: query.trim() ? C.indigo : 'rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'background 0.2s' }}>
                      <Send size={12} />
                    </motion.button>
                }
              </div>

              {/* Reply / suggestions */}
              <AnimatePresence mode="wait">
                {reply ? (
                  <motion.div key="reply" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${C.indigo},${C.violet})`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={13} color="#fff" />
                      </div>
                      <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: C.indigo, textTransform: 'uppercase', marginBottom: 4, fontFamily: MONO }}>COPILOT</p>
                        <p style={{ fontSize: 13, lineHeight: 1.65, color: C.text0, fontFamily: SANS }}>{reply}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                      <button onClick={() => { setQuery(''); setReply(''); inputRef.current?.focus(); }}
                        style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${C.border}`, background: 'transparent', color: C.text1, fontSize: 11, cursor: 'pointer', fontFamily: SANS }}>
                        Ask another
                      </button>
                      <button onClick={() => { router.push('/copilot'); setOpen(false); }}
                        style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: C.indigo, color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: SANS, display: 'flex', alignItems: 'center', gap: 5 }}>
                        Open Copilot <ArrowRight size={10} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="suggestions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '12px 18px 16px' }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: C.text2, textTransform: 'uppercase', marginBottom: 8, fontFamily: MONO }}>Try asking</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {suggestions.map(s => (
                        <button key={s} onClick={() => { setQuery(s); submit(s); }}
                          style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'left', color: C.text1, fontSize: 12, fontFamily: SANS, transition: 'background 0.15s', display: 'flex', alignItems: 'center', gap: 8 }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,116,255,0.08)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}>
                          <Sparkles size={11} color={C.indigo} />{s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>{/* end inner clipped content */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}