"use client";

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import gsap from "gsap";
import { AboutView } from "./components/AboutView";
import { AchievementBrowser } from "./components/AchievementBrowser";
import { DesktopIcons } from "./components/DesktopIcons";
import { ProjectBrowser } from "./components/ProjectBrowser";
import { Taskbar } from "./components/Taskbar";
import { RoboDecoration } from "./components/RoboDecoration";
import { TerminalBrowser } from "./components/TerminalBrowser";
import { FlappyBirdBrowser } from "./components/FlappyBirdBrowser";
import { MusicBrowser } from "./components/MusicBrowser";
import { ContactBrowser } from "./components/ContactBrowser";
import { RatingBrowser } from "./components/RatingBrowser";
import { VirusOverlay } from "./components/VirusOverlay";
import { WindowControls } from "./components/WindowControls";
import { Chatbot } from "./components/Chatbot";
import type { ActiveSection, Project } from "./components/types";

const projects: Project[] = [
  {
    id: "M-01",
    title: "Gamified Learning Platform",
    tech: ["React.js", "Node.js", "MongoDB", "Supabase", "Tailwind CSS"],
    image: "/assets/background.png",
    desc: "",
  },
  {
    id: "M-02",
    title: "QuizVerse",
    tech: ["Next.js", "Tailwind CSS", "Firebase", "Zustand", "TypeScript"],
    image: "/assets/Project/Project(before).png",
    desc: "",
  },
  {
    id: "M-03",
    title: "VTU Vault",
    tech: ["Next.js", "TypeScript"],
    image: "/assets/Project/Project(after).png",
    desc: "",
  },
];
const preloadAssets = [
  "/assets/background.png",
  "/assets/background2.png",
  "/assets/background3.png",
  "/assets/background4.png",
  "/assets/black blue border.png",
  "/assets/sleep.png",
  "/assets/wake.png",
  "/assets/Project/Project(before).png",
  "/assets/Project/Project(after).png",
  "/assets/achievements/ach1.png",
  "/assets/achievements/ach2.png",
  "/assets/terminal/terminal 1.png",
  "/assets/terminal/terminal 2.png",
  "/assets/flappy bird/bird1.png",
  "/assets/flappy bird/bird2.png",
  "/assets/Bird.gif",
  "/assets/music/music1.png",
  "/assets/music/music2.png",
  "/assets/contact/c1.png",
  "/assets/contact/c2.png",
  "/assets/sytem error.png",
  "/assets/ok button.png",
  "/assets/cancel button.png",
];

