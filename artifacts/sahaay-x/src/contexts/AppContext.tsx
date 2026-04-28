import React, { createContext, useContext, useState, useEffect } from "react";
import { T, type Lang } from "@/lib/translations";

interface AppContextType {
  theme: "dark" | "light";
  toggleTheme: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof T["en"];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("sahaax_theme") as "dark" | "light") || "dark";
  });
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("sahaax_lang") as Lang) || "en";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem("sahaax_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("sahaax_lang", l);
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, setLang, t: T[lang] }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
