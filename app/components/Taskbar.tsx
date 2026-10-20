"use client";

import { useEffect, useState, useCallback } from "react";
import type { ActiveSection } from "./types";

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

type TaskbarProps = {
  recentSections: ActiveSection[];
  onRestore: (section: ActiveSection) => void;
};

export function Taskbar({ recentSections, onRestore }: TaskbarProps) {
  const [time, setTime] = useState("--:--");
  const [dateTime, setDateTime] = useState<string>();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(formatTime(now));
      setDateTime(now.toISOString());
    };
    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // keep button state in sync when user presses Escape or F11
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // browser blocked the request (e.g. no user gesture) — ignore silently
    }
  }, []);

  return (
    <footer className="taskbar" aria-label="Desktop taskbar">
      {recentSections.length > 0 && (
        <div className="taskbar-recents">
          {recentSections.map((section) => (
            <button className="taskbar-recent" data-section={section} type="button" key={section} onClick={() => onRestore(section)}>
              <span className="taskbar-recent-icon" aria-hidden="true">{section === "terminal" ? ">_" : section === "flappy" ? "★" : section === "music" ? "♫" : section === "contact" ? "✉" : "◉"}</span>
              <span>{section === "projects" ? "Project Explorer" : section === "achievements" ? "Achievements" : section === "terminal" ? "Terminal" : section === "flappy" ? "Flappy Bird" : section === "music" ? "Music Player" : section === "contact" ? "Contact Me" : "About"}</span>
            </button>
          ))}
        </div>
      )}
      <div className="taskbar-tray">
        <span className="taskbar-status" aria-hidden="true">◖</span>
        <span className="taskbar-status" aria-hidden="true">⌁</span>
        <button
          className="taskbar-settings"
          type="button"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? "▣" : "▢"}
        </button>
        <button className="taskbar-settings" type="button" aria-label="Settings" title="Settings">⚙</button>
        <time dateTime={dateTime}>{time}</time>
      </div>
    </footer>
  );
}
