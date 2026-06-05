import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";


const DoctorProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    specialization: "",
    experienceYears: "",
    consultationFee: "",
    phone: "",
    qualification: "",
    available: true
  });

  const specializations = [
    "Cardiology", "Dermatology", "Neurology",
    "Orthopedics", "Pediatrics", "Psychiatry",
    "Gynecology", "General", "ENT", "Dentistry"
  ];

 useEffect(() => {
  // ✅ Use /doctors/me instead of name matching
  axiosInstance.get("/doctors/me")
    .then(res => {
      setForm(res.data);
      setDoctorId(res.data.id);
    })
    .catch(() => {
      // Doctor profile not linked yet
    });
}, []);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox"
      ? e.target.checked
      : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (doctorId) {
        await axiosInstance.put(`/doctors/${doctorId}`, form);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(
          "Doctor profile not found. Ask admin to create your profile.");
      }
      navigate("/doctor/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center
                    justify-center px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg">

        <h2 className="text-2xl font-bold text-blue-600 mb-2">
          My Doctor Profile
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Update your professional information
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Dr. Amit Verma"
              className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
              required />
          </div>

          {/* Specialization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <select name="specialization" value={form.specialization}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-400">
              {specializations.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Experience + Fee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience (years)
              </label>
              <input name="experienceYears" type="number"
                value={form.experienceYears} onChange={handleChange}
                placeholder="5"
                className="w-full border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Fee (₹)
              </label>
              <input name="consultationFee" type="number"
                value={form.consultationFee} onChange={handleChange}
                placeholder="500"
                className="w-full border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
                required />
            </div>
          </div>

          {/* Phone + Qualification */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="9876543210"
                className="w-full border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification
              </label>
              <input name="qualification" value={form.qualification}
                onChange={handleChange} placeholder="MBBS, MD"
                className="w-full border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
                required />
            </div>
          </div>

          {/* Available toggle */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input type="checkbox" name="available"
              checked={form.available} onChange={handleChange}
              className="w-4 h-4 accent-blue-600" id="available" />
            <label htmlFor="available"
              className="text-sm font-medium text-gray-700 cursor-pointer">
              Available for appointments
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg
                         font-medium hover:bg-blue-700 transition
                         disabled:opacity-50">
              {loading ? "Saving..." : "Update Profile"}
            </button>
            <button type="button"
              onClick={() => navigate("/doctor/dashboard")}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg
                         font-medium hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default DoctorProfile;