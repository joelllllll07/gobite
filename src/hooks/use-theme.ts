import { useEffect, useState } from "react";

const KEY = "gobite:theme";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (window.localStorage.getItem(KEY) as "light" | "dark" | null) ?? "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.localStorage.setItem(KEY, next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return { theme, toggle };
}
