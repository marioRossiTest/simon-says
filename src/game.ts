export const PADS = ['green', 'red', 'yellow', 'blue'] as const;
export type Pad = (typeof PADS)[number];

export type PressResult = 'correct' | 'round-complete' | 'wrong';

/** Pure Simon Says rules: no DOM, no timers, injectable randomness. */
export class SimonGame {
  private seq: Pad[] = [];
  private step = 0;

  constructor(private readonly random: () => number = Math.random) {}

  get sequence(): readonly Pad[] {
    return this.seq;
  }

  get score(): number {
    return Math.max(0, this.seq.length - 1);
  }

  reset(): void {
    this.seq = [];
    this.step = 0;
  }

  /** Appends one random pad and rewinds the player's position. */
  extend(): readonly Pad[] {
    this.seq.push(PADS[Math.floor(this.random() * PADS.length)]!);
    this.step = 0;
    return this.seq;
  }

  press(pad: Pad): PressResult {
    if (pad !== this.seq[this.step]) return 'wrong';
    this.step++;
    return this.step === this.seq.length ? 'round-complete' : 'correct';
  }
}
