import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLayout from "../components/AuthLayout"; // Adjust path if needed

// Animation variants for the form container
const formVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

// Animation variants for individual form items
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form, {
        withCredentials: true,
      });
      localStorage.setItem("token", res.data.token);
      setMessage("✅ Login Successful!");
      setTimeout(() => navigate("/dashboard"), 1000); // Navigate after a short delay
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Login failed"));
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      description="Sign in to continue managing your budgets and expenses with FinTrack."
      gradient="animated-gradient-pink" // Custom class for animated gradient
    >
      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-sm"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.input
            variants={itemVariants}
            type="email" name="email" placeholder="Email"
            value={form.email} onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all"
            required
          />
          <motion.input
            variants={itemVariants}
            type="password" name="password" placeholder="Password"
            value={form.password} onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all"
            required
          />
          <motion.button
            variants={itemVariants}
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            Login
          </motion.button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm font-medium text-red-500">{message}</p>
        )}
        <p className="text-center mt-6 text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-pink-600 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}

export default Login;