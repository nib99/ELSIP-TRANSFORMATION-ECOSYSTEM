export default function Sidebar() {
  const route = window.location.hash.slice(1) || 'dashboard';
  
  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>📱 ELSIP</h1>
      </div>
      <nav class="sidebar-nav">
        <a href="#dashboard" class="${route === 'dashboard' ? 'active' : ''}">
          📊 Dashboard
        </a>
        <a href="#credentials" class="${route === 'credentials' ? 'active' : ''}">
          🎫 Credentials
        </a>
        <a href="#inspection" class="${route === 'inspection' ? 'active' : ''}">
          ✅ Inspection
        </a>
        <a href="#extended-inspection" class="${route === 'extended-inspection' ? 'active' : ''}">
          📋 Extended Inspection
        </a>
        <a href="#video" class="${route === 'video' ? 'active' : ''}">
          🎬 Demo Video
        </a>
      </nav>
    </aside>
  `;
}
