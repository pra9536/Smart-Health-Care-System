import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

const specializations = [
  "Cardiology", "Dermatology", "Neurology", "Orthopedics",
  "Pediatrics", "Psychiatry", "Gynecology", "General", "ENT", "Dentistry"
];

const emptyForm = {
  name: "", specialization: "Cardiology",
  experienceYears: "", consultationFee: "",
  phone: "", qualification: "", available: true
};

const AdminDoctorManagement = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = () => {
    axiosInstance.get("/doctors")
      .then(res => setDoctors(res.data.data))
      .catch(() => toast.error("Failed to load doctors"));
  };

  const handleChange = (e) => {
    const value = e.target.type === "checkbox"
      ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post("/doctors", form);
      toast.success("Doctor added successfully!");
      setForm(emptyForm);
      setShowForm(false);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add doctor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this doctor?")) return;
    try {
      await axiosInstance.delete(`/doctors/${id}`);
      toast.success("Doctor deleted!");
      fetchDoctors();
    } catch {
      toast.error("Could not delete doctor");
    }
  };

  const toggleAvailable = async (doctor) => {
    try {
      await axiosInstance.put(`/doctors/${doctor.id}`, {
        ...doctor,
        available: !doctor.available
      });
      toast.success("Availability updated!");
      fetchDoctors();
    } catch {
      toast.error("Could not update availability");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Doctor Management
          </h1>
          <p className="text-gray-500 mt-1">Add, update, or remove doctors</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/admin/dashboard")}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg
                       text-sm font-medium hover:bg-gray-200 transition">
            ← Back to Dashboard
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg
                       text-sm font-medium hover:bg-blue-700 transition">
            {showForm ? "✕ Cancel" : "+ Add Doctor"}
          </button>
        </div>
      </div>

      {/* Add Doctor Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border
                        border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Add New Doctor
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Doctor Full Name" required
                className="border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-400" />

              <select name="specialization" value={form.specialization}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-400">
                {specializations.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <input name="qualification" value={form.qualification}
                onChange={handleChange} placeholder="MBBS, MD" required
                className="border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-400" />

              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="Phone Number" required
                className="border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-400" />

              <input name="experienceYears" type="number"
                value={form.experienceYears} onChange={handleChange}
                placeholder="Experience (years)" required
                className="border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-400" />

              <input name="consultationFee" type="number"
                value={form.consultationFee} onChange={handleChange}
                placeholder="Consultation Fee (₹)" required
                className="border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>

            <div className="flex items-center gap-3 mb-4">
              <input type="checkbox" name="available"
                checked={form.available} onChange={handleChange}
                className="w-4 h-4 accent-blue-600" id="avail" />
              <label htmlFor="avail"
                className="text-sm text-gray-600 cursor-pointer">
                Available for appointments
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white px-8 py-2 rounded-lg
                         font-medium hover:bg-blue-700 transition
                         disabled:opacity-50">
              {loading ? "Adding..." : "Add Doctor"}
            </button>
          </form>
        </div>
      )}

      {/* Doctors Table */}
      <div className="bg-white rounded-2xl shadow-sm border
                      border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Specialization</th>
              <th className="px-4 py-3 text-left">Fee</th>
              <th className="px-4 py-3 text-left">Experience</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc, index) => (
              <tr key={doc.id}
                className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  👨‍⚕️ {doc.name}
                </td>
                <td className="px-4 py-3 text-blue-600">
                  {doc.specialization}
                </td>
                <td className="px-4 py-3">₹{doc.consultationFee}</td>
                <td className="px-4 py-3">{doc.experienceYears} yrs</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleAvailable(doc)}
                    className={`px-3 py-1 rounded-full text-xs font-medium
                      transition cursor-pointer
                      ${doc.available
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                    {doc.available ? "✅ Available" : "❌ Unavailable"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(doc.id)}
                    className="text-red-500 hover:text-red-700
                               text-sm font-medium hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {doctors.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">👨‍⚕️</p>
            <p>No doctors added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDoctorManagement;