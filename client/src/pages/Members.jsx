import { useEffect, useState } from "react";
import { clubsAPI, membersAPI } from "../utils/api";
import { Users, AlertCircle, X } from "lucide-react";

const ROLES = ["President", "Treasurer", "HR", "Event Manager", "Member"];

export default function Members() {
  const [clubs, setClubs] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  const currentUserId =
    JSON.parse(localStorage.getItem("user"))?._id ||
    JSON.parse(localStorage.getItem("user"))?.id ||
    null;

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

  const loadMembers = async (clubId) => {
    if (!clubId) return;

    try {
      setLoading(true);
      setError("");
      const [membersRes, clubRes] = await Promise.all([
        membersAPI.getByClub(clubId),
        clubsAPI.getById(clubId),
      ]);
      setMembers(membersRes.data);
      setSelectedClub(clubRes.data);
    } catch (err) {
      setError("Failed to load members");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isPresident =
    (
      selectedClub?.presidentId?._id || selectedClub?.presidentId
    )?.toString() === currentUserId;

  const handleRoleChange = async (memberId, role) => {
    try {
      setUpdating(memberId);
      await membersAPI.updateRole(selectedClub._id, memberId, role);
      await loadMembers(selectedClub._id);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-8">
          <h1 className="section-title">Members</h1>
          <p className="section-subtitle">Manage club members and roles</p>
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

        {/* Club Selection */}
        <div className="card-base p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Club
          </label>
          <select
            onChange={(e) => loadMembers(e.target.value)}
            className="input-field"
          >
            <option value="">Choose a club to view members</option>
            {clubs.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Members List */}
        {selectedClub ? (
          loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="card-base p-12 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No members yet</p>
            </div>
          ) : (
            <div className="card-base overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {members.map((m) => {
                      const isSelf = m.userId === currentUserId;
                      const isPresident = m.role === "President";

                      return (
                        <tr key={m.userId} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {m.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {m.email}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {isPresident && !isSelf ? (
                              <select
                                value={m.role}
                                onChange={(e) =>
                                  handleRoleChange(m.userId, e.target.value)
                                }
                                disabled={updating === m.userId}
                                className="input-field text-sm py-1"
                              >
                                {ROLES.map((r) => (
                                  <option key={r} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="badge badge-primary">{m.role}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {isSelf && (
                              <span className="text-gray-500 text-xs">(You)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="card-base p-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Select a club to view members</p>
          </div>
        )}
      </div>
    </div>
  );
}
