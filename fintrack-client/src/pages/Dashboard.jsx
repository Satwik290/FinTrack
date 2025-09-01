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
import { motion } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center mb-10"
      >
        <h1 className="text-4xl font-extrabold text-gray-800">📊 FinTrack Dashboard</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition"
        >
          Logout
        </motion.button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { title: "Income", value: summary.income, color: "text-green-600" },
          { title: "Expenses", value: summary.expense, color: "text-red-600" },
          { title: "Savings", value: summary.savings, color: "text-blue-600" },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white shadow-lg rounded-2xl p-6 text-center"
          >
            <h2 className="text-lg font-medium text-gray-500">{card.title}</h2>
            <p className={`text-3xl font-extrabold ${card.color}`}>₹{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-lg rounded-2xl p-6 mb-10"
      >
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
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white shadow-lg rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-700">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-left">
                <th className="p-3">Date</th>
                <th className="p-3">Category</th>
                <th className="p-3">Type</th>
                <th className="p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <motion.tr
                  key={t._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="p-3">{t.category}</td>
                  <td
                    className={`p-3 font-semibold ${
                      t.type === "income" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {t.type}
                  </td>
                  <td className="p-3 font-bold">₹{t.amount}</td>
                </motion.tr>
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
      </motion.div>
    </div>
  );
}

export default Dashboard;
