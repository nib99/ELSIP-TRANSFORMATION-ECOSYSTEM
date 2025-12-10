import React, { useState } from "react";
import "../index.css"; // Make sure CSS is imported

export default function DashboardView() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openVideoModal = () => setIsModalOpen(true);
  const closeVideoModal = () => setIsModalOpen(false);

  return (
    <div className="dashboard" style={{ padding: "20px" }}>
      {/* Header */}
      <header className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2>Dashboard Overview</h2>
        <button onClick={openVideoModal} className="video-demo-btn">
          🎬 Watch 60-Second Demo
        </button>
      </header>

      {/* Cards Section */}
      <section className="dashboard-cards" style={{ display: "flex", gap: "20px", marginBottom: "40px", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 200px", background: "#f0f4f8", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3>Total Users</h3>
          <p>1,250</p>
        </div>
        <div className="card" style={{ flex: "1 1 200px", background: "#f0f4f8", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3>Active Sessions</h3>
          <p>320</p>
        </div>
        <div className="card" style={{ flex: "1 1 200px", background: "#f0f4f8", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3>Pending Approvals</h3>
          <p>17</p>
        </div>
      </section>

      {/* Charts Section */}
      <section className="dashboard-charts" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div className="chart" style={{ flex: "1 1 400px", background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
          <h3>Monthly Revenue</h3>
          <p>[Chart Placeholder]</p>
        </div>
        <div className="chart" style={{ flex: "1 1 400px", background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
          <h3>User Growth</h3>
          <p>[Chart Placeholder]</p>
        </div>
      </section>

      {/* Video Modal */}
      {isModalOpen && (
        <div className="video-modal">
          <div className="video-modal-overlay" onClick={closeVideoModal}></div>
          <div className="video-modal-content">
            <iframe
              src="https://www.youtube.com/embed/VIDEO_ID" // Replace VIDEO_ID
              title="Demo Video"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <button className="video-modal-close" onClick={closeVideoModal}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
