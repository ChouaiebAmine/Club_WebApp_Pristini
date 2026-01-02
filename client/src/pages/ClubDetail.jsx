import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { clubsAPI, eventsAPI } from "../utils/api";
import { ArrowLeft, Edit2, LogOut, UserPlus, Calendar, MapPin, Users, AlertCircle, X, Plus } from "lucide-react";

export default function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const userId =
    JSON.parse(localStorage.getItem("user"))?._id ??
    JSON.parse(localStorage.getItem("user"))?.id ??
    null;

  const [clubForm, setClubForm] = useState({
    name: "",
    category: "",
    description: "",
    memberCount: 0,
    meetingSchedule: "",
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    maxAttendees: "",
  });

  const fetchClub = async () => {
    try {
      setError("");
      const res = await clubsAPI.getById(id);
      setClub(res.data);
      setClubForm({
        name: res.data.name || "",
        category: res.data.category || "",
        description: res.data.description || "",
        memberCount: res.data.memberCount || 0,
        meetingSchedule: res.data.meetingSchedule || "",
      });
    } catch (err) {
      console.error("fetchClub error:", err);
      setError(err.response?.data?.message || "Error fetching club");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await eventsAPI.getByClub(id);
      setEvents(res.data);
    } catch (err) {
      console.error("fetchEvents error:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchClub(), fetchEvents()]).catch((e) => console.error(e));
  }, [id]);

  const saveClub = async () => {
    try {
      setBusy(true);
      await clubsAPI.update(id, clubForm);
      setEditing(false);
      await fetchClub();
      setError("");
    } catch (err) {
      console.error("saveClub error:", err);
      setError(err.response?.data?.message || "Failed to save club");
    } finally {
      setBusy(false);
    }
  };

  const createEvent = async () => {
    try {
      setBusy(true);
      await eventsAPI.create({
        clubId: id,
        ...eventForm,
      });
      setEventForm({
        title: "",
        description: "",
        date: "",
        location: "",
        maxAttendees: "",
      });
      setShowEventForm(false);
      await fetchEvents();
      setError("");
    } catch (err) {
      console.error("createEvent error:", err);
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    try {
      setBusy(true);
      await clubsAPI.join(id);
      await fetchClub();
      setError("");
    } catch (err) {
      console.error("join error:", err);
      setError(err.response?.data?.message || "Failed to join club");
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    try {
      setBusy(true);
      await clubsAPI.leave(id);
      await fetchClub();
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Can't leave — you're not a member of this club"
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading club...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <button
            onClick={() => navigate("/clubs")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Clubs
          </button>
          <div className="card-base p-12 text-center">
            <p className="text-gray-600 text-lg">Club not found</p>
          </div>
        </div>
      </div>
    );
  }

  const myEmail = JSON.parse(localStorage.getItem("user"))?.email;
  const isMember = club.members?.some((m) => m.userId?.email === myEmail);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          <button
            onClick={() => navigate("/clubs")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Clubs
          </button>
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

        {!editing ? (
          <>
            {/* Club Info */}
            <div className="card-base p-8 mb-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {club.name}
                  </h1>
                  {club.category && (
                    <span className="badge badge-primary mb-4">
                      {club.category}
                    </span>
                  )}
                  <p className="text-gray-600 text-lg mb-4">{club.description}</p>

                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-gray-400" />
                      <span>{club.memberCount || 0} members</span>
                    </div>
                    {club.meetingSchedule && (
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" />
                        <span>{club.meetingSchedule}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:items-end">
                  {isMember ? (
                    <button
                      disabled={busy}
                      onClick={handleLeave}
                      className="btn-danger flex items-center gap-2"
                    >
                      <LogOut size={18} />
                      {busy ? "Leaving..." : "Leave Club"}
                    </button>
                  ) : (
                    <button
                      disabled={busy}
                      onClick={handleJoin}
                      className="btn-primary flex items-center gap-2"
                    >
                      <UserPlus size={18} />
                      {busy ? "Joining..." : "Join Club"}
                    </button>
                  )}
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-outline flex items-center gap-2"
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Events Section */}
            <div className="card-base p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Events</h2>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create Event
                </button>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No events yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((e) => (
                    <div
                      key={e._id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                    >
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {e.title}
                      </h4>
                      <p className="text-gray-600 mb-4">{e.description}</p>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
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
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              await eventsAPI.register(e._id);
                              await fetchEvents();
                              await fetchClub();
                            } catch (err) {
                              console.error("register error:", err);
                              setError(
                                err.response?.data?.message || "Failed to register"
                              );
                            }
                          }}
                          className="btn-primary text-sm"
                        >
                          Register
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await eventsAPI.checkin(e._id);
                              await fetchEvents();
                            } catch (err) {
                              console.error("checkin error:", err);
                              setError(
                                err.response?.data?.message || "Failed to check in"
                              );
                            }
                          }}
                          className="btn-secondary text-sm"
                        >
                          Check In
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Edit Form */}
            <div className="card-base p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Club</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Club Name
                  </label>
                  <input
                    type="text"
                    value={clubForm.name}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, name: e.target.value })
                    }
                    placeholder="Club name"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={clubForm.category}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, category: e.target.value })
                    }
                    placeholder="e.g., Sports, Academic, Arts"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={clubForm.description}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, description: e.target.value })
                    }
                    placeholder="Describe your club"
                    rows="4"
                    className="input-field resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Count
                    </label>
                    <input
                      type="number"
                      value={clubForm.memberCount}
                      onChange={(e) =>
                        setClubForm({
                          ...clubForm,
                          memberCount: Number(e.target.value),
                        })
                      }
                      placeholder="0"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Schedule
                    </label>
                    <input
                      type="text"
                      value={clubForm.meetingSchedule}
                      onChange={(e) =>
                        setClubForm({
                          ...clubForm,
                          meetingSchedule: e.target.value,
                        })
                      }
                      placeholder="e.g., Every Monday at 5 PM"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  disabled={busy}
                  onClick={saveClub}
                  className="flex-1 btn-primary"
                >
                  {busy ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}

        {/* Create Event Modal */}
        {showEventForm && (
          <div className="modal-overlay">
            <div className="modal max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Event</h2>
                <button
                  onClick={() => setShowEventForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event title"
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, title: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the event"
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, description: e.target.value })
                    }
                    rows="3"
                    className="input-field resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.date}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, date: e.target.value })
                      }
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
                      value={eventForm.maxAttendees}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          maxAttendees: Number(e.target.value),
                        })
                      }
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
                    value={eventForm.location}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, location: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEventForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={createEvent}
                  disabled={busy}
                  className="flex-1 btn-primary"
                >
                  {busy ? "Creating..." : "Create Event"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
