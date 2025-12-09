// src/views/CredentialView.js
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import useTranslation from "../i18n/useTranslation";
import { Mail, LogOut, User, Globe } from "lucide-react";

export default function CredentialView({ onLogin }) {
  const { t, lang, setLang } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        onLogin?.();
      }
    });
  }, [onLogin]);

  const signIn = async () => {
    if (!email.includes("@")) return alert("Please enter valid email");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) alert(error.message);
    else {
      alert(t("offlineNote"));
      onLogin?.();
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <User size={80} className="mx-auto text-emerald-700 mb-6" />
          <h2 className="text-4xl font-bold text-emerald-800 mb-4">{t("welcomeBack")}</h2>
          <p className="text-xl text-gray-700 mb-8">{user.email}</p>
          <button onClick={() => supabase.auth.signOut()} className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-xl flex items-center gap-4 mx-auto text-xl">
            <LogOut /> {t("signOut")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-teal-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        <img src="/favicon.ico" alt="ELSIP" className="h-24 mx-auto mb-8" />
        <h1 className="text-5xl font-bold text-emerald-800 mb-2">{t("appName")}</h1>
        <p className="text-xl text-gray-300 mb-8">{t("ministry")}</p>

        <div className="flex justify-center gap-4 mb-8">
          <button onClick={() => setLang("en")} className={`px-6 py-2 rounded-xl ${lang === "en" ? "bg-emerald-600 text-white" : "bg-gray-200"}`}>English</button>
          <button onClick={() => setLang("am")} className={`px-6 py-2 rounded-xl ${lang === "am" ? "bg-emerald-600 text-white" : "bg-gray-200"}`}>አማርኛ</button>
          <button onClick={() => setLang("om")} className={`px-6 py-2 rounded-xl ${lang === "om" ? "bg-emerald-600 text-white" : "bg-gray-200"}`}>Afaan Oromoo</button>
        </div>

        <input
          type="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 border-2 border-emerald-300 rounded-xl text-lg mb-4"
        />
        <button
          onClick={signIn}
          disabled={loading}
          className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-70 text-white py-5 rounded-xl text-xl font-bold flex items-center justify-center gap-3"
        >
          <Mail size={28} /> {loading ? t("sending") : t("sendMagicLink")}
        </button>

        <p className="mt-8 text-sm text-gray-300 flex items-center justify-center gap-2">
          <Globe size={18} /> {t("offlineNote")}
        </p>
      </div>
    </div>
  );
}
