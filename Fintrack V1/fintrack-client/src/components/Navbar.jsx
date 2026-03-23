import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow px-6 py-4 flex justify-between items-center fixed top-0 left-64 right-0 z-10"
    >
      <h2 className="text-xl font-bold text-gray-700">Welcome Back 👋</h2>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
      >
        Logout
      </motion.button>
    </motion.header>
  );
}

export default Navbar;
