import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: isOpen ? 0 : -250 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="bg-white shadow-lg fixed h-full top-0 left-0 p-6 z-20"
      style={{ width: isOpen ? "16rem" : "4rem" }}
    >
      <div className="flex justify-between items-center mb-8">
        {isOpen && (
          <h1 className="text-2xl font-bold text-blue-600">FinTrack</h1>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded hover:bg-gray-200"
        >
          {isOpen ? "⬅" : "➡"}
        </button>
      </div>

      <nav className="flex flex-col gap-4">
        {[
          { to: "/dashboard", label: "📊 Dashboard" },
          { to: "/transactions", label: "💸 Transactions" },
          { to: "/budgets", label: "📅 Budgets" },
          { to: "/reports", label: "📑 Reports" },
        ].map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-medium transition ${
                isActive
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`
            }
          >
            {isOpen ? link.label : link.label.split(" ")[0]} {/* icon only when closed */}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
}

export default Sidebar;
