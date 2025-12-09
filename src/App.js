import DashboardView from './views/DashboardView.js';
import CredentialView from './views/CredentialView.js';
import InspectionView from './views/InspectionView.js';
import ExtendedInspectionView from './views/ExtendedInspectionView.js';
import VideoView from './views/VideoView.js'; // ✅ new import

export default function App() {
  const route = window.location.hash.slice(1) || 'dashboard';
  
  let view;
  switch(route) {
    case 'dashboard':
      view = DashboardView();
      break;
    case 'credentials':
      view = CredentialView();
      break;
    case 'inspection':
      view = InspectionView();
      break;
    case 'extended-inspection':
      view = ExtendedInspectionView();
      break;
    case 'video': // ✅ new route
      view = VideoView();
      break;
    default:
      view = DashboardView();
  }
  
  return `
    <div class="app">
      ${view}
    </div>
  `;
}
