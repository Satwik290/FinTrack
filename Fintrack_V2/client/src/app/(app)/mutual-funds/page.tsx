"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ChevronDown,
  X,
  Search,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  useMFPortfolio,
  useMFSearch,
  useMFNavHistory,
  useAddMFLumpsum,
  useAddMFSip,
  useDeleteMFHolding,
  type MFHolding,
} from "@/hooks/useMutualFunds";

/* ── Formatters ─────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
const fmtNav = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

/* ── Summary stat ───────────────────────────────── */
function SummaryTile({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "green" | "red" | "neutral";
}) {
  const color =
    highlight === "green"
      ? "var(--success)"
      : highlight === "red"
        ? "var(--danger)"
        : "var(--text-primary)";
  return (
    <div className="card" style={{ padding: 20 }}>
      <p
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          marginBottom: 6,
          fontWeight: 500,
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: -0.5 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── NAV History Chart ───────────────────────────── */
function NavChart({
  schemeCode,
  schemeName,
}: {
  schemeCode: string;
  schemeName: string;
}) {
  const [period, setPeriod] = useState<"1Y" | "3Y" | "5Y">("1Y");
  const { data = [], isLoading } = useMFNavHistory(schemeCode, period);

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          NAV History
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          {(["1Y", "3Y", "5Y"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="btn btn-sm"
              style={{
                padding: "4px 10px",
                fontSize: 12,
                background:
                  period === p ? "var(--indigo-500)" : "var(--bg-surface-2)",
                color: period === p ? "#fff" : "var(--text-secondary)",
                border: "none",
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
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
          }}
        >
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : data.length === 0 ? (
        <div
          style={{
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            fontSize: 13,
          }}
        >
          No history available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`navGrad-${schemeCode}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
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
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(d) => {
                const p = d.split("-");
                return `${p[0]}-${p[1]}`;
              }}
              interval="preserveStartEnd"
            />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 12,
              }}
              // Fix: Explicitly cast 'v' to any or number to satisfy Recharts Tooltip types
              formatter={(v: any) => [fmtNav(v as number), "NAV"]}
            />
            <Area
              type="monotone"
              dataKey="nav"
              stroke="#6366f1"
              strokeWidth={2}
              fill={`url(#navGrad-${schemeCode})`}
              dot={false}
              activeDot={{ r: 4, fill: "#6366f1" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/* ── Holding Card ────────────────────────────────── */
function HoldingCard({
  h,
  onDelete,
}: {
  h: MFHolding;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isGain = h.pnl >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: 20 }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            flexShrink: 0,
            background: "rgba(99,102,241,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          {h.isSIP ? "🔄" : "📈"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "var(--text-primary)",
              }}
            >
              {h.schemeName}
            </p>
            {h.isSIP && (
              <span className="badge badge-indigo" style={{ fontSize: 11 }}>
                SIP ₹{(h.sipAmount ?? 0).toLocaleString("en-IN")}/mo
              </span>
            )}
            <span className="badge badge-info" style={{ fontSize: 10 }}>
              {h.category}
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            {h.fundHouse}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {/* P&L badge */}
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 13,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 99,
              background: isGain
                ? "rgba(16,185,129,0.12)"
                : "rgba(239,68,68,0.12)",
              color: isGain ? "var(--success)" : "var(--danger)",
            }}
          >
            {isGain ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {h.pnlPct >= 0 ? "+" : ""}
            {h.pnlPct.toFixed(2)}%
          </span>
          <button
            className="btn btn-icon"
            onClick={() => setExpanded((e) => !e)}
            style={{ width: 28, height: 28 }}
          >
            <ChevronDown
              size={14}
              style={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </button>
          <button
            className="btn btn-icon"
            onClick={() => onDelete(h.id)}
            style={{ width: 28, height: 28, color: "var(--danger)" }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Key numbers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginTop: 16,
        }}
      >
        {[
          { label: "Invested", value: fmt(h.investedAmount) },
          { label: "Current", value: fmt(h.currentValue) },
          {
            label: "P&L",
            value: `${h.pnl >= 0 ? "+" : ""}${fmt(h.pnl)}`,
            color: isGain ? "var(--success)" : "var(--danger)",
          },
          { label: "NAV", value: fmtNav(h.currentNAV) },
        ].map((item) => (
          <div key={item.label} style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 2,
              }}
            >
              {item.label}
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: (item as any).color ?? "var(--text-primary)",
              }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* SIP info */}
      {h.isSIP && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 10,
            background: "var(--bg-surface-2)",
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            📅 Next SIP: <strong>{h.nextSipDate ?? "—"}</strong>
          </span>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Installments: <strong>{h.totalSipInstallments}</strong>
          </span>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Units: <strong>{h.units.toFixed(3)}</strong>
          </span>
        </div>
      )}

      {/* Expanded NAV chart */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <NavChart schemeCode={h.schemeCode} schemeName={h.schemeName} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Add Holding Modal ───────────────────────────── */
function AddHoldingModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"lumpsum" | "sip">("lumpsum");
  const [searchQ, setSearchQ] = useState("");
  const [selected, setSelected] = useState<{
    schemeCode: string;
    schemeName: string;
  } | null>(null);

  const { data: searchResults = [], isLoading: searching } =
    useMFSearch(searchQ);
  const addLumpsum = useAddMFLumpsum();
  const addSip = useAddMFSip();

  const [form, setForm] = useState({
    units: "",
    avgNAV: "",
    investedAt: new Date().toISOString().split("T")[0],
    sipAmount: "",
    sipDay: "5",
    sipStartDate: new Date().toISOString().split("T")[0],
  });

  function handleSubmit() {
    if (!selected) return;
    if (mode === "lumpsum") {
      addLumpsum.mutate(
        {
          schemeCode: selected.schemeCode,
          schemeName: selected.schemeName,
          units: parseFloat(form.units),
          avgNAV: parseFloat(form.avgNAV),
          investedAt: form.investedAt,
        },
        { onSuccess: onClose },
      );
    } else {
      addSip.mutate(
        {
          schemeCode: selected.schemeCode,
          schemeName: selected.schemeName,
          sipAmount: parseFloat(form.sipAmount),
          sipDay: parseInt(form.sipDay),
          sipStartDate: form.sipStartDate,
        },
        { onSuccess: onClose },
      );
    }
  }

  const isPending = addLumpsum.isPending || addSip.isPending;

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
              fontSize: 20,
              color: "var(--text-primary)",
            }}
          >
            Add Mutual Fund
          </h2>
          <button
            className="btn btn-icon"
            onClick={onClose}
            style={{ width: 32, height: 32 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["lumpsum", "sip"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="btn btn-sm"
              style={{
                flex: 1,
                background:
                  mode === m ? "var(--indigo-500)" : "var(--bg-surface-2)",
                color: mode === m ? "#fff" : "var(--text-secondary)",
                border: "none",
                textTransform: "capitalize",
              }}
            >
              {m === "lumpsum" ? "💰 Lumpsum" : "🔄 SIP"}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <label style={L}>Search Fund</label>
          <div style={{ position: "relative" }}>
            <Search
              size={14}
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
              style={{ paddingLeft: 36 }}
              placeholder="e.g. HDFC Mid Cap, Axis Bluechip…"
              value={searchQ}
              onChange={(e) => {
                setSearchQ(e.target.value);
                setSelected(null);
              }}
            />
          </div>
          {searching && (
            <p
              style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}
            >
              Searching…
            </p>
          )}
          {searchResults.length > 0 && !selected && (
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                marginTop: 4,
                maxHeight: 180,
                overflowY: "auto",
                background: "var(--bg-surface)",
              }}
            >
              {searchResults.map((r) => (
                <button
                  key={r.schemeCode}
                  onClick={() => {
                    setSelected(r);
                    setSearchQ(r.schemeName);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 14px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "var(--text-primary)",
                    borderBottom: "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-surface-2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <span style={{ fontWeight: 500 }}>{r.schemeName}</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginLeft: 8,
                    }}
                  >
                    #{r.schemeCode}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lumpsum fields */}
        {mode === "lumpsum" && (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div>
              <label style={L}>Units purchased</label>
              <input
                className="input"
                type="number"
                step="0.001"
                placeholder="100.000"
                value={form.units}
                onChange={(e) =>
                  setForm((f) => ({ ...f, units: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={L}>Avg. purchase NAV (₹)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                placeholder="45.50"
                value={form.avgNAV}
                onChange={(e) =>
                  setForm((f) => ({ ...f, avgNAV: e.target.value }))
                }
              />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={L}>Investment date</label>
              <input
                className="input"
                type="date"
                value={form.investedAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, investedAt: e.target.value }))
                }
              />
            </div>
          </div>
        )}

        {/* SIP fields */}
        {mode === "sip" && (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div>
              <label style={L}>Monthly SIP amount (₹)</label>
              <input
                className="input"
                type="number"
                placeholder="5000"
                value={form.sipAmount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sipAmount: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={L}>SIP date (day of month)</label>
              <input
                className="input"
                type="number"
                min={1}
                max={28}
                placeholder="5"
                value={form.sipDay}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sipDay: e.target.value }))
                }
              />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={L}>SIP start date</label>
              <input
                className="input"
                type="date"
                value={form.sipStartDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sipStartDate: e.target.value }))
                }
              />
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            className="btn btn-ghost"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 2 }}
            onClick={handleSubmit}
            disabled={!selected || isPending}
          >
            {isPending
              ? "Saving…"
              : `Add ${mode === "sip" ? "SIP" : "Holding"}`}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Page ───────────────────────────────────── */
export default function MutualFundsPage() {
  const { data, isLoading, isError } = useMFPortfolio();
  const deleteMF = useDeleteMFHolding();
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "lumpsum" | "sip">(
    "all",
  );

  const portfolio = data ?? {
    holdings: [],
    summary: {
      totalInvested: 0,
      totalCurrent: 0,
      totalPnl: 0,
      totalPnlPct: 0,
      holdingsCount: 0,
    },
  };
  const { summary } = portfolio;
  const isGain = summary.totalPnl >= 0;

  const filtered = portfolio.holdings.filter((h) =>
    filterType === "all" ? true : filterType === "sip" ? h.isSIP : !h.isSIP,
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Mutual Funds</h1>
          <p className="page-subtitle">
            Powered by MFAPI.in · NAV updated daily · All values in ₹
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={17} /> Add Fund
        </button>
      </div>

      {/* Summary tiles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <SummaryTile
          label="Total Invested"
          value={fmt(summary.totalInvested)}
        />
        <SummaryTile
          label="Current Value"
          value={fmt(summary.totalCurrent)}
          highlight="neutral"
        />
        <SummaryTile
          label="Total P&L"
          value={`${summary.totalPnl >= 0 ? "+" : ""}${fmt(summary.totalPnl)}`}
          sub={`${summary.totalPnlPct >= 0 ? "+" : ""}${summary.totalPnlPct.toFixed(2)}%`}
          highlight={isGain ? "green" : "red"}
        />
        <SummaryTile
          label="Holdings"
          value={String(summary.holdingsCount)}
          sub="schemes"
        />
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["all", "lumpsum", "sip"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className="btn btn-sm"
            style={{
              background:
                filterType === f ? "var(--indigo-500)" : "var(--bg-surface-2)",
              color: filterType === f ? "#fff" : "var(--text-secondary)",
              border: "none",
              textTransform: "capitalize",
            }}
          >
            {f === "all" ? "All" : f === "sip" ? "🔄 SIP" : "💰 Lumpsum"}
          </button>
        ))}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 12,
            color: "var(--text-muted)",
            alignSelf: "center",
          }}
        >
          {filtered.length} fund{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* States */}
      {isLoading && (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />{" "}
          Loading portfolio…
        </div>
      )}
      {isError && (
        <div
          style={{ padding: 48, textAlign: "center", color: "var(--danger)" }}
        >
          Failed to load. Is the server running?
        </div>
      )}
      {!isLoading && !isError && filtered.length === 0 && (
        <div
          className="card"
          style={{
            padding: 48,
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <p style={{ fontSize: 32, marginBottom: 12 }}>📊</p>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>
            No mutual fund holdings yet
          </p>
          <p style={{ fontSize: 13 }}>
            Add a lumpsum or SIP investment to get started
          </p>
        </div>
      )}

      {/* Holdings */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map((h, i) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <HoldingCard h={h} onDelete={(id) => deleteMF.mutate(id)} />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && <AddHoldingModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const L: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
  color: "var(--text-primary)",
};
