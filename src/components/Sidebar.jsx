import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const route = location.pathname || "/";

  const linkClass = (path) =>
    `block px-4 py-2 rounded hover:bg-gray-700 transition ${
      route === path ? "bg-gray-700 font-bold" : ""
    }`;

  return (
    <aside className="sidebar w-64 bg-gray-800 text-white min-h-screen p-4 flex flex-col gap-4">
      <div className="sidebar-header mb-6">
        <h1 className="text-2xl font-bold">📱 ELSIP</h1>
      </div>
      <nav className="sidebar-nav flex flex-col gap-2">
        <Link to="/" className={linkClass("/")}>
          📊 Dashboard
        </Link>
        <Link to="/credentials" className={linkClass("/credentials")}>
          🎫 Credentials
        </Link>
        <Link to="/inspection" className={linkClass("/inspection")}>
          ✅ Inspection
        </Link>
        <Link to="/extended-inspection" className={linkClass("/extended-inspection")}>
          📋 Extended Inspection
        </Link>
        <Link to="/video" className={linkClass("/video")}>
          🎬 Demo Video
        </Link>
      </nav>
    </aside>
  );
}
