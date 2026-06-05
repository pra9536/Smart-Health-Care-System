import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login", form);
      const { token, name, email, role } = res.data;
      login({ name, email, role }, token);
      toast.success("Login successful!");

      if (role === "PATIENT") navigate("/patient/dashboard");
      else if (role === "DOCTOR") navigate("/doctor/dashboard");
      else if (role === "ADMIN") navigate("/admin/dashboard");

    } catch (err) {
      // ✅ Handle unverified email
      if (err.response?.data?.notVerified) {
        toast.warning("Email not verified! Redirecting...");
        navigate("/verify-otp", {
          state: { email: form.email, debugOtp: err.response.data.debugOtp }
        });
      } else {
        toast.error(
          err.response?.data?.message || "Login failed!");
      }
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Login to HealthCare
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email" name="email"
              value={form.email} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="rahul@gmail.com" required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password" name="password"
              value={form.password} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••••" required
            />
          </div>
          <div className="flex justify-end">
  <Link to="/forgot-password"
    className="text-sm text-blue-600 hover:underline">
    Forgot Password?
  </Link>
</div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;