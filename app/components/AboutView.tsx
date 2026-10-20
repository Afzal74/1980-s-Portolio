import type { RefObject } from "react";

type AboutViewProps = {
  characterRef: RefObject<HTMLImageElement | null>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  descriptionRef: RefObject<HTMLParagraphElement | null>;
  eyeOverlayRef: RefObject<SVGSVGElement | null>;
  isCharacterHovered: boolean;
  onCharacterEnter: () => void;
  onCharacterLeave: () => void;
};

const technologies = ["Python", "TypeScript", "Git", "GitHub", "VS Code", "Canva"];

export function AboutView({
  characterRef,
  headingRef,
  descriptionRef,
  eyeOverlayRef,
  isCharacterHovered,
  onCharacterEnter,
  onCharacterLeave
}: AboutViewProps) {
  return (
    <>
      <div className="profile">
        <div className="character-wrap" onMouseEnter={onCharacterEnter} onMouseLeave={onCharacterLeave}>
          {isCharacterHovered ? (
            <svg ref={eyeOverlayRef} className="character wake-diagram" viewBox="175 109 228 228" aria-label="Awake illustrated character">
              <image href="/assets/wake.png" x="189" y="123" width="200" height="200" preserveAspectRatio="none" />
              <g className="d2c-eye-group" data-cx="274" data-cy="224" data-r="14" data-pr="5.6" data-boundary="125">
                <circle cx="274" cy="224" r="14" fill="#fff" stroke="#fff" strokeWidth="2" />
                <circle className="d2c-pupil" cx="274" cy="224" r="5.6" fill="#000" />
              </g>
              <g className="d2c-eye-group" data-cx="321" data-cy="234" data-r="14" data-pr="5.6" data-boundary="125">
                <circle cx="321" cy="234" r="14" fill="#fff" stroke="#fff" strokeWidth="2" />
                <circle className="d2c-pupil" cx="321" cy="234" r="5.6" fill="#000" />
              </g>
            </svg>
          ) : (
            <img ref={characterRef} className="character sleep-character" src="/assets/sleep.png" alt="Sleeping illustrated character" />
          )}
        </div>
        <div className="profile-copy">
          <h1 ref={headingRef}>AFZAL BASHEER</h1>
          <p ref={descriptionRef}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis erat et quam iaculis faucibus at sit amet nibh. Vestibulum dignissim lectus in ligula rhoncus, et bibendum risus dictum. Pellentesque condimentum arcu dapibus tempor. Pellentesque venenatis nec magna nec finibus.tion</p>
        </div>
      </div>
      <div className="tech-showcase" aria-label="Technology stack">
        <div className="marquee-track">
          {[...technologies, ...technologies].map((technology, index) => (
            <span className="marquee-logo" key={`${technology}-${index}`}>{technology}</span>
          ))}
        </div>
      </div>
    </>
  );
}
