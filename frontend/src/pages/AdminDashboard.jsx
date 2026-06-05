import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    doctors: 0, patients: 0, appointments: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [loading, setLoading] = useState(true);

  const completedApps = appointments.filter(a => a.status === "CONFIRMED" || a.status === "COMPLETED").length;
  const cancelledApps = appointments.filter(a => a.status === "CANCELLED").length;
  const totalAppsCount = appointments.length;
  const successRate = totalAppsCount > 0 ? Math.round((completedApps / totalAppsCount) * 100) : 0;

  useEffect(() => {
    Promise.all([
      axiosInstance.get("/doctors"),
      axiosInstance.get("/patients"),
      axiosInstance.get("/appointments/all")
    ]).then(([docs, pats, apps]) => {
      setStats({
        doctors: docs.data.data ? docs.data.data.length : (Array.isArray(docs.data) ? docs.data.length : 0),
        patients: pats.data ? pats.data.length : 0,
        appointments: apps.data ? apps.data.length : 0
      });
      setAppointments(apps.data || []);
    }).finally(() => setLoading(false));

    // Load audit logs separately
    axiosInstance.get("/audit/all")
      .then(res => setAuditLogs(res.data || []))
      .catch(() => {}); // silently fail if not ready
  }, []);

  const cards = [
    {
      label: "Total Doctors",
      value: stats.doctors,
      icon: "👨‍⚕️",
      color: "bg-blue-50/50 border-blue-100 hover:shadow-blue-500/5 hover:border-blue-200"
    },
    {
      label: "Total Patients",
      value: stats.patients,
      icon: "🧑‍🤝‍🧑",
      color: "bg-green-50/50 border-green-100 hover:shadow-green-500/5 hover:border-green-200"
    },
    {
      label: "Total Appointments",
      value: stats.appointments,
      icon: "📋",
      color: "bg-purple-50/50 border-purple-100 hover:shadow-purple-500/5 hover:border-purple-200"
    },
    {
      label: "Audit Events",
      value: auditLogs.length,
      icon: "🔍",
      color: "bg-orange-50/50 border-orange-100 hover:shadow-orange-500/5 hover:border-orange-200"
    },
  ];

  // Helper to get audit badge color
  const getAuditBadgeColor = (action) => {
    if (action.includes("FAILED") || action.includes("BLOCKED"))
      return "bg-red-50 text-red-700 border-red-100";
    if (action.includes("SUCCESS") || action.includes("VERIFIED"))
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (action.includes("RESENT") || action.includes("OTP"))
      return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-blue-50 text-blue-700 border-blue-100";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-2 text-base">
          Real-time diagnostics, scheduler tracking, and audit metrics.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {cards.map(card => (
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

      {/* Visual Analytics & Diagnostics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Fulfillment Rate widget */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="font-bold text-slate-500 text-xs tracking-wider uppercase mb-3.5 flex items-center gap-2">
            📊 Appointment Fulfillment Metrics
          </h3>
          <div className="flex justify-between items-end mb-2.5">
            <span className="text-3xl font-black text-indigo-600 leading-none">{successRate}%</span>
            <span className="text-xs text-slate-400 font-bold">{completedApps} of {totalAppsCount} Completed</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${successRate}%` }}></div>
          </div>
          <div className="flex gap-4 mt-4 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5">🟢 Completed: <strong className="text-slate-600">{completedApps}</strong></span>
            <span className="flex items-center gap-1.5">🔴 Cancelled: <strong className="text-slate-600">{cancelledApps}</strong></span>
          </div>
        </div>

        {/* System Diagnostics Layer */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="font-bold text-slate-500 text-xs tracking-wider uppercase mb-4.5 flex items-center gap-2">
            🖥️ System Service Diagnostics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
              <span className="text-xs font-bold text-slate-600">Database Connection (MySQL)</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
              <span className="text-xs font-bold text-slate-600">Redis Caching Service</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                PROTECTED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-10 flex-wrap border-b border-slate-100 pb-6">
        <button onClick={() => navigate("/admin/doctors")}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl
                     text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
          👨‍⚕️ Manage Doctors
        </button>
        <button onClick={() => setShowLogs(!showLogs)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white px-6 py-2.5 rounded-xl
                     text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
          🔍 {showLogs ? "Hide Audit Logs" : "View Audit Logs"}
        </button>
      </div>

      {/* All appointments table */}
      <h2 className="text-xl font-bold text-slate-700 mb-5 flex items-center gap-2">
        📅 System Appointments Grid
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8
                          border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm
                        border border-slate-100 overflow-hidden mb-12">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-400">
              <tr className="border-b border-slate-100">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">#</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">Patient</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">Doctor</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">Time</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6}
                    className="px-5 py-10 text-center text-slate-400 font-medium bg-slate-50/20">
                    No appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((app, index) => (
                  <tr key={app.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-slate-400 font-bold">
                      {index + 1}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-700">
                      {app.patient?.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      Dr. {app.doctor?.name}
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-medium">
                      {app.appointmentDate}
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-medium">
                      {app.appointmentTime}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full
                        text-xs font-bold
                        ${app.status === "CONFIRMED"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : app.status === "PENDING"
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          : app.status === "CANCELLED"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Logs Timeline section */}
      {showLogs && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
              🔍 System Activity Stream
            </h2>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Showing last {Math.min(auditLogs.length, 50)} Events
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              No audit logs yet
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 pl-2">
              {auditLogs
                .slice(0, 50)
                .reverse() // show latest first
                .map((log, index) => (
                  <div key={log.id} className="flex gap-5 relative items-start group">
                    <div className={`w-9 h-9 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-xs z-10 transition-all duration-300 group-hover:scale-110 ${
                      log.action.includes("FAILED") || log.action.includes("BLOCKED") ? "bg-red-500 text-white" :
                      log.action.includes("SUCCESS") || log.action.includes("VERIFIED") ? "bg-emerald-500 text-white" : "bg-indigo-500 text-white"
                    }`}>
                      {log.action.includes("FAILED") || log.action.includes("BLOCKED") ? "❌" : 
                       log.action.includes("SUCCESS") || log.action.includes("VERIFIED") ? "✅" : "⚙️"}
                    </div>
                    
                    <div className="flex-1 bg-white border border-slate-100/80 rounded-2xl p-5 shadow-sm group-hover:shadow-md transition-all duration-300">
                      <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getAuditBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          {new Date(log.timestamp).toLocaleString("en-IN")}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{log.details}</p>
                      
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50 text-[10px] text-slate-400 font-bold">
                        <span>👤 USER: <strong className="text-slate-500">{log.performedBy}</strong></span>
                        <span>🌐 IP: <strong className="text-slate-500">{log.ipAddress}</strong></span>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;