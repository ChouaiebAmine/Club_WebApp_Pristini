import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { clubsAPI } from "../utils/api";
import "./Clubs.css";

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
  });

  const handleSubmit = async () => {
    try {
      await clubsAPI.create(formData);
      setShowModal(false);
      setFormData({ name: "", category: "", description: "" });
      fetchClubs(); // refresh list
    } catch (err) {
      alert("Failed to create club");
    }
  };

  const categories = [];

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    filterClubs();
  }, [search, category, clubs]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await clubsAPI.getAll();
      setClubs(response.data);
    } catch (err) {
      setError("Failed to load clubs");
    } finally {
      setLoading(false);
    }
  };

  const filterClubs = () => {
    let filtered = clubs;

    if (category !== "All") {
      filtered = filtered.filter((club) => club.category === category);
    }

    if (search) {
      filtered = filtered.filter(
        (club) =>
          club.name.toLowerCase().includes(search.toLowerCase()) ||
          club.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredClubs(filtered);
  };

  if (loading) {
    return <div className="loading">Loading clubs...</div>;
  }

  return (
    <div className="clubs-container">
      <div className="clubs-header">
        <h1>Clubs</h1>
        <p>Manage all student clubs and organizations</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="clubs-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search clubs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Club
        </button>
      </div>

      {filteredClubs.length === 0 ? (
        <p className="no-data">No clubs found</p>
      ) : (
        <div className="clubs-grid">
          {filteredClubs.map((club) => (
            <Link
              key={club._id}
              to={`/clubs/${club._id}`}
              className="club-card-link"
            >
              <div className="club-card">
                <div
                  className="club-header"
                  style={{ backgroundColor: club.color }}
                >
                  <div className="club-menu">⋮</div>
                </div>
                <div className="club-body">
                  <h3>{club.name}</h3>
                  <p className="club-category">{club.category}</p>
                  <p className="club-description">{club.description}</p>
                  <div className="club-meta">
                    <span className="club-members">
                      {" "}
                      {club.memberCount} members
                    </span>
                    <span className="club-schedule">
                      {" "}
                      {club.meetingSchedule}
                    </span>
                  </div>
                  <div className="club-president">
                    President: {club.presidentId?.name || "TBD"}
                  </div>
                  <div className="club-actions">
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Club</h2>

            <input
              type="text"
              placeholder="Club name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clubs;
