import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
    <div className="flex min-h-screen">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 items-center justify-center text-white p-12">
        <div>
          <h1 className="text-4xl font-bold mb-4">Welcome to FinTrack</h1>
          <p className="text-lg opacity-90">
            Your personal finance manager to track expenses, budgets, and savings
            effortlessly.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-96">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Create Account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Register
            </button>
          </form>
          {message && (
            <p className="mt-4 text-center text-sm text-red-500">{message}</p>
          )}
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
