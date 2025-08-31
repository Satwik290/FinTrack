import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ✅ Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, savings: 0 });
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const headers = { Authorization: `Bearer ${token}` };

        // Summary API
        const resSummary = await axios.get("http://localhost:5000/api/transactions/summary", { headers });
        setSummary(resSummary.data);

        // Transactions API
        const resTransactions = await axios.get("http://localhost:5000/api/transactions", { headers });
        setTransactions(resTransactions.data.slice(0, 5)); // show last 5
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  // Chart data
  const chartData = {
    labels: ["Income", "Expenses", "Savings"],
    datasets: [
      {
        label: "Amount (₹)",
        data: [summary.income, summary.expense, summary.savings],
        backgroundColor: ["#22c55e", "#ef4444", "#3b82f6"],
        borderRadius: 12,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">📊 FinTrack Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow"
        >
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-xl rounded-2xl p-6 text-center hover:scale-105 transition">
          <h2 className="text-lg font-semibold text-gray-500">Income</h2>
          <p className="text-3xl font-extrabold text-green-600">₹{summary.income}</p>
        </div>
        <div className="bg-white shadow-xl rounded-2xl p-6 text-center hover:scale-105 transition">
          <h2 className="text-lg font-semibold text-gray-500">Expenses</h2>
          <p className="text-3xl font-extrabold text-red-600">₹{summary.expense}</p>
        </div>
        <div className="bg-white shadow-xl rounded-2xl p-6 text-center hover:scale-105 transition">
          <h2 className="text-lg font-semibold text-gray-500">Savings</h2>
          <p className="text-3xl font-extrabold text-blue-600">₹{summary.savings}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Financial Overview</h2>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: false },
            },
          }}
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="p-3">{t.category}</td>
                  <td
                    className={`p-3 font-bold ${
                      t.type === "income" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {t.type}
                  </td>
                  <td className="p-3">₹{t.amount}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-gray-400">
                    No recent transactions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
