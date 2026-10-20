import type { Project } from "./types";

type ProjectBrowserProps = {
  projects: Project[];
  activeProject: number;
  onSelect: (index: number) => void;
};

export function ProjectBrowser({ projects, activeProject, onSelect }: ProjectBrowserProps) {
  return (
    <div className="project-explorer">
      <div className="project-files">
        {projects.map((project, index) => (
          <button
            className={`project-file ${activeProject === index ? "active" : ""}`}
            type="button"
            key={project.id}
            onClick={() => onSelect(index)}
          >
            <img src={project.image} alt="" />
            <span>project-{index + 1}.png</span>
          </button>
        ))}
      </div>
    </div>
  );
}
