import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [debugToken, setDebugToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/forgot-password",
        { email });
      const token = res.data?.debugToken || "";
      setDebugToken(token);
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50
                    flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md
                      w-full max-w-md text-center">

        <div className="w-16 h-16 bg-blue-100 rounded-full
                        flex items-center justify-center
                        text-3xl mx-auto mb-6">
          🔐
        </div>

        {!sent ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Enter your email and we will send you
              a reset link.
            </p>

            <form onSubmit={handleSubmit}
                  className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border border-gray-300
                           rounded-xl px-4 py-3
                           focus:outline-none
                           focus:ring-2 focus:ring-blue-400"
                required
              />
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white
                           py-3 rounded-xl font-semibold
                           hover:bg-blue-700 transition
                           disabled:opacity-50">
                {loading ? "Sending..." : "Send Reset Link 📧"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-2xl font-bold
                           text-gray-800 mb-2">
              Check Your Email!
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              We sent a password reset link to
              <br />
              <span className="text-blue-600 font-medium">
                {email}
              </span>
            </p>
            <p className="text-red-400 text-xs mb-6">
              ⏰ Link expires in 30 minutes
            </p>
            {debugToken && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-xl text-left">
                <div className="flex">
                  <div className="flex-shrink-0 text-yellow-500 text-lg">
                    ⚠️
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider">
                      Development Debug Mode
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Email sending failed or is bypassed. Use this debug link to reset your password:
                    </p>
                    <div className="mt-2 text-center">
                      <Link
                        to={`/reset-password?token=${debugToken}`}
                        className="text-blue-600 font-semibold hover:underline break-all inline-block bg-white border border-yellow-200 px-3 py-1 rounded text-sm"
                      >
                        Reset Password 🔗
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <button onClick={() => setSent(false)}
              className="text-blue-600 text-sm
                         hover:underline">
              Resend email
            </button>
          </>
        )}

        <div className="mt-6">
          <Link to="/login"
            className="text-gray-400 text-sm hover:text-gray-600">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;