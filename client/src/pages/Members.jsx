import { useEffect, useState } from "react";
import { clubsAPI, membersAPI } from "../utils/api";

const ROLES = ["President", "Treasurer", "HR", "Event Manager", "Member"];

export default function Members() {
  const [clubs, setClubs] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);

  const currentUserId =
    JSON.parse(localStorage.getItem("user"))?._id ||
    JSON.parse(localStorage.getItem("user"))?.id ||
    null;
  useEffect(() => {
    clubsAPI.getAll().then((res) => setClubs(res.data));
  }, []);

  const loadMembers = async (clubId) => {
    if (!clubId) return;

    const [membersRes, clubRes] = await Promise.all([
      membersAPI.getByClub(clubId),
      clubsAPI.getById(clubId),
    ]);
    console.log("clubRes.data:", clubRes.data);
    setMembers(membersRes.data);
    setSelectedClub(clubRes.data);
  };

  // Replace it with this more robust check:
  const isPresident =
    (
      selectedClub?.presidentId?._id || selectedClub?.presidentId
    )?.toString() === currentUserId;
  console.log("isPresident:", isPresident);
  const handleRoleChange = async (memberId, role) => {
    try {
      await membersAPI.updateRole(selectedClub._id, memberId, role);
      loadMembers(selectedClub._id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Members</h1>

      <select onChange={(e) => loadMembers(e.target.value)}>
        <option value="">Select club</option>
        {clubs.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      <ul style={{ marginTop: 20 }}>
        {members.map((m) => {
          const isSelf = m.userId === currentUserId;
          console.log("currentUserId:", currentUserId);
          console.log("presidentId:", selectedClub?.presidentId);

          return (
            <li key={m.userId} style={{ marginBottom: 10 }}>
              {m.name} — {m.email} —{" "}
              {isPresident ? (
                <select
                  value={m.role}
                  disabled={isSelf}
                  onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              ) : (
                <b>{m.role}</b>
              )}
              {isSelf && m.role === "President" && (
                <span style={{ color: "gray" }}> (You)</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
