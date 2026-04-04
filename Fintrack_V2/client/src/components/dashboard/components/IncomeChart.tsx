'use client';
import { useState }          from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { useDashboardStore } from '@/hooks/useDashboard';
import { C, MONO, SANS, fmtAxis } from '../../../utils/dashboard/tokens';
import { Transaction }       from '../../../utils/dashboard/types';
import { Shard }             from './Shard';
import { ChartTip }          from './ChartTip';
import { useChartData }      from '../../../hooks/useDhooks';

interface IncomeChartProps { txns: Transaction[]; }

export function IncomeChart({ txns }: IncomeChartProps) {
  const { isMasked, chartPreference, setChartPreference } = useDashboardStore();
  const [chartTab, setChartTab] = useState<'forecast' | 'mom'>('mom');
  const { momData, forecastData, hasMoM, hasForecast, curKey } = useChartData(txns);

  const todayLabel = forecastData.find(d => d.key === curKey)?.name;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}>
      <Shard style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4, padding: '3px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}` }}>
            {(['mom', 'forecast'] as const).map(tab => (
              <button key={tab} onClick={() => setChartTab(tab)}
                style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: SANS, fontSize: 11, fontWeight: 600, background: chartTab === tab ? C.raised : 'transparent', color: chartTab === tab ? C.text0 : C.text2, boxShadow: chartTab === tab ? '0 1px 4px rgba(0,0,0,0.4)' : undefined, transition: 'all 0.2s' }}>
                {tab === 'mom' ? '6-Mo History' : '12-Mo Forecast'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['area', 'bar'] as const).map(p => (
              <button key={p} onClick={() => setChartPreference(p)}
                style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: SANS, fontSize: 10, background: chartPreference === p ? C.indigo : 'rgba(255,255,255,0.04)', color: chartPreference === p ? '#fff' : C.text2, transition: 'all 0.2s' }}>
                {p === 'area' ? 'Area' : 'Bar'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 220 }}>
          <AnimatePresence mode="wait">
            <motion.div key={chartTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartTab === 'mom' ? (
                  !hasMoM ? (
                    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 28 }}>📊</span>
                      <span style={{ fontSize: 12, color: C.text1, fontFamily: SANS }}>Add transactions to see history</span>
                    </div>
                  ) : chartPreference === 'area' ? (
                    <AreaChart data={momData} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="mom-i" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.jade} stopOpacity={0.35} /><stop offset="100%" stopColor={C.jade} stopOpacity={0} /></linearGradient>
                        <linearGradient id="mom-e" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.terra} stopOpacity={0.3} /><stop offset="100%" stopColor={C.terra} stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: C.text2, fontSize: 10, fontFamily: SANS }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={fmtAxis} tick={{ fill: C.text2, fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} width={52} />
                      <Tooltip content={<ChartTip masked={isMasked} />} />
                      <Area type="monotone" dataKey="income"  name="Income"  stroke={C.jade}  strokeWidth={2} fill="url(#mom-i)" dot={false} activeDot={{ r: 4, fill: C.jade,  strokeWidth: 0 }} />
                      <Area type="monotone" dataKey="expense" name="Expense" stroke={C.terra} strokeWidth={2} fill="url(#mom-e)" dot={false} activeDot={{ r: 4, fill: C.terra, strokeWidth: 0 }} />
                    </AreaChart>
                  ) : (
                    <BarChart data={momData} barGap={3} barCategoryGap="22%" margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: C.text2, fontSize: 10, fontFamily: SANS }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={fmtAxis} tick={{ fill: C.text2, fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} width={52} />
                      <Tooltip content={<ChartTip masked={isMasked} />} />
                      <Bar dataKey="income"  name="Income"  fill={C.jade}  radius={[3, 3, 0, 0]} />
                      <Bar dataKey="expense" name="Expense" fill={C.terra} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="net"     name="Net"     radius={[3, 3, 0, 0]}>
                        {momData.map((d, i) => <Cell key={i} fill={d.net >= 0 ? C.indigo : C.terra} />)}
                      </Bar>
                    </BarChart>
                  )
                ) : (
                  !hasForecast ? (
                    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 28 }}>📈</span>
                      <span style={{ fontSize: 12, color: C.text1, fontFamily: SANS }}>Add transactions to see forecast</span>
                    </div>
                  ) : chartPreference === 'area' ? (
                    <AreaChart data={forecastData} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="fc-i" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.jade} stopOpacity={0.35} /><stop offset="100%" stopColor={C.jade} stopOpacity={0} /></linearGradient>
                        <linearGradient id="fc-e" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.terra} stopOpacity={0.3} /><stop offset="100%" stopColor={C.terra} stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: C.text2, fontSize: 10, fontFamily: SANS }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={fmtAxis} tick={{ fill: C.text2, fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} width={52} />
                      <Tooltip content={<ChartTip masked={isMasked} />} />
                      {todayLabel && <ReferenceLine x={todayLabel} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 3" label={{ value: 'Today', position: 'insideTopRight', fill: C.text2, fontSize: 9 }} />}
                      <Area type="monotone" dataKey="income"  name="Income"  stroke={C.jade}  strokeWidth={2} fill="url(#fc-i)" dot={false} activeDot={{ r: 4, fill: C.jade,  strokeWidth: 0 }} />
                      <Area type="monotone" dataKey="expense" name="Expense" stroke={C.terra} strokeWidth={2} fill="url(#fc-e)" dot={false} activeDot={{ r: 4, fill: C.terra, strokeWidth: 0 }} />
                    </AreaChart>
                  ) : (
                    <BarChart data={forecastData} barGap={3} barCategoryGap="22%" margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: C.text2, fontSize: 10, fontFamily: SANS }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={fmtAxis} tick={{ fill: C.text2, fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} width={52} />
                      <Tooltip content={<ChartTip masked={isMasked} />} />
                      <Bar dataKey="income"  name="Income"  radius={[3, 3, 0, 0]}>{forecastData.map((d, i) => <Cell key={i} fill={d.isProj ? `${C.jade}55`  : C.jade}  />)}</Bar>
                      <Bar dataKey="expense" name="Expense" radius={[3, 3, 0, 0]}>{forecastData.map((d, i) => <Cell key={i} fill={d.isProj ? `${C.terra}55` : C.terra} />)}</Bar>
                    </BarChart>
                  )
                )}
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
          {[{ c: C.jade, l: 'Income' }, { c: C.terra, l: 'Expense' }, { c: C.indigo, l: 'Net' }].map(s => (
            <span key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: C.text2, fontFamily: SANS }}>
              <span style={{ width: 16, height: 2, borderRadius: 99, background: s.c }} />{s.l}
            </span>
          ))}
        </div>
      </Shard>
    </motion.div>
  );
}