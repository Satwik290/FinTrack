import { useState, useEffect } from "react";
import axios from "axios";

function BudgetRow({ budget, onUpdated, onDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [category, setCategory] = useState(budget.category);
  const [limit, setLimit] = useState(budget.limit);

  // Utilization state
  const [spent, setSpent] = useState(0);
  const [remaining, setRemaining] = useState(limit);
  const [percent, setPercent] = useState(0);

  // ✅ Fetch utilization data from API
  const fetchUtilization = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(
        `http://localhost:5000/api/budgets/utilization?year=${budget.year}${
          budget.type === "monthly" ? `&month=${budget.month}` : ""
        }`,
        { headers }
      );

      const util = res.data.find(
        (u) => u.category.toLowerCase() === budget.category.toLowerCase()
      );

      if (util) {
        setSpent(util.spent);
        setRemaining(util.remaining);
        setPercent(Math.min((util.spent / util.limit) * 100, 100));
      }
    } catch (err) {
      console.error("Failed to fetch budget utilization", err);
    }
  };

  // ✅ Fetch utilization whenever budget or limit changes
  useEffect(() => {
    fetchUtilization();
  }, [budget]);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.put(
        `http://localhost:5000/api/budgets/${budget._id}`,
        { category, limit },
        { headers }
      );

      onUpdated(res.data);
      setIsEditing(false);
      fetchUtilization(); // 🔄 refresh after update
    } catch (err) {
      console.error("Failed to update budget", err.response?.data || err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`http://localhost:5000/api/budgets/${budget._id}`, {
        headers,
      });

      onDeleted(budget._id);
    } catch (err) {
      console.error("Failed to delete budget", err.response?.data || err.message);
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-3">
        {isEditing ? (
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded"
          />
        ) : (
          budget.category
        )}
      </td>
      <td className="p-3">
        {isEditing ? (
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="p-2 border rounded"
          />
        ) : (
          `₹${budget.limit}`
        )}
      </td>
      <td className="p-3">₹{spent}</td>
      <td className="p-3 w-64">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              percent < 70
                ? "bg-green-500"
                : percent < 100
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {percent.toFixed(2)}% used (
          {remaining >= 0
            ? `₹${remaining} left`
            : `Over by ₹${Math.abs(remaining)}`} )
        </p>
      </td>
      <td className="p-3">
        {isEditing ? (
          <>
            <button
              onClick={handleUpdate}
              className="px-2 py-1 bg-green-500 text-white rounded mr-2"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="px-2 py-1 bg-blue-500 text-white rounded mr-2"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-2 py-1 bg-red-500 text-white rounded"
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
}

export default BudgetRow;
