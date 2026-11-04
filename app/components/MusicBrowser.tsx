import { useEffect, useRef, useState } from "react";

type MusicBrowserProps = {
  onClose: () => void;
};

let sharedAudio: HTMLAudioElement | null = null;

function getSharedAudio() {
  if (!sharedAudio) {
    sharedAudio = new Audio("/Doreamon.mp3");
    sharedAudio.preload = "metadata";
  }
  return sharedAudio;
}

export function MusicBrowser({ onClose }: MusicBrowserProps) {
  const [isPlaying, setIsPlaying] = useState(() => sharedAudio ? !sharedAudio.paused : false);
  const [progress, setProgress] = useState(() => {
    if (!sharedAudio?.duration) return 0;
    return (sharedAudio.currentTime / sharedAudio.duration) * 100;
  });
  const [volume, setVolume] = useState(70);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = getSharedAudio();
    audioRef.current = audio;
    audio.volume = volume / 100;
    const updatePlayer = () => {
      setIsPlaying(!audio.paused);
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const resetPlayer = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    audio.addEventListener("timeupdate", updatePlayer);
    audio.addEventListener("play", updatePlayer);
    audio.addEventListener("pause", updatePlayer);
    audio.addEventListener("ended", resetPlayer);
    return () => {
      audio.removeEventListener("timeupdate", updatePlayer);
      audio.removeEventListener("play", updatePlayer);
      audio.removeEventListener("pause", updatePlayer);
      audio.removeEventListener("ended", resetPlayer);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
  }, [volume]);

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (audio?.duration) audio.currentTime = (value / 100) * audio.duration;
    setProgress(value);
  };

  const resetTrack = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
  };

  const closeMusic = () => {
    resetTrack();
    onClose();
  };

  return (
    <div className="music-browser">
      <div className="music-track-display">Doreamon.mp3</div>
      <label className="music-progress">
        <span className="sr-only">Track progress</span>
        <input type="range" min="0" max="100" value={progress} onChange={(event) => seek(Number(event.target.value))} />
      </label>
      <div className="music-controls">
        <button type="button" aria-label="Restart track" onClick={resetTrack}>◀|</button>
        <button
          type="button"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={() => {
            const audio = audioRef.current;
            if (!audio) return;
            if (audio.paused) {
              void audio.play().catch(() => setIsPlaying(false));
            } else {
              audio.pause();
            }
          }}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
        <button type="button" aria-label="Skip to end" onClick={() => seek(100)}>▶|</button>
        <span className="music-volume-icon" aria-hidden="true">🔊</span>
        <label className="music-volume">
          <span className="sr-only">Volume</span>
          <input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
        </label>
      </div>
      <button className="music-close" type="button" onClick={closeMusic}>CLOSE</button>
    </div>
  );
}
