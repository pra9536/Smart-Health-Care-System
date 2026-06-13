import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

// Lazy-load page components
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const BookAppointment = lazy(() => import("./pages/BookAppointment"));
const DoctorList = lazy(() => import("./pages/DoctorList"));
const Login = lazy(() => import("./pages/Login"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard"));
const Register = lazy(() => import("./pages/Register"));
const AdminDoctorManagement = lazy(() => import("./pages/AdminDoctorManagement"));
const DoctorDashboard = lazy(() => import("./pages/DoctorDashboard"));
const DoctorDetail = lazy(() => import("./pages/DoctorDetail"));
const DoctorProfile = lazy(() => import("./pages/DoctorProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PatientProfile = lazy(() => import("./pages/PatientProfile"));
const AddMedicalRecord = lazy(() => import("./pages/AddMedicalRecord"));
const Chatbot = lazy(() => import("./pages/Chatbot"));
const MedicalRecords = lazy(() => import("./pages/MedicalRecords"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const OtpVerification = lazy(() => import("./pages/OtpVerification"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 overflow-x-hidden w-full relative">
          <Navbar />
          <div className="flex-1 w-full overflow-x-hidden">
            <Suspense fallback={
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            }>
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
            </Suspense>
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;