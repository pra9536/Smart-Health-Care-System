import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { downloadMedicalRecordPDF } from "../utils/generatePDF";

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  axiosInstance.get("/medical-records/my")
    .then(res => setRecords(res.data))
    .catch((err) => {
      // 400 = profile not created yet, just show empty
      if (err.response?.status !== 400) {
        toast.error("Failed to load medical records");
      }
      setRecords([]);
    })
    .finally(() => setLoading(false));
}, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12
                      border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        My Medical Records
      </h1>
      <p className="text-gray-500 mb-8">
        View your diagnosis and prescriptions from doctors
      </p>

      {records.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🗂️</p>
          <p>No medical records found yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(record => (
            <div key={record.id}
              className="bg-white border border-gray-100 rounded-2xl
                         p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    Dr. {record.doctor?.name}
                  </h3>
                  <p className="text-blue-600 text-sm">
                    {record.doctor?.specialization}
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  📅 {record.recordDate}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-xs text-red-400 mb-1 font-medium">
                    🩺 Diagnosis
                  </p>
                  <p className="text-gray-800 text-sm">{record.diagnosis}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-blue-400 mb-1 font-medium">
                    💊 Prescription
                  </p>
                  <p className="text-gray-800 text-sm">
                    {record.prescription || "None"}
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-xs text-green-400 mb-1 font-medium">
                    📝 Notes
                  </p>
                  <p className="text-gray-800 text-sm">
                    {record.notes || "No notes"}
                  </p>
                </div>
              </div>

              {/* Report file link if uploaded */}
              {record.reportUrl && (
                <a href={record.reportUrl} target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 mt-4
                             text-blue-600 text-sm hover:underline">
                  📎 View Report File
                </a>
              )}
<div className="mt-4 flex justify-end">
  <button
    onClick={() => downloadMedicalRecordPDF(record)}
    className="flex items-center gap-2 bg-blue-600 text-white
               px-4 py-2 rounded-lg text-sm font-medium
               hover:bg-blue-700 transition">
    📥 Download PDF
  </button>
</div>
            </div>
            
            
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;