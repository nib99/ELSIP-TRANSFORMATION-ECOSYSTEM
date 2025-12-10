import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import DashboardView from './views/DashboardView.jsx';
import CredentialView from './views/CredentialView.jsx';
import InspectionView from './views/InspectionView.jsx';
import ExtendedInspectionView from './views/ExtendedInspectionView.jsx';
import VideoView from './views/VideoView.jsx';

export default function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/credentials" element={<CredentialView />} />
          <Route path="/inspection" element={<InspectionView />} />
          <Route path="/extended-inspection" element={<ExtendedInspectionView />} />
          <Route path="/video" element={<VideoView />} />
        </Routes>
      </Router>
    </div>
  );
}
