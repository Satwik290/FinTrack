import { Link, Outlet, useNavigate } from "react-router-dom";
import { FaChartBar, FaWallet, FaMoneyBillWave, FaSignOutAlt } from "react-icons/fa";

function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-[#0f172a] text-white flex flex-col shadow-xl">
        <div className="px-6 py-6 text-2xl font-bold flex items-center gap-2 border-b border-gray-700">
          <FaChartBar className="text-blue-400" />
          FinTrack
        </div>

        <nav className="flex-1 px-4 py-6 space-y-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition"
          >
            <FaChartBar /> Dashboard
          </Link>
          <Link
            to="/transactions"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition"
          >
            <FaWallet /> Transactions
          </Link>
          <Link
            to="/budgets"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition"
          >
            <FaMoneyBillWave /> Budgets
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 m-4 rounded-lg bg-red-600 hover:bg-red-700 transition"
        >
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 bg-gray-50 min-h-screen p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
