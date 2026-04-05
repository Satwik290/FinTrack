'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Command, Send, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { V, MONO, SANS } from '../../../utils/dashboard/tokens';

/* ── ButtonBeam — always-on spinning comet for the trigger button ── */
function ButtonBeam() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let angle = 0;
    let raf: number;
    const tick = () => {
      angle = (angle + 2.2) % 360;
      if (ref.current) {
        ref.current.style.background =
          `conic-gradient(from ${angle}deg at 50% 50%,` +
          `transparent 0deg,${V.indigo} 40deg,${V.violet} 80deg,` +
          `#0DDC9B 130deg,transparent 170deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: -1.5, borderRadius: 12, zIndex: 0, overflow: 'hidden' }}>
      <div ref={ref} style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }} />
      <div style={{ position: 'absolute', inset: 1.5, borderRadius: 10, background: 'var(--ft-raised)' }} />
    </div>
  );
}

/* ── ModalBeam — activates when the modal opens ── */
function ModalBeam({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let angle = 0;
    let raf: number;
    const tick = () => {
      angle = (angle + 1.4) % 360;
      if (ref.current) {
        ref.current.style.background =
          `conic-gradient(from ${angle}deg at 50% 50%,` +
          `transparent 0deg,${V.indigo} 60deg,${V.violet} 120deg,` +
          `#0DDC9B 180deg,${V.indigo} 240deg,transparent 300deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    if (active) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <div style={{
      position: 'absolute', inset: -1.5, borderRadius: 22, zIndex: 0, overflow: 'hidden',
      opacity: active ? 1 : 0, transition: 'opacity 0.4s ease',
      pointerEvents: 'none',
    }}>
      <div ref={ref} style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }} />
      <div style={{ position: 'absolute', inset: 1.5, borderRadius: 20, background: 'var(--ft-surface)' }} />
    </div>
  );
}

export function CopilotOmnibar() {
  const [open,       setOpen]       = useState(false);
  const [query,      setQuery]      = useState('');
  const [reply,      setReply]      = useState('');
  const [loading,    setLoading]    = useState(false);
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
    } catch { setReply("Couldn't reach Copilot. Check your connection."); }
    finally { setLoading(false); }
  }, []);

  return (
    <>
      {/* ── Trigger button ── */}
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <ButtonBeam />
        <motion.button
          onClick={() => setOpen(true)}
          onHoverStart={() => setBtnHovered(true)}
          onHoverEnd={() => setBtnHovered(false)}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          style={{
            position: 'relative', zIndex: 1,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 10, border: 'none',
            background: 'var(--ft-raised)', cursor: 'pointer',
            fontFamily: SANS, fontSize: 12,
            color: btnHovered ? 'var(--ft-text0)' : 'var(--ft-text1)',
            transition: 'color 0.2s',
          }}>
          <Sparkles size={13} color={V.indigo} />
          <span>Ask Copilot</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 4, padding: '2px 6px', borderRadius: 5, background: 'var(--ft-tag-bg)', fontSize: 10, color: 'var(--ft-text2)', fontFamily: MONO }}>
            <Command size={9} /> K
          </span>
        </motion.button>
      </div>

      {/* ── Modal overlay + dialog ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop — z 9998 */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setOpen(false); setQuery(''); setReply(''); }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 9998 }}
            />

            {/* Dialog — z 9999 */}
            <motion.div
              initial={{ opacity: 0, y: -24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed', top: '18%', left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(640px,92vw)',
                zIndex: 9999,
                borderRadius: 20,
                /* no border here — ModalBeam provides it */
              }}>

              {/* Beam sits behind via z-index */}
              <ModalBeam active={open} />

              {/* Content card */}
              <div style={{
                position: 'relative', zIndex: 1,
                background: 'var(--ft-surface)',
                borderRadius: 20, overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px var(--ft-border)',
              }}>

                {/* Input row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', borderBottom: '1px solid var(--ft-border)' }}>
                  <Sparkles size={16} color={V.indigo} />
                  <input
                    ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(query); } }}
                    placeholder="Ask anything about your finances..."
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ft-text0)', fontSize: 14, fontFamily: SANS }}
                  />
                  {loading
                    ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${V.indigo}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                    : <motion.button onClick={() => submit(query)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: query.trim() ? V.indigo : 'var(--ft-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'background 0.2s' }}>
                        <Send size={12} />
                      </motion.button>
                  }
                </div>

                {/* Reply / suggestions */}
                <AnimatePresence mode="wait">
                  {reply ? (
                    <motion.div key="reply" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${V.indigo},${V.violet})`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sparkles size={13} color="#fff" />
                        </div>
                        <div>
                          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: V.indigo, textTransform: 'uppercase', marginBottom: 4, fontFamily: MONO }}>COPILOT</p>
                          <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--ft-text0)', fontFamily: SANS }}>{reply}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid var(--ft-border)' }}>
                        <button onClick={() => { setQuery(''); setReply(''); inputRef.current?.focus(); }}
                          style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid var(--ft-border)', background: 'transparent', color: 'var(--ft-text1)', fontSize: 11, cursor: 'pointer', fontFamily: SANS }}>
                          Ask another
                        </button>
                        <button onClick={() => { router.push('/copilot'); setOpen(false); }}
                          style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: V.indigo, color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: SANS, display: 'flex', alignItems: 'center', gap: 5 }}>
                          Open Copilot <ArrowRight size={10} />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="suggestions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '12px 18px 16px' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: 'var(--ft-text2)', textTransform: 'uppercase', marginBottom: 8, fontFamily: MONO }}>Try asking</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {suggestions.map(s => (
                          <button key={s} onClick={() => { setQuery(s); submit(s); }}
                            style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'var(--ft-hover-bg)', cursor: 'pointer', textAlign: 'left', color: 'var(--ft-text1)', fontSize: 12, fontFamily: SANS, transition: 'background 0.15s', display: 'flex', alignItems: 'center', gap: 8 }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,116,255,0.1)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'var(--ft-hover-bg)')}>
                            <Sparkles size={11} color={V.indigo} />{s}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}