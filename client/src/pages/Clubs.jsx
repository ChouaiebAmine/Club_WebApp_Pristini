import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { clubsAPI } from "../utils/api";
import { Search, Plus, Edit2, Trash2, X, AlertCircle } from "lucide-react";

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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
      setError("");
      const res = await clubsAPI.getAll();
      setClubs(res.data);
    } catch (err) {
      setError("Failed to load clubs. Please try again.");
      console.error(err);
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
    if (!formData.name.trim()) {
      setError("Club name is required");
      return;
    }

    try {
      if (editingId) {
        await clubsAPI.update(editingId, formData);
      } else {
        await clubsAPI.create(formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: "", category: "", description: "" });
      setError("");
      fetchClubs();
    } catch (err) {
      setError("Failed to save club. Please try again.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await clubsAPI.delete(id);
      setDeleteConfirm(null);
      setError("");
      fetchClubs();
    } catch (err) {
      setError("Failed to delete club. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-8">
          <h1 className="section-title">Clubs</h1>
          <p className="section-subtitle">Manage and explore all clubs</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-8">
        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search clubs by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={20} />
            Add Club
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading clubs...</p>
          </div>
        ) : filteredClubs.length === 0 ? (
          <div className="card-base p-12 text-center">
            <div className="text-gray-400 mb-4 flex justify-center">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg mb-2">No clubs found</p>
            <p className="text-gray-500 text-sm mb-4">
              {search ? "Try adjusting your search" : "Create your first club to get started"}
            </p>
            {!search && (
              <button onClick={openCreate} className="btn-primary">
                Create Club
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <div key={club._id} className="card-base overflow-hidden hover:shadow-md transition">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24"></div>

                <div className="p-6">
                  <Link
                    to={`/clubs/${club._id}`}
                    className="block group mb-2"
                  >
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                      {club.name}
                    </h3>
                  </Link>

                  {club.category && (
                    <span className="badge badge-primary mb-3">
                      {club.category}
                    </span>
                  )}

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {club.description || "No description provided"}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(club)}
                      className="flex-1 btn-outline flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(club._id)}
                      className="flex-1 btn-outline text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? "Edit Club" : "Create New Club"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Club Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter club name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sports, Academic, Arts"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Describe your club..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="4"
                  className="input-field resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 btn-primary"
              >
                {editingId ? "Update Club" : "Create Club"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal max-w-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Club?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this club? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
