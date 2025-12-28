import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { clubsAPI, eventsAPI } from "../utils/api";

export default function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [busy, setBusy] = useState(false); // disable buttons during requests
  const [error, setError] = useState("");

  const userId =
    JSON.parse(localStorage.getItem("user"))?._id ??
    JSON.parse(localStorage.getItem("user"))?.id ??
    null;

  // robust helper to check membership
  const checkIsMember = useCallback(
    (clubObj) => {
      if (!clubObj || !clubObj.members) return false;
      return clubObj.members.some((m) => {
        // m.userId can be ObjectId string, populated object with _id, or nested id
        const uid =
          (m.userId && (m.userId._id || m.userId.id || m.userId)) || null;
        return uid && uid.toString() === userId?.toString();
      });
    },
    [userId]
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveClub = async () => {
    try {
      setBusy(true);
      await clubsAPI.update(id, clubForm);
      setEditing(false);
      await fetchClub();
    } catch (err) {
      console.error("saveClub error:", err);
      alert(err.response?.data?.message || "Failed to save club");
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
    } catch (err) {
      console.error("createEvent error:", err);
      alert(err.response?.data?.message || "Failed to create event");
    } finally {
      setBusy(false);
    }
  };

  // JOIN
  const handleJoin = async () => {
    console.log("aaaauserId:", userId);
    console.log("members:", club.members);
    console.log("isMember:aaaa", isMember);

    try {
      setBusy(true);
      await clubsAPI.join(id); // sends POST /clubs/:id/join
      await fetchClub(); // refresh club so members & count update
    } catch (err) {
      console.error("join error:", err);
      alert(err.response?.data?.message || "Failed to join club");
    } finally {
      setBusy(false);
    }
  };

  // LEAVE
  const handleLeave = async () => {
    try {
      setBusy(true);
      await clubsAPI.leave(id);
      await fetchClub();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Can't leave — you're not a member of this club"
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!club) return <div style={{ padding: 24 }}>Not found</div>;

  const myEmail = JSON.parse(localStorage.getItem("user"))?.email;

  const isMember = club.members.some((m) => m.userId?.email === myEmail);
  return (
    <div style={{ padding: 24 }}>
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      {!editing ? (
        <>
          <h1>{club.name}</h1>
          <p>
            <b>Category:</b> {club.category}
          </p>
          <p>{club.description}</p>
          <p>
            <b>Members:</b> {club.memberCount}
          </p>
          <p>
            <b>Schedule:</b> {club.meetingSchedule}
          </p>

          <button disabled={busy} onClick={handleLeave}>
            {busy ? "Leaving..." : "Leave Club"}
          </button>

          <button
            disabled={busy}
            onClick={handleJoin}
            style={{ marginLeft: 8 }}
          >
            {busy ? "Joining..." : "Join Club"}
          </button>

          <button onClick={() => setEditing(true)}>Edit Club</button>
          <button onClick={() => navigate("/clubs")}>Back</button>

          <hr />

          <h2>Events</h2>
          <button onClick={() => setShowEventForm(true)}>+ Create Event</button>

          {events.length === 0 ? (
            <p>No events yet</p>
          ) : (
            events.map((e) => (
              <div
                key={e._id}
                style={{ border: "1px solid #ccc", padding: 12, marginTop: 10 }}
              >
                <h4>{e.title}</h4>
                <p>{e.description}</p>
                <p>
                  <b>Date:</b> {new Date(e.date).toLocaleString()}
                </p>
                <p>
                  <b>Location:</b> {e.location}
                </p>

                <button
                  onClick={async () => {
                    try {
                      await eventsAPI.register(e._id);
                      await fetchEvents();
                      await fetchClub(); // in case attendees count shown on club
                    } catch (err) {
                      console.error("register error:", err);
                      alert(
                        err.response?.data?.message || "Failed to register"
                      );
                    }
                  }}
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
                      alert(
                        err.response?.data?.message || "Failed to check in"
                      );
                    }
                  }}
                >
                  Check-in
                </button>
              </div>
            ))
          )}
        </>
      ) : (
        <>
          <h2>Edit Club</h2>

          <input
            value={clubForm.name}
            onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
            placeholder="Name"
          />
          <input
            value={clubForm.category}
            onChange={(e) =>
              setClubForm({ ...clubForm, category: e.target.value })
            }
            placeholder="Category"
          />
          <textarea
            value={clubForm.description}
            onChange={(e) =>
              setClubForm({ ...clubForm, description: e.target.value })
            }
            placeholder="Description"
          />
          <input
            type="number"
            value={clubForm.memberCount}
            onChange={(e) =>
              setClubForm({ ...clubForm, memberCount: Number(e.target.value) })
            }
            placeholder="Members"
          />
          <input
            value={clubForm.meetingSchedule}
            onChange={(e) =>
              setClubForm({ ...clubForm, meetingSchedule: e.target.value })
            }
            placeholder="Meeting schedule"
          />

          <button disabled={busy} onClick={saveClub}>
            Save
          </button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      )}

      {showEventForm && (
        <div style={{ marginTop: 30 }}>
          <h3>Create Event</h3>

          <input
            placeholder="Title"
            value={eventForm.title}
            onChange={(e) =>
              setEventForm({ ...eventForm, title: e.target.value })
            }
          />
          <textarea
            placeholder="Description"
            value={eventForm.description}
            onChange={(e) =>
              setEventForm({ ...eventForm, description: e.target.value })
            }
          />
          <input
            type="datetime-local"
            value={eventForm.date}
            onChange={(e) =>
              setEventForm({ ...eventForm, date: e.target.value })
            }
          />
          <input
            placeholder="Location"
            value={eventForm.location}
            onChange={(e) =>
              setEventForm({ ...eventForm, location: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Max attendees"
            value={eventForm.maxAttendees}
            onChange={(e) =>
              setEventForm({
                ...eventForm,
                maxAttendees: Number(e.target.value),
              })
            }
          />

          <button onClick={createEvent}>Create</button>
          <button onClick={() => setShowEventForm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
