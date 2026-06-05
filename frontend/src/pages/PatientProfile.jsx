import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

const PatientProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    address: "",
    bloodGroup: "B+"
  });

  // Try to load existing profile
  useEffect(() => {
    axiosInstance.get("/patients/me")
      .then(res => {
        setForm(res.data);
        setIsExisting(true);
      })
      .catch(() => {
        // No profile yet — show empty form
        setIsExisting(false);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isExisting) {
        // Update existing profile
        await axiosInstance.put("/patients/profile", form);
        toast.success("Profile updated successfully!");
      } else {
        // Create new profile
        await axiosInstance.post("/patients/profile", form);
        toast.success("Profile created successfully!");
      }
      navigate("/patient/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg">

        <h2 className="text-2xl font-bold text-blue-600 mb-2">
          {isExisting ? "Update My Profile" : "Complete Your Profile"}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {isExisting
            ? "Update your personal information below."
            : "Please fill in your details to book appointments."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Prateek Sharma"
              className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
              required />
          </div>

          {/* Age + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input name="age" type="number" value={form.age}
                onChange={handleChange} placeholder="25"
                className="w-full border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Phone + Blood Group */}
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
                Blood Group
              </label>
              <select name="bloodGroup" value={form.bloodGroup}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>O+</option>
                <option>O-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea name="address" value={form.address}
              onChange={handleChange} rows={2}
              placeholder="Kanpur, Uttar Pradesh"
              className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg
                         font-medium hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? "Saving..." : isExisting ? "Update Profile" : "Save Profile"}
            </button>
            <button type="button" onClick={() => navigate("/patient/dashboard")}
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

export default PatientProfile;