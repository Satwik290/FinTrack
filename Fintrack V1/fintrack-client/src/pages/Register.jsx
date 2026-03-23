import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLayout from "../components/AuthLayout"; // Adjust path if needed

// Animation variants (can be reused or defined in a separate file)
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", form, {
        withCredentials: true,
      });
      setMessage("✅ Registered Successfully! Please login.");
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Registration failed"));
    }
  };

  return (
    <AuthLayout
      title="Welcome to FinTrack"
      description="Your personal finance manager to track expenses, budgets, and savings effortlessly."
      gradient="animated-gradient-indigo" // Custom class for animated gradient
    >
      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-sm"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Create Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.input
            variants={itemVariants}
            type="text" name="name" placeholder="Full Name"
            value={form.name} onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
            required
          />
          <motion.input
            variants={itemVariants}
            type="email" name="email" placeholder="Email"
            value={form.email} onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
            required
          />
          <motion.input
            variants={itemVariants}
            type="password" name="password" placeholder="Password"
            value={form.password} onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
            required
          />
          <motion.button
            variants={itemVariants}
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Register
          </motion.button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm font-medium text-green-600">{message}</p>
        )}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}

export default Register;