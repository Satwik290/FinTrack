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
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api"; // Adjust to your actual axios/fetch instance

// --- Types ---
interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  icon: string;
  color: string;
}

// --- Utility Functions ---
const NOW = Date.now();
const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
const calculateDaysLeft = (deadline: string) =>
  Math.ceil((new Date(deadline).getTime() - NOW) / (1000 * 60 * 60 * 24));

const PRESET_COLORS = [
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#0ea5e9",
];
const PRESET_ICONS = ["🎯", "🛡️", "✈️", "💻", "🚗", "🏠", "🎓", "👶", "💍"];

// --- Components ---
function CircularProgress({
  pct,
  color,
  size = 88,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(pct, 100) / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100 dark:text-gray-800"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="w-32 h-5 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="w-24 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
      </div>
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="w-16 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="w-16 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full" />
      </div>
    </div>
  );
}

// --- Main Page ---
export default function GoalsPage() {
  const [modalMode, setModalMode] = useState<"closed" | "create" | "edit">(
    "closed",
  );
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const watchedColor = watch("color", PRESET_COLORS[0]);
  const watchedIcon = watch("icon", PRESET_ICONS[0]);

  // Queries & Mutations
  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await api.get("/goals");
      // handles both: direct array  OR  { data: [...] } wrapper
      return Array.isArray(res.data) ? res.data : (res.data.data ?? []);
    },
  });

  const createGoal = useMutation({
    mutationFn: async (newGoal: any) =>
      (await api.post("/goals", newGoal)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      closeModal();
    },
  });

  const updateGoal = useMutation({
    mutationFn: async (updatedGoal: any) =>
      (await api.patch(`/goals/${selectedGoal?.id}`, updatedGoal)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      closeModal();
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/goals/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  // Derived Stats
  const stats = useMemo(() => {
    if (!Array.isArray(goals) || goals.length === 0)
      return { totalTarget: 0, totalCurrent: 0, overallPct: 0 };

    const totalTarget = goals.reduce((acc, g) => acc + g.target, 0);
    const totalCurrent = goals.reduce((acc, g) => acc + g.current, 0);
    const overallPct =
      totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
    return { totalTarget, totalCurrent, overallPct };
  }, [goals]);
  // Handlers
  const openEditModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setValue("title", goal.title);
    setValue("target", goal.target);
    setValue("deadline", goal.deadline.split("T")[0]); // Format for input type="date"
    setValue("icon", goal.icon);
    setValue("color", goal.color);
    setModalMode("edit");
    setActiveMenuId(null);
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
    else if (modalMode === "edit") updateGoal.mutate(payload);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header & Stats Dashboard */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Financial Goals
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and manage your saving milestones.
          </p>
        </div>
        <button
          onClick={() => {
            reset();
            setModalMode("create");
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-indigo-200 dark:shadow-none active:scale-95"
        >
          <Plus size={18} /> Add New Goal
        </button>
      </div>

      {!isLoading && goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Target size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Target</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalTarget)}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Saved</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalCurrent)}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <CircularProgress
              pct={stats.overallPct}
              color="#6366f1"
              size={50}
            />
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Overall Progress
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.overallPct}% Complete
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            {" "}
            <SkeletonCard /> <SkeletonCard /> <SkeletonCard />{" "}
          </>
        ) : goals.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl text-gray-400 bg-gray-50 dark:bg-gray-900/50">
            <Target size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No goals set yet
            </h3>
            <p className="text-sm mb-4">
              Start planning your financial future today.
            </p>
            <button
              onClick={() => setModalMode("create")}
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Create your first goal
            </button>
          </div>
        ) : (
          goals.map((g, i) => {
            const pct = Math.min(Math.round((g.current / g.target) * 100), 100);
            const daysLeft = calculateDaysLeft(g.deadline);
            const isMenuOpen = activeMenuId === g.id;

            return (
              <motion.div
                key={g.id}
                layoutId={`goal-card-${g.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group relative bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* 3-Dot Menu */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => setActiveMenuId(isMenuOpen ? null : g.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                  <AnimatePresence>
                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveMenuId(null)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-20 overflow-hidden"
                        >
                          <button
                            onClick={() => openEditModal(g)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            onClick={() => deleteGoal.mutate(g.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                      style={{ backgroundColor: `${g.color}15` }}
                    >
                      {g.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                      {g.title}
                    </h3>
                    <div
                      className="flex items-center gap-1 mt-1 text-sm font-medium"
                      style={{
                        color: daysLeft < 0 ? "#ef4444" : "var(--text-muted)",
                      }}
                    >
                      {daysLeft < 0 ? <AlertCircle size={14} /> : null}
                      <span className="text-gray-500 dark:text-gray-400">
                        {daysLeft > 0
                          ? `${daysLeft} days left`
                          : daysLeft === 0
                            ? "Due today"
                            : "Past due"}
                      </span>
                    </div>
                  </div>
                  <div className="-mt-2 -mr-2">
                    <CircularProgress pct={pct} color={g.color} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">
                        Saved so far
                      </p>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(g.current)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">
                        Target
                      </p>
                      <span className="font-semibold text-gray-400">
                        {formatCurrency(g.target)}
                      </span>
                    </div>
                  </div>

                  <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${g.color}, ${g.color}dd)`,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalMode !== "closed" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 border border-gray-100 dark:border-gray-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {modalMode === "create" ? "Create New Goal" : "Edit Goal"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Goal Title
                  </label>
                  <input
                    {...register("title", { required: true })}
                    placeholder="e.g. New Laptop"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Target Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        ₹
                      </span>
                      <input
                        {...register("target", { required: true })}
                        type="number"
                        placeholder="100000"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Deadline
                    </label>
                    <input
                      {...register("deadline", { required: true })}
                      type="date"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Pick an Icon
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_ICONS.map((icon) => (
                      <button
                        type="button"
                        key={icon}
                        onClick={() => setValue("icon", icon)}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${watchedIcon === icon ? "bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-500 scale-110" : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Theme Color
                  </label>
                  <div className="flex gap-3">
                    {PRESET_COLORS.map((color) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setValue("color", color)}
                        className={`w-8 h-8 rounded-full transition-transform ${watchedColor === color ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-110" : "hover:scale-110"}`}
                        style={{ backgroundColor: color, ringColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createGoal.isPending || updateGoal.isPending}
                    className="flex-[2] px-4 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all disabled:opacity-70 flex justify-center items-center"
                  >
                    {createGoal.isPending || updateGoal.isPending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Save Goal"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
