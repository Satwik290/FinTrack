import axios from "axios";
import { useEffect, useState } from "react";
import BudgetRow from "./BudgetRow";

function BudgetTable({ refresh }) {
  const [budgets, setBudgets] = useState([]);
  const [utilizations, setUtilizations] = useState([]);

  // ✅ Fetch all budgets
  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get("http://localhost:5000/api/budgets", {
        headers,
      });
      setBudgets(res.data);
    } catch (err) {
      console.error("Failed to fetch budgets", err.response?.data || err.message);
    }
  };

  // ✅ Fetch utilization for all budgets
  const fetchUtilizations = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const year = new Date().getFullYear();
      const res = await axios.get(
        `http://localhost:5000/api/budgets/utilization?year=${year}`,
        { headers }
      );

      setUtilizations(res.data);
    } catch (err) {
      console.error("Failed to fetch budget utilization", err.response?.data || err.message);
    }
  };

  // ✅ Run on load + whenever refresh changes
  useEffect(() => {
    fetchBudgets();
    fetchUtilizations();
  }, [refresh]);

  const handleUpdate = (updatedBudget) => {
    setBudgets((prev) =>
      prev.map((b) => (b._id === updatedBudget._id ? updatedBudget : b))
    );
    fetchUtilizations(); // refresh utilization after update
  };

  const handleDelete = (id) => {
    setBudgets((prev) => prev.filter((b) => b._id !== id));
    fetchUtilizations(); // refresh utilization after delete
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Budgets</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600">
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Limit</th>
              <th className="p-3 text-left">Spent</th>
              <th className="p-3 text-left">Progress</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((b) => {
              const util = utilizations.find((u) => u.category === b.category);
              return (
                <BudgetRow
                  key={b._id}
                  budget={b}
                  utilization={util}
                  onUpdated={handleUpdate}
                  onDeleted={handleDelete}
                />
              );
            })}
            {budgets.length === 0 && (
              <tr>
                <td colSpan="5" className="p-3 text-center text-gray-400">
                  No budgets set yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BudgetTable;
