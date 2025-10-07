import { useEffect, useState } from "react";
import axios from "axios";
import DashboardCharts from "../components/DashboardCharts";

function Dashboard() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, savings: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('month');
  const [trends, setTrends] = useState({ income: 0, expense: 0, savings: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Summary API
        const resSummary = await axios.get("http://localhost:5000/api/transactions/summary", { headers });
        setSummary(resSummary.data);

        // Recent transactions
        const resTransactions = await axios.get("http://localhost:5000/api/transactions", { headers });
        const allTransactions = resTransactions.data;
        setTransactions(allTransactions.slice(0, 10));

        // Calculate trends
        calculateTrends(allTransactions);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateTrends = (transactions) => {
    const now = new Date();
    const lastPeriodStart = new Date();
    const currentPeriodStart = new Date();

    // Set period based on timeframe
    if (timeframe === 'week') {
      lastPeriodStart.setDate(now.getDate() - 14);
      currentPeriodStart.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
      lastPeriodStart.setMonth(now.getMonth() - 2);
      currentPeriodStart.setMonth(now.getMonth() - 1);
    } else {
      lastPeriodStart.setFullYear(now.getFullYear() - 2);
      currentPeriodStart.setFullYear(now.getFullYear() - 1);
    }

    const lastPeriod = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= lastPeriodStart && date < currentPeriodStart;
    });

    const currentPeriod = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= currentPeriodStart;
    });

    const lastIncome = lastPeriod.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const currentIncome = currentPeriod.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const lastExpense = lastPeriod.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const currentExpense = currentPeriod.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const incomeTrend = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome * 100).toFixed(1) : 0;
    const expenseTrend = lastExpense > 0 ? ((currentExpense - lastExpense) / lastExpense * 100).toFixed(1) : 0;
    const savingsTrend = (currentIncome - currentExpense) - (lastIncome - lastExpense);
    const savingsTrendPercent = (lastIncome - lastExpense) > 0 
      ? (savingsTrend / (lastIncome - lastExpense) * 100).toFixed(1) 
      : 0;

    setTrends({
      income: parseFloat(incomeTrend),
      expense: parseFloat(expenseTrend),
      savings: parseFloat(savingsTrendPercent)
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
      'food': '🍽️',
      'transport': '🚗',
      'entertainment': '🎬',
      'shopping': '🛍️',
      'bills': '💡',
      'salary': '💰',
      'freelance': '💻',
      'investment': '📊',
      'healthcare': '⚕️',
      'education': '📚',
      'travel': '✈️',
      'business': '🏢',
      'other': '📦'
    };
    return icons[category?.toLowerCase()] || '💼';
  };

  const getTransactionBadge = (type) => {
    return type === 'income' 
      ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="mr-1">📈</span> Income
        </span>
      : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <span className="mr-1">📉</span> Expense
        </span>;
  };

  const calculateTrend = () => {
    const savingsRate = summary.income > 0 ? ((summary.savings / summary.income) * 100).toFixed(1) : 0;
    return savingsRate;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
              💰
            </div>
          </div>
          <p className="text-gray-600 font-medium text-lg">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">📊</span>
                Financial Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-base sm:text-lg">Your complete financial overview at a glance</p>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-lg border border-gray-100">
              <button
                onClick={() => setTimeframe('week')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  timeframe === 'week'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeframe('month')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  timeframe === 'month'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeframe('year')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  timeframe === 'year'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Year
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Income Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500 opacity-10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">
                  💰
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  trends.income >= 0 
                    ? 'text-green-700 bg-green-200' 
                    : 'text-red-700 bg-red-200'
                }`}>
                  {trends.income >= 0 ? '+' : ''}{trends.income}%
                </div>
              </div>
              <h3 className="text-green-700 font-semibold text-sm mb-1">Total Income</h3>
              <p className="text-3xl font-bold text-green-600 mb-2">{formatAmount(summary.income)}</p>
              <div className="flex items-center text-xs text-green-600">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                <span>This {timeframe}</span>
              </div>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500 opacity-10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-red-500 bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">
                  💸
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  trends.expense <= 0 
                    ? 'text-green-700 bg-green-200' 
                    : 'text-red-700 bg-red-200'
                }`}>
                  {trends.expense >= 0 ? '+' : ''}{trends.expense}%
                </div>
              </div>
              <h3 className="text-red-700 font-semibold text-sm mb-1">Total Expenses</h3>
              <p className="text-3xl font-bold text-red-600 mb-2">{formatAmount(summary.expense)}</p>
              <div className="flex items-center text-xs text-red-600">
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                <span>This {timeframe}</span>
              </div>
            </div>
          </div>

          {/* Savings Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 opacity-10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">
                  🏦
                </div>
                <div className="text-xs font-medium text-blue-700 bg-blue-200 px-2 py-1 rounded-full">
                  {calculateTrend()}%
                </div>
              </div>
              <h3 className="text-blue-700 font-semibold text-sm mb-1">Net Savings</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">{formatAmount(summary.savings)}</p>
              <div className="flex items-center text-xs text-blue-600">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                <span>Savings rate</span>
              </div>
            </div>
          </div>

          {/* Transactions Count Card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500 opacity-10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">
                  📝
                </div>
                <div className="text-xs font-medium text-purple-700 bg-purple-200 px-2 py-1 rounded-full">
                  Active
                </div>
              </div>
              <h3 className="text-purple-700 font-semibold text-sm mb-1">Transactions</h3>
              <p className="text-3xl font-bold text-purple-600 mb-2">{transactions.length}</p>
              <div className="flex items-center text-xs text-purple-600">
                <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
                <span>Recent entries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Component */}
        <DashboardCharts summary={summary} />

        {/* Recent Transactions */}
        <div className="bg-white backdrop-blur-sm bg-opacity-70 border border-white border-opacity-20 rounded-2xl shadow-xl overflow-hidden mt-6 sm:mt-8">
          <div className="p-6 sm:p-8 pb-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span>📋</span>
                  Recent Transactions
                </h2>
                <p className="text-gray-600 mt-1">Your latest financial activities</p>
              </div>
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm whitespace-nowrap">
                View All →
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-8 pb-6 sm:pb-8">
            {transactions.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No transactions yet</h3>
                <p className="text-gray-500 mb-6">Start adding transactions to see them here</p>
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Add Transaction
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr 
                          key={transaction._id} 
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(transaction.date).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(transaction.date).toLocaleDateString('en-GB', {
                                weekday: 'short'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getCategoryIcon(transaction.category)}</span>
                              <span className="text-sm font-medium text-gray-800 capitalize">
                                {transaction.category}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getTransactionBadge(transaction.type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className={`text-lg font-bold ${
                              transaction.type === "income" ? "text-green-600" : "text-red-600"
                            }`}>
                              {transaction.type === "income" ? "+" : "-"}{formatAmount(transaction.amount)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {transactions.map((transaction) => (
                    <div 
                      key={transaction._id} 
                      className={`border-l-4 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
                        transaction.type === 'income' 
                          ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-500' 
                          : 'bg-gradient-to-br from-red-50 to-red-100 border-red-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{getCategoryIcon(transaction.category)}</span>
                          <div>
                            <h3 className="font-bold text-base sm:text-lg text-gray-800 capitalize">
                              {transaction.category}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {new Date(transaction.date).toLocaleDateString('en-GB', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short'
                              })}
                            </p>
                          </div>
                        </div>
                        {getTransactionBadge(transaction.type)}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-600 font-medium">Amount</span>
                        <span className={`text-xl sm:text-2xl font-bold ${
                          transaction.type === "income" ? "text-green-600" : "text-red-600"
                        }`}>
                          {transaction.type === "income" ? "+" : "-"}{formatAmount(transaction.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <div className="bg-white backdrop-blur-sm bg-opacity-70 border border-white border-opacity-20 rounded-2xl p-4 sm:p-6 shadow-xl w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base">
                <span className="text-lg">➕</span>
                <span>Add Income</span>
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base">
                <span className="text-lg">➖</span>
                <span>Add Expense</span>
              </button>
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base">
                <span className="text-lg">📊</span>
                <span>View Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;