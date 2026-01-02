import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Clubs from "./pages/Clubs";
import ClubDetail from "./pages/ClubDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Members from "./pages/Members";
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  return (
    <BrowserRouter>
      {isLoggedIn && <Navbar setIsLoggedIn={setIsLoggedIn} />}

      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/" />
            ) : (
              <Login setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />
        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/" /> : <Register />}
        />
        <Route
          path="/clubs"
          element={isLoggedIn ? <Clubs /> : <Navigate to="/login" />}
        />
        <Route
          path="/clubs/:id"
          element={isLoggedIn ? <ClubDetail /> : <Navigate to="/login" />}
        />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route
          path="/members"
          element={isLoggedIn ? <Members /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
