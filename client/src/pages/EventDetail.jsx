import { useParams, useNavigate } from "react-router-dom";
import { eventsAPI } from "../utils/api";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Users, ArrowLeft, AlertCircle, X } from "lucide-react";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await eventsAPI.getById(id);
      setEvent(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load event");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setBusy(true);
      await eventsAPI.register(id);
      await fetchEvent();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register");
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleCheckin = async () => {
    try {
      setBusy(true);
      await eventsAPI.checkin(id);
      await fetchEvent();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to check in");
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    try {
      setBusy(true);
      await eventsAPI.cancel(id);
      navigate("/events");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel event");
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <button
            onClick={() => navigate("/events")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Events
          </button>
          <div className="card-base p-12 text-center">
            <p className="text-gray-600 text-lg">Event not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          <button
            onClick={() => navigate("/events")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Events
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

        {/* Event Card */}
        <div className="card-base overflow-hidden">
          {/* Header Image */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-48"></div>

          {/* Content */}
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>

            <p className="text-gray-600 text-lg mb-8">{event.description}</p>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 py-6 border-y border-gray-200">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar size={20} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Date & Time</span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {new Date(event.date).toLocaleString()}
                </p>
              </div>

              {event.location && (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin size={20} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Location</span>
                  </div>
                  <p className="text-gray-900 font-semibold">{event.location}</p>
                </div>
              )}

              {event.maxAttendees && (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Users size={20} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Capacity</span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {event.attendees?.length || 0} / {event.maxAttendees}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRegister}
                disabled={busy}
                className="btn-primary flex-1"
              >
                {busy ? "Registering..." : "Register"}
              </button>
              <button
                onClick={handleCheckin}
                disabled={busy}
                className="btn-secondary flex-1"
              >
                {busy ? "Checking In..." : "Check In"}
              </button>
              <button
                onClick={handleCancel}
                disabled={busy}
                className="btn-danger flex-1"
              >
                {busy ? "Canceling..." : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
