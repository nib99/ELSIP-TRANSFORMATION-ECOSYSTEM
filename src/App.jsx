import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import DashboardView from "./views/DashboardView";
import VideoView from "./views/VideoView";
import CredentialView from "./views/CredentialView";
import InspectionView from "./views/InspectionView";
import ExtendedInspectionView from "./views/ExtendedInspectionView";

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/video" element={<VideoView />} />
              <Route path="/credentials" element={<CredentialView />} />
              <Route path="/inspection" element={<InspectionView />} />
              <Route path="/extended-inspection" element={<ExtendedInspectionView />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
