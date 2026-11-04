let clickAudio: HTMLAudioElement | null = null;

export function playClickSound() {
  if (!clickAudio) {
    clickAudio = new Audio("/sound%20on%20click.mp3");
    clickAudio.preload = "auto";
    clickAudio.volume = 0.2;
  }
  clickAudio.currentTime = 0;
  void clickAudio.play().catch(() => undefined);
}
