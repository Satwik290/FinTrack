'use client';
import { motion, useInView } from 'framer-motion';
import { Code, FileText, ArrowRight, Quote, Star } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

const testimonials = [
  {
    name: 'Arjun M.',
    role: 'Sr. Engineering Manager',
    quote:
      "The BigInt architecture is why I switched. Every other platform loses precision on my crypto fractional shares. FinTrack's integer storage is the first system I genuinely trust with my portfolio.",
    initials: 'AM',
    gradient: 'from-indigo-500 to-violet-600',
  },
  {
    name: 'Priya S.',
    role: 'Independent Consultant',
    quote:
      "The 12-month Net Worth Forecast isn't just a chart — it's a crystal ball. Seeing exactly when I hit my Freedom Goal based on my current saving rate genuinely changed how I think about money.",
    initials: 'PS',
    gradient: 'from-teal-500 to-emerald-600',
  },
  {
    name: 'Rahul T.',
    role: 'Angel Investor',
    quote:
      "Having Gemini seamlessly switch between a conservative CA persona for my taxes and a sharp CFA persona for portfolio risk? That's not a feature — it's a competitive advantage.",
    initials: 'RT',
    gradient: 'from-orange-500 to-rose-600',
  },
];

export default function TestimonialsFooter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' });

  return (
    <>
      {/* Testimonials */}
      <section id="testimonials" ref={ref} className="py-28 md:py-36 bg-[#0F121C] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />

        {/* FIXED: Proper container */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="text-center mb-20 md:mb-24"
          >
            <p className="text-[12px] font-mono text-indigo-400 tracking-[0.12em] uppercase mb-4">◇ Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Built for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                Power Users.
              </span>
            </h2>
          </motion.div>

          {/* FIXED: Grid with proper responsive spacing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, filter: 'blur(5px)' }}
                animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="bg-[#161B29]/60 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6 md:p-7 relative overflow-hidden group flex flex-col h-full"
              >
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${t.gradient} opacity-30`} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-b from-indigo-500/[0.03] to-transparent" />

                <Quote className="absolute top-5 right-5 text-white/[0.04]" size={36} />

                <div className="flex gap-0.5 mb-5 relative z-10">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} fill="#facc15" stroke="none" className="text-amber-400" />
                  ))}
                </div>

                <p className="text-[13px] text-slate-300 leading-relaxed mb-6 flex-1 relative z-10">"{t.quote}"</p>

                <div className="flex items-center gap-3 pt-5 border-t border-white/[0.05] relative z-10">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold shadow-lg flex-shrink-0`}
                  >
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-semibold text-sm truncate">{t.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section ref={ctaRef} className="py-28 md:py-36 bg-[#080B14] relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#7E5BFB]/8 blur-[150px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="max-w-4xl mx-auto px-6 md:px-8 text-center relative z-10"
        >
          <p className="text-[12px] font-mono text-indigo-400 tracking-[0.12em] uppercase mb-6">◇ Get Started</p>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Stop recording the past.
          </h2>

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-12">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C74FF] via-[#9F7AEA] to-[#7E5BFB]">
              Start modeling your future.
            </span>
          </h2>

          <a
            href="/auth"
            className="inline-flex items-center gap-2.5 bg-white text-[#0F121C] px-8 py-4 rounded-full font-bold text-base hover:bg-slate-100 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_4px_30px_rgba(255,255,255,0.12)] group"
          >
            Initialize Your Wealth Engine
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>

          <p className="text-[12px] text-slate-500 mt-8 font-mono">Free forever · No credit card · Open source</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#060810] border-t border-white/[0.05] py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="text-white font-bold tracking-tight text-sm">FinTrack</span>
            <span className="text-[11px] text-slate-400 font-mono bg-white/[0.04] px-2.5 py-1 rounded">v2.0.0</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Satwik290/FinTrack"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[13px] text-slate-400 hover:text-white transition-colors group"
            >
              <Code size={14} className="group-hover:text-indigo-400 transition-colors" />
              Source
            </a>
            <Link
              href="/docs/api"
              className="flex items-center gap-2 text-[13px] text-slate-400 hover:text-white transition-colors group"
            >
              <FileText size={14} className="group-hover:text-violet-400 transition-colors" />
              API Docs
            </Link>
          </div>

          <p className="text-[11px] text-slate-500 font-mono">© {new Date().getFullYear()} FinTrack Intelligence</p>
        </div>
      </footer>
    </>
  );
}