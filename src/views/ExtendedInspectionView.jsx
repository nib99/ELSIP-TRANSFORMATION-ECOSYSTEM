// src/views/ExtendedInspectionView.js
import React, { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode.react";
import { supabase } from "../supabaseClient";
import {
  Camera,
  Download,
  Share2,
  Languages,
  User,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Plus,
  Loader2
} from "lucide-react";

/**
 * ExtendedInspectionView.js
 * Single-file JavaScript React implementation:
 * - Login screen (Supabase)
 * - Inspector dashboard & Extended Inspection module
 * - Admin panel to list generated reports
 * - PWA install prompt hooks
 * - Voice inspection (Web Speech API)
 * - PDF generation + QR code + Supabase storage upload
 *
 * Drop this file into src/views and import it in your app router or App.js.
 */

// Local storage key
const LOCAL_STORAGE_KEY = "elsip-inspection-v9-js";

// Minimal multilingual checklist
const INITIAL_CHECKLIST = [
  {
    id: 1,
    category: "Safety Gear",
    item: "All workers wearing hard hats",
    item_am: "ሁሉም ሠራተኞች የጭንቅላት ቁር ለብሰዋል",
    item_om: "Hojjettoonni hundi samii mataa uffatan",
    status: null
  },
  {
    id: 2,
    category: "Safety Gear",
    item: "High-visibility vests present",
    item_am: "ከፍተኛ ታይነት ቬስቶች አሉ",
    item_om: "Vestoota mul’atu ol’aanaa jiru",
    status: null
  },
  {
    id: 3,
    category: "Machinery",
    item: "Emergency stop buttons functional",
    item_am: "የአደጋ ማቆሚያ አዝራሮች ይሰራሉ",
    item_om: "Qabduu dhaammata dararaa hojjetu",
    status: null
  },
  {
    id: 4,
    category: "Environment",
    item: "Ventilation adequate",
    item_am: "የአየር ማስገቢያ በቂ ነው",
    item_om: "Haawa buufatu gahaa dha",
    status: null
  },
  {
    id: 5,
    category: "Fire Safety",
    item: "Fire extinguishers accessible",
    item_am: "የእሳት ማጥፊያዎች ተደራሽ ናቸው",
    item_om: "Qottoo ibidda ukkaamsuu argama",
    status: null
  },
  {
    id: 6,
    category: "Housekeeping",
    item: "Walkways clear",
    item_am: "መንገዶች ንፁህ ናቸው",
    item_om: "Karraan qulqulluu dha",
    status: null
  }
];

function usePWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    function handler(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
    return choice.outcome === "accepted";
  };

  return { canInstall, promptInstall };
}

