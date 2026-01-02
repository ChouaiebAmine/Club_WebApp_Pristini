import { useEffect, useState } from "react";
import { eventsAPI, clubsAPI } from "../utils/api";
import { Plus, X, Calendar, MapPin, Users, AlertCircle } from "lucide-react";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedClub, setSelectedClub] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    clubId: "",
    title: "",
    description: "",
    date: "",
    location: "",
    maxAttendees: "",
  });

  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await clubsAPI.getAll();
      setClubs(res.data);
    } catch (err) {
      setError("Failed to load clubs");
      console.error(err);
    }
  };

  const fetchEvents = async (clubId) => {
    if (!clubId) return;
    try {
      setLoading(true);
      setSelectedClub(clubId);
      const res = await eventsAPI.getByClub(clubId);
      setEvents(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load events");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.clubId || !form.title) {
      setError("Club and title are required");
      return;
    }

    try {
      setLoading(true);
      await eventsAPI.create({
        ...form,
        maxAttendees: Number(form.maxAttendees),
      });
      setShowForm(false);
      setForm({
        clubId: "",
        title: "",
        description: "",
        date: "",
        location: "",
        maxAttendees: "",
      });
      setError("");
      fetchEvents(form.clubId);
    } catch (err) {
      setError("Failed to create event");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (eventId) => {
    try {
      await eventsAPI.register(eventId);
      fetchEvents(selectedClub);
    } catch (err) {
      setError("Failed to register for event");
      console.error(err);
    }
  };

  const checkin = async (eventId) => {
    try {
      await eventsAPI.checkin(eventId);
      fetchEvents(selectedClub);
    } catch (err) {
      setError("Failed to check in");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-8">
          <h1 className="section-title">Events</h1>
          <p className="section-subtitle">Manage and register for club events</p>
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
        <div className="card-base p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Club
              </label>
              <select
                value={selectedClub}
                onChange={(e) => fetchEvents(e.target.value)}
                className="input-field"
              >
                <option value="">Choose a club to view events</option>
                {clubs.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedClub && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={20} />
                Create Event
              </button>
            )}
          </div>
        </div>

        {/* Events List */}
        {selectedClub ? (
          loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="card-base p-12 text-center">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg mb-4">No events yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Create First Event
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((e) => {
                const myAttendance = e.attendees?.find((a) => a.userId?._id === userId);

                return (
                  <div key={e._id} className="card-base p-6 hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{e.title}</h3>
                        <p className="text-gray-600 mb-4">{e.description}</p>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            {new Date(e.date).toLocaleString()}
                          </div>
                          {e.location && (
                            <div className="flex items-center gap-2">
                              <MapPin size={16} className="text-gray-400" />
                              {e.location}
                            </div>
                          )}
                          {e.maxAttendees && (
                            <div className="flex items-center gap-2">
                              <Users size={16} className="text-gray-400" />
                              Max {e.maxAttendees} attendees
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        {myAttendance ? (
                          <>
                            <span className="badge badge-success">
                              {myAttendance.status === "checked_in" ? "Checked In" : "Registered"}
                            </span>
                            {myAttendance.status === "registered" && (
                              <button
                                onClick={() => checkin(e._id)}
                                className="btn-primary text-sm"
                              >
                                Check In
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="badge badge-warning">Not Registered</span>
                            <button
                              onClick={() => register(e._id)}
                              className="btn-primary text-sm"
                            >
                              Register
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="card-base p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Select a club to view events</p>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Event</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Club *
                </label>
                <select
                  required
                  value={form.clubId}
                  onChange={(e) => setForm({ ...form, clubId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select a club</option>
                  {clubs.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter event title"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Describe the event..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="3"
                  className="input-field resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Attendees
                  </label>
                  <input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={form.maxAttendees}
                    onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter event location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary"
                >
                  {loading ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
