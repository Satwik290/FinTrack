import { Link, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Layout() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-64 bg-white shadow-lg p-6 flex flex-col"
      >
        <h2 className="text-2xl font-bold mb-8 text-indigo-600">FinTrack</h2>
        <nav className="flex flex-col space-y-4 text-gray-700">
          <Link to="/dashboard" className="hover:text-indigo-600">📊 Dashboard</Link>
          <Link to="/transactions" className="hover:text-indigo-600">💰 Transactions</Link>
          <Link to="/budgets" className="hover:text-indigo-600">📈 Budgets</Link>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="mt-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-md p-4 flex justify-between items-center"
        >
          <h1 className="text-xl font-semibold text-gray-700">Welcome to FinTrack</h1>
          <span className="text-gray-500">User Panel</span>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet /> {/* 👈 This renders the current page (Dashboard, Transactions, etc.) */}
        </main>
      </div>
    </div>
  );
}

export default Layout;