export default function ExtendedInspectionView() {
  // app routing between 'login', 'inspector', 'admin'
  const [route, setRoute] = useState("login");

  // auth / user
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [lang, setLang] = useState("en");
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [photos, setPhotos] = useState([]);
  const [siteName, setSiteName] = useState("Bule Hora Industrial Zone");
  const [signers, setSigners] = useState([
    { id: 1, name: "Inspector Galgalo Dida", role: "Lead Inspector", ref: React.createRef() }
  ]);
  const [reportUrl, setReportUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [listReports, setListReports] = useState([]);
  const [installState, setInstallState] = useState(false);

  // hook for PWA
  const { canInstall, promptInstall } = usePWAInstallPrompt();

  // speech recognition (voice inspection)
  const recognitionRef = useRef(null);
  useEffect(() => {
    // init speech recognition if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = lang === "am" ? "am-ET" : lang === "om" ? "om-ET" : "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = handleSpeechResult;
      rec.onerror = (e) => console.warn("Speech error", e);
      recognitionRef.current = rec;
    }
  }, [lang]);

  function handleSpeechResult(ev) {
    const spoken = ev.results[0][0].transcript.trim().toLowerCase();
    // accept words: pass / fail / pending (in english) and common Amharic words
    // basic mapping:
    const passKeywords = ["pass", "passed", "yes", "አዎን", "ገና", "ገለ"];
    const failKeywords = ["fail", "failed", "no", "አይ", "አልተሳካም"];
    const pendingKeywords = ["pending", "later", "ገባር"];

    if (passKeywords.some(k => spoken.includes(k))) {
      setLastVoiceCmd("pass");
    } else if (failKeywords.some(k => spoken.includes(k))) {
      setLastVoiceCmd("fail");
    } else if (pendingKeywords.some(k => spoken.includes(k))) {
      setLastVoiceCmd("pending");
    } else {
      setLastVoiceCmd(spoken);
    }
  }

  const [lastVoiceCmd, setLastVoiceCmd] = useState(null);
  useEffect(() => {
    if (!voiceMode || !lastVoiceCmd) return;
    // apply last voice cmd to the next pending item
    const pendingIndex = checklist.findIndex(i => !i.status);
    if (pendingIndex >= 0) {
      if (lastVoiceCmd === "pass") toggleStatus(checklist[pendingIndex].id, "pass");
      else if (lastVoiceCmd === "fail") toggleStatus(checklist[pendingIndex].id, "fail");
      else if (lastVoiceCmd === "pending") toggleStatus(checklist[pendingIndex].id, null);
    }
    setLastVoiceCmd(null);
  }, [lastVoiceCmd, voiceMode]);

  // Auth: subscribe to supabase auth changes
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data?.session?.user ?? null);
      setAuthLoading(false);
      if (data?.session?.user) setRoute("inspector");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setRoute("inspector");
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Load draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChecklist(parsed.checklist || INITIAL_CHECKLIST);
        setPhotos(parsed.photos || []);
        setSiteName(parsed.siteName || siteName);
        setLang(parsed.lang || lang);
      } catch (e) {
        console.warn("Failed to parse draft", e);
      }
    }
  }, []);

  // Save draft
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ checklist, photos, siteName, lang }));
  }, [checklist, photos, siteName, lang]);

  // Admin reports list loader
  async function loadReports() {
    try {
      // List files from Supabase storage bucket 'inspection-reports'
      const { data, error } = await supabase.storage.from("inspection-reports").list("", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "desc" }
      });
      if (error) throw error;
      // for each file, get public url
      const items = await Promise.all(
        (data || []).map(async (f) => {
          const { data: urlData } = supabase.storage.from("inspection-reports").getPublicUrl(f.name);
          return { name: f.name, updated_at: f.updated_at, publicUrl: urlData?.publicUrl ?? null };
        })
      );
      setListReports(items);
    } catch (err) {
      console.error("Load reports error", err);
      setError(err.message || "Failed to load reports");
    }
  }

  // small helpers
  const t = (en, am, om) => (lang === "am" ? am : lang === "om" ? om : en);
  const itemT = (item) => (lang === "am" ? item.item_am : lang === "om" ? item.item_om : item.item);

  function toggleStatus(id, status) {
    setChecklist((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  function handlePhotoUpload(e) {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPhotos((p) => [...p, reader.result]);
      reader.readAsDataURL(file);
    });
  }

  function addSigner() {
    const name = prompt(t("Enter signer name", "የፈራሚ ስም ያስገቡ", "Maqaa mallattoofaa galchaa"));
    if (name) setSigners((p) => [...p, { id: Date.now(), name, role: "Co-Signer", ref: React.createRef() }]);
  }

  // helper to check if signature canvas has content
  function sigHasData(sigRef) {
    try {
      return sigRef && sigRef.current && !sigRef.current.isEmpty();
    } catch (e) {
      return false;
    }
  }

  // Generate PDF, upload to Supabase, add QR code
  async function generatePDF() {
    if (!user) {
      setError(t("Please log in to generate reports", "እባክዎ ሪፖርት ለማመን ግባ", "Galchaa hojjechuuf seeni"));
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Force signatures into DOM so html2canvas can capture them
      const sigContainer = document.createElement("div");
      sigContainer.style.position = "absolute";
      sigContainer.style.left = "-9999px";
      sigContainer.style.top = "-9999px";
      document.body.appendChild(sigContainer);

      signers.forEach((s) => {
        if (sigHasData(s)) {
          const img = document.createElement("img");
          img.src = s.ref.current.toDataURL();
          img.style.maxWidth = "600px";
          sigContainer.appendChild(img);
        }
      });

      // Build hidden template content (we assume an element #pdf-template exists in DOM)
      const template = buildHiddenPDFTemplate();
      // attach it temporarily so html2canvas can render
      const tempWrapper = document.createElement("div");
      tempWrapper.style.position = "absolute";
      tempWrapper.style.left = "-9999px";
      tempWrapper.style.top = "-9999px";
      tempWrapper.innerHTML = template;
      document.body.appendChild(tempWrapper);

      // render
      const canvas = await html2canvas(tempWrapper, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: true
      });

      // create pdf
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgData = canvas.toDataURL("image/png");
      const imgProps = { width: canvas.width, height: canvas.height };
      // figure height for full page width
      const pdfImgHeight = (canvas.height * pageWidth) / canvas.width;

      // page 1
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfImgHeight);
      let heightLeft = pdfImgHeight - pageHeight;

      // extra pages
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -heightLeft, pageWidth, pdfImgHeight);
        heightLeft -= pageHeight;
      }

      // watermark
      pdf.setFontSize(60);
      pdf.setTextColor(150);
      pdf.text(t("OFFICIAL", "ኦፊሴላዊ", "OFFICIAL"), pageWidth / 2, pageHeight / 2, {
        align: "center",
        angle: 45
      });
      pdf.setTextColor(0);

      // upload PDF to Supabase
      const blob = pdf.output("blob");
      const filename = `reports/inspection_${user.id}_${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage.from("inspection-reports").upload(filename, blob, {
        contentType: "application/pdf",
        upsert: true
      });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("inspection-reports").getPublicUrl(filename);
      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) throw new Error("Missing public URL after upload");

      // add QR code to pdf on every page (re-open with jsPDF and insert)
      const qrCanvas = document.createElement("canvas");
      // generate small QR into canvas
      // use qrcode.react by rendering to canvas - simplest: use library-free QR generator via canvas
      // but we already have qrcode.react — we can draw QR component to DOM and read it
      const qrWrapper = document.createElement("div");
      qrWrapper.style.position = "absolute";
      qrWrapper.style.left = "-9999px";
      qrWrapper.style.top = "-9999px";
      qrWrapper.innerHTML = `<div id="__qr_temp"></div>`;
      document.body.appendChild(qrWrapper);

      // render QR into wrapper using QRCode from qrcode.react by mounting a temporary element
      // Since we are serverless here, simpler: use third-party small generator - but to keep dependencies minimal,
      // draw using the canvas from qrcode.react by creating element
      // For simplicity, we use the canvas API via QRCode library (qrcode.react uses qrcode.js under the hood),
      // so create canvas and draw using qrcode library (if present) — fallback: skip embedding QR in PDF pages.

      try {
        // best-effort: create QR using qrcode.react's toDataURL via rendering an SVG then converting
        // fallback: use qrDataURL via a small helper below
        const qrDataURL = await generateQRDataURL(publicUrl, 256);
        // add to each page bottom-right
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.addImage(qrDataURL, "PNG", pageWidth - 50, pageHeight - 50, 40, 40);
        }
      } catch (qrErr) {
        console.warn("QR embed failed", qrErr);
      }

      // save for user
      pdf.save(`MoLS_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      setReportUrl(publicUrl);
      // cleanup
      tempWrapper.remove();
      sigContainer.remove();
      qrWrapper.remove();
      // update admin list live
      loadReports();

      // success toast
      try {
        toast(t("Report uploaded", "ሪፖርት ተስተናገደ", "Galchaan olkaa'ame"));
      } catch (e) {}
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate PDF");
    } finally {
      setUploading(false);
    }
  }

  // small QR generator (returns dataURL)
  async function generateQRDataURL(text, size = 256) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      // try using qrcode.react library's internal generator by drawing via QRCode component is complex.
      // Instead use lightweight qrcode-generator library approach if available, otherwise try using DOM-based QR creation.
      try {
        // Use external QRCode lib if present (qrcode.react uses qrcodejs)
        if (window.QRCode) {
          new window.QRCode(canvas, { text, width: size, height: size, colorDark: "#000000", colorLight: "#ffffff" });
          setTimeout(() => resolve(canvas.toDataURL()), 200);
        } else {
          // fallback: draw a simple placeholder
          const ctx = canvas.getContext("2d");
          canvas.width = size;
          canvas.height = size;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, size, size);
          ctx.fillStyle = "#000";
          ctx.font = "12px Arial";
          ctx.fillText("QR", size / 2 - 8, size / 2);
          resolve(canvas.toDataURL());
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  // small toast
  function toast(msg) {
    const el = document.createElement("div");
    el.textContent = msg;
    Object.assign(el.style, {
      position: "fixed",
      bottom: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#111827",
      color: "#fff",
      padding: "12px 20px",
      borderRadius: "12px",
      zIndex: 9999,
      boxShadow: "0 6px 24px rgba(0,0,0,0.25)"
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  // admin: download a report or copy url
  async function downloadReport(publicUrl, fileName) {
    if (!publicUrl) return;
    // open in new tab
    window.open(publicUrl, "_blank");
  }

  // admin: delete report (requires supabase permissions)
  async function deleteReport(name) {
    if (!confirm("Delete " + name + " ?")) return;
    const { error } = await supabase.storage.from("inspection-reports").remove([name]);
    if (error) {
      setError(error.message);
    } else {
      toast("Deleted " + name);
      loadReports();
    }
  }

  // quick login flow (email + magic link)
  async function signInWithEmail(email) {
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setAuthLoading(false);
    if (error) setError(error.message);
    else toast(t("Check your email for sign-in link", "እባክዎ ኢሜልዎን ይክፈቱ", "E-mail kee ilaali"));
  }

  // sign out
  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setRoute("login");
  }

  // load reports when admin route is active
  useEffect(() => {
    if (route === "admin") loadReports();
  }, [route]);

  // small UI components
  function LoginView() {
    const emailRef = useRef();
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 p-8">
        <div className="max-w-3xl w-full bg-white rounded-2xl p-10 shadow-2xl">
          {/* MoLS logo area */}
          <div className="text-center mb-8">
            <img src="/public/favicon.ico" alt="MoLS" style={{ width: 96, height: 96, margin: "0 auto" }} />
            <h1 className="text-3xl font-bold mt-4">Ministry of Labor & Skills — ELSIP</h1>
            <p className="text-sm text-gray-600 mt-2">{t("Inspector sign-in", "የፈራሚ ግባ", "Seensa")}</p>
          </div>

          <div className="space-y-4">
            <input ref={emailRef} placeholder="you@domain.gov.et" className="w-full p-4 border rounded-lg" />
            <div className="flex gap-4">
              <button
                onClick={() => signInWithEmail(emailRef.current.value)}
                className="flex-1 bg-emerald-700 text-white px-6 py-4 rounded-lg font-bold"
              >
                Send Magic Link
              </button>
              <button onClick={() => { setLang("am"); toast("ተቀይሯል → አማርኛ"); }} className="px-6 py-4 border rounded-lg">
                አማርኛ
              </button>
            </div>

            <div className="text-sm text-gray-500">
              {t(
                "Use your MoLS government email. You will receive a magic link to sign in.",
                "የMoLS ኢሜልዎን ይጠቀሙ። በኢሜል ውስጥ ሊንክ ይቀበላሉ።"
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <button onClick={() => { setRoute("inspector"); }} className="text-sm text-emerald-700">Continue as demo (no auth)</button>
          </div>
        </div>
      </div>
    );
  }

  function InspectorView() {
    const firstSignerRef = signers[0]?.ref;

    return (
      <div className="p-6 max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src="/public/favicon.ico" alt="MoLS" style={{ width: 48, height: 48 }} />
            <div>
              <div className="font-bold text-xl">ELSIP — Inspection</div>
              <div className="text-sm text-gray-600">{siteName}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Languages size={20} />
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="p-2 border rounded">
              <option value="en">English</option>
              <option value="am">አማርኛ</option>
              <option value="om">Afaan Oromoo</option>
            </select>
            <button onClick={() => setRoute("admin")} className="px-3 py-2 border rounded">Admin</button>
            <button onClick={signOut} className="px-3 py-2 bg-red-50 rounded">Sign out</button>
          </div>
        </header>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <div className="text-gray-500">Passed</div>
            <div className="text-2xl font-bold"><CheckCircle2 /> {checklist.filter(i => i.status === "pass").length}</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-gray-500">Failed</div>
            <div className="text-2xl font-bold"><XCircle /> {checklist.filter(i => i.status === "fail").length}</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-gray-500">Pending</div>
            <div className="text-2xl font-bold"><AlertTriangle /> {checklist.filter(i => !i.status).length}</div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-4 mb-6">
          {checklist.map((it) => (
            <div key={it.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">{it.category}</div>
                <div className="text-lg font-bold">{itemT(it)}</div>
              </div>
              <div className="flex gap-2">
                <button className={`px-4 py-2 rounded ${it.status === "pass" ? "bg-emerald-700 text-white" : "border"}`} onClick={() => toggleStatus(it.id, "pass")}>PASS</button>
                <button className={`px-4 py-2 rounded ${it.status === "fail" ? "bg-red-600 text-white" : "border"}`} onClick={() => toggleStatus(it.id, "fail")}>FAIL</button>
                <button className="px-3 py-2 border rounded" onClick={() => toggleStatus(it.id, null)}>Clear</button>
              </div>
            </div>
          ))}
        </div>

        {/* Photo upload */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold">Photo Evidence</div>
            <label className="px-3 py-2 bg-emerald-600 text-white rounded cursor-pointer flex items-center gap-2">
              <Camera /> Add photos
              <input accept="image/*" capture="environment" multiple type="file" onChange={handlePhotoUpload} hidden />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((p, i) => (
              <img key={i} src={p} alt={`evidence ${i}`} className="w-full h-40 object-cover rounded" />
            ))}
          </div>
        </div>

        {/* Signatures */}
        <div className="space-y-4 mb-6">
          {signers.map((s, idx) => (
            <div key={s.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-3">
                <div><strong>{s.name}</strong> <div className="text-sm text-gray-500">{s.role}</div></div>
                <div>
                  <button onClick={() => s.ref.current?.clear()} className="px-3 py-2 border rounded">Clear</button>
                </div>
              </div>
              <SignatureCanvas ref={s.ref} penColor="#1e40af" canvasProps={{ width: 600, height: 150, className: "border rounded" }} />
            </div>
          ))}
          <div className="text-right"><button onClick={addSigner} className="px-4 py-2 bg-purple-700 text-white rounded flex items-center gap-2"><Plus /> Add signer</button></div>
        </div>

        {/* voice mode */}
        <div className="mb-6 flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={voiceMode} onChange={(e) => {
              setVoiceMode(e.target.checked);
              try {
                if (e.target.checked) recognitionRef.current?.start();
                else recognitionRef.current?.stop();
              } catch (e) {}
            }} />
            <span>Voice inspection mode</span>
          </label>
          <div className="text-sm text-gray-500">{t("Speak 'pass', 'fail' to mark next item", "የኔን ቃል ንግግር በመጠቀም ንግግሩን ይለውጡ")}</div>
        </div>

        {/* generate */}
        <div className="text-center">
          <button onClick={generatePDF} disabled={uploading} className="px-8 py-4 bg-gradient-to-r from-emerald-700 to-green-500 text-white rounded-lg text-xl flex items-center gap-4 mx-auto">
            {uploading ? <><Loader2 className="animate-spin" /> Generating...</> : <><FileCheck /> Generate Official Report</>}
          </button>

          {reportUrl && (
            <div className="mt-6 bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-600">Report public URL:</div>
              <div className="break-all text-emerald-700 font-mono">{reportUrl}</div>
              <div className="mt-3 flex gap-3">
                <button className="px-3 py-2 bg-emerald-700 text-white rounded" onClick={() => navigator.clipboard.writeText(reportUrl)}><Share2 /> Copy</button>
                <a className="px-3 py-2 border rounded" href={reportUrl} target="_blank" rel="noreferrer">Open</a>
              </div>
            </div>
          )}
        </div>

        {/* hidden pdf template container (used by generatePDF) */}
        <div id="pdf-template-root" style={{ display: "none" }} dangerouslySetInnerHTML={{ __html: buildHiddenPDFTemplate() }} />
      </div>
    );
  }

  // admin panel view
  function AdminView() {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Admin — Generated Reports</h2>
          <div>
            <button onClick={() => setRoute("inspector")} className="px-3 py-2 border rounded mr-2">Inspector</button>
            <button onClick={() => signOut()} className="px-3 py-2 bg-red-50 rounded">Sign out</button>
          </div>
        </header>

        <div className="mb-4">
          <button onClick={loadReports} className="px-3 py-2 bg-emerald-700 text-white rounded">Refresh list</button>
        </div>

        <div>
          {listReports.length === 0 ? <div className="text-gray-500">No reports yet.</div> : (
            <div className="space-y-3">
              {listReports.map((r) => (
                <div key={r.name} className="bg-white p-3 rounded shadow flex justify-between items-center">
                  <div>
                    <div className="font-mono text-sm">{r.name}</div>
                    <div className="text-sm text-gray-500">{r.updated_at}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.publicUrl && <a href={r.publicUrl} target="_blank" rel="noreferrer" className="px-3 py-2 border rounded">Open</a>}
                    <button onClick={() => navigator.clipboard.writeText(r.publicUrl || "")} className="px-3 py-2 border rounded">Copy URL</button>
                    <button onClick={() => deleteReport(r.name)} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // small build of HTML template used to render PDF (string)
  function buildHiddenPDFTemplate() {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB");
    const itemsHtml = checklist.map((i) => {
      return `<tr style="border-bottom:1px solid #eee;">
        <td style="padding:8px;vertical-align:top;"><strong>[${i.category}]</strong><div>${lang === "am" ? i.item_am : lang === "om" ? i.item_om : i.item}</div></td>
        <td style="padding:8px;vertical-align:top;text-align:center;font-weight:bold;">${i.status ? i.status.toUpperCase() : "PENDING"}</td>
      </tr>`;
    }).join("");

    const photosHtml = photos.map((p) => `<img src="${p}" style="max-width:240px;margin:8px;border:1px solid #ddd;" />`).join("");

    const signaturesHtml = signers.map((s) => {
      let sigImg = "";
      try {
        if (sigHasData(s)) sigImg = `<img src="${s.ref.current.toDataURL()}" style="max-width:220px;border-bottom:2px solid #0f5132;" />`;
      } catch (e) {}
      return `<div style="width:45%;display:inline-block;vertical-align:top;margin:8px;"><div style="font-weight:bold;">${s.name}</div><div>${s.role}</div>${sigImg}</div>`;
    }).join("");

    // include official header and QR placeholder
    return `
      <div style="font-family: 'Noto Sans Ethiopic', 'Inter', sans-serif; padding:16mm; background:white; width:210mm; box-sizing:border-box;">
        <div style="text-align:center; margin-bottom:12px;">
          <div style="font-size:20px; font-weight:800;">${t("FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA","የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ","")}</div>
          <div style="font-size:16px; font-weight:700; margin-top:8px;">${t("Ministry of Labor & Skills","የሥራና ክህሎት ሚኒስትር","")}</div>
          <h2 style="margin-top:12px;">${t("Occupational Safety Inspection Report","የሥራ ቦታ ደህንነት ሪፖርት","")}</h2>
        </div>

        <div style="margin-bottom:12px;">
          <strong>Site:</strong> ${siteName} &nbsp; <strong>Date:</strong> ${dateStr}
        </div>

        <table style="width:100%; border-collapse:collapse; margin-bottom:12px;">
          <thead style="background:#f1fdf6;">
            <tr><th style="text-align:left; padding:8px;">Item</th><th style="width:160px; text-align:center; padding:8px;">Status</th></tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        ${photos.length ? `<div style="margin-bottom:12px;"><strong>Photo evidence</strong><div>${photosHtml}</div></div>` : ""}

        <div style="margin-top:20px;">
          <strong>Signatures</strong>
          <div style="display:flex; gap:12px; margin-top:8px;">${signaturesHtml}</div>
        </div>

        <div style="margin-top:32px; text-align:center; font-size:12px; color:#666;">Official report generated by ELSIP platform</div>
      </div>
    `;
  }

  // copy-paste QR poster generator utility (returns HTML string)
  function generateQRPosterHtml(regionName, reportUrl) {
    const qrData = reportUrl || "";
    return `
      <div style="font-family: 'Noto Sans Ethiopic', Inter, sans-serif; width:420mm; padding:24mm; background:white;">
        <h1 style="text-align:center; color:#0f5132;">Ministry of Labor & Skills — ${regionName}</h1>
        <div style="display:flex; align-items:center; justify-content:center; gap:20px; margin-top:24px;">
          <div style="width:300px; height:300px; border:8px solid #0f5132; display:flex; align-items:center; justify-content:center;">
            <img src="${reportUrl}" style="max-width:100%; max-height:100%;" />
          </div>
        </div>
        <div style="text-align:center; margin-top:18px;">Scan to verify reports</div>
      </div>
    `;
  }

  // basic app shell route dispatcher
  if (route === "login") return <LoginView />;
  if (route === "admin") return <AdminView />;
  return <InspectorView />;
}
