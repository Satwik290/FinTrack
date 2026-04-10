"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  MoreVertical,
  Pencil,
  Trash2,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  ArrowUpCircle,
  Flame,
  Trophy,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

/* ── Types ── */
interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  icon: string;
  color: string;
}

type SortKey = "deadline" | "progress" | "name" | "target";
type FilterKey = "all" | "on-track" | "at-risk" | "completed";

/* ── Utilities ── */
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const calcDaysLeft = (deadline: string) =>
  Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);

const PRESET_COLORS = [
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#0ea5e9",
  "#14b8a6",
];
const PRESET_ICONS = [
  "🎯",
  "🛡️",
  "✈️",
  "💻",
  "🚗",
  "🏠",
  "🎓",
  "👶",
  "💍",
  "📈",
  "🌍",
  "🏋️",
];

/* ── Circular Progress ── */
function CircularProgress({
  pct,
  color,
  size = 76,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const sw = 7;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <div
      style={{ width: size, height: size, position: "relative", flexShrink: 0 }}
      className="flex items-center justify-center"
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={sw}
          className="text-gray-200 dark:text-gray-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div
        style={{ position: "absolute", inset: 0 }}
        className="flex items-center justify-center"
      >
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct}%</span>
      </div>
    </div>
  );
}

/* ── Skeleton Card ── */
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 animate-pulse">
      <div className="flex justify-between items-start mb-5">
        <div className="space-y-2 flex-1">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="w-28 h-4 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
          <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full ml-3" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="w-14 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-14 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
  );
}

