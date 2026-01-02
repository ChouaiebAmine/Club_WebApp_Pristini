import React from "react";
import { Megaphone } from "lucide-react";

export default class Announcements extends React.Component {
  render() {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container-custom py-8">
            <h1 className="section-title">Announcements</h1>
            <p className="section-subtitle">Stay updated with club announcements</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-custom py-8">
          <div className="card-base p-12 text-center">
            <Megaphone size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Announcements feature coming soon</p>
            <p className="text-gray-500 text-sm mt-2">
              Stay tuned for club announcements and updates
            </p>
          </div>
        </div>
      </div>
    );
  }
}
