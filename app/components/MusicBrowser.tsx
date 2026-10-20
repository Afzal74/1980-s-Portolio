import { useEffect, useState } from "react";

type MusicBrowserProps = {
  onClose: () => void;
};

export function MusicBrowser({ onClose }: MusicBrowserProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setProgress((current) => (current >= 100 ? 0 : current + 1));
    }, 500);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="music-browser">
      <div className="music-track-display">MusicByPedro - Noire #1</div>
      <label className="music-progress">
        <span className="sr-only">Track progress</span>
        <input type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} />
      </label>
      <div className="music-controls">
        <button type="button" aria-label="Previous track" onClick={() => setProgress(0)}>◀|</button>
        <button type="button" aria-label={isPlaying ? "Pause" : "Play"} onClick={() => setIsPlaying((playing) => !playing)}>
          {isPlaying ? "❚❚" : "▶"}
        </button>
        <button type="button" aria-label="Next track" onClick={() => setProgress(100)}>▶|</button>
        <span className="music-volume-icon" aria-hidden="true">🔊</span>
        <label className="music-volume">
          <span className="sr-only">Volume</span>
          <input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
        </label>
      </div>
      <button className="music-close" type="button" onClick={onClose}>CLOSE</button>
    </div>
  );
}
