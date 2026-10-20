"use client";

import { useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import gsap from "gsap";
import { AboutView } from "./components/AboutView";
import { AchievementBrowser } from "./components/AchievementBrowser";
import { DesktopIcons } from "./components/DesktopIcons";
import { ProjectBrowser } from "./components/ProjectBrowser";
import { Taskbar } from "./components/Taskbar";
import { TerminalBrowser } from "./components/TerminalBrowser";
import { FlappyBirdBrowser } from "./components/FlappyBirdBrowser";
import { MusicBrowser } from "./components/MusicBrowser";
import { ContactBrowser } from "./components/ContactBrowser";
import { VirusOverlay } from "./components/VirusOverlay";
import { WindowControls } from "./components/WindowControls";
import type { ActiveSection, Project } from "./components/types";

const projects: Project[] = [
  { id: "M-01", title: "Gamified Learning Platform", tech: ["React.js", "Node.js", "MongoDB", "Supabase", "Tailwind CSS"], image: "/assets/background.png", desc: "" },
  { id: "M-02", title: "QuizVerse", tech: ["Next.js", "Tailwind CSS", "Firebase", "Zustand", "TypeScript"], image: "/assets/Project/Project(before).png", desc: "" },
  { id: "M-03", title: "VTU Vault", tech: ["Next.js", "TypeScript"], image: "/assets/Project/Project(after).png", desc: "" }
];

export default function Home() {
  const windowRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const eyeOverlayRef = useRef<SVGSVGElement>(null);
  const isRestoringRef = useRef(false);
  const windowDragRef = useRef<{ pointerId: number; startClientX: number; startClientY: number; startX: number; startY: number; startLeft: number; startTop: number } | null>(null);
  const [isCharacterHovered, setIsCharacterHovered] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>("about");
  const [activeProject, setActiveProject] = useState(0);
  const [activeAchievement, setActiveAchievement] = useState(0);
  const [isVirusOpen, setIsVirusOpen] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [recentSections, setRecentSections] = useState<ActiveSection[]>([]);

  useLayoutEffect(() => {
    if (!isWindowOpen || !windowRef.current) return;
    if (isRestoringRef.current) return;
    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro.fromTo(windowRef.current, { autoAlpha: 0, scale: 0.85, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.8 });
      if (activeSection === "about" && characterRef.current && headingRef.current && descriptionRef.current) {
        intro.fromTo(characterRef.current, { autoAlpha: 0, x: -18 }, { autoAlpha: 1, x: 0, duration: 0.45 }, "-=0.3")
          .fromTo([headingRef.current, descriptionRef.current], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 }, "-=0.2")
          .fromTo(".marquee-logo", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.07 }, "-=0.15");
        gsap.to(characterRef.current, { y: -1, scale: 1.01, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true });
      }
    }, windowRef);
    return () => context.revert();
  }, [activeSection, isWindowOpen]);

  useLayoutEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const svg = eyeOverlayRef.current;
      if (!svg || !isWindowOpen || activeSection !== "about" || !isCharacterHovered) return;
      const bounds = svg.getBoundingClientRect();
      const pointX = 175 + ((event.clientX - bounds.left) / bounds.width) * 228;
      const pointY = 109 + ((event.clientY - bounds.top) / bounds.height) * 228;
      svg.querySelectorAll<SVGGElement>(".d2c-eye-group").forEach((eye) => {
        const cx = Number(eye.dataset.cx);
        const cy = Number(eye.dataset.cy);
        const radius = Number(eye.dataset.r);
        const pupilRadius = Number(eye.dataset.pr);
        const boundary = Number(eye.dataset.boundary ?? 125);
        const pupil = eye.querySelector<SVGCircleElement>(".d2c-pupil");
        if (!pupil) return;
        if (pointX < cx - boundary || pointX > cx + boundary || pointY < cy - boundary || pointY > cy + boundary) {
          pupil.setAttribute("cx", String(cx));
          pupil.setAttribute("cy", String(cy));
          return;
        }
        const distance = Math.min(Math.hypot(pointX - cx, pointY - cy), radius - pupilRadius - 2);
        const angle = Math.atan2(pointY - cy, pointX - cx);
        pupil.setAttribute("cx", String(cx + Math.cos(angle) * distance));
        pupil.setAttribute("cy", String(cy + Math.sin(angle) * distance));
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [activeSection, isCharacterHovered, isWindowOpen]);

  useLayoutEffect(() => {
    const moveCursor = (event: MouseEvent) => {
      if (cursorRef.current) gsap.to(cursorRef.current, { x: event.clientX, y: event.clientY, duration: 0.08, overwrite: true });
    };
    const pressCursor = () => cursorRef.current?.classList.add("custom-cursor--pressed");
    const releaseCursor = () => cursorRef.current?.classList.remove("custom-cursor--pressed");
    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", pressCursor);
    window.addEventListener("mouseup", releaseCursor);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", pressCursor);
      window.removeEventListener("mouseup", releaseCursor);
    };
  }, []);

  const openWindow = (section: ActiveSection) => {
    setActiveSection(section);
    setIsWindowOpen(true);
    setRecentSections((sections) => sections.filter((recent) => recent !== section));
  };

  const minimizeWindow = () => {
    setRecentSections((sections) => [...sections.filter((recent) => recent !== activeSection), activeSection]);
    requestAnimationFrame(() => {
      const windowElement = windowRef.current;
      const taskbarEntry = document.querySelector<HTMLElement>(`.taskbar-recent[data-section="${activeSection}"]`);
      if (!windowElement || !taskbarEntry) {
        setIsWindowOpen(false);
        return;
      }

      const windowBounds = windowElement.getBoundingClientRect();
      const taskbarBounds = taskbarEntry.getBoundingClientRect();
      gsap.to(windowElement, {
        x: taskbarBounds.left + taskbarBounds.width / 2 - (windowBounds.left + windowBounds.width / 2),
        y: taskbarBounds.top + taskbarBounds.height / 2 - (windowBounds.top + windowBounds.height / 2),
        scale: 0.08,
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => setIsWindowOpen(false)
      });
    });
  };

  const closeWindow = () => {
    requestAnimationFrame(() => {
      const windowElement = windowRef.current;
      if (!windowElement) {
        setIsWindowOpen(false);
        return;
      }

      gsap.to(windowElement, {
        scale: 0.08,
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => setIsWindowOpen(false)
      });
    });
  };

  const restoreWindow = (section: ActiveSection) => {
    isRestoringRef.current = true;
    setActiveSection(section);
    setIsWindowOpen(true);
    requestAnimationFrame(() => {
      const windowElement = windowRef.current;
      const taskbarEntry = document.querySelector<HTMLElement>(`.taskbar-recent[data-section="${section}"]`);
      if (!windowElement || !taskbarEntry) {
        isRestoringRef.current = false;
        setRecentSections((sections) => sections.filter((recent) => recent !== section));
        return;
      }

      const windowBounds = windowElement.getBoundingClientRect();
      const taskbarBounds = taskbarEntry.getBoundingClientRect();
      const targetX = taskbarBounds.left + taskbarBounds.width / 2 - (windowBounds.left + windowBounds.width / 2);
      const targetY = taskbarBounds.top + taskbarBounds.height / 2 - (windowBounds.top + windowBounds.height / 2);

      gsap.set(windowElement, {
        x: targetX,
        y: targetY,
        scale: 0.08,
        autoAlpha: 0
      });
      gsap.to(windowElement, {
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          isRestoringRef.current = false;
          setRecentSections((sections) => sections.filter((recent) => recent !== section));
        }
      });
    });
  };

  const handleWindowPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!windowRef.current || (event.target as HTMLElement).closest(".controls")) return;
    const desktop = event.currentTarget.closest<HTMLElement>(".desktop");
    if (!desktop) return;
    const windowElement = windowRef.current;
    const windowBounds = windowElement.getBoundingClientRect();
    const desktopBounds = desktop.getBoundingClientRect();
    windowDragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: Number(gsap.getProperty(windowElement, "x")),
      startY: Number(gsap.getProperty(windowElement, "y")),
      startLeft: windowBounds.left - desktopBounds.left,
      startTop: windowBounds.top - desktopBounds.top
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleWindowPointerMove = (event: PointerEvent<HTMLElement>) => {
    const drag = windowDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !windowRef.current) return;
    const desktop = event.currentTarget.closest<HTMLElement>(".desktop");
    if (!desktop) return;
    const desktopBounds = desktop.getBoundingClientRect();
    const windowElement = windowRef.current;
    const windowBounds = windowElement.getBoundingClientRect();
    const nextLeft = Math.max(0, Math.min(
      drag.startLeft + event.clientX - drag.startClientX,
      desktopBounds.width - windowBounds.width
    ));
    const nextTop = Math.max(0, Math.min(
      drag.startTop + event.clientY - drag.startClientY,
      desktopBounds.height - windowBounds.height
    ));
    gsap.set(windowElement, {
      x: drag.startX + nextLeft - drag.startLeft,
      y: drag.startY + nextTop - drag.startTop
    });
  };

  const stopWindowDragging = (event: PointerEvent<HTMLElement>) => {
    if (windowDragRef.current?.pointerId === event.pointerId) {
      windowDragRef.current = null;
    }
  };

  return (
    <main className={`desktop ${isVirusOpen ? "virus-active" : ""}`}>
      <DesktopIcons onOpen={openWindow} />
      {isVirusOpen && <VirusOverlay errorCount={errorCount} onAction={() => setErrorCount((count) => count + 1)} />}
      {isWindowOpen && (
        <section ref={windowRef} className={`portfolio-window ${activeSection === "about" ? "about-window" : activeSection === "terminal" ? "terminal-window" : activeSection === "flappy" ? "flappy-window" : activeSection === "music" ? "music-window" : activeSection === "contact" ? "contact-window" : "projects-window"}`}>
          <header
            className="title-bar project-title-bar"
            onPointerDown={handleWindowPointerDown}
            onPointerMove={handleWindowPointerMove}
            onPointerUp={stopWindowDragging}
            onPointerCancel={stopWindowDragging}
          >
            <div className="title-bar-spacer">
              <h1 className="project-window-title">
                {activeSection === "projects" ? "Project Explorer" : activeSection === "achievements" ? "Achievements" : activeSection === "terminal" ? "Terminal" : activeSection === "flappy" ? "Flappy Bird" : activeSection === "music" ? "Royalty Free Music Player" : activeSection === "contact" ? "Contact Me" : "About"}
              </h1>
            </div>
            <WindowControls onMinimize={minimizeWindow} onClose={closeWindow} />
          </header>
          <div className={`window-body ${activeSection !== "about" && activeSection !== "terminal" && activeSection !== "flappy" && activeSection !== "music" && activeSection !== "contact" ? "projects-window-body" : ""}`}>
            {activeSection === "projects" ? (
              <ProjectBrowser projects={projects} activeProject={activeProject} onSelect={setActiveProject} />
            ) : activeSection === "achievements" ? (
              <AchievementBrowser activeAchievement={activeAchievement} onSelect={setActiveAchievement} />
            ) : activeSection === "terminal" ? (
              <TerminalBrowser onNavigate={openWindow} />
            ) : activeSection === "flappy" ? (
              <FlappyBirdBrowser onClose={closeWindow} />
            ) : activeSection === "music" ? (
              <MusicBrowser onClose={closeWindow} />
            ) : activeSection === "contact" ? (
              <ContactBrowser onClose={closeWindow} />
            ) : (
              <AboutView
                characterRef={characterRef}
                headingRef={headingRef}
                descriptionRef={descriptionRef}
                eyeOverlayRef={eyeOverlayRef}
                isCharacterHovered={isCharacterHovered}
                onCharacterEnter={() => setIsCharacterHovered(true)}
                onCharacterLeave={() => setIsCharacterHovered(false)}
              />
            )}
          </div>
        </section>
      )}
      <Taskbar recentSections={recentSections} onRestore={restoreWindow} />
      {/* Custom pixel-art arrow cursor */}
      <svg
        ref={cursorRef}
        className="custom-cursor"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="36"
        height="36"
        aria-hidden="true"
      >
        {/* black outline — slightly larger shape behind */}
        <polygon
          points="2,2 2,20 7,15 10,22 13,21 10,14 16,14"
          fill="#000"
        />
        {/* white fill on top */}
        <polygon
          points="3,3 3,18 7.5,13.5 10.5,20.5 12,20 9,13 15,13"
          fill="#fff"
        />
      </svg>
    </main>
  );
}
