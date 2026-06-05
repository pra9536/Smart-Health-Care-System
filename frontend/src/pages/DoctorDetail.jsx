import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();          // ✅ declared ONCE only

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hovered, setHovered] = useState(0);

  // ✅ Load doctor + ratings together
  useEffect(() => {
    axiosInstance.get(`/doctors/${id}`)
      .then(res => setDoctor(res.data))
      .finally(() => setLoading(false));

    // Load average rating
    axiosInstance.get(`/ratings/doctor/${id}`)
      .then(res => {
        setAvgRating(res.data.averageRating || 0);
        setTotalRatings(res.data.totalRatings || 0);
      })
      .catch(() => {});
  }, [id]);

  // ✅ Submit rating function
  const submitRating = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating!");
      return;
    }
    try {
      await axiosInstance.post("/ratings", {
        doctorId: parseInt(id),
        stars: rating,
        review
      });
      toast.success("Rating submitted! Thank you ⭐");
      // Refresh average
      axiosInstance.get(`/ratings/doctor/${id}`)
        .then(res => {
          setAvgRating(res.data.averageRating || 0);
          setTotalRatings(res.data.totalRatings || 0);
        });
      setRating(0);
      setReview("");
    } catch {
      toast.error("Failed to submit rating. Try again!");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12
                      border-b-2 border-blue-600"></div>
    </div>
  );

  if (!doctor) return (
    <p className="text-center mt-20 text-gray-400">
      Doctor not found.
    </p>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-md p-8
                      border border-gray-100">

        {/* Doctor header */}
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full
                          flex items-center justify-center text-4xl">
            👨‍⚕️
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {doctor.name}
            </h1>
            <p className="text-blue-600 font-medium">
              {doctor.specialization}
            </p>
            <p className={`text-sm mt-1 font-medium
              ${doctor.available
                ? "text-green-600" : "text-red-500"}`}>
              {doctor.available
                ? "✅ Available for appointments"
                : "❌ Currently not available"}
            </p>
          </div>
        </div>

        {/* ✅ Average rating display */}
        <div className="flex items-center gap-3 mb-6
                        bg-yellow-50 rounded-xl p-4">
          <span className="text-4xl font-bold text-yellow-500">
            {Number(avgRating).toFixed(1)}
          </span>
          <div>
            <div className="text-yellow-400 text-xl">
              {"★".repeat(Math.round(avgRating))}
              {"☆".repeat(5 - Math.round(avgRating))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {totalRatings} patient reviews
            </p>
          </div>
        </div>

        {/* Doctor details */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Qualification</p>
            <p className="font-medium text-gray-700">
              {doctor.qualification || "N/A"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Experience</p>
            <p className="font-medium text-gray-700">
              {doctor.experienceYears} years
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">
              Consultation Fee
            </p>
            <p className="font-medium text-gray-700">
              ₹{doctor.consultationFee}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Phone</p>
            <p className="font-medium text-gray-700">
              {doctor.phone}
            </p>
          </div>
        </div>

        {/* Book button */}
        {user ? (
          user.role === "PATIENT" && doctor.available ? (
            <button
              onClick={() => navigate(`/doctors/${doctor.id}/book`)}
              className="w-full bg-blue-600 text-white py-3
                         rounded-xl font-semibold hover:bg-blue-700
                         transition text-lg">
              Book Appointment
            </button>
          ) : (
            <p className="text-center text-gray-400 text-sm">
              Only patients can book appointments.
            </p>
          )
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 text-white py-3
                       rounded-xl font-semibold hover:bg-blue-700
                       transition text-lg">
            Login to Book Appointment
          </button>
        )}

        {/* ✅ Rating section — only for PATIENT */}
        {user?.role === "PATIENT" && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              ⭐ Rate Your Experience
            </h3>

            {/* Star selector with hover effect */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className={`text-4xl transition-transform
                              hover:scale-110
                    ${star <= (hovered || rating)
                      ? "text-yellow-400"
                      : "text-gray-300"}`}>
                  ★
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-gray-500
                                 self-center ml-2">
                  {["", "Poor", "Fair", "Good",
                    "Very Good", "Excellent"][rating]}
                </span>
              )}
            </div>

            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Share your experience with this doctor..."
              rows={3}
              className="w-full border border-gray-300 rounded-xl
                         px-4 py-2 text-sm mb-4 focus:outline-none
                         focus:ring-2 focus:ring-yellow-400 resize-none"
            />

            <button onClick={submitRating}
              className="w-full bg-yellow-400 text-white py-2
                         rounded-xl font-medium hover:bg-yellow-500
                         transition">
              Submit Review ⭐
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorDetail;