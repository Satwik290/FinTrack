"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  ChevronDown,
  Search,
  X,
  Loader2,
  Landmark,
  BarChart2,
  BookOpen,
  Shield,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
  Star,
  ArrowUpRight,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  useWealth,
  useAddAsset,
  useDeleteAsset,
  useAddLiability,
  useDeleteLiability,
  useAddMFLumpsum,
  useAddMFSip,
  useDeleteMFHolding,
  useAddStock,
  useDeleteStock,
  useAddInsurance,
  useDeleteInsurance,
  usePayPremium,
  useMFNavHistory,
  useMFSearch,
  useStockSearch,
  type WealthSummary,
  type Liability,
  type InsurancePolicy,
} from "@/hooks/usewealth";
import { useWealthStore } from "@/store/useWealthStore";
import api from "@/lib/api";

/* ─── Design tokens ──────────────────────────────── */
const MONO = "'Space Mono', 'JetBrains Mono', 'Courier New', monospace";
const GAIN = "#2D9664";
const LOSS = "#C0614A";
const CARD = "var(--bg-surface)";

/* ─── Formatters ─────────────────────────────────── */
const fmtINR = (n: number, masked = false) =>
  masked
    ? "₹ ••••••"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(n);

const fmtINRPrecise = (n: number, masked = false) =>
  masked
    ? "••••"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n);

const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

function timeAgo(iso: string | null | number): string {
  if (!iso) return "Never";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ─── Tab config ─────────────────────────────────── */
type Tab =
  | "overview"
  | "stocks"
  | "mutual-funds"
  | "assets"
  | "liabilities"
  | "insurance";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Landmark },
  { id: "stocks", label: "Stocks", icon: BarChart2 },
  { id: "mutual-funds", label: "Mutual Funds", icon: BookOpen },
  { id: "assets", label: "Assets", icon: Shield },
  { id: "liabilities", label: "Liabilities", icon: AlertTriangle },
  { id: "insurance", label: "Insurance", icon: Shield },
];

const LIABILITY_CATEGORIES = [
  "Home Loan",
  "Car Loan",
  "Personal Loan",
  "Education Loan",
  "Credit Card",
  "Other",
];

const EXCHANGE_CFG = {
  NSE: { label: "NSE", color: "#6366f1", emoji: "🇮🇳" },
  US: { label: "US", color: "#f59e0b", emoji: "🇺🇸" },
  CRYPTO: { label: "Crypto", color: "#f97316", emoji: "₿" },
} as const;

/* ══════════════════════════════════════════════════
 *  NET WORTH HEADER (Sticky)
 * ══════════════════════════════════════════════════ */
function NetWorthHeader({
  data,
  masked,
  onToggleMask,
  onSync,
  syncing,
}: {
  data: WealthSummary;
  masked: boolean;
  onToggleMask: () => void;
  onSync: () => void;
  syncing: boolean;
}) {
  const isPos = data.netWorth >= 0;

  return (
    <div
      style={{
        borderRadius: 24,
        padding: "28px 32px",
        marginBottom: 24,
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(145deg,#0f1117 0%,#1a1f2e 60%,#1e1628 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(99,102,241,0.07)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: 60,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "rgba(45,150,100,0.06)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Net Worth
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 44,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: -1,
              }}
            >
              {masked
                ? "₹ ••••••••"
                : new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(data.netWorth)}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 15,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 99,
                background: isPos
                  ? "rgba(45,150,100,0.2)"
                  : "rgba(192,97,74,0.2)",
                color: isPos ? GAIN : LOSS,
              }}
            >
              {isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {fmtPct(data.totalPnlPct)}
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.35)",
              marginTop: 6,
              fontFamily: MONO,
            }}
          >
            {masked
              ? "•••• invested"
              : `${fmtINR(data.totalInvested)} invested`}
            &nbsp;·&nbsp;
            <span style={{ color: data.totalPnl >= 0 ? GAIN : LOSS }}>
              {data.totalPnl >= 0 ? "+" : ""}
              {masked ? "••••" : fmtINR(data.totalPnl)} P&L
            </span>
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onSync}
              disabled={syncing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <RefreshCw
                size={13}
                style={{
                  animation: syncing ? "spin 1s linear infinite" : "none",
                }}
              />
              Sync All
            </button>
            <button
              onClick={onToggleMask}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: masked
                  ? "rgba(99,102,241,0.2)"
                  : "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {masked ? <EyeOff size={13} /> : <Eye size={13} />}
              {masked ? "Show" : "Hide"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[
              {
                label: "Assets",
                value: data.totalAssets,
                color: "rgba(255,255,255,0.85)",
              },
              {
                label: "Liabilities",
                value: data.totalLiabilities,
                color: LOSS,
              },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.35)",
                    marginBottom: 2,
                  }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: 15,
                    fontWeight: 700,
                    color: s.color,
                  }}
                >
                  {masked ? "••••" : fmtINR(s.value)}
                </p>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
            }}
          >
            <span>📊 Stocks: {timeAgo(data.lastSynced.stocks)}</span>
            <span>📈 MF: {timeAgo(data.lastSynced.mutualFunds)}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Financial Freedom — {Math.round(data.financialFreedomPct)}% of debt
            repaid
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            D/A: {data.debtToAsset.toFixed(1)}%
          </span>
        </div>
        <div
          style={{
            height: 4,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(data.financialFreedomPct, 100)}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: "100%",
              borderRadius: 99,
              background: `linear-gradient(90deg,${GAIN},#34d399)`,
            }}
          />
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  OVERVIEW TAB
 * ══════════════════════════════════════════════════ */
