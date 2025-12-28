import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🏆</span>
          Club Manager
        </Link>

        <ul className="nav-menu">
          <li>
            <Link to="/" className="nav-link">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/clubs" className="nav-link">
              Clubs
            </Link>
          </li>
          <li>
            <Link to="/members" className="nav-link">
              Members
            </Link>
          </li>
          <li>
            <Link to="/events" className="nav-link">
              Events
            </Link>
          </li>
          <li>
            <Link to="/announcements" className="nav-link">
              Announcements
            </Link>
          </li>
        </ul>

        <div className="navbar-user">
          <span className="user-name">{user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
