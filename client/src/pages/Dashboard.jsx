import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Calendar, Club, Megaphone, ArrowRight } from "lucide-react";
import { clubsAPI, eventsAPI } from "../utils/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    clubs: 0,
    events: 0,
    members: 0,
  });
  const [recentClubs, setRecentClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const clubsRes = await clubsAPI.getAll();
      setRecentClubs(clubsRes.data.slice(0, 3));
      setStats((prev) => ({
        ...prev,
        clubs: clubsRes.data.length,
      }));
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card-base p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-8">
          <h1 className="section-title">Welcome back, {user?.name}!</h1>
          <p className="section-subtitle">Here's what's happening with your clubs</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={Club}
                label="Total Clubs"
                value={stats.clubs}
                color="bg-blue-600"
              />
              <StatCard
                icon={Calendar}
                label="Upcoming Events"
                value={stats.events}
                color="bg-green-600"
              />
              <StatCard
                icon={Users}
                label="Active Members"
                value={stats.members}
                color="bg-purple-600"
              />
            </div>

            {/* Recent Clubs */}
            <div className="card-base p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Featured Clubs</h2>
                <Link
                  to="/clubs"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View All
                  <ArrowRight size={16} />
                </Link>
              </div>

              {recentClubs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentClubs.map((club) => (
                    <Link
                      key={club._id}
                      to={`/clubs/${club._id}`}
                      className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                          {club.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{club.category}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{club.description}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Club size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">No clubs yet</p>
                  <Link to="/clubs" className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">
                    Create your first club
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/clubs"
                className="card-base p-6 hover:shadow-md transition flex items-center justify-between group"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                    Browse Clubs
                  </h3>
                  <p className="text-sm text-gray-600">Discover and join clubs</p>
                </div>
                <Club size={24} className="text-gray-400 group-hover:text-blue-600 transition" />
              </Link>

              <Link
                to="/events"
                className="card-base p-6 hover:shadow-md transition flex items-center justify-between group"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                    View Events
                  </h3>
                  <p className="text-sm text-gray-600">Check upcoming events</p>
                </div>
                <Calendar size={24} className="text-gray-400 group-hover:text-blue-600 transition" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
