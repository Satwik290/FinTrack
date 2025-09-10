// src/components/BudgetForm.jsx
import { useState } from "react";
import axios from "axios";

function BudgetForm({ onBudgetAdded }) {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.post(
        "http://localhost:5000/api/budgets",
        { category, limit, year },
        { headers }
      );

      onBudgetAdded(res.data);
      setCategory("");
      setLimit("");
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
