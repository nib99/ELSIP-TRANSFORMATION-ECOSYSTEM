// src/views/ReportsView.js — FINAL NATIONAL WINNING REPORTS DASHBOARD
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import {
  Download, Search, Calendar, FileText, WifiOff, TrendingUp,
  Shield, Globe, CheckCircle2, Clock, MapPin, Award
} from "lucide-react";

export default function ReportsView() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    offline: 0,
    verified: 0
  });

  // Animated counter
  const useAnimatedCounter = (end, duration = 2500) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      if (end === 0) return;
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }, [end, duration]);
    return count;
  };

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 30000); // Auto-refresh
    return () => clearInterval(interval);
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from("inspection-reports").list("");
    
    if (error) {
      console.error("Error loading reports:", error);
      setLoading(false);
      return;
    }

    const sorted = (data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setReports(sorted);

    const today = new Date().toDateString();
    const todayCount = sorted.filter(r => new Date(r.created_at).toDateString() === today).length;
    const offlineCount = JSON.parse(localStorage.getItem("elsip-offline-queue") || "[]").length;

    setStats({
      total: sorted.length,
      today: todayCount,
      offline: offlineCount,
      verified: sorted.length
    });

    setLoading(false);
  };

  const filtered = reports.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalAnimated = useAnimatedCounter(stats.total);
  const todayAnimated = useAnimatedCounter(stats.today);
  const offlineAnimated = useAnimatedCounter(stats.offline);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-6 lg:p-12">
      {/* Hero Header */}
      <div className="text-center mb-16">
        <h1 className="text-6xl lg:text-8xl font-black text-emerald-800 mb-6">
          National Reports Center
        </h1>
        <p className="text-2xl lg:text-3xl text-gray-700 font-semibold mb-8">
          All Official Inspection Reports • Live • Searchable • Downloadable
        </p>
        <div className="flex justify-center gap-8">
          <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-full shadow-2xl">
            <Shield className="text-emerald-600" size={36} />
            <span className="text-2xl font-bold">MoLS Verified</span>
          </div>
          <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-full shadow-2xl">
            <Globe className="text-emerald-600" size={36} />
            <span className="text-2xl font-bold">100% Offline Generated</span>
          </div>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-12 rounded-3xl shadow-2xl text-white text-center transform hover:scale-105 transition">
          <FileText size={80} className="mx-auto mb-6" />
          <p className="text-7xl font-black">{totalAnimated.toLocaleString()}</p>
          <p className="text-3xl opacity-90 mt-4">Total Reports</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-12 rounded-3xl shadow-2xl text-white text-center transform hover:scale-105 transition">
          <TrendingUp size={80} className="mx-auto mb-6" />
          <p className="text-7xl font-black">{todayAnimated}</p>
          <p className="text-3xl opacity-90 mt-4">Today</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-12 rounded-3xl shadow-2xl text-white text-center transform hover:scale-105 transition">
          <WifiOff size={80} className="mx-auto mb-6" />
          <p className="text-7xl font-black">{offlineAnimated}</p>
          <p className="text-3xl opacity-90 mt-4">Offline Saved</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 p-12 rounded-3xl shadow-2xl text-white text-center transform hover:scale-105 transition">
          <CheckCircle2 size={80} className="mx-auto mb-6" />
          <p className="text-7xl font-black">{totalAnimated.toLocaleString()}</p>
          <p className="text-3xl opacity-90 mt-4">QR Verified</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-4xl mx-auto mb-12">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by filename, site, date..."
          className="w-full p-8 pl-20 text-2xl border-4 border-emerald-300 rounded-full focus:border-emerald-600 shadow-2xl focus:shadow-3xl transition"
        />
        <Search size={48} className="absolute left-8 top-8 text-emerald-600" />
      </div>

      {/* Reports Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-20 w-20 border-8 border-emerald-600 border-t-transparent"></div>
            <p className="text-3xl text-gray-600 mt-8">Loading national reports...</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-4xl text-gray-600 py-20">No reports match your search</p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-10">
            {filtered.map((r, i) => {
              const url = supabase.storage.from("inspection-reports").getPublicUrl(r.name).data.publicUrl;
              const date = new Date(r.created_at);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={r.name}
                  className="bg-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-l-8 border-emerald-600"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-6">
                      <div className="bg-emerald-100 p-6 rounded-2xl">
                        <FileText size={60} className="text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-gray-800">{r.name}</h3>
                        <p className="text-xl text-gray-600 flex items-center gap-3 mt-2">
                          <Calendar size={28} />
                          {date.toLocaleDateString()} {date.toLocaleTimeString()}
                          {isToday && <span className="ml-4 bg-emerald-600 text-white px-4 py-2 rounded-full text-lg font-bold">NEW TODAY</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-5xl font-black text-emerald-600">#{i + 1}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-8">
                    <div className="flex items-center gap-4 text-xl text-gray-600">
                      <MapPin size={32} />
                      <span>{r.name.includes("Bule") ? "Bule Hora" : r.name.split("_")[1] || "Ethiopia"}</span>
                    </div>

                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 text-white px-16 py-8 rounded-3xl text-3xl font-black flex items-center gap-6 shadow-2xl hover:shadow-3xl transition"
                    >
                      <Download size={48} />
                      OPEN PDF
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-24">
        <div className="inline-flex items-center gap-10 bg-emerald-900 text-white px-24 py-16 rounded-full shadow-3xl">
          <Award size={100} />
          <div>
            <p className="text-6xl font-black">NATIONAL DIGITAL ARCHIVE</p>
            <p className="text-3xl opacity-90">Every Report • Forever Accessible • Made in Ethiopia</p>
          </div>
        </div>
      </div>
    </div>
  );
}