function OverviewTab({
  data,
  masked,
}: {
  data: WealthSummary;
  masked: boolean;
}) {
  const allPnlData = [
    { name: "MF", pnl: data.mfSummary.totalPnl, color: "#6366f1" },
    { name: "Stocks", pnl: data.stockSummary.totalPnl, color: "#f59e0b" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div className="card" style={{ padding: 24 }}>
        <p
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          Portfolio Allocation
        </p>
        <p
          style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}
        >
          Total: {fmtINR(data.totalAssets, masked)}
        </p>
        {data.allocation.length === 0 ? (
          <EmptyState icon="📊" message="Add investments to see allocation" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.allocation}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {data.allocation.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: any) => [fmtINR(v as number, masked), "Value"]}
                contentStyle={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <p
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          P&L by Category
        </p>
        <p
          style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}
        >
          Unrealised gain/loss
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={allPnlData} barSize={48}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              formatter={(v: any) => [fmtINR(v as number, masked), "P&L"]}
              contentStyle={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
              {allPnlData.map((d, i) => (
                <Cell key={i} fill={d.pnl >= 0 ? GAIN : LOSS} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ padding: 24, gridColumn: "span 2" }}>
        <p
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "var(--text-primary)",
            marginBottom: 16,
          }}
        >
          Top 5 Performers
        </p>
        {data.top5Performers.length === 0 ? (
          <EmptyState
            icon="🏆"
            message="Add holdings to see your top performers"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {data.top5Performers.map((h, i) => (
              <div
                key={h.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 8px",
                  borderRadius: 10,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg-surface-2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    color: "var(--text-muted)",
                    width: 20,
                    textAlign: "center",
                  }}
                >
                  #{i + 1}
                </span>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    flexShrink: 0,
                    background:
                      h.type === "MF"
                        ? "rgba(99,102,241,0.12)"
                        : "rgba(245,158,11,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  {h.type === "MF" ? "📈" : "📊"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.name}
                  </p>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 99,
                      background: "var(--bg-surface-2)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {h.badge}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    color: "var(--text-primary)",
                    flexShrink: 0,
                  }}
                >
                  {fmtINR(h.currentValue, masked)}
                </p>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 700,
                    color: h.pnl >= 0 ? GAIN : LOSS,
                    flexShrink: 0,
                    minWidth: 70,
                    textAlign: "right",
                  }}
                >
                  {fmtPct(h.pnlPct)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.debtToAsset > 30 && (
        <div
          style={{
            gridColumn: "span 2",
            padding: "14px 20px",
            borderRadius: 14,
            background: "rgba(192,97,74,0.08)",
            border: "1px solid rgba(192,97,74,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 20 }}>💡</span>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.5,
            }}
          >
            Your debt-to-asset ratio is{" "}
            <strong style={{ color: LOSS }}>
              {data.debtToAsset.toFixed(1)}%
            </strong>
            . Financial advisors recommend keeping this below 30%.
          </p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  STOCKS TAB
 * ══════════════════════════════════════════════════ */
function StocksTab({ data, masked }: { data: WealthSummary; masked: boolean }) {
  const deleteStock = useDeleteStock();
  const [showModal, setShowModal] = useState(false);
  const [filterEx, setFilterEx] = useState<"ALL" | "NSE" | "US" | "CRYPTO">(
    "ALL",
  );

  const filtered = data.stockHoldings.filter(
    (h) => filterEx === "ALL" || h.exchange === filterEx,
  );

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {[
          { l: "Invested", v: fmtINR(data.stockSummary.totalInvested, masked) },
          { l: "Current", v: fmtINR(data.stockSummary.totalCurrent, masked) },
          {
            l: "P&L",
            v: `${data.stockSummary.totalPnl >= 0 ? "+" : ""}${fmtINR(data.stockSummary.totalPnl, masked)}`,
            c: data.stockSummary.totalPnl >= 0 ? GAIN : LOSS,
          },
          { l: "Holdings", v: String(data.stockSummary.holdingsCount) },
        ].map((s) => (
          <div key={s.l} className="card" style={{ padding: "16px 18px" }}>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              {s.l}
            </p>
            <p
              style={{
                fontFamily: MONO,
                fontSize: 18,
                fontWeight: 700,
                color: (s as any).c ?? "var(--text-primary)",
              }}
            >
              {s.v}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        {(["ALL", "NSE", "US", "CRYPTO"] as const).map((e) => (
          <button
            key={e}
            onClick={() => setFilterEx(e)}
            className="btn btn-sm"
            style={{
              border: "none",
              background:
                filterEx === e
                  ? e === "ALL"
                    ? "var(--indigo-500)"
                    : EXCHANGE_CFG[e as keyof typeof EXCHANGE_CFG]?.color
                  : "var(--bg-surface-2)",
              color: filterEx === e ? "#fff" : "var(--text-secondary)",
            }}
          >
            {e === "ALL"
              ? "All"
              : `${EXCHANGE_CFG[e as keyof typeof EXCHANGE_CFG].emoji} ${EXCHANGE_CFG[e as keyof typeof EXCHANGE_CFG].label}`}
          </button>
        ))}
        <button
          className="btn btn-primary btn-sm"
          style={{ marginLeft: "auto" }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={14} /> Add Stock
        </button>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon="📊"
            message="No stock holdings yet. Add NSE, US stocks, or crypto."
            action={() => setShowModal(true)}
            actionLabel="Add Holding"
          />
        ) : (
          filtered.map((h, i) => {
            const cfg = EXCHANGE_CFG[h.exchange as keyof typeof EXCHANGE_CFG];
            const isG = h.pnl >= 0;
            return (
              <div
                key={h.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 20px",
                  borderBottom:
                    i < filtered.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg-surface-2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: cfg.color + "18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  {cfg.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.companyName}
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 99,
                        background: cfg.color + "18",
                        color: cfg.color,
                      }}
                    >
                      {h.ticker}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      ×{h.quantity}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p
                    style={{
                      fontFamily: MONO,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {fmtINRPrecise(h.currentPrice, masked)}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    avg {fmtINRPrecise(h.avgBuyPrice, masked)}
                  </p>
                </div>
                <div
                  style={{ textAlign: "right", flexShrink: 0, minWidth: 90 }}
                >
                  <p
                    style={{
                      fontFamily: MONO,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {fmtINR(h.currentValue, masked)}
                  </p>
                  <p
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      color: isG ? GAIN : LOSS,
                    }}
                  >
                    {isG ? "+" : ""}
                    {fmtPct(h.pnlPct)}
                  </p>
                </div>
                <button
                  className="btn btn-icon"
                  onClick={() => deleteStock.mutate(h.id)}
                  style={{
                    width: 28,
                    height: 28,
                    color: "var(--danger)",
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {showModal && <AddStockModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  MUTUAL FUNDS TAB
 * ══════════════════════════════════════════════════ */
function MutualFundsTab({
  data,
  masked,
}: {
  data: WealthSummary;
  masked: boolean;
}) {
  const deleteMF = useDeleteMFHolding();
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [navPeriod, setNavPeriod] = useState<"1Y" | "3Y" | "5Y">("1Y");
  const [filterType, setFilterType] = useState<"all" | "lumpsum" | "sip">(
    "all",
  );

  const filtered = data.mfHoldings.filter((h) =>
    filterType === "all" ? true : filterType === "sip" ? h.isSIP : !h.isSIP,
  );

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {[
          { l: "Invested", v: fmtINR(data.mfSummary.totalInvested, masked) },
          { l: "Current", v: fmtINR(data.mfSummary.totalCurrent, masked) },
          {
            l: "P&L",
            v: `${data.mfSummary.totalPnl >= 0 ? "+" : ""}${fmtINR(data.mfSummary.totalPnl, masked)}`,
            c: data.mfSummary.totalPnl >= 0 ? GAIN : LOSS,
          },
          { l: "Schemes", v: String(data.mfSummary.holdingsCount) },
        ].map((s) => (
          <div key={s.l} className="card" style={{ padding: "16px 18px" }}>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              {s.l}
            </p>
            <p
              style={{
                fontFamily: MONO,
                fontSize: 18,
                fontWeight: 700,
                color: (s as any).c ?? "var(--text-primary)",
              }}
            >
              {s.v}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        {(["all", "lumpsum", "sip"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className="btn btn-sm"
            style={{
              border: "none",
              background:
                filterType === f ? "var(--indigo-500)" : "var(--bg-surface-2)",
              color: filterType === f ? "#fff" : "var(--text-secondary)",
              textTransform: "capitalize",
            }}
          >
            {f === "all" ? "All" : f === "sip" ? "🔄 SIP" : "💰 Lumpsum"}
          </button>
        ))}
        <button
          className="btn btn-primary btn-sm"
          style={{ marginLeft: "auto" }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={14} /> Add Fund
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📈"
          message="No mutual fund holdings. Add a lumpsum or SIP."
          action={() => setShowModal(true)}
          actionLabel="Add Fund"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((h) => {
            const isG = h.pnl >= 0;
            const expanded = expandedId === h.id;
            return (
              <div key={h.id} className="card" style={{ padding: 20 }}>
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      flexShrink: 0,
                      background: "rgba(99,102,241,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 17,
                    }}
                  >
                    {h.isSIP ? "🔄" : "📈"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: "var(--text-primary)",
                        marginBottom: 3,
                      }}
                    >
                      {h.schemeName}
                    </p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span
                        className="badge badge-info"
                        style={{ fontSize: 10 }}
                      >
                        {h.category}
                      </span>
                      {h.isSIP && (
                        <span
                          className="badge badge-indigo"
                          style={{ fontSize: 10 }}
                        >
                          SIP ₹{(h.sipAmount ?? 0).toLocaleString("en-IN")}/mo
                        </span>
                      )}
                      {h.nextSipDate && (
                        <span
                          style={{ fontSize: 10, color: "var(--text-muted)" }}
                        >
                          Next: {h.nextSipDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          fontFamily: MONO,
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                        }}
                      >
                        {fmtINR(h.currentValue, masked)}
                      </p>
                      <p
                        style={{
                          fontFamily: MONO,
                          fontSize: 12,
                          color: isG ? GAIN : LOSS,
                        }}
                      >
                        {isG ? "+" : ""}
                        {fmtPct(h.pnlPct)}
                      </p>
                    </div>
                    <button
                      className="btn btn-icon"
                      onClick={() => setExpandedId(expanded ? null : h.id)}
                      style={{ width: 28, height: 28 }}
                    >
                      <ChevronDown
                        size={13}
                        style={{
                          transform: expanded ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s",
                        }}
                      />
                    </button>
                    <button
                      className="btn btn-icon"
                      onClick={() => deleteMF.mutate(h.id)}
                      style={{ width: 28, height: 28, color: "var(--danger)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 10,
                    marginTop: 14,
                  }}
                >
                  {[
                    { l: "Invested", v: fmtINR(h.investedAmount, masked) },
                    { l: "Current", v: fmtINR(h.currentValue, masked) },
                    {
                      l: "P&L",
                      v: `${h.pnl >= 0 ? "+" : ""}${fmtINR(h.pnl, masked)}`,
                      c: isG ? GAIN : LOSS,
                    },
                    { l: "NAV", v: fmtINRPrecise(h.currentNAV, masked) },
                  ].map((s) => (
                    <div
                      key={s.l}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: "var(--bg-surface-2)",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          marginBottom: 2,
                        }}
                      >
                        {s.l}
                      </p>
                      <p
                        style={{
                          fontFamily: MONO,
                          fontSize: 12,
                          fontWeight: 700,
                          color: (s as any).c ?? "var(--text-primary)",
                        }}
                      >
                        {s.v}
                      </p>
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <MiniNavChart
                        schemeCode={h.schemeCode}
                        period={navPeriod}
                        onPeriodChange={setNavPeriod}
                        masked={masked}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && <AddMFModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

function MiniNavChart({
  schemeCode,
  period,
  onPeriodChange,
  masked,
}: {
  schemeCode: string;
  period: "1Y" | "3Y" | "5Y";
  onPeriodChange: (p: "1Y" | "3Y" | "5Y") => void;
  masked: boolean;
}) {
  const { data = [], isLoading } = useMFNavHistory(schemeCode, period);
  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <p
          style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}
        >
          NAV History
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          {(["1Y", "3Y", "5Y"] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className="btn btn-sm"
              style={{
                padding: "3px 8px",
                fontSize: 11,
                border: "none",
                background:
                  period === p ? "var(--indigo-500)" : "var(--bg-surface-2)",
                color: period === p ? "#fff" : "var(--text-secondary)",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <div
          style={{
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
          }}
        >
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`ng-${schemeCode}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--text-muted)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              formatter={(v: any) => [
                fmtINRPrecise(v as number, masked),
                "NAV",
              ]}
              contentStyle={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey="nav"
              stroke="#6366f1"
              strokeWidth={2}
              fill={`url(#ng-${schemeCode})`}
              dot={false}
              activeDot={{ r: 3, fill: "#6366f1" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  ASSETS TAB
 * ══════════════════════════════════════════════════ */
function AssetsTab({ data, masked }: { data: WealthSummary; masked: boolean }) {
  const deleteAsset = useDeleteAsset();
  const [showModal, setShowModal] = useState(false);

  const ASSET_EMOJI: Record<string, string> = {
    Property: "🏠",
    "Fixed Deposit": "🏦",
    Gold: "🪙",
    Vehicle: "🚗",
    "Mutual Fund": "📈",
    Stock: "📊",
    Crypto: "₿",
    Other: "💼",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <p
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "var(--text-primary)",
            }}
          >
            Manual Assets
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            Total:{" "}
            <span
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {fmtINR(data.manualAssetsValue, masked)}
            </span>
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowModal(true)}
        >
          <Plus size={14} /> Add Asset
        </button>
      </div>

      {data.assets.length === 0 ? (
        <EmptyState
          icon="🏠"
          message="Add manual assets like property, FD, gold, or vehicles."
          action={() => setShowModal(true)}
          actionLabel="Add Asset"
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: 16,
          }}
        >
          {data.assets.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card"
              style={{ padding: 20 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(16,185,129,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    {ASSET_EMOJI[a.type] ?? "💼"}
                  </div>
                  <div>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "var(--text-primary)",
                      }}
                    >
                      {a.name}
                    </p>
                    <span
                      className="badge badge-success"
                      style={{ fontSize: 10 }}
                    >
                      {a.type}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-icon"
                  onClick={() => deleteAsset.mutate(a.id)}
                  style={{
                    width: 28,
                    height: 28,
                    color: "var(--danger)",
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: 22,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                }}
              >
                {masked ? "₹ ••••••" : fmtINR(a.currentValueInCents / 100)}
              </p>
              {a.ticker && (
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginTop: 4,
                  }}
                >
                  Ticker: {a.ticker} · Qty: {a.quantity}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && <AddAssetModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  LIABILITIES TAB
 * ══════════════════════════════════════════════════ */
const LIABILITY_CATEGORY_EMOJI: Record<string, string> = {
  "Home Loan": "🏠",
  "Car Loan": "🚗",
  "Personal Loan": "💳",
  "Education Loan": "🎓",
  "Credit Card": "💳",
  Other: "📋",
};

function LiabilitiesTab({
  data,
  masked,
}: {
  data: WealthSummary;
  masked: boolean;
}) {
  const deleteLiability = useDeleteLiability();
  const [showModal, setShowModal] = useState(false);

  const sorted = [...data.liabilities].sort(
    (a, b) => b.interestRate - a.interestRate,
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <p
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "var(--text-primary)",
            }}
          >
            Liabilities
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            Total:{" "}
            <span style={{ fontFamily: MONO, fontWeight: 700, color: LOSS }}>
              {fmtINR(data.totalLiabilities, masked)}
            </span>
            &nbsp;·&nbsp;D/A ratio:{" "}
            <strong>{data.debtToAsset.toFixed(1)}%</strong>
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowModal(true)}
        >
          <Plus size={14} /> Add Loan
        </button>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <p
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: "var(--text-primary)",
            }}
          >
            Financial Freedom Progress
          </p>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 700,
              color: GAIN,
            }}
          >
            {data.financialFreedomPct.toFixed(1)}%
          </p>
        </div>
        <div
          style={{
            height: 10,
            background: "var(--bg-surface-2)",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.financialFreedomPct}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: "100%",
              borderRadius: 99,
              background: `linear-gradient(90deg,${GAIN},#34d399)`,
            }}
          />
        </div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
          Based on principal repaid across all loans. 100% = debt-free.
        </p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon="🎉" message="No liabilities! You're debt-free." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sorted.map((l, i) => {
            const repaidPct =
              l.totalPrincipalInCents > 0
                ? ((l.totalPrincipalInCents - l.remainingBalanceInCents) /
                    l.totalPrincipalInCents) *
                  100
                : 0;
            const rateColor =
              l.interestRate > 10
                ? LOSS
                : l.interestRate > 6
                  ? "var(--warning)"
                  : GAIN;
            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card"
                style={{ padding: 22 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      flexShrink: 0,
                      background: "rgba(192,97,74,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    {LIABILITY_CATEGORY_EMOJI[l.category] ?? "📋"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "var(--text-primary)",
                        marginBottom: 3,
                      }}
                    >
                      {l.loanName}
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span
                        className="badge badge-danger"
                        style={{ fontSize: 10 }}
                      >
                        {l.category}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 99,
                          background: `${rateColor}18`,
                          color: rateColor,
                          fontWeight: 700,
                        }}
                      >
                        {l.interestRate}% p.a.
                      </span>
                      {l.dueDate && (
                        <span
                          style={{ fontSize: 11, color: "var(--text-muted)" }}
                        >
                          EMI due: {l.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p
                      style={{
                        fontFamily: MONO,
                        fontSize: 18,
                        fontWeight: 800,
                        color: LOSS,
                      }}
                    >
                      {masked
                        ? "₹ ••••••"
                        : fmtINR(l.remainingBalanceInCents / 100)}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      of{" "}
                      {masked
                        ? "₹ ••••"
                        : fmtINR(l.totalPrincipalInCents / 100)}
                    </p>
                  </div>
                  <button
                    className="btn btn-icon"
                    onClick={() => deleteLiability.mutate(l.id)}
                    style={{
                      width: 28,
                      height: 28,
                      color: "var(--danger)",
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    }}
                  >
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Repaid
                    </span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 11,
                        color: GAIN,
                        fontWeight: 700,
                      }}
                    >
                      {repaidPct.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "var(--bg-surface-2)",
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${repaidPct}%` }}
                      transition={{
                        duration: 0.9,
                        delay: i * 0.06 + 0.2,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      style={{
                        height: "100%",
                        borderRadius: 99,
                        background: `linear-gradient(90deg,${GAIN},#34d399)`,
                      }}
                    />
                  </div>
                </div>
                {l.emiInCents && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginTop: 8,
                    }}
                  >
                    Monthly EMI:{" "}
                    <span
                      style={{
                        fontFamily: MONO,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      {masked ? "••••" : fmtINR(l.emiInCents / 100)}
                    </span>
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && <AddLiabilityModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  INSURANCE TAB — Elite redesign
 * ══════════════════════════════════════════════════ */

const POLICY_META: Record<
  string,
  { icon: string; color: string; bg: string; label: string }
> = {
  TERM_LIFE: {
    icon: "🛡️",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.10)",
    label: "Term Life",
  },
  HEALTH: {
    icon: "🏥",
    color: "#10b981",
    bg: "rgba(16,185,129,0.10)",
    label: "Health",
  },
  MOTOR: {
    icon: "🚗",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.10)",
    label: "Motor",
  },
  HOME: {
    icon: "🏠",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.10)",
    label: "Home",
  },
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function InsuranceTab({
  data,
  masked,
}: {
  data: WealthSummary;
  masked: boolean;
}) {
  const deletePolicy = useDeleteInsurance();
  const payPremium = usePayPremium();
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const policies: InsurancePolicy[] = data.insurancePolicies ?? [];

  // ── HLV gap metrics ──────────────────────────────
  const hlv = (data as any).hlvMetrics ?? null;
  const totalCoverage = policies.reduce((s, p) => s + (p.sumInsured ?? 0), 0);
  const termPolicies = policies.filter((p) => p.type === "TERM_LIFE");
  const termCoverage = termPolicies.reduce(
    (s, p) => s + (p.sumInsured ?? 0),
    0,
  );
  const annualPremium = policies.reduce((s, p) => {
    const amt = p.premiumAmount ?? 0;
    const freq = (p.frequency ?? "").toLowerCase();
    if (freq === "monthly") return s + amt * 12;
    if (freq === "quarterly") return s + amt * 4;
    if (freq === "semi_annual") return s + amt * 2;
    return s + amt;
  }, 0);

  // Urgent renewals (within 30 days)
  const urgentRenewals = policies.filter((p) => {
    const d = daysUntil(p.nextDueDate);
    return d >= 0 && d <= 30;
  });

  const filteredPolicies =
    selectedType === "ALL"
      ? policies
      : policies.filter((p) => p.type === selectedType);

  // Coverage ratio vs recommended (10x income approximation via hlv or fallback)
  const recommended = hlv?.requiredCoverage ?? 0;
  const coverageRatio =
    recommended > 0 ? Math.min((termCoverage / recommended) * 100, 120) : null;
  const coverageGap =
    recommended > 0 ? Math.max(recommended - termCoverage, 0) : 0;

  return (
    <div>
      {/* ── Top metrics row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Total Coverage",
            value: fmtINR(totalCoverage, masked),
            sub: `${policies.length} active polic${policies.length === 1 ? "y" : "ies"}`,
            icon: "🛡️",
            color: "#6366f1",
            bg: "rgba(99,102,241,0.08)",
          },
          {
            label: "Annual Premium",
            value: fmtINR(annualPremium, masked),
            sub: "across all policies",
            icon: "💳",
            color: LOSS,
            bg: "rgba(192,97,74,0.08)",
          },
          {
            label: "Term Coverage",
            value: fmtINR(termCoverage, masked),
            sub: `${termPolicies.length} term polic${termPolicies.length === 1 ? "y" : "ies"}`,
            icon: "📋",
            color: GAIN,
            bg: "rgba(45,150,100,0.08)",
          },
          {
            label: "Renewals Due",
            value: String(urgentRenewals.length),
            sub:
              urgentRenewals.length > 0 ? "within 30 days" : "nothing urgent",
            icon: urgentRenewals.length > 0 ? "⚠️" : "✅",
            color: urgentRenewals.length > 0 ? "#f59e0b" : GAIN,
            bg:
              urgentRenewals.length > 0
                ? "rgba(245,158,11,0.08)"
                : "rgba(45,150,100,0.08)",
          },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "16px 18px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                {s.label}
              </p>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
            </div>
            <p
              style={{
                fontFamily: MONO,
                fontSize: 18,
                fontWeight: 700,
                color: s.color,
                marginBottom: 4,
              }}
            >
              {s.value}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── HLV Protection Shield ── */}
      {recommended > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: 20,
            borderRadius: 18,
            overflow: "hidden",
            position: "relative",
            background:
              coverageGap > 0
                ? "linear-gradient(135deg,rgba(192,97,74,0.08) 0%,rgba(192,97,74,0.03) 100%)"
                : "linear-gradient(135deg,rgba(45,150,100,0.08) 0%,rgba(45,150,100,0.03) 100%)",
            border: `1px solid ${coverageGap > 0 ? "rgba(192,97,74,0.2)" : "rgba(45,150,100,0.2)"}`,
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 22 }}>
                  {coverageGap > 0 ? "⚠️" : "✅"}
                </span>
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: "var(--text-primary)",
                      marginBottom: 2,
                    }}
                  >
                    {coverageGap > 0
                      ? "Coverage Gap Detected"
                      : "Protection Goal Met"}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    HLV-based life insurance analysis
                  </p>
                </div>
              </div>

              {/* Coverage bar */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Coverage vs Recommended
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      fontWeight: 700,
                      color: coverageGap > 0 ? LOSS : GAIN,
                    }}
                  >
                    {coverageRatio?.toFixed(0) ?? 0}%
                  </span>
                </div>
                <div
                  style={{
                    height: 10,
                    background: "var(--bg-surface-2)",
                    borderRadius: 99,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(coverageRatio ?? 0, 100)}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      height: "100%",
                      borderRadius: 99,
                      background:
                        coverageGap > 0
                          ? `linear-gradient(90deg,${LOSS},#f87171)`
                          : `linear-gradient(90deg,${GAIN},#34d399)`,
                    }}
                  />
                  {/* 100% marker */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: "83.3%",
                      width: 1.5,
                      background: "rgba(255,255,255,0.3)",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 4,
                    fontSize: 10,
                    color: "var(--text-muted)",
                  }}
                >
                  <span>0</span>
                  <span>Required: {masked ? "••••" : fmtINR(recommended)}</span>
                </div>
              </div>
            </div>

            {/* Right stats */}
            <div style={{ display: "flex", gap: 20 }}>
              {[
                {
                  label: "You Have",
                  value: fmtINR(termCoverage, masked),
                  color: "var(--text-primary)",
                },
                {
                  label: "Recommended",
                  value: fmtINR(recommended, masked),
                  color: "var(--text-secondary)",
                },
                ...(coverageGap > 0
                  ? [
                      {
                        label: "Gap",
                        value: fmtINR(coverageGap, masked),
                        color: LOSS,
                      },
                    ]
                  : []),
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginBottom: 3,
                    }}
                  >
                    {s.label}
                  </p>
                  <p
                    style={{
                      fontFamily: MONO,
                      fontSize: 14,
                      fontWeight: 700,
                      color: s.color,
                    }}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Urgent renewals banner ── */}
      <AnimatePresence>
        {urgentRenewals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: 16,
              padding: "12px 18px",
              borderRadius: 12,
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.25)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Clock size={16} style={{ color: "#f59e0b", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {urgentRenewals.length} renewal
                {urgentRenewals.length > 1 ? "s" : ""} due soon:
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginLeft: 6,
                }}
              >
                {urgentRenewals
                  .map((p) => {
                    const d = daysUntil(p.nextDueDate);
                    return `${p.policyName} (${d === 0 ? "today" : `${d}d`})`;
                  })
                  .join(" · ")}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter + Add ── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {(["ALL", "TERM_LIFE", "HEALTH", "MOTOR", "HOME"] as const).map((t) => {
          const meta = t === "ALL" ? null : POLICY_META[t];
          const active = selectedType === t;
          return (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className="btn btn-sm"
              style={{
                border: "none",
                background: active
                  ? (meta?.color ?? "var(--indigo-500)")
                  : "var(--bg-surface-2)",
                color: active ? "#fff" : "var(--text-secondary)",
              }}
            >
              {meta ? `${meta.icon} ${meta.label}` : "All Policies"}
            </button>
          );
        })}
        <button
          className="btn btn-primary btn-sm"
          style={{ marginLeft: "auto" }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={14} /> Add Policy
        </button>
      </div>

      {/* ── Policy cards ── */}
      {filteredPolicies.length === 0 ? (
        <EmptyState
          icon="🛡️"
          message={
            policies.length === 0
              ? "No insurance policies found. Protect your wealth!"
              : "No policies match this filter."
          }
          action={policies.length === 0 ? () => setShowModal(true) : undefined}
          actionLabel="Add Policy"
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))",
            gap: 16,
          }}
        >
          {filteredPolicies.map((p, i) => {
            const meta = POLICY_META[p.type] ?? {
              icon: "📋",
              color: "#6366f1",
              bg: "rgba(99,102,241,0.08)",
              label: p.type,
            };
            const days = daysUntil(p.nextDueDate);
            const urgent = days >= 0 && days <= 7;
            const soon = days >= 0 && days <= 30;
            const overdue = days < 0;

            let dueBadgeColor = "var(--text-muted)";
            let dueBgColor = "var(--bg-surface-2)";
            if (overdue) {
              dueBadgeColor = LOSS;
              dueBgColor = "rgba(192,97,74,0.10)";
            } else if (urgent) {
              dueBadgeColor = LOSS;
              dueBgColor = "rgba(192,97,74,0.08)";
            } else if (soon) {
              dueBadgeColor = "#f59e0b";
              dueBgColor = "rgba(245,158,11,0.08)";
            }

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  background: "var(--bg-surface)",
                  boxShadow: urgent
                    ? `0 0 0 1px ${LOSS}40, var(--shadow-sm)`
                    : "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                whileHover={{ scale: 1.01 }}
              >
                {/* Card header strip */}
                <div
                  style={{ height: 4, background: meta.color, opacity: 0.8 }}
                />

                <div
                  style={{
                    padding: "18px 20px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Top row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: meta.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          flexShrink: 0,
                        }}
                      >
                        {meta.icon}
                      </div>
                      <div>
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: "var(--text-primary)",
                            marginBottom: 3,
                            lineHeight: 1.2,
                          }}
                        >
                          {p.policyName}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              padding: "2px 8px",
                              borderRadius: 99,
                              background: meta.bg,
                              color: meta.color,
                              fontWeight: 600,
                            }}
                          >
                            {meta.label}
                          </span>
                          <span
                            style={{ fontSize: 11, color: "var(--text-muted)" }}
                          >
                            {p.provider}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn btn-icon"
                      onClick={() => deletePolicy.mutate(p.id)}
                      style={{
                        width: 28,
                        height: 28,
                        color: "var(--danger)",
                        flexShrink: 0,
                        border: "none",
                        background: "transparent",
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Sum insured — hero number */}
                  <div style={{ marginBottom: 16 }}>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: 1.2,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: 4,
                      }}
                    >
                      Sum Insured
                    </p>
                    <p
                      style={{
                        fontFamily: MONO,
                        fontSize: 24,
                        fontWeight: 800,
                        color: "var(--text-primary)",
                        letterSpacing: -0.5,
                      }}
                    >
                      {masked
                        ? "₹ ••••••••"
                        : new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0,
                          }).format(p.sumInsured)}
                    </p>
                  </div>

                  {/* Stats grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "var(--bg-surface-2)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          marginBottom: 3,
                        }}
                      >
                        Premium
                      </p>
                      <p
                        style={{
                          fontFamily: MONO,
                          fontSize: 13,
                          fontWeight: 700,
                          color: LOSS,
                        }}
                      >
                        {masked ? "••••" : fmtINR(p.premiumAmount)}
                      </p>
                      <p
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          marginTop: 1,
                        }}
                      >
                        {p.frequency?.toLowerCase?.()}
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: dueBgColor,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          marginBottom: 3,
                        }}
                      >
                        Next Due
                      </p>
                      <p
                        style={{
                          fontFamily: MONO,
                          fontSize: 13,
                          fontWeight: 700,
                          color: dueBadgeColor,
                        }}
                      >
                        {overdue
                          ? "Overdue"
                          : days === 0
                            ? "Today"
                            : `${days}d`}
                      </p>
                      <p
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          marginTop: 1,
                        }}
                      >
                        {new Date(p.nextDueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Pay premium CTA */}
                  <div style={{ marginTop: "auto" }}>
                    {(overdue || soon) && (
                      <button
                        onClick={() => payPremium.mutate(p.id)}
                        disabled={payPremium.isPending}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          padding: "10px 16px",
                          borderRadius: 10,
                          border: "none",
                          cursor: "pointer",
                          background: overdue
                            ? `linear-gradient(135deg,${LOSS},#e87c6a)`
                            : soon
                              ? "linear-gradient(135deg,#f59e0b,#fbbf24)"
                              : "var(--bg-surface-2)",
                          color:
                            overdue || soon ? "#fff" : "var(--text-primary)",
                          fontSize: 13,
                          fontWeight: 700,
                          boxShadow: overdue
                            ? `0 4px 14px ${LOSS}40`
                            : soon
                              ? "0 4px 14px rgba(245,158,11,0.35)"
                              : "none",
                          transition: "all 0.2s",
                        }}
                      >
                        {payPremium.isPending ? (
                          <>
                            <Loader2
                              size={14}
                              style={{ animation: "spin 1s linear infinite" }}
                            />{" "}
                            Processing…
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} /> Mark Premium as Paid
                          </>
                        )}
                      </button>
                    )}
                    {!overdue && !soon && (
                      <button
                        onClick={() => payPremium.mutate(p.id)}
                        disabled={payPremium.isPending}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          padding: "9px 16px",
                          borderRadius: 10,
                          border: "1px solid var(--border)",
                          cursor: "pointer",
                          background: "transparent",
                          color: "var(--text-secondary)",
                          fontSize: 12,
                          fontWeight: 600,
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "var(--bg-surface-2)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {payPremium.isPending ? (
                          <>
                            <Loader2
                              size={13}
                              style={{ animation: "spin 1s linear infinite" }}
                            />{" "}
                            Processing…
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={13} /> Mark as Paid
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && <AddInsuranceModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════
 *  MODALS
 * ══════════════════════════════════════════════════ */

/**
 * FIX: The original AddStockModal had a null-safety bug.
 * `selected` state could be null when addStock.mutate was called
 * because the disabled guard uses React state which can be stale in
 * closures. Additionally, the `name` was being set incorrectly:
 *   r.primary==='NSE' ? r.secondary : r.primary
 * but r.primary is the TICKER (e.g. "TCS"), never the string "NSE".
 * The company name is r.secondary. Fixed below.
 */
function AddStockModal({ onClose }: { onClose: () => void }) {
  const [exchange, setExchange] = useState<"NSE" | "US" | "CRYPTO">("NSE");
  const [searchQ, setSearchQ] = useState("");
  const [selected, setSelected] = useState<{
    ticker: string;
    name: string;
  } | null>(null);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const { data: results = [] } = useStockSearch(searchQ, exchange);
  const addStock = useAddStock();

  const handleSubmit = () => {
    // ── FIX: explicit null guard before mutating ──
    if (!selected || !qty || !price) return;
    addStock.mutate(
      {
        ticker: selected.ticker,
        exchange,
        companyName: selected.name, // ── FIX: was selected!.name with potential null crash
        quantity: parseFloat(qty),
        avgBuyPrice: parseFloat(price),
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal title="Add Stock / Crypto" onClose={onClose}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["NSE", "US", "CRYPTO"] as const).map((e) => (
          <button
            key={e}
            onClick={() => {
              setExchange(e);
              setSearchQ("");
              setSelected(null);
            }}
            className="btn btn-sm"
            style={{
              flex: 1,
              border: "none",
              background:
                exchange === e ? EXCHANGE_CFG[e].color : "var(--bg-surface-2)",
              color: exchange === e ? "#fff" : "var(--text-secondary)",
              fontSize: 12,
            }}
          >
            {EXCHANGE_CFG[e].emoji} {EXCHANGE_CFG[e].label}
          </button>
        ))}
      </div>
      <SearchDropdown
        label={`Search ${EXCHANGE_CFG[exchange].label}`}
        query={searchQ}
        setQuery={setSearchQ}
        results={(results ?? []).filter(Boolean).map((r: any) => ({
          key: r.ticker ?? r.symbol ?? "",
          primary: r.ticker ?? r.symbol ?? "",
          // ── FIX: company name is always r.name or r.schemeName, not conditional on exchange ──
          secondary: r.name ?? r.companyName ?? r.schemeName ?? "",
        }))}
        onSelect={(r) => {
          setSelected({ ticker: r.key, name: r.secondary || r.key });
          setSearchQ(r.secondary || r.key);
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginTop: 14,
        }}
      >
        <FormField
          label="Quantity"
          value={qty}
          onChange={setQty}
          type="number"
          placeholder="10"
        />
        <FormField
          label="Avg Buy Price (₹)"
          value={price}
          onChange={setPrice}
          type="number"
          placeholder="1500.00"
        />
      </div>
      {/* Show selected ticker confirmation */}
      {selected && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            borderRadius: 8,
            background: "var(--bg-surface-2)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={14} style={{ color: GAIN, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            <strong style={{ color: "var(--text-primary)" }}>
              {selected.ticker}
            </strong>
            {selected.name &&
              selected.name !== selected.ticker &&
              ` — ${selected.name}`}
          </span>
        </div>
      )}
      <ModalActions
        onClose={onClose}
        onSubmit={handleSubmit}
        // ── FIX: safe null check instead of relying on !selected alone ──
        disabled={
          selected === null ||
          !qty ||
          !price ||
          isNaN(parseFloat(qty)) ||
          isNaN(parseFloat(price))
        }
        loading={addStock.isPending}
        label="Add Stock"
      />
    </Modal>
  );
}

function AddMFModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"lumpsum" | "sip">("lumpsum");
  const [searchQ, setSearchQ] = useState("");
  const [selected, setSelected] = useState<{
    schemeCode: string;
    schemeName: string;
  } | null>(null);
  const [f, setF] = useState({
    units: "",
    avgNAV: "",
    investedAt: new Date().toISOString().split("T")[0],
    sipAmount: "",
    sipDay: "5",
    sipStartDate: new Date().toISOString().split("T")[0],
  });
  const { data: results = [] } = useMFSearch(searchQ);
  const addLumpsum = useAddMFLumpsum();
  const addSip = useAddMFSip();

  const submit = () => {
    if (!selected) return;
    if (mode === "lumpsum")
      addLumpsum.mutate(
        {
          schemeCode: selected.schemeCode,
          schemeName: selected.schemeName,
          units: parseFloat(f.units),
          avgNAV: parseFloat(f.avgNAV),
          investedAt: f.investedAt,
        },
        { onSuccess: onClose },
      );
    else
      addSip.mutate(
        {
          schemeCode: selected.schemeCode,
          schemeName: selected.schemeName,
          sipAmount: parseFloat(f.sipAmount),
          sipDay: parseInt(f.sipDay),
          sipStartDate: f.sipStartDate,
        },
        { onSuccess: onClose },
      );
  };

  return (
    <Modal title="Add Mutual Fund" onClose={onClose}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["lumpsum", "sip"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="btn btn-sm"
            style={{
              flex: 1,
              border: "none",
              background:
                mode === m ? "var(--indigo-500)" : "var(--bg-surface-2)",
              color: mode === m ? "#fff" : "var(--text-secondary)",
            }}
          >
            {m === "lumpsum" ? "💰 Lumpsum" : "🔄 SIP"}
          </button>
        ))}
      </div>
      <SearchDropdown
        label="Search Scheme"
        query={searchQ}
        setQuery={setSearchQ}
        results={(results || [])
          .filter(Boolean)
          .map((r: any) => ({
            key: r.schemeCode,
            primary: r.schemeName,
            secondary: `#${r.schemeCode}`,
          }))}
        onSelect={(r) => {
          setSelected({ schemeCode: r.key, schemeName: r.primary });
          setSearchQ(r.primary);
        }}
      />
      {mode === "lumpsum" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginTop: 14,
          }}
        >
          <FormField
            label="Units"
            value={f.units}
            onChange={(v) => setF((p) => ({ ...p, units: v }))}
            type="number"
            placeholder="100.000"
          />
          <FormField
            label="Avg NAV (₹)"
            value={f.avgNAV}
            onChange={(v) => setF((p) => ({ ...p, avgNAV: v }))}
            type="number"
            placeholder="45.50"
          />
          <div style={{ gridColumn: "span 2" }}>
            <FormField
              label="Investment Date"
              value={f.investedAt}
              onChange={(v) => setF((p) => ({ ...p, investedAt: v }))}
              type="date"
            />
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginTop: 14,
          }}
        >
          <FormField
            label="Monthly SIP (₹)"
            value={f.sipAmount}
            onChange={(v) => setF((p) => ({ ...p, sipAmount: v }))}
            type="number"
            placeholder="5000"
          />
          <FormField
            label="SIP Day (1-28)"
            value={f.sipDay}
            onChange={(v) => setF((p) => ({ ...p, sipDay: v }))}
            type="number"
            placeholder="5"
          />
          <div style={{ gridColumn: "span 2" }}>
            <FormField
              label="Start Date"
              value={f.sipStartDate}
              onChange={(v) => setF((p) => ({ ...p, sipStartDate: v }))}
              type="date"
            />
          </div>
        </div>
      )}
      <ModalActions
        onClose={onClose}
        onSubmit={submit}
        disabled={
          !selected ||
          (mode === "lumpsum" ? !f.units || !f.avgNAV : !f.sipAmount)
        }
        loading={addLumpsum.isPending || addSip.isPending}
        label={mode === "sip" ? "Add SIP" : "Add Holding"}
      />
    </Modal>
  );
}

function AddAssetModal({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({ name: "", type: "Property", currentValue: "" });
  const addAsset = useAddAsset();
  const TYPES = ["Property", "Fixed Deposit", "Gold", "Vehicle", "Other"];
  return (
    <Modal title="Add Manual Asset" onClose={onClose}>
      <FormField
        label="Asset Name"
        value={f.name}
        onChange={(v) => setF((p) => ({ ...p, name: v }))}
        placeholder="e.g. Mumbai Apartment"
      />
      <div style={{ marginTop: 14 }}>
        <label style={LS}>Type</label>
        <select
          className="input"
          value={f.type}
          onChange={(e) => setF((p) => ({ ...p, type: e.target.value }))}
        >
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: 14 }}>
        <FormField
          label="Current Value (₹)"
          value={f.currentValue}
          onChange={(v) => setF((p) => ({ ...p, currentValue: v }))}
          type="number"
          placeholder="5000000"
        />
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          Enter value in ₹ — stored in paise internally
        </p>
      </div>
      <ModalActions
        onClose={onClose}
        onSubmit={() =>
          addAsset.mutate(
            {
              name: f.name,
              type: f.type,
              currentValueInCents: Math.round(parseFloat(f.currentValue) * 100),
            },
            { onSuccess: onClose },
          )
        }
        disabled={!f.name || !f.currentValue}
        loading={addAsset.isPending}
        label="Add Asset"
      />
    </Modal>
  );
}

function AddLiabilityModal({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({
    loanName: "",
    category: "Home Loan",
    totalPrincipal: "",
    remainingBalance: "",
    interestRate: "",
    emi: "",
    dueDate: "",
  });
  const addLiability = useAddLiability();
  return (
    <Modal title="Add Liability" onClose={onClose}>
      <FormField
        label="Loan Name"
        value={f.loanName}
        onChange={(v) => setF((p) => ({ ...p, loanName: v }))}
        placeholder="e.g. SBI Home Loan"
      />
      <div style={{ marginTop: 14 }}>
        <label style={LS}>Category</label>
        <select
          className="input"
          value={f.category}
          onChange={(e) => setF((p) => ({ ...p, category: e.target.value }))}
        >
          {LIABILITY_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginTop: 14,
        }}
      >
        <FormField
          label="Total Principal (₹)"
          value={f.totalPrincipal}
          onChange={(v) => setF((p) => ({ ...p, totalPrincipal: v }))}
          type="number"
          placeholder="2000000"
        />
        <FormField
          label="Remaining Balance (₹)"
          value={f.remainingBalance}
          onChange={(v) => setF((p) => ({ ...p, remainingBalance: v }))}
          type="number"
          placeholder="1500000"
        />
        <FormField
          label="Interest Rate (%)"
          value={f.interestRate}
          onChange={(v) => setF((p) => ({ ...p, interestRate: v }))}
          type="number"
          placeholder="8.5"
        />
        <FormField
          label="Monthly EMI (₹) — optional"
          value={f.emi}
          onChange={(v) => setF((p) => ({ ...p, emi: v }))}
          type="number"
          placeholder="18000"
        />
        <div style={{ gridColumn: "span 2" }}>
          <FormField
            label="Next EMI Due Date — optional"
            value={f.dueDate}
            onChange={(v) => setF((p) => ({ ...p, dueDate: v }))}
            type="date"
          />
        </div>
      </div>
      <ModalActions
        onClose={onClose}
        onSubmit={() =>
          addLiability.mutate(
            {
              loanName: f.loanName,
              category: f.category as any,
              totalPrincipalInCents: Math.round(
                parseFloat(f.totalPrincipal) * 100,
              ),
              remainingBalanceInCents: Math.round(
                parseFloat(f.remainingBalance) * 100,
              ),
              interestRate: parseFloat(f.interestRate),
              emiInCents: f.emi
                ? Math.round(parseFloat(f.emi) * 100)
                : undefined,
              dueDate: f.dueDate || undefined,
            },
            { onSuccess: onClose },
          )
        }
        disabled={
          !f.loanName ||
          !f.totalPrincipal ||
          !f.remainingBalance ||
          !f.interestRate
        }
        loading={addLiability.isPending}
        label="Add Liability"
      />
    </Modal>
  );
}

function AddInsuranceModal({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({
    policyName: "",
    provider: "",
    type: "TERM_LIFE",
    sumInsured: "",
    premiumAmount: "",
    frequency: "ANNUAL",
    startDate: new Date().toISOString().split("T")[0],
  });
  const addPolicy = useAddInsurance();
  return (
    <Modal title="Add Insurance Policy" onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ gridColumn: "span 2" }}>
          <FormField
            label="Policy Name"
            value={f.policyName}
            onChange={(v) => setF((p) => ({ ...p, policyName: v }))}
            placeholder="e.g. Max Life Term Plan"
          />
        </div>
        <div>
          <FormField
            label="Provider"
            value={f.provider}
            onChange={(v) => setF((p) => ({ ...p, provider: v }))}
            placeholder="e.g. Max Life"
          />
        </div>
        <div>
          <label style={LS}>Type</label>
          <select
            className="input"
            value={f.type}
            onChange={(e) => setF((p) => ({ ...p, type: e.target.value }))}
          >
            {Object.entries(POLICY_META).map(([k, v]) => (
              <option key={k} value={k}>
                {v.icon} {v.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FormField
            label="Sum Insured (₹)"
            value={f.sumInsured}
            onChange={(v) => setF((p) => ({ ...p, sumInsured: v }))}
            type="number"
            placeholder="10000000"
          />
        </div>
        <div>
          <label style={LS}>Frequency</label>
          <select
            className="input"
            value={f.frequency}
            onChange={(e) => setF((p) => ({ ...p, frequency: e.target.value }))}
          >
            {[
              ["ANNUAL", "Annual"],
              ["SEMI_ANNUAL", "Semi-Annual"],
              ["QUARTERLY", "Quarterly"],
              ["MONTHLY", "Monthly"],
            ].map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FormField
            label="Premium Amount (₹)"
            value={f.premiumAmount}
            onChange={(v) => setF((p) => ({ ...p, premiumAmount: v }))}
            type="number"
            placeholder="12000"
          />
        </div>
        <div>
          <FormField
            label="Start Date"
            value={f.startDate}
            onChange={(v) => setF((p) => ({ ...p, startDate: v }))}
            type="date"
          />
        </div>
      </div>
      <ModalActions
        onClose={onClose}
        onSubmit={() =>
          addPolicy.mutate(
            {
              policyName: f.policyName,
              provider: f.provider,
              type: f.type as any,
              frequency: f.frequency as any,
              sumInsuredInCents: Math.round(parseFloat(f.sumInsured) * 100),
              premiumInCents: Math.round(parseFloat(f.premiumAmount) * 100),
              startDate: f.startDate,
            },
            { onSuccess: onClose },
          )
        }
        disabled={
          !f.policyName || !f.provider || !f.sumInsured || !f.premiumAmount
        }
        loading={addPolicy.isPending}
        label="Add Policy"
      />
    </Modal>
  );
}

/* ── Shared UI primitives ────────────────────────── */
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" style={{ maxWidth: 520 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: "var(--text-primary)",
            }}
          >
            {title}
          </h2>
          <button
            className="btn btn-icon"
            onClick={onClose}
            style={{ width: 30, height: 30 }}
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

function SearchDropdown({
  label,
  query,
  setQuery,
  results,
  onSelect,
}: {
  label: string;
  query: string;
  setQuery: (v: string) => void;
  results: { key: string; primary: string; secondary: string }[];
  onSelect: (r: { key: string; primary: string; secondary: string }) => void;
}) {
  return (
    <div>
      <label style={LS}>{label}</label>
      <div style={{ position: "relative" }}>
        <Search
          size={13}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
          }}
        />
        <input
          className="input"
          style={{ paddingLeft: 34 }}
          placeholder="Type to search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {results.length > 0 && (
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 10,
            marginTop: 4,
            maxHeight: 160,
            overflowY: "auto",
            background: "var(--bg-surface)",
          }}
        >
          {results.map((r) => (
            <button
              key={r.key}
              onClick={() => onSelect(r)}
              style={{
                display: "block",
                width: "100%",
                padding: "9px 14px",
                textAlign: "left",
                background: "none",
                border: "none",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--text-primary)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-surface-2)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <span style={{ fontWeight: 600 }}>{r.primary}</span>
              <span
                style={{
                  color: "var(--text-muted)",
                  marginLeft: 8,
                  fontSize: 11,
                }}
              >
                {r.secondary}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={LS}>{label}</label>
      <input
        className="input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ModalActions({
  onClose,
  onSubmit,
  disabled,
  loading,
  label,
}: {
  onClose: () => void;
  onSubmit: () => void;
  disabled: boolean;
  loading: boolean;
  label: string;
}) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
      <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
        Cancel
      </button>
      <button
        className="btn btn-primary"
        style={{ flex: 2 }}
        onClick={onSubmit}
        disabled={disabled || loading}
      >
        {loading ? "Saving…" : label}
      </button>
    </div>
  );
}

function EmptyState({
  icon,
  message,
  action,
  actionLabel,
}: {
  icon: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div
      className="card"
      style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}
    >
      <p style={{ fontSize: 36, marginBottom: 12 }}>{icon}</p>
      <p
        style={{
          fontWeight: 600,
          fontSize: 14,
          marginBottom: 4,
          color: "var(--text-secondary)",
        }}
      >
        {message}
      </p>
      {action && actionLabel && (
        <button
          className="btn btn-primary btn-sm"
          style={{ marginTop: 16 }}
          onClick={action}
        >
          <Plus size={13} /> {actionLabel}
        </button>
      )}
    </div>
  );
}

const LS: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
  color: "var(--text-primary)",
};

/* ══════════════════════════════════════════════════
 *  MAIN PAGE
 * ══════════════════════════════════════════════════ */
export default function WealthPage() {
  const { data, isLoading, isError, refetch, isFetching } = useWealth();
  const { isMasked, togglePrivacyMode } = useWealthStore();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          gap: 12,
          color: "var(--text-muted)",
        }}
      >
        <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
        Loading your wealth data…
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
        }}
      >
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 16,
            padding: "24px 32px",
            color: "var(--danger)",
            textAlign: "center",
          }}
        >
          <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
            Failed to load wealth data
          </p>
          <p style={{ fontSize: 13, opacity: 0.8 }}>
            Ensure the backend is running and you are logged in.
          </p>
          <button
            className="btn btn-sm btn-ghost"
            style={{ marginTop: 12 }}
            onClick={() => refetch()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Wealth & Investments</h1>
          <p className="page-subtitle">
            Your complete financial picture — single source of truth
          </p>
        </div>
      </div>

      <NetWorthHeader
        data={data}
        masked={isMasked}
        onToggleMask={togglePrivacyMode}
        onSync={() => refetch()}
        syncing={isFetching}
      />

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          background: "var(--bg-surface-2)",
          padding: 4,
          borderRadius: 14,
          width: "fit-content",
          overflowX: "auto",
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 16px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                background: active ? "var(--bg-surface)" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: active ? "var(--shadow-sm)" : "none",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && (
            <OverviewTab data={data} masked={isMasked} />
          )}
          {activeTab === "stocks" && (
            <StocksTab data={data} masked={isMasked} />
          )}
          {activeTab === "mutual-funds" && (
            <MutualFundsTab data={data} masked={isMasked} />
          )}
          {activeTab === "assets" && (
            <AssetsTab data={data} masked={isMasked} />
          )}
          {activeTab === "liabilities" && (
            <LiabilitiesTab data={data} masked={isMasked} />
          )}
          {activeTab === "insurance" && (
            <InsuranceTab data={data} masked={isMasked} />
          )}
        </motion.div>
      </AnimatePresence>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
