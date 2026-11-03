"use client";

import { useEffect, useRef } from "react";

type RoboDecorationProps = { onChatOpen: () => void };

export function RoboDecoration({ onChatOpen }: RoboDecorationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const moveEyes = (event: MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const screenTransform = svg.getScreenCTM();
      if (!screenTransform) return;
      const svgPoint = point.matrixTransform(screenTransform.inverse());

      svg.querySelectorAll<SVGGElement>(".d2c-eye-group").forEach((eye) => {
        const cx = Number(eye.getAttribute("data-cx"));
        const cy = Number(eye.getAttribute("data-cy"));
        const radius = Number(eye.getAttribute("data-r"));
        const pupilRadius = Number(eye.getAttribute("data-pr"));
        const pupil = eye.querySelector<SVGCircleElement>(".d2c-pupil");
        if (!pupil) return;
        const distance = Math.min(Math.hypot(svgPoint.x - cx, svgPoint.y - cy), radius - pupilRadius - 2);
        const angle = Math.atan2(svgPoint.y - cy, svgPoint.x - cx);
        pupil.setAttribute("cx", String(cx + Math.cos(angle) * distance));
        pupil.setAttribute("cy", String(cy + Math.sin(angle) * distance));
      });
    };

    window.addEventListener("mousemove", moveEyes);
    return () => window.removeEventListener("mousemove", moveEyes);
  }, []);

  return (
    <div
      className="desktop-robo"
      role="button"
      tabIndex={0}
      aria-label="Open portfolio help chatbot"
      onClick={onChatOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onChatOpen();
      }}
      onMouseEnter={() => document.documentElement.classList.add("robo-help-hover")}
      onMouseLeave={() => document.documentElement.classList.remove("robo-help-hover")}
    >
      <svg ref={svgRef} className="d2c-container" viewBox="151 119 288 248" role="presentation">
        <image href="/assets/robo.png" x="165" y="133" width="260" height="220" preserveAspectRatio="none" />
        <g className="d2c-eye-group" data-cx="263" data-cy="264.8" data-r="20" data-pr="8">
          <circle cx="263" cy="264.8" r="20" fill="#fff" stroke="#fff" strokeWidth="2" />
          <circle className="d2c-pupil" cx="263" cy="264.8" r="8" fill="#000" />
        </g>
        <g className="d2c-eye-group" data-cx="341.4" data-cy="265.825" data-r="20" data-pr="8">
          <circle cx="341.4" cy="265.825" r="20" fill="#fff" stroke="#fff" strokeWidth="2" />
          <circle className="d2c-pupil" cx="341.4" cy="265.825" r="8" fill="#000" />
        </g>
      </svg>
    </div>
  );
}
