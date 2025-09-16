import { useState } from "react";
import axios from "axios";

function BudgetForm({ onBudgetAdded }) {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [type, setType] = useState("yearly");
  const [month, setMonth] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // ✅ Normalize category before sending
      const payload = {
        category: category.trim().toLowerCase(),
        limit,
        year,
        type,
      };

      if (type === "monthly") payload.month = parseInt(month);

      const res = await axios.post(
        "http://localhost:5000/api/budgets",
        payload,
        { headers }
      );

      onBudgetAdded(res.data);

      // reset form
      setCategory("");
      setLimit("");
      setType("yearly");
      setMonth("");
    } catch (err) {
      console.error("Failed to add budget", err.response?.data || err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow mb-6"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-700">Add Budget</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-3 border rounded-lg w-full"
          required
        />
        <input
          type="number"
          placeholder="Limit (₹)"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="p-3 border rounded-lg w-full"
          required
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="p-3 border rounded-lg w-full"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-3 border rounded-lg w-full"
        >
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
        </select>
        {type === "monthly" && (
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="p-3 border rounded-lg w-full"
            required
          >
            <option value="">Select Month</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        )}
      </div>

      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
      >
        Add Budget
      </button>
    </form>
  );
}

export default BudgetForm;
