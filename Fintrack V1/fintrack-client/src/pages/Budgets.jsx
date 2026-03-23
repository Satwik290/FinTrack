// src/pages/Budgets.jsx
import { useState } from "react";
import BudgetForm from "../components/BudgetForm";
import BudgetTable from "../components/BudgetTable";

function Budgets() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">📌 Budgets</h1>

      <BudgetForm onBudgetAdded={() => setRefresh(refresh + 1)} />
      <BudgetTable refresh={refresh} />

      {/* ✅ Add transaction trigger for budgets */}
      {/* Example if you want transactions inside this page */}
      {/* <Transactions onTransactionsChanged={() => setRefresh(refresh + 1)} /> */}
    </div>
  );
}

export default Budgets;
