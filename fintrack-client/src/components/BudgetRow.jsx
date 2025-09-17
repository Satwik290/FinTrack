import { useState, useEffect } from "react";
import axios from "axios";

function BudgetRow({ budget, onUpdated, onDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [category, setCategory] = useState(budget.category);
  const [limit, setLimit] = useState(budget.limit);

  // Utilization state
  const [spent, setSpent] = useState(0);
  const [remaining, setRemaining] = useState(budget.limit);
  const [percent, setPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED: Fetch utilization data from API
  const fetchUtilization = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const params = new URLSearchParams({
        year: budget.year.toString(),
      });
      
      if (budget.type === "monthly" && budget.month) {
        params.append('month', budget.month.toString());
      }

      console.log(`🔍 Fetching utilization for budget: ${budget.category} (${budget.type})`);
      
      const res = await axios.get(
        `http://localhost:5000/api/budgets/utilization?${params.toString()}`,
        { headers }
      );

      console.log(`📊 Utilization response:`, res.data);

      // FIXED: Find the matching budget by category (both should be lowercase)
      const util = res.data.find(
        (u) => u.category.toLowerCase() === budget.category.toLowerCase()
      );

      console.log(`🎯 Found matching utilization:`, util);

      if (util) {
        setSpent(util.spent);
        setRemaining(util.remaining);
        setPercent(Math.min((util.spent / util.limit) * 100, 100));
      } else {
        // Reset to defaults if no utilization found
        setSpent(0);
        setRemaining(budget.limit);
        setPercent(0);
      }
    } catch (err) {
      console.error("❌ Failed to fetch budget utilization", err);
      // Reset to defaults on error
      setSpent(0);
      setRemaining(budget.limit);
      setPercent(0);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch utilization whenever budget changes
  useEffect(() => {
    fetchUtilization();
  }, [budget, budget._id]);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.put(
        `http://localhost:5000/api/budgets/${budget._id}`,
        { 
          category: category.trim().toLowerCase(), // Ensure normalization
          limit: parseFloat(limit) 
        },
        { headers }
      );

      onUpdated(res.data);
      setIsEditing(false);
      // Fetch utilization will be triggered by useEffect when budget prop changes
    } catch (err) {
      console.error("❌ Failed to update budget", err.response?.data || err.message);
      alert("Failed to update budget. Please try again.");
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
      console.error("❌ Failed to delete budget", err.response?.data || err.message);
      alert("Failed to delete budget. Please try again.");
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-3">
        {isEditing ? (
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded w-full"
            placeholder="Category name"
          />
        ) : (
          <span className="capitalize">{budget.category}</span>
        )}
      </td>
      <td className="p-3">
        {isEditing ? (
          <input
            type="number"
            step="0.01"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="p-2 border rounded w-full"
            placeholder="Budget limit"
          />
        ) : (
          `₹${budget.limit}`
        )}
      </td>
      <td className="p-3">
        {loading ? (
          <span className="text-gray-400">Loading...</span>
        ) : (
          `₹${spent}`
        )}
      </td>
      <td className="p-3 w-64">
        {loading ? (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="h-2.5 bg-gray-300 rounded-full animate-pulse"></div>
          </div>
        ) : (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  percent < 70
                    ? "bg-green-500"
                    : percent < 100
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {percent.toFixed(1)}% used (
              {remaining >= 0
                ? `₹${remaining.toFixed(2)} left`
                : `Over by ₹${Math.abs(remaining).toFixed(2)}`})
            </p>
          </>
        )}
      </td>
      <td className="p-3">
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleUpdate}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCategory(budget.category);
                  setLimit(budget.limit);
                }}
                className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default BudgetRow;