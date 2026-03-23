import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useState, useEffect } from "react";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function DashboardCharts({ summary }) {
  const [activeChart, setActiveChart] = useState('bar');
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };
        
        const res = await axios.get("http://localhost:5000/api/transactions", { headers });
        const transactions = res.data;

        const weeks = [0, 1, 2, 3];
        const weeklyIncome = [];
        const weeklyExpense = [];

        weeks.forEach((weekOffset) => {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - (weekOffset + 1) * 7);
          const weekEnd = new Date();
          weekEnd.setDate(weekEnd.getDate() - weekOffset * 7);

          const weekTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= weekStart && tDate < weekEnd;
          });

          const income = weekTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          
          const expense = weekTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

          weeklyIncome.unshift(income);
          weeklyExpense.unshift(expense);
        });

        setTrendData({ weeklyIncome, weeklyExpense });
      } catch (err) {
        console.error("Failed to fetch trend data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (activeChart === 'line') {
      fetchTrendData();
    }
  }, [activeChart]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const barChartData = {
    labels: ["Income", "Expenses", "Savings"],
    datasets: [
      {
        label: "Amount (₹)",
        data: [summary.income || 0, summary.expense || 0, summary.savings || 0],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(59, 130, 246, 0.8)"
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(59, 130, 246, 1)"
        ],
        borderWidth: 2,
        borderRadius: 12,
        borderSkipped: false,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        displayColors: false,
        padding: 12,
        callbacks: {
          label: function(context) {
            return formatAmount(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          callback: function(value) {
            return '₹' + (value >= 1000 ? (value/1000) + 'K' : value);
          },
          color: '#6b7280',
          font: {
            size: 12,
          }
        },
        border: {
          display: false
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        border: {
          display: false
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const doughnutChartData = {
    labels: ["Income", "Expenses", "Savings"],
    datasets: [
      {
        data: [summary.income || 0, summary.expense || 0, Math.max(summary.savings || 0, 0)],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(59, 130, 246, 0.8)"
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(59, 130, 246, 1)"
        ],
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#6b7280',
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${formatAmount(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    }
  };

  const lineChartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Income",
        data: trendData?.weeklyIncome || [0, 0, 0, 0],
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "rgba(34, 197, 94, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
      {
        label: "Expenses",
        data: trendData?.weeklyExpense || [0, 0, 0, 0],
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "rgba(239, 68, 68, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#6b7280',
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatAmount(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          callback: function(value) {
            return '₹' + (value >= 1000 ? (value/1000) + 'K' : value);
          },
          color: '#6b7280',
          font: {
            size: 12,
          }
        },
        border: {
          display: false
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          }
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const renderChart = () => {
    if (activeChart === 'line' && loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600 text-sm">Loading trend data...</p>
          </div>
        </div>
      );
    }

    switch(activeChart) {
      case 'bar':
        return <Bar data={barChartData} options={barChartOptions} />;
      case 'doughnut':
        return (
          <div className="flex items-center justify-center" style={{ height: '100%' }}>
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
        );
      case 'line':
        return <Line data={lineChartData} options={lineChartOptions} />;
      default:
        return <Bar data={barChartData} options={barChartOptions} />;
    }
  };

  return (
    <div className="bg-white backdrop-blur-sm bg-opacity-70 border border-white border-opacity-20 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>📊</span>
            Financial Overview
          </h2>
          <p className="text-gray-600 mt-1">Visual breakdown of your finances</p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveChart('bar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeChart === 'bar'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            title="Bar Chart"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <span className="hidden sm:inline">Bar</span>
          </button>
          <button
            onClick={() => setActiveChart('doughnut')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeChart === 'doughnut'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            title="Doughnut Chart"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v.878A2.988 2.988 0 0110 16a2.988 2.988 0 01-3-2.122V13a2 2 0 00-2-2H4.083A5.973 5.973 0 014 10c0-.69.14-1.348.332-1.973z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Donut</span>
          </button>
          <button
            onClick={() => setActiveChart('line')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeChart === 'line'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            title="Line Chart"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Trend</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center justify-center sm:justify-start gap-3 bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <span className="text-xs font-medium text-green-700 block">Income</span>
            <span className="text-lg font-bold text-green-600">{formatAmount(summary.income || 0)}</span>
          </div>
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-3 bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div>
            <span className="text-xs font-medium text-red-700 block">Expenses</span>
            <span className="text-lg font-bold text-red-600">{formatAmount(summary.expense || 0)}</span>
          </div>
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-3 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div>
            <span className="text-xs font-medium text-blue-700 block">Savings</span>
            <span className="text-lg font-bold text-blue-600">{formatAmount(summary.savings || 0)}</span>
          </div>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 sm:p-6 border border-gray-100" style={{ height: '400px' }}>
        {renderChart()}
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-lg">💡</span>
            </div>
            <h4 className="font-semibold text-purple-800 text-sm">Savings Rate</h4>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {summary.income > 0 ? ((summary.savings / summary.income) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-xs text-purple-700 mt-1">
            {summary.savings >= 0 ? 'Keep it up! 🎉' : 'Time to cut expenses'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-amber-500 bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-lg">📈</span>
            </div>
            <h4 className="font-semibold text-amber-800 text-sm">Expense Ratio</h4>
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {summary.income > 0 ? ((summary.expense / summary.income) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-xs text-amber-700 mt-1">
            {summary.expense < summary.income * 0.5 ? 'Excellent control!' : 'Watch your spending'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-teal-500 bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
            <h4 className="font-semibold text-teal-800 text-sm">Financial Health</h4>
          </div>
          <p className="text-2xl font-bold text-teal-600">
            {summary.savings >= 0 ? 'Healthy' : 'Needs Attention'}
          </p>
          <p className="text-xs text-teal-700 mt-1">
            {summary.savings >= summary.income * 0.2 
              ? 'Great financial discipline!' 
              : 'Consider increasing savings'}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 bg-opacity-20 rounded-xl flex items-center justify-center">
            <span className="text-xl">💼</span>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-800 text-sm">Total Balance</h4>
            <p className="text-xs text-indigo-600">Your net financial position</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className={`text-2xl sm:text-3xl font-bold ${
            summary.savings >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatAmount(summary.savings || 0)}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {summary.savings >= 0 ? '↗ Positive balance' : '↘ Negative balance'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardCharts;