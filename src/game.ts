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

const BASE_FLASH_MS = 400;
const MIN_FLASH_MS = 180;
const SPEEDUP_EVERY = 5;
const SPEEDUP_FACTOR = 0.8;

/** Flash duration for a given round: 20% faster every 5 rounds, floored at MIN_FLASH_MS. */
export function flashDuration(round: number): number {
  const tier = Math.floor(Math.max(0, round - 1) / SPEEDUP_EVERY);
  return Math.max(MIN_FLASH_MS, Math.round(BASE_FLASH_MS * SPEEDUP_FACTOR ** tier));
}
