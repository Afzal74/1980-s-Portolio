"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

type SplashScreenProps = {
  videoSrc?: string;
};

export default function SplashScreen({
  videoSrc = "/Afzal-optimized.mp4",
}: SplashScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closingRef = useRef(false);

  const [isDone, setIsDone] = useState(false);

  /* =========================
     CLOSE SPLASH
  ========================= */

  const closeSplash = useCallback(() => {
    if (closingRef.current) return;

    closingRef.current = true;

    const root = rootRef.current;
    const video = videoRef.current;

    if (!root) return;

    gsap.to(root, {
      opacity: 0,
      duration: 0.45,
      ease: "power2.inOut",
      onComplete: () => {
        if (video) {
          video.pause();
          video.currentTime = 0;
        }

        setIsDone(true);
      },
    });
  }, []);

  /* =========================
     PLAY VIDEO
  ========================= */

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    // Try to start UNMUTED
    video.muted = false;
    video.defaultMuted = false;
    video.volume = 1;

    const startVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.warn("Autoplay with sound was blocked by the browser:", error);
      }
    };

    if (video.readyState >= 2) {
      startVideo();
    } else {
      video.addEventListener("canplay", startVideo, { once: true });
    }

    video.addEventListener("ended", closeSplash);

    return () => {
      video.removeEventListener("ended", closeSplash);
    };
  }, [closeSplash]);

  /* =========================
     DON'T RENDER AFTER CLOSE
  ========================= */

  if (isDone) return null;

  return (
    <div ref={rootRef} className="splash-root">
      {/* =========================================
          BLURRED BACKGROUND VIDEO
      ========================================= */}

      <video
        className="background-video"
        src={videoSrc}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        aria-hidden="true"
      />

      {/* =========================================
          DARK OVERLAY
      ========================================= */}

      <div className="dark-overlay" />

      {/* =========================================
          CRT HORIZONTAL TV LINES
      ========================================= */}

      <div className="tv-lines" />

      {/* =========================================
          MOVING CRT SCAN BAR
      ========================================= */}

      <div className="tv-scan" />

      {/* =========================================
          CRT FLICKER
      ========================================= */}

      <div className="crt-flicker" />

      {/* =========================================
          MAIN VIDEO FRAME
      ========================================= */}

      <div className="video-frame">
        <video
          ref={videoRef}
          className="main-video"
          src={videoSrc}
          autoPlay
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          onEnded={closeSplash}
        />

        {/* Inner black shadow */}
        <div className="inner-shadow" />
      </div>

      <style jsx>{`
        /* =========================================
           ROOT
        ========================================= */

        .splash-root {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;

          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #000;

          z-index: 99999;
        }

        /* =========================================
           BLURRED BACKGROUND VIDEO
        ========================================= */

        .background-video {
          position: absolute;

          top: 50%;
          left: 50%;

          width: 100%;
          height: 100%;

          object-fit: cover;

          transform: translate(-50%, -50%) scale(1.08);

          filter: blur(35px) brightness(0.18) saturate(0.65);

          opacity: 0.95;

          pointer-events: none;

          z-index: 0;
        }

        /* =========================================
           DARK OVERLAY
        ========================================= */

        .dark-overlay {
          position: absolute;
          inset: 0;

          background: radial-gradient(
            ellipse at center,
            rgba(0, 0, 0, 0.15) 0%,
            rgba(0, 0, 0, 0.55) 55%,
            rgba(0, 0, 0, 0.92) 100%
          );

          pointer-events: none;

          z-index: 1;
        }

        /* =========================================
           TV HORIZONTAL LINES
        ========================================= */

        .tv-lines {
          position: absolute;
          inset: -100% 0;

          background: repeating-linear-gradient(
            to bottom,
            rgba(0, 255, 220, 0.08) 0px,
            rgba(0, 255, 220, 0.08) 1px,
            transparent 1px,
            transparent 5px
          );

          opacity: 0.8;

          pointer-events: none;

          animation: tvLineMove 4s linear infinite;

          z-index: 2;
        }

        @keyframes tvLineMove {
          0% {
            transform: translateY(0);
          }

          100% {
            transform: translateY(50%);
          }
        }

        /* =========================================
           MOVING SCAN BAR
        ========================================= */

        .tv-scan {
          position: absolute;

          left: 0;
          right: 0;

          height: 2px;

          background: rgba(0, 255, 220, 0.15);

          box-shadow:
            0 0 12px rgba(0, 255, 220, 0.12),
            0 0 30px rgba(0, 255, 220, 0.08);

          pointer-events: none;

          animation: scanDown 5s linear infinite;

          z-index: 3;
        }

        @keyframes scanDown {
          0% {
            top: -5%;
            opacity: 0;
          }

          10% {
            opacity: 0.8;
          }

          50% {
            opacity: 0.5;
          }

          90% {
            opacity: 0.8;
          }

          100% {
            top: 105%;
            opacity: 0;
          }
        }

        /* =========================================
           CRT FLICKER
        ========================================= */

        .crt-flicker {
          position: absolute;
          inset: 0;

          background: rgba(255, 255, 255, 0.015);

          pointer-events: none;

          animation: crtFlicker 0.12s infinite;

          z-index: 4;
        }

        @keyframes crtFlicker {
          0% {
            opacity: 0.05;
          }

          25% {
            opacity: 0.02;
          }

          50% {
            opacity: 0.04;
          }

          75% {
            opacity: 0.015;
          }

          100% {
            opacity: 0.04;
          }
        }

        /* =========================================
           MAIN VIDEO FRAME
        ========================================= */

        .video-frame {
          position: relative;

          width: min(60vw, 900px);
          max-height: 62vh;

          aspect-ratio: 16 / 9;

          padding: 18px;

          background: #000;

          border-radius: 18px;

          border: 1px solid rgba(255, 255, 255, 0.06);

          box-shadow:
            0 0 0 2px rgba(0, 0, 0, 0.95),
            0 20px 60px rgba(0, 0, 0, 0.8),
            0 0 100px rgba(0, 0, 0, 0.7);

          overflow: hidden;

          z-index: 5;
        }

        /* =========================================
           MAIN VIDEO
        ========================================= */

        .main-video {
          display: block;

          width: 100%;
          height: 100%;

          object-fit: cover;

          border-radius: 9px;

          background: #000;

          outline: none;

          border: none;

          user-select: none;

          -webkit-user-select: none;

          -webkit-touch-callout: none;
        }

        /* =========================================
           INNER BLACK SHADOW
        ========================================= */

        .inner-shadow {
          position: absolute;

          inset: 18px;

          border-radius: 9px;

          pointer-events: none;

          box-shadow:
            inset 0 0 35px rgba(0, 0, 0, 0.95),
            inset 0 0 12px rgba(0, 0, 0, 0.9);

          z-index: 2;
        }

        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 768px) {
          .video-frame {
            width: 88vw;

            max-height: 65vh;

            padding: 10px;

            border-radius: 14px;
          }

          .inner-shadow {
            inset: 10px;

            border-radius: 7px;
          }

          .main-video {
            border-radius: 7px;
          }

          .background-video {
            filter: blur(25px) brightness(0.15) saturate(0.55);
          }
        }

        /* =========================================
           REDUCED MOTION
        ========================================= */

        @media (prefers-reduced-motion: reduce) {
          .tv-lines,
          .tv-scan,
          .crt-flicker {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
