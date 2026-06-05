import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [debugOtp, setDebugOtp] = useState(location.state?.debugOtp || "");
  const inputs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Redirect if no email
  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto move to next input
    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move back on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const newOtp = pasted.split("").concat(
        Array(6 - pasted.length).fill("")
      );
      setOtp(newOtp);
      inputs.current[Math.min(pasted.length, 5)].focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter complete 6-digit OTP!");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/auth/verify-otp", {
        email,
        otp: otpString
      });
      toast.success("Email verified successfully! 🎉");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid OTP!");
      // Clear OTP on wrong entry
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const res = await axiosInstance.post("/auth/resend-otp", { email });
      const newDebugOtp = res.data?.debugOtp || "";
      setDebugOtp(newDebugOtp);
      toast.success("New OTP sent to your email!");
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0].focus();
    } catch (err) {
      toast.error("Failed to resend OTP!");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center
                    justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md
                      w-full max-w-md text-center">

        {/* Icon */}
        <div className="w-20 h-20 bg-blue-100 rounded-full
                        flex items-center justify-center
                        text-4xl mx-auto mb-6">
          📧
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-500 text-sm mb-2">
          We sent a 6-digit OTP to
        </p>
        <p className="text-blue-600 font-semibold mb-6">
          {email}
        </p>

        {debugOtp && (
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
                  Email sending failed or is bypassed. Use OTP: <strong className="text-yellow-900 bg-yellow-100 px-2 py-0.5 rounded font-mono text-base">{debugOtp}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* OTP Input boxes */}
        <div className="flex gap-3 justify-center mb-8"
             onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputs.current[index] = el}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-2xl font-bold
                         border-2 rounded-xl outline-none transition
                         ${digit
                           ? "border-blue-500 bg-blue-50 text-blue-700"
                           : "border-gray-300 text-gray-800"}
                         focus:border-blue-500 focus:bg-blue-50`}
            />
          ))}
        </div>

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.join("").length !== 6}
          className="w-full bg-blue-600 text-white py-3 rounded-xl
                     font-semibold hover:bg-blue-700 transition
                     disabled:opacity-50 disabled:cursor-not-allowed
                     mb-4">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white
                              border-t-transparent rounded-full
                              animate-spin"></div>
              Verifying...
            </span>
          ) : "Verify OTP ✅"}
        </button>

        {/* Resend section */}
        <div className="text-sm text-gray-500">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-blue-600 font-medium hover:underline
                         disabled:opacity-50">
              {resendLoading ? "Sending..." : "🔄 Resend OTP"}
            </button>
          ) : (
            <p>
              Resend OTP in{" "}
              <span className="text-blue-600 font-semibold">
                {timer}s
              </span>
            </p>
          )}
        </div>

        {/* Back to register */}
        <button
          onClick={() => navigate("/register")}
          className="mt-4 text-gray-400 text-sm hover:text-gray-600">
          ← Back to Register
        </button>

      </div>
    </div>
  );
};

export default OtpVerification;