import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    date: "",
    paymentMethod: "",
    notes: "",
  });
  const [editing, setEditing] = useState(null); // store transaction being edited
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
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // ✅ Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Add or Update Transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (editing) {
        // Update
        await axios.put(
          `http://localhost:5000/api/transactions/${editing}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditing(null);
      } else {
        // Add new
        await axios.post("http://localhost:5000/api/transactions", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setForm({
        type: "expense",
        amount: "",
        category: "",
        date: "",
        paymentMethod: "",
        notes: "",
      });

      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Delete transaction
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(transactions.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Open edit modal
  const handleEdit = (transaction) => {
    setEditing(transaction._id);
    setForm({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date.split("T")[0], // format date
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
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="paymentMethod"
          placeholder="Payment Method"
          value={form.paymentMethod}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />
        <button
          type="submit"
          className={`${
            editing ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
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
                <td className="p-3">{t.category}</td>
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
