import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Dashboard() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, savings: 0 });
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trends, setTrends] = useState({ income: 0, expense: 0 });
  const [lastMonthSummary, setLastMonthSummary] = useState({ income: 0, expense: 0, savings: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Please login to continue");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data
      const [resSummary, resTransactions, resBudgets] = await Promise.all([
        axios.get("http://localhost:5000/api/transactions/summary", { headers }),
        axios.get("http://localhost:5000/api/transactions", { headers }),
        axios.get("http://localhost:5000/api/budgets", { headers }).catch(() => ({ data: [] }))
      ]);

      console.log("Summary from API:", resSummary.data);
      console.log("Transactions from API:", resTransactions.data);

      // Use API summary or calculate from transactions
      const apiSummary = resSummary.data || {};
      const allTransactions = resTransactions.data || [];
      
      // If API summary is empty, calculate from transactions
      if (apiSummary.income === 0 && apiSummary.expense === 0 && allTransactions.length > 0) {
        const calculated = {
          income: allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0),
          expense: allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0),
          savings: 0
        };
        calculated.savings = calculated.income - calculated.expense;
        setSummary(calculated);
        console.log("Calculated summary:", calculated);
      } else {
        setSummary({
          income: apiSummary.income || 0,
          expense: apiSummary.expense || 0,
          savings: apiSummary.savings || (apiSummary.income || 0) - (apiSummary.expense || 0)
        });
      }

      setTransactions(allTransactions);
      setBudgets(resBudgets.data || []);
      
      calculateMonthlyData(allTransactions);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyData = (trans) => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const thisMonthTrans = trans.filter(t => {
      const date = new Date(t.date);
      return date >= thisMonthStart;
    });
    
    const lastMonthTrans = trans.filter(t => {
      const date = new Date(t.date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });

    const thisIncome = thisMonthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const thisExpense = thisMonthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const lastIncome = lastMonthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const lastExpense = lastMonthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);

    setLastMonthSummary({
      income: lastIncome,
      expense: lastExpense,
      savings: lastIncome - lastExpense
    });

    setTrends({
      income: lastIncome > 0 ? (((thisIncome - lastIncome) / lastIncome) * 100).toFixed(1) : (thisIncome > 0 ? 100 : 0),
      expense: lastExpense > 0 ? (((thisExpense - lastExpense) / lastExpense) * 100).toFixed(1) : (thisExpense > 0 ? 100 : 0)
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount || 0));
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: '🍽️', transport: '🚗', entertainment: '🎬', shopping: '🛍️',
      bills: '💡', salary: '💰', freelance: '💻', investment: '📊',
      healthcare: '⚕️', education: '📚', travel: '✈️', other: '📦'
    };
    return icons[category?.toLowerCase()] || '💼';
  };

  // Memoized chart data
  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${percentage}%`;
          }
        }
      }
    }
  }), []);

  const createDoughnutData = (income, expense) => {
    const safeIncome = income || 0;
    const safeExpense = expense || 0;
    
    // If both are 0, show equal split for visual purpose
    if (safeIncome === 0 && safeExpense === 0) {
      return {
        labels: ['Income', 'Expenses'],
        datasets: [{
          data: [1, 1],
          backgroundColor: ['rgba(34, 197, 94, 0.3)', 'rgba(239, 68, 68, 0.3)'],
          borderWidth: 0,
        }]
      };
    }
    
    return {
      labels: ['Income', 'Expenses'],
      datasets: [{
        data: [safeIncome, safeExpense],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 2,
      }]
    };
  };

  // Balance trend data
  const balanceChartData = useMemo(() => {
    const days = [];
    const balances = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const relevantTrans = transactions.filter(t => new Date(t.date) <= date);
      const balance = relevantTrans.reduce((sum, t) => 
        sum + (t.type === 'income' ? t.amount : -t.amount), 0
      );

      if (i % 3 === 0 || i < 7) {
        days.push(date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
      } else {
        days.push('');
      }
      balances.push(balance);
    }

    return {
      labels: days,
      datasets: [{
        label: 'Balance',
        data: balances,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 3,
      }]
    };
  }, [transactions]);

  const lineChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `Balance: ${formatAmount(context.parsed.y)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#9ca3af', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
        border: { display: false },
        ticks: {
          color: '#9ca3af',
          font: { size: 10 },
          callback: (value) => '₹' + (Math.abs(value) >= 1000 ? (value/1000).toFixed(1) + 'k' : value)
        }
      }
    }
  }), []);

  // Last 7 days bar chart
  const barChartData = useMemo(() => {
    const result = { days: [], incomes: [], expenses: [] };

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      result.days.push(date.toLocaleDateString('en-GB', { weekday: 'short' }));

      const dayTrans = transactions.filter(t => 
        new Date(t.date).toDateString() === date.toDateString()
      );

      result.incomes.push(dayTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
      result.expenses.push(dayTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
    }

    return {
      labels: result.days,
      datasets: [
        {
          label: 'Income',
          data: result.incomes,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderRadius: 6,
        },
        {
          label: 'Expenses',
          data: result.expenses,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderRadius: 6,
        }
      ]
    };
  }, [transactions]);

  const barChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatAmount(context.parsed.y)}`
        }
      }
    },
    scales: {
      x: { 
        grid: { display: false, drawBorder: false },
        ticks: { color: '#9ca3af', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
        border: { display: false },
        ticks: {
          color: '#9ca3af',
          font: { size: 10 },
          callback: (value) => '₹' + (value >= 1000 ? (value/1000).toFixed(0) + 'k' : value)
        }
      }
    }
  }), []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">💰</div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <span>📊</span>
            Overview
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Your complete financial dashboard</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          
          {/* Balance */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 bg-opacity-20 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl">
                💰
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-green-700 mb-1">Balance</h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 truncate">{formatAmount(summary.savings)}</p>
          </div>

          {/* Income */}
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl">
                📈
              </div>
              {parseFloat(trends.income) !== 0 && summary.income > 0 && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  parseFloat(trends.income) >= 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                }`}>
                  {parseFloat(trends.income) >= 0 ? '↗' : '↘'} {Math.abs(parseFloat(trends.income))}%
                </span>
              )}
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Income</h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">{formatAmount(summary.income)}</p>
          </div>

          {/* Expenses */}
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl">
                💸
              </div>
              {parseFloat(trends.expense) !== 0 && summary.expense > 0 && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  parseFloat(trends.expense) <= 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                }`}>
                  {parseFloat(trends.expense) >= 0 ? '↗' : '↘'} {Math.abs(parseFloat(trends.expense))}%
                </span>
              )}
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Expenses</h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">{formatAmount(summary.expense)}</p>
          </div>

          {/* Transactions */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 bg-opacity-20 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl">
                📝
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-purple-700 mb-1">Transactions</h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">{transactions.length}</p>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          
          {/* This Month */}
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">This Month</h3>
                <p className="text-xs sm:text-sm text-gray-500">Current period</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Income</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-green-600">{formatAmount(summary.income)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Expenses</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-red-600">{formatAmount(summary.expense)}</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Net Savings</span>
                  <p className={`text-base sm:text-lg font-bold ${summary.savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatAmount(summary.savings)}
                  </p>
                </div>
              </div>
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                <Doughnut data={createDoughnutData(summary.income, summary.expense)} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Last Month */}
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Last Month</h3>
                <p className="text-xs sm:text-sm text-gray-500">Previous period</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Income</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-green-600">{formatAmount(lastMonthSummary.income)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Expenses</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-red-600">{formatAmount(lastMonthSummary.expense)}</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Net Savings</span>
                  <p className={`text-base sm:text-lg font-bold ${lastMonthSummary.savings >= 0 ? 'text-gray-700' : 'text-red-600'}`}>
                    {formatAmount(lastMonthSummary.savings)}
                  </p>
                </div>
              </div>
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                <Doughnut 
                  data={createDoughnutData(lastMonthSummary.income, lastMonthSummary.expense)} 
                  options={doughnutOptions} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          
          {/* Balance Trend */}
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Balance Trend</h3>
                <p className="text-xs sm:text-sm text-gray-500">Last 30 days</p>
              </div>
            </div>
            <div className="h-60 sm:h-72">
              <Line data={balanceChartData} options={lineChartOptions} />
            </div>
          </div>

          {/* Last 7 Days */}
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Last 7 Days</h3>
                <p className="text-xs sm:text-sm text-gray-500">Daily comparison</p>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-600">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded"></div>
                  <span className="text-xs text-gray-600">Expenses</span>
                </div>
              </div>
            </div>
            <div className="h-60 sm:h-72">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Budgets */}
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Budgets</h3>
                <p className="text-xs sm:text-sm text-gray-500">Track spending limits</p>
              </div>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {budgets.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">💰</div>
                  <p className="text-sm">No budgets set</p>
                </div>
              ) : (
                budgets.slice(0, 4).map((budget) => {
                  const spent = transactions
                    .filter(t => t.category?.toLowerCase() === budget.category?.toLowerCase() && t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                  const percentage = budget.limit > 0 ? ((spent / budget.limit) * 100).toFixed(0) : 0;
                  
                  return (
                    <div key={budget._id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                            percentage > 80 ? 'bg-red-100' : percentage > 60 ? 'bg-yellow-100' : 'bg-green-100'
                          }`}>
                            {getCategoryIcon(budget.category)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 capitalize text-sm">{budget.category}</p>
                            <p className="text-xs text-gray-500">
                              {formatAmount(spent)} / {formatAmount(budget.limit)}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${
                          percentage > 80 ? 'text-red-600' : percentage > 60 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Recent Activity</h3>
                <p className="text-xs sm:text-sm text-gray-500">Latest transactions</p>
              </div>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-sm">No transactions yet</p>
                </div>
              ) : (
                transactions.slice(0, 6).map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {getCategoryIcon(transaction.category)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 capitalize text-sm">{transaction.category}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl mb-1">📊</div>
              <p className="text-xs sm:text-sm opacity-90">Savings Rate</p>
              <p className="text-lg sm:text-2xl font-bold mt-1">
                {summary.income > 0 ? ((summary.savings / summary.income) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl mb-1">💳</div>
              <p className="text-xs sm:text-sm opacity-90">Daily Avg</p>
              <p className="text-lg sm:text-2xl font-bold mt-1">
                {formatAmount(summary.expense / 30)}
              </p>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl mb-1">📈</div>
              <p className="text-xs sm:text-sm opacity-90">Total Txns</p>
              <p className="text-lg sm:text-2xl font-bold mt-1">{transactions.length}</p>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl mb-1">🎯</div>
              <p className="text-xs sm:text-sm opacity-90">Budgets</p>
              <p className="text-lg sm:text-2xl font-bold mt-1">{budgets.length}</p>
            </div>
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          <button 
            className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center"
            title="Add Income"
          >
            <span className="text-xl sm:text-2xl">💰</span>
          </button>
          <button 
            className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center"
            title="Add Expense"
          >
            <span className="text-xl sm:text-2xl">💸</span>
          </button>
          <button 
            className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center"
            title="Add Transaction"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;