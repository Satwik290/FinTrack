import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/transactions", {
          withCredentials: true,
        });
        setTransactions(res.data);
      } catch (err) {
        console.error(err.response?.data?.message || "Failed to fetch");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <ul>
        {transactions.map((t) => (
          <li key={t._id} className="border-b py-2">
            {t.type} - {t.amount} ({t.category})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
