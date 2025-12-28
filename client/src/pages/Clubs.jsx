import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { clubsAPI } from "../utils/api";
import "./Clubs.css";

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    filterClubs();
  }, [search, clubs]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await clubsAPI.getAll();
      setClubs(res.data);
    } catch {
      setError("Failed to load clubs");
    } finally {
      setLoading(false);
    }
  };

  const filterClubs = () => {
    let data = clubs;
    if (search) {
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredClubs(data);
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: "", category: "", description: "" });
    setShowModal(true);
  };

  const openEdit = (club) => {
    setEditingId(club._id);
    setFormData({
      name: club.name,
      category: club.category,
      description: club.description,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await clubsAPI.update(editingId, formData);
      } else {
        await clubsAPI.create(formData);
      }
      setShowModal(false);
      setEditingId(null);
      fetchClubs();
    } catch {
      alert("Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this club?")) return;
    try {
      await clubsAPI.delete(id);
      fetchClubs();
    } catch {
      alert("Delete failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="clubs-container">
      <h1>Clubs</h1>

      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button onClick={openCreate}>+ Add Club</button>

      <div className="clubs-grid">
        {filteredClubs.map((club) => (
          <div key={club._id} className="club-card">
            <Link to={`/clubs/${club._id}`}>
              <h3>{club.name}</h3>
            </Link>
            <p>{club.category}</p>
            <p>{club.description}</p>

            <button onClick={() => openEdit(club)}>Edit</button>
            <button onClick={() => handleDelete(club._id)}>Delete</button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingId ? "Edit Club" : "Add Club"}</h2>

            <input
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <input
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

            <button onClick={() => setShowModal(false)}>Cancel</button>
            <button onClick={handleSubmit}>
              {editingId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
