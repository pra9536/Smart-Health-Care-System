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

  const startCheckout = (e) => {
    e.preventDefault();
    if (!form.appointmentDate || !form.appointmentTime || !form.symptoms) {
      toast.error("Please fill all details!");
      return;
    }
    setStep("checkout");
  };

  const processSimulatedPayment = async () => {
    if (paymentMethod === "UPI" && !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID (e.g. user@okaxis)!");
      return;
    }
    if (paymentMethod === "CARD" && (cardInfo.number.length < 16 || cardInfo.cvv.length < 3)) {
      toast.error("Please enter a valid 16-digit card number and 3-digit CVV!");
      return;
    }

    setPaymentLoading(true);
    try {
      // 1. Submit appointment to DB in PENDING state
      const apptRes = await axiosInstance.post("/appointments/book", {
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        symptoms: form.symptoms,
        doctorId: parseInt(doctorId)
      });

      const appointment = apptRes.data;

      // 2. Call transactional payments processing API
      const payRes = await axiosInstance.post("/payments/process", {
        appointmentId: appointment.id,
        amount: doctor?.consultationFee || 500.0,
        paymentMethod: paymentMethod
      });

      setTxnDetails(payRes.data);
      toast.success("Payment successful & Booking confirmed!");
      setStep("success");
    } catch (err) {
      toast.error(err.response?.data?.error || "Transaction failed! Please try again.");
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
                  💳 Payment Gateway
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  Secure sandbox transaction console
                </p>
              </div>
              <button
                onClick={() => setStep("booking")}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl transition"
              >
                ← Back
              </button>
            </div>

            {/* Price Detail */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 mb-6">
              <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
                <span>Doctor Consultation Fee:</span>
                <span className="text-slate-800 font-bold">Rs. {doctor?.consultationFee}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold text-slate-600 mt-2 border-t border-slate-100 pt-2 text-blue-700 font-extrabold text-base">
                <span>Total Amount Due:</span>
                <span>Rs. {doctor?.consultationFee}</span>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod("UPI")}
                className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition ${
                  paymentMethod === "UPI"
                    ? "border-blue-600 bg-blue-50/30 text-blue-600 font-extrabold"
                    : "border-slate-200 text-slate-400 hover:text-slate-600 bg-white"
                }`}
              >
                📱 UPI Payment
              </button>
              <button
                onClick={() => setPaymentMethod("CARD")}
                className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition ${
                  paymentMethod === "CARD"
                    ? "border-blue-600 bg-blue-50/30 text-blue-600 font-extrabold"
                    : "border-slate-200 text-slate-400 hover:text-slate-600 bg-white"
                }`}
              >
                💳 Credit / Debit Card
              </button>
            </div>

            {/* Payment Method Details */}
            {paymentMethod === "UPI" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Enter UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. patient@okaxis"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 font-medium"
                    required
                  />
                </div>
                <div className="flex justify-center items-center flex-col bg-slate-50 rounded-2xl p-5 border border-dashed border-slate-200 my-4">
                  <div className="w-40 h-40 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-inner p-2.5 relative group overflow-hidden bg-gradient-to-tr from-white to-slate-50/50">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        `upi://pay?pa=smarthealthcare@okaxis&pn=SmartHealthCare&am=${doctor?.consultationFee || 500.0}&cu=INR&tn=Consultation+Fee+Dr+${encodeURIComponent(doctor?.name || "Doctor")}`
                      )}`} 
                      alt="UPI QR Code" 
                      className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/150x150?text=QR+Code";
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100/50 text-[10px] font-bold">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Live UPI QR Generated
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2 text-center max-w-[220px] leading-relaxed">
                    Scan this QR code with any UPI app (GPay, PhonePe, Paytm) to simulate transfer of <strong>Rs. {doctor?.consultationFee || 500.0}</strong> dynamically.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="number"
                    maxLength={16}
                    placeholder="1234567812345678"
                    value={cardInfo.number}
                    onChange={handleCardChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. John Doe"
                    value={cardInfo.name}
                    onChange={handleCardChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 font-medium"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiry"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardInfo.expiry}
                      onChange={handleCardChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      CVV / Security Code
                    </label>
                    <input
                      type="password"
                      name="cvv"
                      maxLength={3}
                      placeholder="•••"
                      value={cardInfo.cvv}
                      onChange={handleCardChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 font-medium"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={processSimulatedPayment}
              disabled={paymentLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-emerald-500/20 transition-all duration-200 mt-6 flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {paymentLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>🔒 Pay Rs. {doctor?.consultationFee}</span>
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
              Simulated Transaction Ledger verified successfully
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
                <p className="flex justify-between"><span>Method:</span> <strong className="text-slate-700 font-semibold uppercase">{paymentMethod}</strong></p>
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