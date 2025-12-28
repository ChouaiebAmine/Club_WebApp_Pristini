import { useParams } from "react-router-dom";
import { eventsAPI } from "../utils/api";
import { useEffect, useState } from "react";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    eventsAPI.getById(id).then((res) => setEvent(res.data));
  }, [id]);

  if (!event) return null;

  return (
    <div style={{ padding: 24 }}>
      <h1>{event.title}</h1>
      <button onClick={() => eventsAPI.register(id)}>Register</button>
      <button onClick={() => eventsAPI.checkin(id)}>Check-in</button>
      <button onClick={() => eventsAPI.cancel(id)}>Cancel</button>
    </div>
  );
}
