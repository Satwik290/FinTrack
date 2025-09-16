// src/pages/Transactions.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Transactions({ onTransactionsChanged }) {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    date: "",
    paymentMethod: "cash",
    notes: "",
  });
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  // ✅ Fetch transactions
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.get("http://localhost:5000/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch transactions:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // ✅ Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Add or Update Transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // 🔹 Normalize category for budget tracking
      const payload = {
        ...form,
        category: form.category.trim().toLowerCase(),
      };

      if (editing) {
        await axios.put(
          `http://localhost:5000/api/transactions/${editing}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditing(null);
      } else {
        await axios.post("http://localhost:5000/api/transactions", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Reset form
      setForm({
        type: "expense",
        amount: "",
        category: "",
        date: "",
        paymentMethod: "cash",
        notes: "",
      });

      fetchData();
      onTransactionsChanged?.(); // 🔄 Trigger budget refresh
    } catch (err) {
      console.error("❌ Failed to save transaction:", err);
    }
  };

  // ✅ Delete transaction
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTransactions(transactions.filter((t) => t._id !== id));
      onTransactionsChanged?.(); // 🔄 Trigger budget refresh
    } catch (err) {
      console.error("❌ Failed to delete transaction:", err);
    }
  };

  // ✅ Edit transaction
  const handleEdit = (transaction) => {
    setEditing(transaction._id);
    setForm({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date.split("T")[0], // yyyy-mm-dd
      paymentMethod: transaction.paymentMethod,
      notes: transaction.notes,
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">💰 Transactions</h1>

      {/* Add / Edit Transaction Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow mb-6"
      >
        {/* Type */}
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        {/* Amount */}
        <input
          type="number"
          name="amount"
          placeholder="Amount (₹)"
          value={form.amount}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        {/* Category */}
        <input
          type="text"
          name="category"
          placeholder="Category (e.g. food, rent)"
          value={form.category}
          onChange={handleChange}
          className="border p-2 rounded capitalize"
          required
        />

        {/* Date */}
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        {/* Payment Method */}
        <select
          name="paymentMethod"
          value={form.paymentMethod}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
          <option value="other">Other</option>
        </select>

        {/* Notes */}
        <input
          type="text"
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />

        {/* Submit */}
        <button
          type="submit"
          className={`${
            editing
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white px-4 py-2 rounded col-span-2`}
        >
          {editing ? "Update Transaction" : "Add Transaction"}
        </button>
      </form>

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-600">
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Notes</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id} className="border-b hover:bg-gray-50 transition">
                <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-3 capitalize">{t.category}</td>
                <td
                  className={`p-3 font-bold ${
                    t.type === "income" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {t.type}
                </td>
                <td className="p-3">₹{t.amount}</td>
                <td className="p-3">{t.paymentMethod || "-"}</td>
                <td className="p-3">{t.notes || "-"}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(t)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="7" className="p-3 text-center text-gray-400">
                  No transactions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transactions;
