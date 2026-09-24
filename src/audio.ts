/** Plays a short decaying sine tone. The context is created lazily on first user gesture. */
export function beep(freq: number, ms: number): void {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const end = ctx.currentTime + ms / 1000;
  osc.frequency.value = freq;
  osc.connect(gain).connect(ctx.destination);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, end);
  osc.start();
  osc.stop(end);
}
