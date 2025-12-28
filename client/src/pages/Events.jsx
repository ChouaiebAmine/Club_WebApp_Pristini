import { useEffect, useState } from "react";
import { eventsAPI, clubsAPI } from "../utils/api";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedClub, setSelectedClub] = useState("");

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
    const res = await clubsAPI.getAll();
    setClubs(res.data);
  };

  const fetchEvents = async (clubId) => {
    setSelectedClub(clubId);
    const res = await eventsAPI.getByClub(clubId);
    setEvents(res.data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await eventsAPI.create({
      ...form,
      maxAttendees: Number(form.maxAttendees),
    });
    setShowForm(false);
    fetchEvents(form.clubId);
  };

  const register = async (eventId) => {
    await eventsAPI.register(eventId);
    fetchEvents(selectedClub);
  };

  const checkin = async (eventId) => {
    await eventsAPI.checkin(eventId);
    fetchEvents(selectedClub);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Events</h1>

      <select onChange={(e) => fetchEvents(e.target.value)} defaultValue="">
        <option value="" disabled>
          Select club
        </option>
        {clubs.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      <button onClick={() => setShowForm(true)}>+ Create Event</button>

      {showForm && (
        <form onSubmit={handleCreate}>
          <select
            required
            onChange={(e) => setForm({ ...form, clubId: e.target.value })}
          >
            <option value="">Choose club</option>
            {clubs.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Title"
            required
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            placeholder="Description"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <input
            type="datetime-local"
            required
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <input
            placeholder="Location"
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <input
            type="number"
            placeholder="Max attendees"
            onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })}
          />

          <button type="submit">Create</button>
        </form>
      )}

      <hr />

      {events.map((e) => {
        const myAttendance = e.attendees?.find((a) => a.userId?._id === userId);

        return (
          <div key={e._id}>
            <h3>{e.title}</h3>

            {myAttendance ? (
              <p>
                Status: <b>{myAttendance.status}</b>
              </p>
            ) : (
              <p>
                Status: <b>Not registered</b>
              </p>
            )}

            {!myAttendance && (
              <button onClick={() => register(e._id)}>Register</button>
            )}

            {myAttendance?.status === "registered" && (
              <button onClick={() => checkin(e._id)}>Check-in</button>
            )}
          </div>
        );
      })}
    </div>
  );
}
