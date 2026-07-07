import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(true);
  
  const [form, setForm] = useState({
    appointmentDate: "",
    appointmentTime: "",
    symptoms: ""
  });
  
  const [step, setStep] = useState("booking"); // "booking", "checkout", "success"
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [cardInfo, setCardInfo] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [txnDetails, setTxnDetails] = useState(null);

  useEffect(() => {
    // Fetch doctor details to get specialization and fee
    axiosInstance.get(`/doctors/${doctorId}`)
      .then(res => {
        setDoctor(res.data);
      })
      .catch(() => {
        toast.error("Could not fetch doctor details!");
      })
      .finally(() => setLoadingDoc(false));
  }, [doctorId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setCardInfo({ ...cardInfo, [e.target.name]: e.target.value });
  };

  const startCheckout = async (e) => {
    e.preventDefault();
    if (!form.appointmentDate || !form.appointmentTime || !form.symptoms) {
      toast.error("Please fill all details!");
      return;
    }
    try {
      const res = await axiosInstance.get("/appointments/check-slot", {
        params: {
          doctorId: doctorId,
          date: form.appointmentDate,
          time: form.appointmentTime
        }
      });
      if (res.data.booked) {
        toast.error("This slot is already booked for this doctor. Please choose a different date or time.");
        return;
      }
      setStep("checkout");
    } catch (err) {
      toast.error(err.response?.data?.error || "Error checking slot availability.");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processRazorpayPayment = async () => {
    setPaymentLoading(true);
    try {
      const resScript = await loadRazorpayScript();
      if (!resScript) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setPaymentLoading(false);
        return;
      }

      // 1. Submit appointment to DB in PENDING state
      const apptRes = await axiosInstance.post("/appointments/book", {
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        symptoms: form.symptoms,
        doctorId: parseInt(doctorId)
      });

      const appointment = apptRes.data;

      // 2. Create order in Backend
      const orderRes = await axiosInstance.post("/payments/create-order", {
        appointmentId: appointment.id
      });

      const { orderId, amount, currency, keyId } = orderRes.data;

      // 3. Configure Razorpay options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Smart Health Care System",
        description: `Consultation Fee - Dr. ${doctor?.name || "Doctor"}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            setPaymentLoading(true);
            const verifyRes = await axiosInstance.post("/payments/verify", {
              appointmentId: appointment.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            });

            setTxnDetails(verifyRes.data.payment);
            toast.success("Payment successful & Booking confirmed!");
            setStep("success");
          } catch (verifyErr) {
            toast.error(verifyErr.response?.data?.message || "Payment verification failed. Please contact support.");
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: {
          color: "#2563EB"
        },
        modal: {
          ondismiss: async function () {
            toast.warn("Payment checkout cancelled.");
            try {
              await axiosInstance.put(`/appointments/${appointment.id}/cancel`);
            } catch (err) {
              console.error("Failed to auto-cancel appointment:", err);
            }
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Transaction failed! Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loadingDoc) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden transition-all duration-300">
        
        {/* Booking Form Step */}
        {step === "booking" && (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                🏥 Book Consultation
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Consulting Dr. <strong className="text-slate-700 font-bold">{doctor?.name}</strong> ({doctor?.specialization})
              </p>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 mb-6 flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">Consultation Fee</p>
                <p className="text-2xl font-extrabold text-blue-900 mt-0.5">Rs. {doctor?.consultationFee || "500"}</p>
              </div>
              <span className="text-2xl">💳</span>
            </div>

            <form onSubmit={startCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select Appointment Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={form.appointmentDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select Preferred Time
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={form.appointmentTime}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Describe Symptoms
                </label>
                <textarea
                  name="symptoms"
                  rows={3}
                  value={form.symptoms}
                  onChange={handleChange}
                  placeholder="e.g. Mild headache, dry cough, slight fever..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 bg-white placeholder-slate-400 leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Proceed to Checkout →
              </button>
            </form>
          </div>
        )}

        {/* Payment Checkout Step */}
        {step === "checkout" && (
          <div className="p-8">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  💳 Payment Checkout
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  Complete payment securely with Razorpay
                </p>
              </div>
              <button
                onClick={() => setStep("booking")}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl transition"
              >
                ← Back
              </button>
            </div>

            {/* Appointment Brief Summary */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Appointment Details
              </h3>
              <div className="text-sm text-slate-700 space-y-1.5 leading-relaxed">
                <p className="flex justify-between">
                  <span>Doctor:</span> 
                  <strong className="text-slate-800">Dr. {doctor?.name}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Specialization:</span> 
                  <strong className="text-slate-800">{doctor?.specialization}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Date:</span> 
                  <strong className="text-slate-800">{form.appointmentDate}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Time:</span> 
                  <strong className="text-slate-800">{form.appointmentTime}</strong>
                </p>
              </div>
            </div>

            {/* Price Detail */}
            <div className="bg-blue-50/30 border border-blue-100/50 rounded-2xl p-5 mb-6">
              <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
                <span>Consultation Fee:</span>
                <span className="text-slate-800 font-bold">Rs. {doctor?.consultationFee}</span>
              </div>
              <div className="flex justify-between items-center mt-3 border-t border-blue-100/50 pt-3 text-blue-700 font-extrabold text-lg">
                <span>Total Amount Due:</span>
                <span>Rs. {doctor?.consultationFee}</span>
              </div>
            </div>

            {/* Secured by Razorpay Badge / Branding */}
            <div className="flex justify-center items-center flex-col bg-slate-50 rounded-2xl p-5 border border-dashed border-slate-200 my-4 text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="text-sm font-bold text-slate-700">100% Secured Payment Gateway</h4>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[240px] leading-relaxed">
                You will be redirected to the secure Razorpay payment modal to complete the transaction.
              </p>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-extrabold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                <span>Secured by</span>
                <span className="text-blue-600 tracking-tight font-black uppercase text-[12px]">Razorpay</span>
              </div>
            </div>

            <button
              onClick={processRazorpayPayment}
              disabled={paymentLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-500/20 transition-all duration-200 mt-6 flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {paymentLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Proceed to Pay Rs. {doctor?.consultationFee}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Success / Invoice Step */}
        {step === "success" && (
          <div className="p-8 text-center bg-slate-50/50">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner mb-4 animate-bounce">
              ✓
            </div>
            
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Booking & Payment Confirmed!
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Transaction processed and verified securely by Razorpay
            </p>

            {/* Receipt Summary */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm my-6 text-left space-y-3.5 max-w-sm mx-auto">
              <h3 className="font-extrabold text-sm text-slate-700 border-b border-slate-50 pb-2 flex justify-between">
                <span>Receipt Logs</span>
                <span className="text-emerald-500">PAID</span>
              </h3>
              
              <div className="text-xs text-slate-500 space-y-2 leading-relaxed">
                <p className="flex justify-between"><span>Doctor:</span> <strong className="text-slate-700 font-semibold">Dr. {doctor?.name}</strong></p>
                <p className="flex justify-between"><span>Date:</span> <strong className="text-slate-700 font-semibold">{form.appointmentDate}</strong></p>
                <p className="flex justify-between"><span>Time:</span> <strong className="text-slate-700 font-semibold">{form.appointmentTime}</strong></p>
                <p className="flex justify-between"><span>Method:</span> <strong className="text-slate-700 font-semibold uppercase">{txnDetails?.paymentMethod || "RAZORPAY"}</strong></p>
                <p className="flex justify-between"><span>Amount:</span> <strong className="text-slate-800 font-bold">Rs. {doctor?.consultationFee}</strong></p>
                <p className="flex justify-between border-t border-slate-50 pt-2 text-[11px]">
                  <span>Transaction ID:</span> 
                  <strong className="text-indigo-600 font-extrabold font-mono tracking-wider">{txnDetails?.transactionId}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/patient/dashboard")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition active:scale-95 inline-block"
            >
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;