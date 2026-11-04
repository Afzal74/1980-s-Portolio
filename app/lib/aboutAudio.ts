let wakeAudio: HTMLAudioElement | null = null;
let snoreAudio: HTMLAudioElement | null = null;

function playAudio(
  current: HTMLAudioElement | null,
  source: string,
  volume: number,
): HTMLAudioElement {
  const audio = current ?? new Audio(source);
  audio.volume = volume;
  audio.currentTime = 0;
  void audio.play().catch(() => undefined);
  return audio;
}

export function playWakeSound() {
  snoreAudio?.pause();
  wakeAudio = playAudio(wakeAudio, "/wake%20up.mp3", 0.35);
}

export function playSnoreSound() {
  wakeAudio?.pause();
  snoreAudio = playAudio(snoreAudio, "/snore.mp3", 0.25);
}
