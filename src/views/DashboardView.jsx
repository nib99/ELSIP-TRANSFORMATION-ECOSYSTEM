export default function DashboardView() {
  return `
    <div class="dashboard">
      <header class="dashboard-header">
        <h2>Dashboard Overview</h2>
        <button onclick="openVideoModal()" class="video-demo-btn">
          🎬 Watch 60-Second Demo
        </button>
      </header>
      <!-- rest of your dashboard -->
    </div>
  `;
}

Add button styles to src/index.css:

.video-demo-btn {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: transform 0.2s;
}

.video-demo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}


