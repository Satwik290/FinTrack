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
    labels: ["Income", "Expense", "Savings"],
    datasets: [
      {
        label: "Amount (₹)",
        data: [summary.income, summary.expense, summary.savings],
        backgroundColor: ["#4ade80", "#f87171", "#60a5fa"],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-500">Income</h2>
          <p className="text-2xl font-bold text-green-500">₹{summary.income}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-500">Expenses</h2>
          <p className="text-2xl font-bold text-red-500">₹{summary.expense}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-500">Savings</h2>
          <p className="text-2xl font-bold text-blue-500">₹{summary.savings}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Date</th>
              <th className="p-2">Category</th>
              <th className="p-2">Type</th>
              <th className="p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id} className="border-b hover:bg-gray-50">
                <td className="p-2">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-2">{t.category}</td>
                <td className={`p-2 font-semibold ${t.type === "income" ? "text-green-500" : "text-red-500"}`}>
                  {t.type}
                </td>
                <td className="p-2">₹{t.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
