import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

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
      navigate("/dashboard");
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Login failed"));
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-pink-500 to-red-600 items-center justify-center text-white p-12">
        <div>
          <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-lg opacity-90">
            Sign in to continue managing your budgets and expenses with FinTrack.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-96">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
            />
            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Login
            </button>
          </form>
          {message && (
            <p className="mt-4 text-center text-sm text-red-500">{message}</p>
          )}
          <p className="text-center mt-6 text-gray-600">
            Don’t have an account?{" "}
            <Link to="/register" className="text-pink-600 font-semibold">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
