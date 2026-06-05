import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

const AddMedicalRecord = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patient: { id: "" },
    diagnosis: "",
    prescription: "",
    notes: ""
  });

  useEffect(() => {
    // Load all patients for doctor to select
    axiosInstance.get("/patients")
      .then(res => setPatients(res.data))
      .catch(() => toast.error("Failed to load patients"));
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "patientId") {
      setForm({ ...form, patient: { id: e.target.value } });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

 const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate patient selected
    if (!form.patient.id) {
      toast.error("Please select a patient!");
      return;
    }

    setLoading(true);
    try {
      // ✅ Send correct format — patient as object with number id
      await axiosInstance.post("/medical-records", {
        patient: { id: parseInt(form.patient.id) }, // ← parseInt fixes string→number
        diagnosis: form.diagnosis,
        prescription: form.prescription,
        notes: form.notes
      });
      toast.success("Medical record added successfully!");
      navigate("/doctor/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add record");
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center
                    justify-center px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg">

        <h2 className="text-2xl font-bold text-blue-600 mb-2">
          Add Medical Record
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Add diagnosis and prescription for a patient
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Select Patient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Patient
            </label>
            <select name="patientId" onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">-- Select Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis
            </label>
            <textarea name="diagnosis" rows={2}
              value={form.diagnosis} onChange={handleChange}
              placeholder="e.g. Hypertension, Type 2 Diabetes"
              className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
              required />
          </div>

          {/* Prescription */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prescription
            </label>
            <textarea name="prescription" rows={2}
              value={form.prescription} onChange={handleChange}
              placeholder="e.g. Metformin 500mg twice daily"
              className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doctor Notes
            </label>
            <textarea name="notes" rows={2}
              value={form.notes} onChange={handleChange}
              placeholder="Additional notes or advice for patient..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg
                         font-medium hover:bg-blue-700 transition
                         disabled:opacity-50">
              {loading ? "Saving..." : "Save Record"}
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

export default AddMedicalRecord;