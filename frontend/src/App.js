import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import AdminDashboard from "./pages/AdminDashboard";
import BookAppointment from "./pages/BookAppointment";
import DoctorList from "./pages/DoctorList";
import Login from "./pages/Login";
import PatientDashboard from "./pages/PatientDashboard";
import Register from "./pages/Register";
// ADD these two new imports
import AdminDoctorManagement from "./pages/AdminDoctorManagement";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorDetail from "./pages/DoctorDetail";
import DoctorProfile from "./pages/DoctorProfile";
import NotFound from "./pages/NotFound";
import PatientProfile from "./pages/PatientProfile";
// Add imports
import AddMedicalRecord from "./pages/AddMedicalRecord";
import Chatbot from "./pages/Chatbot";
import MedicalRecords from "./pages/MedicalRecords";

import ForgotPassword from "./pages/ForgotPassword";
import OtpVerification from "./pages/OtpVerification";
import ResetPassword from "./pages/ResetPassword";


// Add these imports
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 overflow-x-hidden w-full relative">
          <Navbar />
          <div className="flex-1 w-full overflow-x-hidden">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/doctors" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<OtpVerification />} />
              <Route path="/doctors" element={<DoctorList />} />

              {/* ADD THESE TWO */}
              <Route path="/doctors/:id" element={<DoctorDetail />} />
              <Route path="/doctors/:doctorId/book" element={
                <ProtectedRoute role="PATIENT">
                  <BookAppointment />
                </ProtectedRoute>
              } />

              {/* Patient dashboard */}
              <Route path="/patient/dashboard" element={
                <ProtectedRoute role="PATIENT">
                  <PatientDashboard />
                </ProtectedRoute>
              } />

              {/* Admin dashboard */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute role="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              {/* Patient Profile */}
              <Route path="/patient/profile" element={
                <ProtectedRoute role="PATIENT">
                  <PatientProfile />
                </ProtectedRoute>
              } />

              {/* Doctor dashboard */}
              <Route path="/doctor/dashboard" element={
                <ProtectedRoute role="DOCTOR">
                  <DoctorDashboard />
                </ProtectedRoute>
              } />

              {/* Doctor profile */}
              <Route path="/doctor/profile" element={
                <ProtectedRoute role="DOCTOR">
                  <DoctorProfile />
                </ProtectedRoute>
              } />

              {/* Admin doctor management */}
              <Route path="/admin/doctors" element={
                <ProtectedRoute role="ADMIN">
                  <AdminDoctorManagement />
                </ProtectedRoute>
              } />

              {/* Patient medical records */}
              <Route path="/patient/records" element={
                <ProtectedRoute role="PATIENT">
                  <MedicalRecords />
                </ProtectedRoute>
              } />

              {/* Doctor add medical record */}
              <Route path="/doctor/add-record" element={
                <ProtectedRoute role="DOCTOR">
                  <AddMedicalRecord />
                </ProtectedRoute>
              } />

              <Route path="/chatbot" element={<Chatbot />} />

              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* 404 page — always keep this LAST */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;