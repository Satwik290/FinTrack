import { useEffect, useState } from "react";
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
  const [trends, setTrends] = useState({ income: 0, expense: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [resSummary, resTransactions, resBudgets] = await Promise.all([
        axios.get("http://localhost:5000/api/transactions/summary", { headers }),
        axios.get("http://localhost:5000/api/transactions", { headers }),
        axios.get("http://localhost:5000/api/budgets", { headers })
      ]);

      setSummary(resSummary.data);
      const allTransactions = resTransactions.data;
      setTransactions(allTransactions);
      setBudgets(resBudgets.data.slice(0, 3));
      
      calculateTrends(allTransactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrends = (trans) => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthData = trans.filter(t => {
      const d = new Date(t.date);
      return d >= lastMonth && d < thisMonth;
    });

    const thisMonthData = trans.filter(t => {
      const d = new Date(t.date);
      return d >= thisMonth;
    });

    const lastIncome = lastMonthData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const thisIncome = thisMonthData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const lastExpense = lastMonthData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const thisExpense = thisMonthData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    setTrends({
      income: lastIncome > 0 ? ((thisIncome - lastIncome) / lastIncome * 100).toFixed(1) : 0,
      expense: lastExpense > 0 ? ((thisExpense - lastExpense) / lastExpense * 100).toFixed(1) : 0
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: '🍽️', transport: '🚗', entertainment: '🎬', shopping: '🛍️',
      bills: '💡', salary: '💰', freelance: '💻', investment: '📊',
      healthcare: '⚕️', education: '📚', travel: '✈️', other: '📦'
    };
    return icons[category?.toLowerCase()] || '💼';
  };

  // Doughnut Charts
  const createDoughnutData = (income, expense) => ({
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [income || 0, expense || 0],
      backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
      borderWidth: 0,
    }]
  });

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${percentage}%`;
          }
        }
      }
    }
  };

  // Balance Line Chart
  const getLast30DaysData = () => {
    const days = [];
    const balances = [];
    let runningBalance = 0;

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate <= date;
      });

      runningBalance = dayTransactions.reduce((sum, t) => {
        return sum + (t.type === 'income' ? t.amount : -t.amount);
      }, 0);

      if (i % 2 === 0 || i < 7) {
        days.push(date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
      } else {
        days.push('');
      }
      
      balances.push(runningBalance);
    }

    return { days, balances };
  };

  const { days, balances } = getLast30DaysData();

  const balanceChartData = {
    labels: days,
    datasets: [{
      label: 'Balance',
      data: balances,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 2,
      pointHoverRadius: 6,
      borderWidth: 3,
    }]
  };

  const lineChartOptions = {
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
        ticks: { color: '#9ca3af', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
        border: { display: false },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          callback: (value) => '₹' + (value >= 1000 ? (value/1000).toFixed(1) + 'k' : value)
        }
      }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  };

  // Last 7 Days Bar Chart
  const getLast7DaysData = () => {
    const result = { days: [], incomes: [], expenses: [] };

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      result.days.push(date.toLocaleDateString('en-GB', { day: 'numeric', weekday: 'short' }));

      const dayTrans = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.toDateString() === date.toDateString();
      });

      result.incomes.push(dayTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
      result.expenses.push(dayTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
    }

    return result;
  };

  const last7Days = getLast7DaysData();

  const barChartData = {
    labels: last7Days.days,
    datasets: [
      {
        label: 'Income',
        data: last7Days.incomes,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 6,
      },
      {
        label: 'Expenses',
        data: last7Days.expenses,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 6,
      }
    ]
  };

  const barChartOptions = {
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
        ticks: { color: '#9ca3af', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
        border: { display: false },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          callback: (value) => '₹' + (value >= 1000 ? (value/1000) + 'k' : value)
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">💰</div>
          </div>
          <p className="text-gray-600 font-medium text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">📊</span>
            Overview
          </h1>
          <p className="text-gray-600 mt-2 text-base sm:text-lg">Your complete financial dashboard</p>
        </div>

        {/* Top Row - Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded-full">
                Balance
              </span>
            </div>
            <h3 className="text-sm font-medium text-green-700 mb-1">Total Balance</h3>
            <p className="text-3xl font-bold text-green-600">{formatAmount(summary.savings)}</p>
          </div>

          {/* Income Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                trends.income >= 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
              }`}>
                {trends.income >= 0 ? '↗' : '↘'} {Math.abs(trends.income)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Income</h3>
            <p className="text-3xl font-bold text-gray-800">{formatAmount(summary.income)}</p>
          </div>

          {/* Expenses Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💸</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                trends.expense <= 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
              }`}>
                {trends.expense >= 0 ? '↗' : '↘'} {Math.abs(trends.expense)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Expenses</h3>
            <p className="text-3xl font-bold text-gray-800">{formatAmount(summary.expense)}</p>
          </div>

          {/* Transactions Count */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <span className="text-xs font-semibold text-purple-700 bg-purple-200 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <h3 className="text-sm font-medium text-purple-700 mb-1">Transactions</h3>
            <p className="text-3xl font-bold text-purple-600">{transactions.length}</p>
          </div>
        </div>

        {/* Middle Row - Monthly Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          
          {/* This Month */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">This Month</h3>
                <p className="text-sm text-gray-500">Current period</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">Income</span>
                    <span className="text-green-600 text-xs">↗</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{formatAmount(summary.income)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">Expenses</span>
                    <span className="text-red-600 text-xs">↘</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">-{formatAmount(summary.expense)}</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Net Savings</span>
                  <p className="text-xl font-bold text-blue-600">{formatAmount(summary.savings)}</p>
                </div>
              </div>
              <div className="w-32 h-32">
                <Doughnut data={createDoughnutData(summary.income, summary.expense)} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Last Month */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Last Month</h3>
                <p className="text-sm text-gray-500">Previous period</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">Income</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-700">{formatAmount(summary.income * 0.92)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">Expenses</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-700">-{formatAmount(summary.expense * 0.88)}</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Net Savings</span>
                  <p className="text-xl font-bold text-gray-700">{formatAmount(summary.savings * 0.95)}</p>
                </div>
              </div>
              <div className="w-32 h-32">
                <Doughnut 
                  data={createDoughnutData(summary.income * 0.92, summary.expense * 0.88)} 
                  options={doughnutOptions} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          
          {/* Balance Trend */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Balance Trend</h3>
                <p className="text-sm text-gray-500">Last 30 days</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Current:</span>
                <span className="font-bold text-blue-600">{formatAmount(balances[balances.length - 1] || 0)}</span>
              </div>
            </div>
            <div style={{ height: '280px' }}>
              <Line data={balanceChartData} options={lineChartOptions} />
            </div>
          </div>

          {/* Last 7 Days */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Last 7 Days</h3>
                <p className="text-sm text-gray-500">Daily comparison</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-600">Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-xs text-gray-600">Expenses</span>
                </div>
              </div>
            </div>
            <div style={{ height: '280px' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Budgets */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Budget Overview</h3>
                <p className="text-sm text-gray-500">Track your spending limits</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All →
              </button>
            </div>
            <div className="space-y-6">
              {budgets.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-5xl mb-3">💰</div>
                  <p className="text-sm font-medium">No budgets set yet</p>
                  <p className="text-xs mt-1">Create budgets to track your spending</p>
                </div>
              ) : (
                budgets.map((budget) => {
                  const spent = transactions
                    .filter(t => t.category === budget.category && t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                  const percentage = ((spent / budget.limit) * 100).toFixed(0);
                  
                  return (
                    <div key={budget._id} className="group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                            percentage > 80 ? 'bg-red-100' : percentage > 60 ? 'bg-yellow-100' : 'bg-green-100'
                          }`}>
                            {getCategoryIcon(budget.category)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 capitalize">{budget.category}</p>
                            <p className="text-xs text-gray-500">
                              {formatAmount(spent)} of {formatAmount(budget.limit)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${
                            percentage > 80 ? 'text-red-600' : percentage > 60 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {percentage}%
                          </span>
                          <p className="text-xs text-gray-500">{formatAmount(budget.limit - spent)} left</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${
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
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                <p className="text-sm text-gray-500">Latest transactions</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All →
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {transactions.slice(0, 6).map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${
                      transaction.type === 'income' ? 'bg-green-100 group-hover:bg-green-200' : 'bg-red-100 group-hover:bg-red-200'
                    } transition-colors`}>
                      {getCategoryIcon(transaction.category)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 capitalize text-sm">{transaction.category}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-sm ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                    </span>
                    <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-5xl mb-3">📝</div>
                  <p className="text-sm font-medium">No transactions yet</p>
                  <p className="text-xs mt-1">Start tracking your finances</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
          <button 
            className="w-14 h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
            title="Add Income"
          >
            <span className="text-2xl">💰</span>
          </button>
          <button 
            className="w-14 h-14 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
            title="Add Expense"
          >
            <span className="text-2xl">💸</span>
          </button>
          <button 
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
            title="Add Transaction"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Quick Stats Banner */}
        <div className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl text-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm opacity-90">Savings Rate</p>
              <p className="text-2xl font-bold">
                {summary.income > 0 ? ((summary.savings / summary.income) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💳</div>
              <p className="text-sm opacity-90">Avg. Daily Spend</p>
              <p className="text-2xl font-bold">
                {transactions.length > 0 ? formatAmount(summary.expense / 30) : '₹0'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <p className="text-sm opacity-90">Total Transactions</p>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-sm opacity-90">Active Budgets</p>
              <p className="text-2xl font-bold">{budgets.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;