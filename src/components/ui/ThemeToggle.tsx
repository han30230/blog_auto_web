"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme.v1";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = stored === "dark" || stored === "light" ? stored : "light";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  return (
    <Button
      variant="outline"
      className="rounded-full px-3 py-1 text-xs"
      onClick={() => {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
      }}
    >
      {theme === "dark" ? "다크" : "라이트"}
    </Button>
  );
}

