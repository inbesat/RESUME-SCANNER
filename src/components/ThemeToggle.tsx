"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  window.addEventListener("themechange", callback);
  return () => {
    observer.disconnect();
    window.removeEventListener("themechange", callback);
  };
}

function getSnapshot() {
  return document.documentElement.classList.contains("light");
}

function getServerSnapshot() {
  return false;
}

export default function ThemeToggle() {
  const light = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const nextLight = !document.documentElement.classList.contains("light");
    document.documentElement.classList.toggle("light", nextLight);
    try {
      localStorage.setItem("theme", nextLight ? "light" : "dark");
    } catch {
      // ignore storage errors (private mode)
    }
    window.dispatchEvent(new Event("themechange"));
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      className="rounded-full text-muted-foreground hover:text-foreground"
    >
      {light ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}