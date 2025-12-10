import React, { useState } from "react";
import "../index.css"; // make sure this imports your CSS

export default function DashboardView() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openVideoModal = () => setIsModalOpen(true);
  const closeVideoModal = () => setIsModalOpen(false);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <button onClick={openVideoModal} className="video-demo-btn">
          🎬 Watch 60-Second Demo
        </button>
      </header>

      {/* Video Modal */}
      {isModalOpen && (
        <div className="video-modal">
          <div className="video-modal-overlay" onClick={closeVideoModal}></div>

          <div className="video-modal-content">
            <iframe
              src="https://www.youtube.com/embed/VIDEO_ID" // replace VIDEO_ID
              title="Demo Video"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>

            <button
              className="video-modal-close"
              onClick={closeVideoModal}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* rest of your dashboard content */}
    </div>
  );
}
