
export default function VideoView() {
  return `
    <div class="video-view-container" style="width: 100%; height: 100vh; position: relative; background: #000;">
      <iframe 
        src="/video-demo.html" 
        style="width: 100%; height: 100%; border: none;"
        title="ELSIP 60-Second Demo Video"
      ></iframe>
    </div>
  `;
}
