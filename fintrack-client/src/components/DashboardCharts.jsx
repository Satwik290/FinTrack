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

function DashboardCharts({ summary }) {
  // 🔹 Fallback dummy values if API didn’t load
  const safeSummary = summary && (summary.income || summary.expense || summary.savings)
    ? summary
    : { income: 15000, expense: 8000, savings: 7000 };

  const chartData = {
    labels: ["Income", "Expenses", "Savings"],
    datasets: [
      {
        label: "Amount (₹)",
        data: [safeSummary.income, safeSummary.expense, safeSummary.savings],
        backgroundColor: ["#22c55e", "#ef4444", "#3b82f6"],
        borderRadius: 10,
      },
    ],
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mb-10">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Financial Overview</h2>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 2000 } }, // nice steps
          },
        }}
      />
    </div>
  );
}

export default DashboardCharts;