/* ── Progress Update Modal ── */
function ProgressModal({
  goal,
  onClose,
  onSubmit,
  isPending,
}: {
  goal: Goal;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  isPending: boolean;
}) {
  const [amount, setAmount] = useState(goal.current);
  const pct =
    goal.target > 0
      ? Math.min(Math.round((amount / goal.target) * 100), 100)
      : 0;

  return (
    /* Using a min-height wrapper instead of fixed to avoid iframe collapse issues */
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
        }}
      />
      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 360,
        }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden"
      >
        {/* Colored top bar */}
        <div style={{ height: 3, background: goal.color }} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${goal.color}18` }}
              >
                {goal.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  {goal.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Update saved amount
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Amount input */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">
              Amount Saved
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
                ₹
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-base font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Live progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <span>{fmtCurrency(amount)} saved</span>
              <span style={{ color: goal.color, fontWeight: 700 }}>{pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.3 }}
                style={{
                  height: "100%",
                  borderRadius: 999,
                  background: goal.color,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>₹0</span>
              <span>{fmtCurrency(goal.target)}</span>
            </div>
          </div>

          {/* Quick percentages */}
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            {[25, 50, 75, 100].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(Math.round((goal.target * p) / 100))}
                className="py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-transparent"
              >
                {p}%
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(amount)}
              disabled={isPending}
              style={{ background: goal.color }}
              className="flex-[2] py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity hover:opacity-90"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Save Progress"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Goal Card ── */
function GoalCard({
  g,
  i,
  onEdit,
  onDelete,
  onUpdateProgress,
}: {
  g: Goal;
  i: number;
  onEdit: (g: Goal) => void;
  onDelete: (id: string) => void;
  onUpdateProgress: (g: Goal) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const pct =
    g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
  const daysLeft = calcDaysLeft(g.deadline);
  const isComplete = pct >= 100;
  const isAtRisk = daysLeft <= 30 && daysLeft > 0 && !isComplete;
  const isOverdue = daysLeft <= 0 && !isComplete;

  const stripColor = isComplete
    ? "#10b981"
    : isOverdue
      ? "#ef4444"
      : isAtRisk
        ? "#f59e0b"
        : g.color;
  const circColor = isComplete ? "#10b981" : g.color;

  return (
    <motion.div
      key={g.id}
      layoutId={`goal-${g.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05, duration: 0.3 }}
      style={{ position: "relative" }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Status strip — sits above card, no overflow issues */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          borderRadius: "16px 16px 0 0",
          background: stripColor,
        }}
      />

      <div style={{ padding: "20px 20px 16px" }}>
        {/* Row 1: icon + badges + menu + circular */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 14,
          }}
        >
          {/* Left column: icon, badges, title, days */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: `${g.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                {g.icon}
              </div>
              {isComplete && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "rgba(16,185,129,0.12)",
                    color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.2)",
                  }}
                >
                  <CheckCircle2 size={10} /> Done
                </span>
              )}
              {isAtRisk && !isComplete && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "rgba(245,158,11,0.12)",
                    color: "#f59e0b",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}
                >
                  <Clock size={10} /> At Risk
                </span>
              )}
              {isOverdue && !isComplete && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "rgba(239,68,68,0.12)",
                    color: "#ef4444",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <AlertCircle size={10} /> Overdue
                </span>
              )}
            </div>

            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                lineHeight: 1.3,
                marginBottom: 4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              className="text-gray-900 dark:text-white"
            >
              {g.title}
            </h3>

            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {isOverdue ? (
                <AlertCircle size={11} color="#ef4444" />
              ) : (
                <Clock size={11} className="text-gray-400" />
              )}
              <span
                style={{ fontSize: 11 }}
                className={
                  isOverdue
                    ? "text-red-500"
                    : isAtRisk
                      ? "text-amber-500"
                      : "text-gray-500 dark:text-gray-400"
                }
              >
                {isOverdue
                  ? "Past due"
                  : daysLeft === 0
                    ? "Due today"
                    : `${daysLeft} days left`}
              </span>
            </div>
          </div>

          {/* Right: circular progress + 3-dot stacked vertically */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
              flexShrink: 0,
            }}
          >
            {/* 3-dot menu */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: "1px solid",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  background: "transparent",
                  transition: "all 0.15s",
                }}
                className="border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <MoreVertical size={14} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div
                      style={{ position: "fixed", inset: 0, zIndex: 40 }}
                      onClick={() => setMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -6 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 6px)",
                        width: 160,
                        zIndex: 50,
                        background: "var(--menu-bg)",
                        border: "1px solid var(--menu-border)",
                        borderRadius: 12,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                        overflow: "hidden",
                        paddingTop: 4,
                        paddingBottom: 4,
                      }}
                      className="[--menu-bg:white] dark:[--menu-bg:#1f2937] [--menu-border:#f3f4f6] dark:[--menu-border:#374151]"
                    >
                      {[
                        {
                          icon: ArrowUpCircle,
                          label: "Update Progress",
                          color: "#6366f1",
                          onClick: () => {
                            onUpdateProgress(g);
                            setMenuOpen(false);
                          },
                        },
                        {
                          icon: Pencil,
                          label: "Edit Goal",
                          color: undefined,
                          onClick: () => {
                            onEdit(g);
                            setMenuOpen(false);
                          },
                        },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={item.onClick}
                          style={{
                            width: "100%",
                            padding: "8px 14px",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 13,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "background 0.1s",
                            color: item.color,
                          }}
                          className={
                            item.color ? "" : "text-gray-700 dark:text-gray-200"
                          }
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--menu-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <item.icon size={13} />
                          {item.label}
                        </button>
                      ))}
                      <div
                        style={{ height: 1, margin: "4px 0" }}
                        className="bg-gray-100 dark:bg-gray-700"
                      />
                      <button
                        onClick={() => {
                          onDelete(g.id);
                          setMenuOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 13,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          color: "#ef4444",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(239,68,68,0.07)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <CircularProgress pct={pct} color={circColor} size={72} />
          </div>
        </div>

        {/* Row 2: amounts + progress bar */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <div>
              <p
                style={{ fontSize: 10, marginBottom: 1 }}
                className="text-gray-400"
              >
                Saved
              </p>
              <p
                style={{ fontSize: 13, fontWeight: 700 }}
                className="text-gray-900 dark:text-white"
              >
                {fmtCurrency(g.current)}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{ fontSize: 10, marginBottom: 1 }}
                className="text-gray-400"
              >
                Target
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af" }}>
                {fmtCurrency(g.target)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{ height: 6, borderRadius: 999, overflow: "hidden" }}
            className="bg-gray-100 dark:bg-gray-800"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                height: "100%",
                borderRadius: 999,
                background: isComplete
                  ? "linear-gradient(90deg,#10b981,#34d399)"
                  : `linear-gradient(90deg,${g.color},${g.color}cc)`,
              }}
            />
          </div>

          {/* Bottom row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <span style={{ fontSize: 11 }} className="text-gray-400">
              {g.target - g.current > 0
                ? `${fmtCurrency(g.target - g.current)} to go`
                : "🎉 Goal reached!"}
            </span>
            <button
              onClick={() => onUpdateProgress(g)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: g.color,
                padding: "2px 0",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <ArrowUpCircle size={12} /> Update
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function GoalsPage() {
  const [modalMode, setModalMode] = useState<"closed" | "create" | "edit">(
    "closed",
  );
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [progressGoal, setProgressGoal] = useState<Goal | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("deadline");
  const [filterKey, setFilterKey] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const watchedColor = watch("color", PRESET_COLORS[0]);
  const watchedIcon = watch("icon", PRESET_ICONS[0]);

  /* ── API ── */
  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await api.get("/goals");
      return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
    },
  });

  const createGoal = useMutation({
    mutationFn: async (dto: any) => (await api.post("/goals", dto)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      closeModal();
    },
  });
  const updateGoal = useMutation({
    mutationFn: async (dto: any) =>
      (await api.patch(`/goals/${selectedGoal?.id}`, dto)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      closeModal();
    },
  });
  const deleteGoal = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/goals/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });
  const updateProgress = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) =>
      (await api.patch(`/goals/${id}/progress`, { amount })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setProgressGoal(null);
    },
  });

  /* ── Stats ── */
  const stats = useMemo(() => {
    if (!goals.length)
      return { totalTarget: 0, totalCurrent: 0, completed: 0, inProgress: 0 };
    return {
      totalTarget: goals.reduce((s, g) => s + g.target, 0),
      totalCurrent: goals.reduce((s, g) => s + g.current, 0),
      completed: goals.filter((g) => g.current >= g.target).length,
      inProgress: goals.filter(
        (g) => g.current < g.target && calcDaysLeft(g.deadline) > 0,
      ).length,
    };
  }, [goals]);

  /* ── Filtered + sorted ── */
  const displayed = useMemo(() => {
    let list = [...goals];
    if (searchQuery)
      list = list.filter((g) =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    if (filterKey === "completed")
      list = list.filter((g) => g.current >= g.target);
    else if (filterKey === "on-track")
      list = list.filter(
        (g) => calcDaysLeft(g.deadline) > 30 && g.current < g.target,
      );
    else if (filterKey === "at-risk") {
      list = list.filter((g) => {
        const d = calcDaysLeft(g.deadline);
        return d <= 30 && d > 0 && g.current < g.target;
      });
    }
    list.sort((a, b) => {
      if (sortKey === "deadline")
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (sortKey === "progress")
        return b.current / b.target - a.current / a.target;
      if (sortKey === "name") return a.title.localeCompare(b.title);
      if (sortKey === "target") return b.target - a.target;
      return 0;
    });
    return list;
  }, [goals, searchQuery, filterKey, sortKey]);

  /* ── Handlers ── */
  const openCreate = () => {
    reset();
    setValue("color", PRESET_COLORS[0]);
    setValue("icon", PRESET_ICONS[0]);
    setModalMode("create");
  };
  const openEdit = (g: Goal) => {
    setSelectedGoal(g);
    setValue("title", g.title);
    setValue("target", g.target);
    setValue("deadline", g.deadline.split("T")[0]);
    setValue("icon", g.icon);
    setValue("color", g.color);
    setModalMode("edit");
  };
  const closeModal = () => {
    setModalMode("closed");
    setSelectedGoal(null);
    reset();
  };

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      target: Number(data.target),
      deadline: new Date(data.deadline).toISOString(),
    };
    if (modalMode === "create") createGoal.mutate(payload);
    else updateGoal.mutate(payload);
  };

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "on-track", label: "On Track" },
    { key: "at-risk", label: "At Risk" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px" }}>
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: -0.5,
              marginBottom: 4,
            }}
            className="text-gray-900 dark:text-white"
          >
            Financial Goals
          </h1>
          <p
            style={{ fontSize: 13 }}
            className="text-gray-500 dark:text-gray-400"
          >
            Track milestones toward your financial freedom.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 18px",
            borderRadius: 12,
            border: "none",
            background: "#6366f1",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#4f46e5";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#6366f1";
          }}
        >
          <Plus size={15} /> New Goal
        </button>
      </div>

      {/* ── Stats row ── */}
      {!isLoading && goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 10,
            marginBottom: 20,
          }}
        >
          {[
            {
              icon: Target,
              iconColor: "#6366f1",
              bg: "rgba(99,102,241,0.1)",
              label: "Total Target",
              val: fmtCurrency(stats.totalTarget),
            },
            {
              icon: TrendingUp,
              iconColor: "#10b981",
              bg: "rgba(16,185,129,0.1)",
              label: "Total Saved",
              val: fmtCurrency(stats.totalCurrent),
            },
            {
              icon: Trophy,
              iconColor: "#f59e0b",
              bg: "rgba(245,158,11,0.1)",
              label: "Completed",
              val: `${stats.completed} goal${stats.completed !== 1 ? "s" : ""}`,
            },
            {
              icon: Flame,
              iconColor: "#ef4444",
              bg: "rgba(239,68,68,0.1)",
              label: "In Progress",
              val: `${stats.inProgress} active`,
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding: "14px 16px",
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <s.icon size={17} color={s.iconColor} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{ fontSize: 11, marginBottom: 2 }}
                  className="text-gray-500 dark:text-gray-400"
                >
                  {s.label}
                </p>
                <p
                  style={{ fontSize: 14, fontWeight: 700 }}
                  className="text-gray-900 dark:text-white truncate"
                >
                  {s.val}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Controls ── */}
      {!isLoading && goals.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 20,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div
            style={{
              position: "relative",
              minWidth: 180,
              flex: "1 1 180px",
              maxWidth: 260,
            }}
          >
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search goals…"
              style={{
                width: "100%",
                paddingLeft: 32,
                paddingRight: 12,
                paddingTop: 8,
                paddingBottom: 8,
                fontSize: 13,
                borderRadius: 10,
                border: "1px solid",
                background: "transparent",
                outline: "none",
              }}
              className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Filter tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 4,
              borderRadius: 12,
              flexShrink: 0,
            }}
            className="bg-gray-100 dark:bg-gray-800"
          >
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterKey(f.key)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: filterKey === f.key ? undefined : "transparent",
                  color: filterKey === f.key ? undefined : undefined,
                }}
                className={
                  filterKey === f.key
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            style={{
              padding: "8px 12px",
              fontSize: 12,
              borderRadius: 10,
              border: "1px solid",
              background: "transparent",
              cursor: "pointer",
              outline: "none",
              flexShrink: 0,
            }}
            className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            <option value="deadline">Deadline ↑</option>
            <option value="progress">Progress ↓</option>
            <option value="name">Name A–Z</option>
            <option value="target">Target ↓</option>
          </select>
        </div>
      )}

      {/* ── Goals Grid ── */}
      {isLoading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : goals.length === 0 ? (
        <div
          style={{
            padding: "64px 24px",
            textAlign: "center",
            border: "2px dashed",
            borderRadius: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
          className="border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30"
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              background: "rgba(99,102,241,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Target size={26} color="#6366f1" />
          </div>
          <div>
            <h3
              style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}
              className="text-gray-900 dark:text-white"
            >
              No goals yet
            </h3>
            <p
              style={{ fontSize: 13 }}
              className="text-gray-500 dark:text-gray-400"
            >
              Set financial milestones and track your progress.
            </p>
          </div>
          <button
            onClick={openCreate}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#6366f1",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Create your first goal →
          </button>
        </div>
      ) : displayed.length === 0 ? (
        <div
          style={{ padding: 48, textAlign: "center", fontSize: 14 }}
          className="text-gray-500 dark:text-gray-400"
        >
          No goals match your filters.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {displayed.map((g, i) => (
            <GoalCard
              key={g.id}
              g={g}
              i={i}
              onEdit={openEdit}
              onDelete={(id) => deleteGoal.mutate(id)}
              onUpdateProgress={setProgressGoal}
            />
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <AnimatePresence>
        {modalMode !== "closed" && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(4px)",
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                maxWidth: 420,
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden"
            >
              {/* Colored top bar */}
              <div
                style={{
                  height: 3,
                  background: `linear-gradient(90deg, ${watchedColor}, ${watchedColor}99)`,
                }}
              />

              <div style={{ padding: "20px 22px 22px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 18,
                  }}
                >
                  <h2
                    style={{ fontSize: 16, fontWeight: 700 }}
                    className="text-gray-900 dark:text-white"
                  >
                    {modalMode === "create" ? "New Goal" : "Edit Goal"}
                  </h2>
                  <button
                    onClick={closeModal}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "none",
                      cursor: "pointer",
                      background: "transparent",
                    }}
                    className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    {/* Title */}
                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          display: "block",
                          marginBottom: 6,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                        className="text-gray-500 dark:text-gray-400"
                      >
                        Goal Name
                      </label>
                      <input
                        {...register("title", { required: true })}
                        placeholder="e.g. Emergency Fund"
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: 10,
                          border: "1px solid",
                          fontSize: 13,
                          outline: "none",
                          background: "transparent",
                        }}
                        className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-400 dark:focus:border-indigo-500"
                      />
                    </div>

                    {/* Target + Deadline */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            display: "block",
                            marginBottom: 6,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                          className="text-gray-500 dark:text-gray-400"
                        >
                          Target ₹
                        </label>
                        <input
                          {...register("target", { required: true })}
                          type="number"
                          placeholder="100000"
                          style={{
                            width: "100%",
                            padding: "9px 12px",
                            borderRadius: 10,
                            border: "1px solid",
                            fontSize: 13,
                            outline: "none",
                            background: "transparent",
                          }}
                          className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            display: "block",
                            marginBottom: 6,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                          className="text-gray-500 dark:text-gray-400"
                        >
                          Deadline
                        </label>
                        <input
                          {...register("deadline", { required: true })}
                          type="date"
                          style={{
                            width: "100%",
                            padding: "9px 10px",
                            borderRadius: 10,
                            border: "1px solid",
                            fontSize: 13,
                            outline: "none",
                            background: "transparent",
                          }}
                          className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </div>
                    </div>

                    {/* Icon picker */}
                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          display: "block",
                          marginBottom: 8,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                        className="text-gray-500 dark:text-gray-400"
                      >
                        Icon
                      </label>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        {PRESET_ICONS.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setValue("icon", icon)}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              fontSize: 17,
                              border: "1.5px solid",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all 0.15s",
                              background:
                                watchedIcon === icon
                                  ? `${watchedColor}18`
                                  : "transparent",
                              borderColor:
                                watchedIcon === icon
                                  ? watchedColor
                                  : "transparent",
                              transform:
                                watchedIcon === icon
                                  ? "scale(1.1)"
                                  : "scale(1)",
                            }}
                            className={
                              watchedIcon === icon
                                ? ""
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color picker */}
                    <div>
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          display: "block",
                          marginBottom: 8,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                        className="text-gray-500 dark:text-gray-400"
                      >
                        Color
                      </label>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setValue("color", color)}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: color,
                              border: "none",
                              cursor: "pointer",
                              transition: "transform 0.15s, box-shadow 0.15s",
                              transform:
                                watchedColor === color
                                  ? "scale(1.2)"
                                  : "scale(1)",
                              boxShadow:
                                watchedColor === color
                                  ? `0 0 0 2px white, 0 0 0 4px ${color}`
                                  : "none",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: "1px solid",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        // Merged the style2 properties here:
                        background: `${watchedColor}08`,
                        borderColor: `${watchedColor}22`,
                      }}
                      className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: `${watchedColor}18`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        {watchedIcon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{ fontSize: 13, fontWeight: 700 }}
                          className="text-gray-900 dark:text-white truncate"
                        >
                          {watch("title") || "Your Goal Name"}
                        </p>
                        <p
                          style={{ fontSize: 11 }}
                          className="text-gray-500 dark:text-gray-400"
                        >
                          {watch("target")
                            ? fmtCurrency(Number(watch("target")))
                            : "₹0"}{" "}
                          target
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: watchedColor,
                        }}
                      >
                        0%
                      </span>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: 10, paddingTop: 2 }}>
                      <button
                        type="button"
                        onClick={closeModal}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: 12,
                          border: "none",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createGoal.isPending || updateGoal.isPending}
                        style={{
                          flex: 2,
                          padding: "10px",
                          borderRadius: 12,
                          border: "none",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: `linear-gradient(135deg, ${watchedColor}, ${watchedColor}cc)`,
                          boxShadow: `0 4px 14px ${watchedColor}44`,
                          opacity:
                            createGoal.isPending || updateGoal.isPending
                              ? 0.7
                              : 1,
                        }}
                      >
                        {createGoal.isPending || updateGoal.isPending ? (
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              border: "2px solid rgba(255,255,255,0.3)",
                              borderTopColor: "#fff",
                              borderRadius: "50%",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                        ) : modalMode === "create" ? (
                          "Create Goal"
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Progress Modal ── */}
      <AnimatePresence>
        {progressGoal && (
          <ProgressModal
            goal={progressGoal}
            onClose={() => setProgressGoal(null)}
            onSubmit={(amount) =>
              updateProgress.mutate({ id: progressGoal.id, amount })
            }
            isPending={updateProgress.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
