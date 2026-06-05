import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

const Register = () => {
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "PATIENT"
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/register", form);

      if (res.data.otpSent) {
        toast.success("OTP sent to your email!");
        // ✅ Redirect to OTP verification page
        navigate("/verify-otp", {
          state: { email: form.email, debugOtp: res.data.debugOtp }
        });
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Create Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Full Name"
            value={form.name} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required />
          <input name="email" type="email" placeholder="Email"
            value={form.email} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required />
          <input name="password" type="password" placeholder="Password"
            value={form.password} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required />
          <select name="role" value={form.role} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="PATIENT">Patient</option>
            <option value="DOCTOR">Doctor</option>
          </select>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;