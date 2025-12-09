export default function VideoModal() {
  return `
    <div id="videoModal" class="video-modal" style="display: none;">
      <div class="video-modal-overlay" onclick="closeVideoModal()"></div>
      <div class="video-modal-content">
        <button class="video-modal-close" onclick="closeVideoModal()">✕</button>
        <iframe 
          src="/video-demo.html" 
          style="width: 100%; height: 100%; border: none; border-radius: 12px;"
          title="ELSIP Demo Video"
        ></iframe>
      </div>
    </div>
  `;
}

window.openVideoModal = function() {
  document.getElementById('videoModal').style.display = 'flex';
};

window.closeVideoModal = function() {
  document.getElementById('videoModal').style.display = 'none';
};
