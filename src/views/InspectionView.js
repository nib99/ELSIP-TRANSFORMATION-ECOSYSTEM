// src/views/InspectionView.js
import React from "react";
import { Link } from "react-router-dom";
import useTranslation from "../i18n/useTranslation";
import { FileCheck, Globe, Mic, Shield } from "lucide-react";

export default function InspectionView() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-7xl font-black text-emerald-800 mb-4">{t("appName")}</h1>
        <p className="text-3xl text-gray-700 mb-2">{t("ministry")}</p>
        <p className="text-xl text-gray-600 mb-16">Federal Democratic Republic of Ethiopia</p>

        <div className="grid md:grid-cols-3 gap-10 mb-16">
          <div className="bg-white p-12 rounded-3xl shadow-2xl">
            <Globe size={90} className="mx-auto text-emerald-600 mb-6" />
            <h3 className="text-3xl font-bold mb-3">{t("worksOffline")}</h3>
            <p className="text-gray-600">{t("worksOffline")}</p>
          </div>
          <div className="bg-white p-12 rounded-3xl shadow-2xl">
            <Mic size={90} className="mx-auto text-emerald-600 mb-6" />
            <h3 className="text-3xl font-bold mb-3">{t("voiceInspection")}</h3>
            <p className="text-gray-600">{t("sayAwo")}</p>
          </div>
          <div className="bg-white p-12 rounded-3xl shadow-2xl">
            <Shield size={90} className="mx-auto text-emerald-600 mb-6" />
            <h3 className="text-3xl font-bold mb-3">{t("qrReports")}</h3>
            <p className="text-gray-600">{t("officialReports")}</p>
          </div>
        </div>

        <Link
          to="/inspection"
          className="inline-flex items-center gap-8 bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 text-white px-40 py-20 rounded-3xl text-6xl font-black shadow-3xl"
        >
          <FileCheck size={100} />
          {t("startInspection")}
        </Link>

        <div className="mt-20">
          <h2 className="text-4xl font-bold mb-8">{t("howItWorks")}</h2>
          <video controls className="mx-auto rounded-2xl shadow-2xl max-w-4xl">
            <source src="/sample-video.mp4" type="video/mp4" />
            <track kind="captions" src="/ELSIP-Demo.srt" label="English" />
          </video>
        </div>
      </div>
    </div>
  );
}
