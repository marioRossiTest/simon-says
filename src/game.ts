export const PADS = ['green', 'red', 'yellow', 'blue'] as const;
export type Pad = (typeof PADS)[number];

export type PressResult = 'correct' | 'round-complete' | 'wrong';

/** Pure Simon Says rules: no DOM, no timers, injectable randomness. */
export class SimonGame {
  private seq: Pad[] = [];
  private step = 0;
  /** Cached read-only view of `seq`; invalidated whenever the sequence changes. */
  private snapshot: readonly Pad[] | undefined;

  constructor(private readonly random: () => number = Math.random) {}

  get sequence(): readonly Pad[] {
    this.snapshot ??= Object.freeze([...this.seq]);
    return this.snapshot;
  }

  get score(): number {
    return Math.max(0, this.seq.length - 1);
  }

  reset(): void {
    this.seq = [];
    this.step = 0;
    this.snapshot = undefined;
  }

  /** Appends one random pad and rewinds the player's position. */
  extend(): readonly Pad[] {
    this.seq.push(PADS[Math.floor(this.random() * PADS.length)]!);
    this.step = 0;
    this.snapshot = undefined;
    return this.seq;
  }

  press(pad: Pad): PressResult {
    const expected = this.sequence.slice(0, this.step + 1).at(-1);
    if (pad !== expected) return 'wrong';
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
  let best = BASE_FLASH_MS;
  for (let r = 1; r <= round; r++) {
    const tier = Math.floor(Math.max(0, r - 1) / SPEEDUP_EVERY);
    best = Math.max(MIN_FLASH_MS, Math.round(BASE_FLASH_MS * SPEEDUP_FACTOR ** tier));
  }
  return best;
}
