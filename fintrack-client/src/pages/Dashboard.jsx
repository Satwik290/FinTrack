import { useEffect, useState } from "react";
import axios from "axios";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, savings: 0 });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        // ✅ Summary API
        const resSummary = await axios.get("http://localhost:5000/api/transactions/summary", { headers });
        setSummary(resSummary.data);

        // ✅ Recent transactions
        const resTransactions = await axios.get("http://localhost:5000/api/transactions", { headers });
        setTransactions(resTransactions.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: ["Income", "Expenses", "Savings"],
    datasets: [
      {
        label: "Amount (₹)",
        data: [summary.income, summary.expense, summary.savings],
        backgroundColor: ["#22c55e", "#ef4444", "#3b82f6"],
        borderRadius: 10,
      },
    ],
  };

  return (
    <div className="p-6">
      {/* Page Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">📊 FinTrack Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow-md rounded-xl p-6 text-center">
          <h2 className="text-lg font-medium text-gray-600">Income</h2>
          <p className="text-3xl font-bold text-green-600">₹{summary.income}</p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 text-center">
          <h2 className="text-lg font-medium text-gray-600">Expenses</h2>
          <p className="text-3xl font-bold text-red-600">₹{summary.expense}</p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 text-center">
          <h2 className="text-lg font-medium text-gray-600">Savings</h2>
          <p className="text-3xl font-bold text-blue-600">₹{summary.savings}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Financial Overview</h2>
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Transactions</h2>
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
                <tr key={t._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="p-3">{t.category}</td>
                  <td className={`p-3 font-semibold ${t.type === "income" ? "text-green-500" : "text-red-500"}`}>
                    {t.type}
                  </td>
                  <td className="p-3 font-bold">₹{t.amount}</td>
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