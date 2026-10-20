export type Project = {
  id: string;
  title: string;
  tech: string[];
  image: string;
  desc: string;
};

export type ActiveSection = "about" | "achievements" | "projects" | "terminal" | "flappy" | "music" | "contact";