export default function Home() {
  const windowRefs = useRef(new Map<ActiveSection, HTMLElement>());
  const splashVideoRef = useRef<HTMLVideoElement>(null);
  const characterRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);
  const eyeOverlayRef = useRef<SVGSVGElement>(null);
  const isRestoringRef = useRef(false);
  const windowDragRef = useRef<{
    section: ActiveSection;
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    isRotated?: boolean;
  } | null>(null);
  const [isCharacterHovered, setIsCharacterHovered] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>("about");
  const [openSections, setOpenSections] = useState<ActiveSection[]>([]);
  const [activeProject, setActiveProject] = useState(0);
  const [activeAchievement, setActiveAchievement] = useState(0);
  const [isVirusOpen, setIsVirusOpen] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [recentSections, setRecentSections] = useState<ActiveSection[]>([]);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [hasSplashPermission, setHasSplashPermission] = useState(false);
  const [isSplashExiting, setIsSplashExiting] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    const images = preloadAssets.map((src) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
      return image;
    });
    return () => images.forEach((image) => image.onload = null);
  }, []);

  const finishSplash = () => {
    setIsSplashExiting(true);
    window.setTimeout(() => setIsSplashVisible(false), 700);
  };
  const enableSplashExperience = async () => {
    const video = splashVideoRef.current;
    if (!video) return;
    setHasSplashPermission(true);
    if (document.fullscreenElement !== document.documentElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen can be denied while audio can still be enabled.
      }
    }
    video.muted = false;
    await video.play();
  };

  useLayoutEffect(() => {
    const windowElement = windowRefs.current.get(activeSection);
    if (!isWindowOpen || !windowElement) return;
    if (isRestoringRef.current) return;
    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro.fromTo(
        windowElement,
        { autoAlpha: 0, scale: 0.85, y: 20 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.8 },
      );
      if (
        activeSection === "about" &&
        characterRef.current &&
        headingRef.current &&
        descriptionRef.current
      ) {
        intro
          .fromTo(
            characterRef.current,
            { autoAlpha: 0, x: -18 },
            { autoAlpha: 1, x: 0, duration: 0.45 },
            "-=0.3",
          )
          .fromTo(
            [headingRef.current, descriptionRef.current],
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 },
            "-=0.2",
          )
          .fromTo(
            ".marquee-logo",
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.07 },
            "-=0.15",
          );
        gsap.to(characterRef.current, {
          y: -1,
          scale: 1.01,
          duration: 2.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }
    }, windowElement);
    return () => context.revert();
  }, [isWindowOpen]);

  useLayoutEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const svg = eyeOverlayRef.current;
      if (
        !svg ||
        !isWindowOpen ||
        activeSection !== "about" ||
        !isCharacterHovered
      )
        return;
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
        if (
          pointX < cx - boundary ||
          pointX > cx + boundary ||
          pointY < cy - boundary ||
          pointY > cy + boundary
        ) {
          pupil.setAttribute("cx", String(cx));
          pupil.setAttribute("cy", String(cy));
          return;
        }
        const distance = Math.min(
          Math.hypot(pointX - cx, pointY - cy),
          radius - pupilRadius - 2,
        );
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
      if (cursorRef.current)
        gsap.to(cursorRef.current, {
          x: event.clientX,
          y: event.clientY,
          duration: 0.08,
          overwrite: true,
        });
    };
    const pressCursor = () =>
      cursorRef.current?.classList.add("custom-cursor--pressed");
    const releaseCursor = () =>
      cursorRef.current?.classList.remove("custom-cursor--pressed");
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
    setOpenSections((sections) => sections.includes(section) ? sections : [...sections, section]);
    setRecentSections((sections) => [
      ...sections.filter((recent) => recent !== section),
      section,
    ]);
    setIsWindowOpen(true);
  };

  const minimizeWindow = (section = activeSection) => {
    setRecentSections((sections) => [
      ...sections.filter((recent) => recent !== section),
      section,
    ]);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const windowElement = windowRefs.current.get(section);
      const taskbarEntry = document.querySelector<HTMLElement>(
        `.taskbar-recent[data-section="${section}"]`,
      );
      if (!windowElement || !taskbarEntry) {
        removeWindow(section);
        return;
      }

      const windowBounds = windowElement.getBoundingClientRect();
      const taskbarBounds = taskbarEntry.getBoundingClientRect();
      gsap.to(windowElement, {
        x:
          taskbarBounds.left +
          taskbarBounds.width / 2 -
          (windowBounds.left + windowBounds.width / 2),
        y:
          taskbarBounds.top +
          taskbarBounds.height / 2 -
          (windowBounds.top + windowBounds.height / 2),
        scale: 0.08,
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => removeWindow(section),
      });
    }));
  };

  const removeWindow = (section: ActiveSection) => {
    windowRefs.current.delete(section);
    setOpenSections((sections) => {
      const next = sections.filter((openSection) => openSection !== section);
      setIsWindowOpen(next.length > 0);
      if (section === activeSection && next.length > 0) {
        setActiveSection(next[next.length - 1]);
      }
      return next;
    });
  };

  const closeWindow = (section = activeSection) => {
    requestAnimationFrame(() => {
      const windowElement = windowRefs.current.get(section);
      if (!windowElement) {
        removeWindow(section);
        setRecentSections((sections) => sections.filter((recent) => recent !== section));
        return;
      }

      gsap.to(windowElement, {
        scale: 0.08,
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          removeWindow(section);
          setRecentSections((sections) =>
            sections.filter((recent) => recent !== section),
          );
        },
      });
    });
  };

  const restoreWindow = (section: ActiveSection) => {
    isRestoringRef.current = true;
    setActiveSection(section);
    setOpenSections((sections) => sections.includes(section) ? sections : [...sections, section]);
    setIsWindowOpen(true);
    requestAnimationFrame(() => {
      const windowElement = windowRefs.current.get(section);
      const taskbarEntry = document.querySelector<HTMLElement>(
        `.taskbar-recent[data-section="${section}"]`,
      );
      if (!windowElement || !taskbarEntry) {
        isRestoringRef.current = false;
        setRecentSections((sections) =>
          [...sections.filter((recent) => recent !== section), section],
        );
        return;
      }

      const windowBounds = windowElement.getBoundingClientRect();
      const taskbarBounds = taskbarEntry.getBoundingClientRect();
      const targetX =
        taskbarBounds.left +
        taskbarBounds.width / 2 -
        (windowBounds.left + windowBounds.width / 2);
      const targetY =
        taskbarBounds.top +
        taskbarBounds.height / 2 -
        (windowBounds.top + windowBounds.height / 2);

      gsap.set(windowElement, {
        x: targetX,
        y: targetY,
        scale: 0.08,
        autoAlpha: 0,
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
          setRecentSections((sections) =>
            [...sections.filter((recent) => recent !== section), section],
          );
        },
      });
    });
  };

  const handleWindowPointerDown = (event: PointerEvent<HTMLElement>, section: ActiveSection) => {
    if ((event.target as HTMLElement).closest(".controls"))
      return;
    const desktop = event.currentTarget.closest<HTMLElement>(".desktop");
    if (!desktop) return;
    const windowElement = windowRefs.current.get(section);
    if (!windowElement) return;
    const isRotated =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 700px) and (orientation: portrait)")
        .matches;

    windowDragRef.current = {
      section,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: Number(gsap.getProperty(windowElement, "x")),
      startY: Number(gsap.getProperty(windowElement, "y")),
      startLeft: 0,
      startTop: 0,
      isRotated,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleWindowPointerMove = (event: PointerEvent<HTMLElement>) => {
    const drag = windowDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId)
      return;
    const windowElement = windowRefs.current.get(drag.section);
    if (!windowElement) return;

    const rawDx = event.clientX - drag.startClientX;
    const rawDy = event.clientY - drag.startClientY;

    // In rotated 90deg portrait mode, desktop +X is screen +Y, desktop +Y is screen -X
    const deltaX = drag.isRotated ? rawDy : rawDx;
    const deltaY = drag.isRotated ? -rawDx : rawDy;
    const desktopBounds = document.querySelector<HTMLElement>(".desktop")?.getBoundingClientRect();
    if (!desktopBounds) return;
    const windowBounds = windowElement.getBoundingClientRect();
    const currentX = Number(gsap.getProperty(windowElement, "x"));
    const currentY = Number(gsap.getProperty(windowElement, "y"));
    const nextX = drag.startX + deltaX;
    const nextY = drag.startY + deltaY;
    const minX = desktopBounds.left - windowBounds.left + currentX;
    const maxX = desktopBounds.right - windowBounds.right + currentX;
    const minY = desktopBounds.top - windowBounds.top + currentY;
    const maxY = desktopBounds.bottom - windowBounds.bottom + currentY;

    gsap.set(windowElement, {
      x: Math.max(minX, Math.min(maxX, nextX)),
      y: Math.max(minY, Math.min(maxY, nextY)),
    });
  };

  const stopWindowDragging = (event: PointerEvent<HTMLElement>) => {
    if (windowDragRef.current?.pointerId === event.pointerId) {
      windowDragRef.current = null;
    }
  };

  return (
    <main className={`desktop ${isVirusOpen ? "virus-active" : ""}`}>
      {isSplashVisible && (
        <div
          className={`opening-splash ${hasSplashPermission ? "opening-splash--ready" : ""} ${isSplashExiting ? "opening-splash--exiting" : ""}`}
          role="dialog"
          aria-label="Opening animation"
        >
          <video
            ref={splashVideoRef}
            className="opening-splash-video"
            playsInline
            preload="auto"
            onEnded={finishSplash}
            onError={finishSplash}
          >
            <source src="/Opening%20video.mp4" type="video/mp4" />
          </video>
          {!hasSplashPermission && (
            <button
              type="button"
              className="opening-splash-power"
              onClick={() => void enableSplashExperience()}
              aria-label="Start opening experience"
            >
              <span className="opening-splash-power-icon" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
      <RoboDecoration onChatOpen={() => setIsChatbotOpen(true)} />
      {isChatbotOpen && <Chatbot onClose={() => setIsChatbotOpen(false)} />}
      <DesktopIcons onOpen={openWindow} />
      {isVirusOpen && (
        <VirusOverlay
          errorCount={errorCount}
          onAction={() => setErrorCount((count) => count + 1)}
        />
      )}
      {isWindowOpen && openSections.map((section, windowIndex) => (
        <section
          key={section}
          ref={(element) => {
            if (element) windowRefs.current.set(section, element);
            else windowRefs.current.delete(section);
          }}
          style={{ zIndex: 30 + windowIndex }}
          className={`portfolio-window ${section === "about" ? "about-window" : section === "terminal" ? "terminal-window" : section === "flappy" ? "flappy-window" : section === "music" ? "music-window" : section === "contact" ? "contact-window" : section === "rating" ? "rating-window" : "projects-window"}`}
          onPointerDown={() => {
            setActiveSection(section);
          }}
        >
          <header
            className="title-bar project-title-bar"
            onPointerDown={(event) => {
              setActiveSection(section);
              handleWindowPointerDown(event, section);
            }}
            onPointerMove={handleWindowPointerMove}
            onPointerUp={stopWindowDragging}
            onPointerCancel={stopWindowDragging}
          >
            <div className="title-bar-spacer">
              <h1 className="project-window-title">
                {section === "projects"
                  ? "Project Explorer"
                  : section === "achievements"
                    ? "Achievements"
                    : section === "terminal"
                      ? "Terminal"
                      : section === "flappy"
                        ? "Flappy Bird"
                        : section === "music"
                          ? "Royalty Free Music Player"
                          : section === "contact"
                            ? "Contact Me"
                            : section === "rating"
                              ? "Rating"
                            : "About"}
              </h1>
            </div>
            <WindowControls
              onMinimize={() => minimizeWindow(section)}
              onClose={() => closeWindow(section)}
            />
          </header>
          <div
            className={`window-body ${section !== "about" && section !== "terminal" && section !== "flappy" && section !== "music" && section !== "contact" ? "projects-window-body" : ""}`}
          >
            {section === "projects" ? (
              <ProjectBrowser
                projects={projects}
                activeProject={activeProject}
                onSelect={setActiveProject}
              />
            ) : section === "achievements" ? (
              <AchievementBrowser
                activeAchievement={activeAchievement}
                onSelect={setActiveAchievement}
              />
            ) : section === "terminal" ? (
              <TerminalBrowser onNavigate={openWindow} />
            ) : section === "flappy" ? (
              <FlappyBirdBrowser onClose={() => closeWindow(section)} />
            ) : section === "music" ? (
              <MusicBrowser onClose={() => closeWindow(section)} />
            ) : section === "contact" ? (
              <ContactBrowser onClose={() => closeWindow(section)} />
            ) : section === "rating" ? (
              <RatingBrowser />
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
      ))}
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
        <polygon points="2,2 2,20 7,15 10,22 13,21 10,14 16,14" fill="#000" />
        {/* white fill on top */}
        <polygon
          points="3,3 3,18 7.5,13.5 10.5,20.5 12,20 9,13 15,13"
          fill="#fff"
        />
      </svg>
    </main>
  );
}
