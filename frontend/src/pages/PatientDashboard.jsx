import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { downloadAppointmentPDF } from "../utils/generatePDF";

const statusColors = {
  PENDING: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  CONFIRMED: "bg-green-50 text-green-700 border border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border border-red-200",
  COMPLETED: "bg-blue-50 text-blue-700 border border-blue-200",
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [hasProfile, setHasProfile] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if patient profile exists
    axiosInstance
      .get("/patients/me")
      .then(() => setHasProfile(true))
      .catch(() => setHasProfile(false));

    // Load appointments
    axiosInstance
      .get("/appointments/my")
      .then((res) => setAppointments(res.data || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await axiosInstance.put(`/appointments/${id}/cancel`);
      toast.success("Appointment cancelled!");
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a)),
      );
    } catch {
      toast.error("Could not cancel appointment");
    }
  };

  const handleDownloadReceipt = async (app) => {
    try {
      const res = await axiosInstance.get(`/payments/appointment/${app.id}`);
      const appWithPayment = { ...app, payment: res.data };
      downloadAppointmentPDF(appWithPayment);
    } catch {
      downloadAppointmentPDF(app);
    }
  };

  const completedApps = appointments.filter(a => a.status === "COMPLETED").length;
  const confirmedApps = appointments.filter(a => a.status === "CONFIRMED").length;
  const pendingApps = appointments.filter(a => a.status === "PENDING").length;
  const totalApps = appointments.length;

  const statCards = [
    { label: "Total Bookings", value: totalApps, icon: "📋",
      color: "bg-blue-50/50 border-blue-100 hover:shadow-blue-500/5 hover:border-blue-200", text: "text-blue-700" },
    { label: "Pending Approval", value: pendingApps, icon: "⏳",
      color: "bg-yellow-50/50 border-yellow-100 hover:shadow-yellow-500/5 hover:border-yellow-200", text: "text-yellow-700" },
    { label: "Confirmed Visits", value: confirmedApps, icon: "✅",
      color: "bg-green-50/50 border-green-100 hover:shadow-green-500/5 hover:border-green-200", text: "text-green-700" },
    { label: "Consulted Sessions", value: completedApps, icon: "✔️",
      color: "bg-purple-50/50 border-purple-100 hover:shadow-purple-500/5 hover:border-purple-200", text: "text-purple-700" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Welcome */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
          Welcome, {user?.name} 👋
        </h1>
        <p className="text-slate-500 mt-2 text-base">Book new sessions, review histories, and download reports.</p>
      </div>

      {/* Profile warning banner */}
      {!hasProfile && (
        <div
          className="bg-amber-50/70 backdrop-blur-sm border border-amber-200/50
                        rounded-3xl p-5 mb-8 flex items-center
                        justify-between flex-wrap gap-4 shadow-sm shadow-amber-500/5"
        >
          <div>
            <p className="font-bold text-amber-900 flex items-center gap-1.5 text-sm">
              ⚠️ Profile not completed!
            </p>
            <p className="text-amber-700 text-xs mt-1 font-medium leading-relaxed">
              Please complete your details to unlock scheduling and book appointments.
            </p>
          </div>
          <button
            onClick={() => navigate("/patient/profile")}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-5 py-2.5 rounded-xl
                       text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-200 active:scale-95"
          >
            Complete Profile →
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mb-10 flex-wrap border-b border-slate-100 pb-6">
        <button
          onClick={() => navigate("/doctors")}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl
                     text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          + Book New Appointment
        </button>
        <button
          onClick={() => navigate("/patient/records")}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-2.5 rounded-xl
                     text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          🗂️ My Medical Records
        </button>
        <button
          onClick={() => navigate("/patient/profile")}
          className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-2.5 rounded-xl
                     text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 border border-slate-200/50"
        >
          ✏️ Edit My Profile
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {statCards.map(card => (
          <div key={card.label}
            className={`${card.color} border rounded-3xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default group`}>
            <p className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{card.icon}</p>
            <p className="text-3xl font-extrabold text-slate-800 leading-tight">
              {card.value}
            </p>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1.5">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Appointments list */}
      <h2 className="text-xl font-bold text-slate-700 mb-5 flex items-center gap-2">
        📅 My Appointments Grid
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div
            className="animate-spin rounded-full h-8 w-8
                          border-b-2 border-indigo-600"
          ></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold">No appointments yet. Book your first appointment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div
                className="flex justify-between items-start
                              flex-wrap gap-4"
              >
                <div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight flex items-center gap-2 group-hover:text-blue-700 transition-colors">
                    <span className="w-8 h-8 bg-blue-50/50 text-blue-600 rounded-xl flex items-center justify-center text-sm shadow-inner">👨‍⚕️</span>
                    {app.doctor?.name}
                  </h3>
                  <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mt-2.5 pl-10">
                    {app.doctor?.specialization}
                  </p>
                  
                  <div className="text-sm text-slate-500 space-y-2 mt-4 pl-10 border-l-2 border-slate-50">
                    <p className="flex items-center gap-2">📅 <span className="font-semibold text-slate-700">{app.appointmentDate} at {app.appointmentTime}</span></p>
                    <p className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50 mt-3 text-xs leading-relaxed max-w-xl">
                      🩺 Symptoms: <strong className="text-slate-700 font-semibold">{app.symptoms}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 self-stretch justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[app.status]}`}
                  >
                    {app.status}
                  </span>
                  
                  {app.status === "PENDING" && (
                    <button
                      onClick={() => handleCancel(app.id)}
                      className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-rose-500/20 transition duration-200 active:scale-95 mt-2"
                    >
                      Cancel Appointment
                    </button>
                  )}
                  {app.status === "COMPLETED" && (
                    <button
                      onClick={() => handleDownloadReceipt(app)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-indigo-500/20 transition duration-200 active:scale-95 flex items-center gap-1.5 mt-2"
                    >
                      📥 Receipt
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
