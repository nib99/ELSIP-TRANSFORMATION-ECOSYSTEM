// src/i18n/useTranslation.js
import { useState, useEffect } from "react";
import { translations } from "./translations";

export default function useTranslation() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const browserLang = navigator.language;
    if (browserLang.includes("am")) setLang("am");
    else if (browserLang.includes("om") || browserLang.includes("om-")) setLang("om");
  }, []);

  const t = (key) => {
    return translations[lang][key] || translations.en[key] || key;
  };

  return { t, lang, setLang };
}
