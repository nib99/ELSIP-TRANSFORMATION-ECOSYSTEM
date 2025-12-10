import React, { useState } from "react";
import Card from "../components/Card";
import ChartCard from "../components/ChartCard";

export default function DashboardView() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openVideoModal = () => setIsModalOpen(true);
  const closeVideoModal = () => setIsModalOpen(false);

  const chartData = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 800 },
    { name: "Mar", value: 600 },
    { name: "Apr", value: 1200 },
  ];

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Cards */}
      <div className="flex gap-6 flex-wrap">
        <Card title="Total Users" value="1,250" color="bg-blue-100" />
        <Card title="Active Sessions" value="320" color="bg-green-100" />
        <Card title="Pending Approvals" value="17" color="bg-yellow-100" />
      </div>

      {/* Charts */}
      <div className="flex gap-6 flex-wrap">
        <ChartCard title="Monthly Revenue" data={chartData} />
        <ChartCard title="User Growth" data={chartData} />
      </div>

      {/* Video Modal Trigger */}
      <button onClick={openVideoModal} className="video-demo-btn mt-6 w-64">
        🎬 Watch 60-Second Demo
      </button>

      {/* Video Modal */}
      {isModalOpen && (
        <div className="video-modal">
          <div className="video-modal-overlay" onClick={closeVideoModal}></div>
          <div className="video-modal-content">
            <iframe
              src="https://www.youtube.com/embed/VIDEO_ID"
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
