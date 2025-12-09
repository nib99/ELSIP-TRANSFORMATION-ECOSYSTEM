// src/views/SettingsView.js — FINAL GOVERNMENT-GRADE SETTINGS
import React, { useState, useEffect } from "react";
import { Globe, Check, Shield, Smartphone, Volume2, Bell, User, LogOut } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function SettingsView() {
  const [lang, setLang] = useState(localStorage.getItem("elsip-lang") || "en");
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const changeLang = (l) => {
    localStorage.setItem("elsip-lang", l);
    setLang(l);
    setTimeout(() => window.location.reload(), 300);
  };

  const languages = [
    { code: "en", label: "English", flag: "GB", native: "English" },
    { code: "am", label: "አማርኛ", flag: "ET", native: "Amharic" },
    { code: "om", label: "Afaan Oromoo", flag: "ET", native: "Afaan Oromoo" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl lg:text-7xl font-black text-emerald-800 mb-4">
            Settings Center
          </h1>
          <p className="text-2xl lg:text-3xl text-gray-700">
            Configure ELSIP for Your Region
          </p>
        </div>

        {/* User Card */}
        {user && (
          <div className="bg-white p-10 rounded-3xl shadow-2xl mb-12 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="bg-emerald-100 p-6 rounded-full">
                <User size={60} className="text-emerald-700" />
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-800">Logged in as</p>
                <p className="text-2xl text-gray-700">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="bg-red-600 hover:bg-red-700 text-white px-10 py-6 rounded-2xl text-xl font-bold flex items-center gap-4"
            >
              <LogOut size={32} /> Sign Out
            </button>
          </div>
        )}

        {/* Language Selection */}
        <div className="bg-white p-12 rounded-3xl shadow-2xl mb-12">
          <div className="text-center mb-12">
            <Globe size={80} className="mx-auto text-emerald-600 mb-6" />
            <h2 className="text-4xl lg:text-5xl font-black text-emerald-800">
              Select Language
            </h2>
            <p className="text-xl text-gray-600 mt-4">
              ELSIP supports full offline use in all three languages
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {languages.map((option) => (
              <button
                key={option.code}
                onClick={() => changeLang(option.code)}
                className={`relative p-12 rounded-3xl border-4 transition-all duration-500 transform hover:scale-105 ${
                  lang === option.code
                    ? "border-emerald-600 bg-emerald-50 shadow-2xl"
                    : "border-gray-300 bg-gray-50 hover:border-emerald-400"
                }`}
              >
                <div className="text-center">
                  <div className="text-8xl mb-6">{option.flag === "GB" ? "UK" : "ET"}</div>
                  <p className="text-4xl font-black text-emerald-800 mb-2">
                    {option.label}
                  </p>
                  <p className="text-xl text-gray-600">{option.native}</p>
                </div>
                {lang === option.code && (
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white p-3 rounded-full animate-pulse">
                    <Check size={32} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Status */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-10 rounded-3xl shadow-2xl text-white text-center">
            <Smartphone size={80} className="mx-auto mb-6" />
            <p className="text-3xl font-black">PWA Installed</p>
            <p className="text-xl opacity-90 mt-2">Works without internet</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-10 rounded-3xl shadow-2xl text-white text-center">
            <Volume2 size={80} className="mx-auto mb-6" />
            <p className="text-3xl font-black">Voice Mode</p>
            <p className="text-xl opacity-90 mt-2">Say "Awo" or "Lakki"</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-10 rounded-3xl shadow-2xl text-white text-center">
            <Bell size={80} className="mx-auto mb-6" />
            <p className="text-3xl font-black">Auto Sync</p>
            <p className="text-xl opacity-90 mt-2">Reports upload when online</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-6 bg-emerald-900 text-white px-16 py-10 rounded-full shadow-2xl">
            <Shield size={70} />
            <div>
              <p className="text-4xl font-black">OFFICIAL MoLS SYSTEM</p>
              <p className="text-2xl opacity-90">Federal Democratic Republic of Ethiopia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
