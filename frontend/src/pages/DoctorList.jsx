import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const specializations = [
  "All", "Cardiology", "Dermatology", "Neurology",
  "Orthopedics", "Pediatrics", "Psychiatry", "General"
];

const getSpecialtyBadgeStyle = (spec) => {
  switch (spec) {
    case "Cardiology":
      return "bg-rose-50 text-rose-600 border-rose-100";
    case "Neurology":
      return "bg-purple-50 text-purple-600 border-purple-100";
    case "Dermatology":
      return "bg-amber-50 text-amber-600 border-amber-100";
    case "Orthopedics":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "Pediatrics":
      return "bg-cyan-50 text-cyan-600 border-cyan-100";
    case "Psychiatry":
      return "bg-indigo-50 text-indigo-600 border-indigo-100";
    case "Gynecology":
      return "bg-pink-50 text-pink-600 border-pink-100";
    case "Dentistry":
      return "bg-teal-50 text-teal-600 border-teal-100";
    case "ENT":
      return "bg-blue-50 text-blue-600 border-blue-100";
    default:
      return "bg-gray-50 text-gray-600 border-gray-100";
  }
};

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showWakeUpNotice, setShowWakeUpNotice] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWakeUpNotice(true);
    }, 2500);

    axiosInstance.get("/doctors")
      .then(res => {
        setDoctors(res.data.data || []);
        setFiltered(res.data.data || []);
      })
      .finally(() => {
        clearTimeout(timer);
        setLoading(false);
      });

    return () => clearTimeout(timer);
  }, []);

  const filterBySpec = (spec) => {
    setSelected(spec);
    if (spec === "All") setFiltered(doctors);
    else setFiltered(doctors.filter(d => d.specialization === spec));
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-96 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      {showWakeUpNotice && (
        <div className="text-slate-500 text-sm font-medium animate-pulse text-center max-w-sm px-4">
          Waking up our secure clinical server... This may take up to a minute on the first load as our database initializes. Thank you for your patience! 🏥
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Find a Specialist</h1>
        <p className="text-slate-500 mt-2 text-base max-w-xl">
          Connect with our world-class medical professionals and book your online appointments instantly.
        </p>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2.5 mb-10 pb-4 border-b border-slate-100">
        {specializations.map(spec => (
          <button key={spec} onClick={() => filterBySpec(spec)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm
              ${selected === spec
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}`}>
            {spec}
          </button>
        ))}
      </div>

      {/* Doctor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(doctor => (
          <div key={doctor.id}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-2.5 transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                  👨‍⚕️
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base leading-tight group-hover:text-blue-700 transition-colors">
                    {doctor.name}
                  </h3>
                  <span className={`inline-block text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full border mt-2 ${getSpecialtyBadgeStyle(doctor.specialization)}`}>
                    {doctor.specialization}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2.5 text-sm text-slate-500 mb-6 border-t border-slate-50 pt-4 flex-1">
                <p className="flex items-center gap-2">🎓 <span className="font-semibold text-slate-700">{doctor.qualification}</span></p>
                <p className="flex items-center gap-2">⏱ <span>{doctor.experienceYears} years experience</span></p>
                <p className="flex items-center gap-2">💰 <span className="font-bold text-slate-800">₹{doctor.consultationFee}</span> <span className="text-xs text-slate-400">consultation fee</span></p>
                <p className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${doctor.available ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                    <span className={`w-2 h-2 rounded-full ${doctor.available ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                    {doctor.available ? "Available" : "Not Available"}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/doctors/${doctor.id}`)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 group-hover:scale-[1.02] mt-2 active:scale-95">
              <span>View & Book</span>
              <span className="text-xs">➡️</span>
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No doctors found for this specialization.</p>
        </div>
      )}
    </div>
  );
};

export default DoctorList;
