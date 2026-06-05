import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate("/login");
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-blue-600 text-white shadow-md relative z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Brand */}
        <Link to="/" onClick={closeMenu} className="text-xl font-extrabold tracking-tight flex items-center gap-1.5 hover:scale-105 transition-transform duration-200">
          <span className="text-2xl">🏥</span>
          <span>SmartHealthCare</span>
        </Link>

        {/* Desktop Menu links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/doctors" className="font-bold text-sm hover:text-blue-200 transition">
            Find Doctors
          </Link>

          {!user ? (
            <>
              <Link to="/login" className="font-bold text-sm hover:text-blue-200 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-600 px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-50 transition shadow-sm hover:shadow active:scale-95"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {user.role === "PATIENT" && (
                <>
                  <Link to="/patient/dashboard" className="font-bold text-sm hover:text-blue-200 transition">
                    My Dashboard
                  </Link>
                  <Link to="/patient/records" className="font-bold text-sm hover:text-blue-200 transition">
                    My Records
                  </Link>
                </>
              )}
              {user.role === "DOCTOR" && (
                <>
                  <Link to="/doctor/dashboard" className="font-bold text-sm hover:text-blue-200 transition">
                    My Dashboard
                  </Link>
                  <Link to="/doctor/add-record" className="font-bold text-sm hover:text-blue-200 transition">
                    Add Record
                  </Link>
                </>
              )}
              {user.role === "ADMIN" && (
                <Link to="/admin/dashboard" className="font-bold text-sm hover:text-blue-200 transition">
                  Admin Panel
                </Link>
              )}
              <span className="text-blue-200 text-xs font-semibold bg-white/10 px-3 py-1 rounded-full border border-white/5">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-50 transition shadow-sm hover:shadow active:scale-95"
              >
                Logout
              </button>
            </>
          )}

          {user && (
            <Link 
              to="/chatbot" 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:from-indigo-400 hover:to-purple-500 transition shadow-sm hover:shadow active:scale-95 border border-indigo-400/20"
            >
              🤖 AI Assistant
            </Link>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-xl border border-white/10 active:scale-95"
          aria-label="Toggle Navigation"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-blue-700 border-t border-blue-500/30 px-6 py-5 space-y-4 shadow-xl animate-fadeIn">
          <Link 
            to="/doctors" 
            onClick={closeMenu} 
            className="block font-bold text-base hover:bg-white/10 px-4 py-2.5 rounded-2xl transition"
          >
            🔍 Find Doctors
          </Link>

          {!user ? (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link 
                to="/login" 
                onClick={closeMenu} 
                className="block text-center font-bold text-sm bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-2xl border border-white/10 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="block text-center font-bold text-sm bg-white text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-2xl transition shadow"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {user.role === "PATIENT" && (
                <>
                  <Link 
                    to="/patient/dashboard" 
                    onClick={closeMenu} 
                    className="block font-bold text-base hover:bg-white/10 px-4 py-2.5 rounded-2xl transition"
                  >
                    📅 My Dashboard
                  </Link>
                  <Link 
                    to="/patient/records" 
                    onClick={closeMenu} 
                    className="block font-bold text-base hover:bg-white/10 px-4 py-2.5 rounded-2xl transition"
                  >
                    🗂️ My Records
                  </Link>
                </>
              )}
              {user.role === "DOCTOR" && (
                <>
                  <Link 
                    to="/doctor/dashboard" 
                    onClick={closeMenu} 
                    className="block font-bold text-base hover:bg-white/10 px-4 py-2.5 rounded-2xl transition"
                  >
                    📅 My Dashboard
                  </Link>
                  <Link 
                    to="/doctor/add-record" 
                    onClick={closeMenu} 
                    className="block font-bold text-base hover:bg-white/10 px-4 py-2.5 rounded-2xl transition"
                  >
                    ➕ Add Record
                  </Link>
                </>
              )}
              {user.role === "ADMIN" && (
                <Link 
                  to="/admin/dashboard" 
                  onClick={closeMenu} 
                  className="block font-bold text-base hover:bg-white/10 px-4 py-2.5 rounded-2xl transition"
                >
                  ⚙️ Admin Panel
                </Link>
              )}

              {user && (
                <Link 
                  to="/chatbot" 
                  onClick={closeMenu} 
                  className="block font-bold text-base bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-2xl transition hover:from-indigo-400 hover:to-purple-500 shadow border border-indigo-400/20 text-center"
                >
                  🤖 AI Chatbot Assistant
                </Link>
              )}

              <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-4 mt-3">
                <span className="text-blue-200 text-xs font-semibold">Hi, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-white text-blue-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-50 transition shadow"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
