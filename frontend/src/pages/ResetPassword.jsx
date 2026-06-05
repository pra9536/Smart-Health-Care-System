import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [valid, setValid] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [show, setShow] = useState(false);

  // Verify token on page load
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axiosInstance.get(
      `/auth/verify-reset-token?token=${token}`)
      .then(() => setValid(true))
      .catch(() => {
        toast.error("Invalid or expired reset link!");
        setValid(false);
      })
      .finally(() => setChecking(false));
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error(
        "Password must be at least 6 characters!");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/auth/reset-password", {
        token,
        newPassword: form.newPassword
      });
      toast.success(
        "Password reset successfully! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Failed to reset password!");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return (
    <div className="min-h-screen bg-gray-50
                    flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12
                      border-b-2 border-blue-600"></div>
    </div>
  );

  if (!valid) return (
    <div className="min-h-screen bg-gray-50
                    flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md
                      w-full max-w-md text-center">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Invalid or Expired Link
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          This password reset link is invalid or
          has expired. Please request a new one.
        </p>
        <button onClick={() => navigate("/forgot-password")}
          className="bg-blue-600 text-white px-6 py-2
                     rounded-xl font-medium
                     hover:bg-blue-700 transition">
          Request New Link
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50
                    flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md
                      w-full max-w-md">

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full
                          flex items-center justify-center
                          text-3xl mx-auto mb-4">
            🔑
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Create New Password
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium
                               text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={form.newPassword}
                onChange={e => setForm({
                  ...form,
                  newPassword: e.target.value
                })}
                placeholder="Enter new password"
                className="w-full border border-gray-300
                           rounded-xl px-4 py-3 pr-12
                           focus:outline-none
                           focus:ring-2 focus:ring-blue-400"
                required
              />
              <button type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-3
                           text-gray-400 hover:text-gray-600">
                {show ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium
                               text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type={show ? "text" : "password"}
              value={form.confirmPassword}
              onChange={e => setForm({
                ...form,
                confirmPassword: e.target.value
              })}
              placeholder="Confirm new password"
              className="w-full border border-gray-300
                         rounded-xl px-4 py-3
                         focus:outline-none
                         focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Password match indicator */}
          {form.confirmPassword && (
            <p className={`text-xs font-medium
              ${form.newPassword === form.confirmPassword
                ? "text-green-600"
                : "text-red-500"}`}>
              {form.newPassword === form.confirmPassword
                ? "✅ Passwords match!"
                : "❌ Passwords do not match"}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3
                       rounded-xl font-semibold
                       hover:bg-blue-700 transition
                       disabled:opacity-50">
            {loading ? "Resetting..." : "Reset Password ✅"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;