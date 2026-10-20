type AchievementBrowserProps = {
  activeAchievement: number;
  onSelect: (index: number) => void;
};

const achievements = [
  { id: "A-01", name: "achievement-1.txt" },
  { id: "A-02", name: "achievement-2.txt" }
];

export function AchievementBrowser({ activeAchievement, onSelect }: AchievementBrowserProps) {
  return (
    <div className="project-explorer achievement-explorer">
      <div className="project-files">
        {achievements.map((achievement, index) => (
          <button
            className={`project-file achievement-file ${activeAchievement === index ? "active" : ""}`}
            type="button"
            key={achievement.id}
            onClick={() => onSelect(index)}
          >
            <span className="achievement-file-icon" aria-hidden="true" />
            <span>{achievement.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
