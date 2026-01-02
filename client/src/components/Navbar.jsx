import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Home, Users, Calendar, Megaphone, Club } from "lucide-react";

export default function Navbar({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const navLinks = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/clubs", label: "Clubs", icon: Club },
    { to: "/members", label: "Members", icon: Users },
    { to: "/events", label: "Events", icon: Calendar },
    { to: "/announcements", label: "Announcements", icon: Megaphone },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 hover:text-blue-700 transition">
            <Club size={28} />
            <span>Club Manager</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition w-full"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
