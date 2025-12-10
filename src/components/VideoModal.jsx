import React, { useState } from "react";

export default function VideoModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openVideoModal = () => setIsOpen(true);
  const closeVideoModal = () => setIsOpen(false);

  return (
    <>
      {/* Trigger Button */}
      <button onClick={openVideoModal} className="video-demo-btn">
        🎬 Watch 60-Second Demo
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="video-modal flex items-center justify-center fixed inset-0 z-50">
          <div className="video-modal-overlay absolute inset-0 bg-black bg-opacity-90" onClick={closeVideoModal}></div>
          <div className="video-modal-content relative w-11/12 h-5/6 max-w-6xl bg-white rounded-lg overflow-hidden">
            <iframe
              src="/video-demo.html"
              title="ELSIP Demo Video"
              style={{ width: "100%", height: "100%", border: "none", borderRadius: "12px" }}
            ></iframe>
            <button
              className="video-modal-close absolute -top-10 right-0 bg-white w-10 h-10 rounded-full text-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              onClick={closeVideoModal}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
