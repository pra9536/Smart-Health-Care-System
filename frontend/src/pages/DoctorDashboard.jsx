import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { downloadMedicalRecordPDF } from "../utils/generatePDF";

const statusColors = {
  PENDING:   "bg-yellow-50 text-yellow-700 border border-yellow-200",
  CONFIRMED: "bg-green-50 text-green-700 border border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border border-red-200",
  COMPLETED: "bg-blue-50 text-blue-700 border border-blue-200"
};

// Helper to calculate stats from appointments array
const calcStats = (appts) => ({
  total:     appts.length,
  pending:   appts.filter(a => a.status === "PENDING").length,
  confirmed: appts.filter(a => a.status === "CONFIRMED").length,
  completed: appts.filter(a => a.status === "COMPLETED").length,
});

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0, pending: 0, confirmed: 0, completed: 0
  });

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const [activeTab, setActiveTab] = useState("appointments");
  const [writtenRecords, setWrittenRecords] = useState([]);
  const [loadingWrittenRecords, setLoadingWrittenRecords] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadWrittenRecords = async () => {
    setLoadingWrittenRecords(true);
    try {
      const res = await axiosInstance.get("/medical-records/doctor");
      setWrittenRecords(res.data || []);
    } catch {
      toast.error("Could not fetch written medical records");
    } finally {
      setLoadingWrittenRecords(false);
    }
  };

  const viewPatientHistory = async (patient) => {
    setSelectedPatient(patient);
    setLoadingRecords(true);
    setPatientRecords([]);
    try {
      const res = await axiosInstance.get(`/medical-records/patient/${patient.id}`);
      setPatientRecords(res.data || []);
    } catch {
      toast.error("Could not fetch patient clinical history");
    } finally {
      setLoadingRecords(false);
    }
  };

 useEffect(() => {
  // ✅ Use /doctors/me — finds doctor by JWT token user_id
  axiosInstance.get("/doctors/me")
    .then(res => {
      const doctor = res.data;
      return axiosInstance.get(`/appointments/doctor/${doctor.id}`);
    })
    .then(res => {
      const appts = res.data;
      setAppointments(appts || []);
      setStats(calcStats(appts || []));
    })
    .catch((err) => {
      console.log("Error:", err.response?.data);
      setAppointments([]);
    })
    .finally(() => setLoading(false));
}, [user]);

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/appointments/${id}/status?status=${status}`);
      toast.success(`Appointment ${status.toLowerCase()}!`);

      // ✅ Fix 2 — recalculate stats after status change
      setAppointments(prev => {
        const updated = prev.map(a =>
          a.id === id ? { ...a, status } : a
        );
        setStats(calcStats(updated)); // recalculate from updated list
        return updated;
      });

    } catch {
      toast.error("Could not update appointment status");
    }
  };

  const statCards = [
    { label: "Total Appointments",     value: stats.total, icon: "📋",
      color: "bg-blue-50/50 border-blue-100 hover:shadow-blue-500/5 hover:border-blue-200",     text: "text-blue-700"   },
    { label: "Pending Approval",   value: stats.pending, icon: "⏳",
      color: "bg-yellow-50/50 border-yellow-100 hover:shadow-yellow-500/5 hover:border-yellow-200", text: "text-yellow-700" },
    { label: "Confirmed Consultations", value: stats.confirmed, icon: "✅",
      color: "bg-green-50/50 border-green-100 hover:shadow-green-500/5 hover:border-green-200",   text: "text-green-700"  },
    { label: "Completed Sessions", value: stats.completed, icon: "✔️",
      color: "bg-purple-50/50 border-purple-100 hover:shadow-purple-500/5 hover:border-purple-200", text: "text-purple-700" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
          Welcome, Dr. {user?.name} 👨‍⚕️
        </h1>
        <p className="text-slate-500 mt-2 text-base">
          Review details, update clinical stats, and write patient records.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-10 flex-wrap border-b border-slate-100 pb-6">
        <button onClick={() => navigate("/doctor/add-record")}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl
                     text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
          + Add Medical Record
        </button>
        <button onClick={() => navigate("/doctor/profile")}
          className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-2.5 rounded-xl
                     text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 border border-slate-200/50">
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab("appointments")}
          className={`pb-3 px-4 font-bold text-xs tracking-wider uppercase transition-all duration-200 border-b-2 ${
            activeTab === "appointments"
              ? "border-blue-600 text-blue-600 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          📅 Patient Appointments
        </button>
        <button
          onClick={() => {
            setActiveTab("records");
            loadWrittenRecords();
          }}
          className={`pb-3 px-4 font-bold text-xs tracking-wider uppercase transition-all duration-200 border-b-2 ${
            activeTab === "records"
              ? "border-blue-600 text-blue-600 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          🗂️ Medical Records History
        </button>
      </div>

      {activeTab === "appointments" ? (
        <>
          <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            📅 Active Patient Appointments Grid
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-semibold">No appointments yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map(app => (
                <div key={app.id}
                  className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                  <div className="flex justify-between items-start flex-wrap gap-4">

                    {/* Patient info */}
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg leading-tight flex items-center gap-2 group-hover:text-blue-700 transition-colors">
                        <span className="w-8 h-8 bg-blue-50/50 text-blue-600 rounded-xl flex items-center justify-center text-sm shadow-inner">🧑</span>
                        {app.patient?.name}
                      </h3>
                      <div className="text-sm text-slate-500 space-y-2 mt-4 pl-10 border-l-2 border-slate-50">
                        <p className="flex items-center gap-2">📅 <span className="font-semibold text-slate-700">{app.appointmentDate} at {app.appointmentTime}</span></p>
                        <p className="flex items-center gap-2">🩸 Blood Group: <span className="font-semibold text-slate-700">{app.patient?.bloodGroup || "N/A"}</span></p>
                        <p className="flex items-center gap-2">📞 Phone: <span className="font-semibold text-slate-700">{app.patient?.phone || "N/A"}</span></p>
                        <p className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50 mt-3 text-xs leading-relaxed max-w-xl">
                          🩺 Symptoms: <strong className="text-slate-700 font-semibold">{app.symptoms}</strong>
                        </p>
                        {app.patient && (
                          <button
                            onClick={() => viewPatientHistory(app.patient)}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-100 border border-indigo-100/50 px-3.5 py-1.5 rounded-xl transition mt-3 flex items-center gap-1.5 active:scale-95">
                            🔍 View Clinical History
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status + Action buttons */}
                    <div className="flex flex-col items-end gap-3 self-stretch justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[app.status]}`}>
                        {app.status}
                      </span>

                      {app.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(app.id, "CONFIRMED")}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-emerald-500/20 transition duration-200 active:scale-95">
                            Confirm
                          </button>
                          <button
                            onClick={() => updateStatus(app.id, "CANCELLED")}
                            className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-rose-500/20 transition duration-200 active:scale-95">
                            Cancel
                          </button>
                        </div>
                      )}

                      {app.status === "CONFIRMED" && (
                        <button
                          onClick={() => updateStatus(app.id, "COMPLETED")}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-indigo-500/20 transition duration-200 active:scale-95">
                          Mark Completed
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              🗂️ Medical Records Written History
            </h2>
            {/* Search Input */}
            <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-700 bg-white placeholder-slate-400 shadow-sm"
              />
            </div>
          </div>

          {loadingWrittenRecords ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : writtenRecords.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <p className="text-4xl mb-3">🗂️</p>
              <p className="font-semibold">No medical records written yet.</p>
              <p className="text-xs text-slate-400 mt-1">Click "+ Add Medical Record" above to create one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {writtenRecords
                .filter((rec) =>
                  rec.patient?.name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((record) => (
                  <div
                    key={record.id}
                    className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-100 pb-4 mb-4">
                      <div>
                        <h3 className="font-bold text-gray-800 text-base leading-tight flex items-center gap-2 group-hover:text-blue-700 transition-colors">
                          <span className="w-8 h-8 bg-indigo-50/50 text-indigo-600 rounded-xl flex items-center justify-center text-sm shadow-inner">🧑</span>
                          {record.patient?.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-bold mt-1.5 pl-10">
                          📅 Created Date: {record.recordDate}
                        </p>
                      </div>
                      <button
                        onClick={() => downloadMedicalRecordPDF(record)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-indigo-500/20 transition duration-200 active:scale-95 flex items-center gap-1.5"
                      >
                        📥 Download PDF
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-100/50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
                          🩺 Diagnosis
                        </span>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                          {record.diagnosis}
                        </p>
                      </div>
                      <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100/50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 block mb-1">
                          💊 Prescription
                        </span>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                          {record.prescription || "None"}
                        </p>
                      </div>
                      <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100/50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block mb-1">
                          Doctor Notes
                        </span>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                          {record.notes || "No notes available"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              {writtenRecords.filter((rec) =>
                rec.patient?.name
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="font-semibold text-sm">
                    No matching patient records found.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Patient Vitals & Clinical History Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col justify-between">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 px-6 py-5 flex justify-between items-center text-white">
              <div>
                <h3 className="font-extrabold text-lg leading-tight">
                  📋 Clinical History: {selectedPatient.name}
                </h3>
                <p className="text-indigo-200 text-xs mt-1 font-medium">
                  Reviewing diagnosis, prescriptions, and clinical history.
                </p>
              </div>
              <button 
                onClick={() => setSelectedPatient(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold transition text-sm">
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 bg-slate-50/50 flex-1">
              {loadingRecords ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : patientRecords.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-white p-6">
                  <p className="text-4xl mb-2">🗂️</p>
                  <p className="font-semibold text-sm">No clinical records found for this patient.</p>
                  <p className="text-xs text-slate-400 mt-1">Add a new record to start building their history.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patientRecords.map((record, index) => (
                    <div key={record.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-2 mb-3">
                        <span className="text-xs font-bold text-slate-400">Record #{patientRecords.length - index}</span>
                        <span className="text-xs text-slate-400 font-bold">📅 {record.recordDate}</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100/50">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">🩺 Diagnosis</span>
                          <p className="text-xs font-semibold text-slate-700 leading-relaxed">{record.diagnosis}</p>
                        </div>
                        <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100/50">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 block mb-1">💊 Prescription</span>
                          <p className="text-xs font-semibold text-slate-700 leading-relaxed">{record.prescription || "None"}</p>
                        </div>
                        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100/50">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block mb-1">Clinical Notes</span>
                          <p className="text-xs font-semibold text-slate-700 leading-relaxed">{record.notes || "No notes available"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedPatient(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95">
                Close History
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;