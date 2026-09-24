import './style.css';
import { beep } from './audio';
import { PADS, SimonGame, flashDuration, type Pad } from './game';

const TONES: Record<Pad, number> = { green: 392, red: 330, yellow: 262, blue: 196 };
const FAIL_TONE = 110;
/** Pause between flashes, as a fraction of the flash length (150ms at base speed). */
const GAP_RATIO = 0.375;

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const board = $<HTMLDivElement>('#board');
const status = $<HTMLDivElement>('#status');
const startBtn = $<HTMLButtonElement>('#start');

const game = new SimonGame();
let accepting = false;
let statusTimer: ReturnType<typeof setInterval> | undefined;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const isPad = (v: string | undefined): v is Pad => PADS.includes(v as Pad);

function setAccepting(on: boolean): void {
  accepting = on;
  board.classList.toggle('locked', !on);
}

async function flash(pad: Pad, ms = 400): Promise<void> {
  const el = board.querySelector<HTMLElement>(`[data-pad="${pad}"]`)!;
  const nodes = [...document.querySelectorAll<HTMLElement>('.pad')];
  const widths = nodes.map((node) => node.offsetWidth);
  nodes.forEach((node, i) => (node.style.width = `${widths[i]}px`));
  el.classList.add('lit');
  beep(TONES[pad], ms);
  await sleep(ms);
  el.classList.remove('lit');
}

async function nextRound(): Promise<void> {
  setAccepting(false);
  const seq = game.extend();
  clearInterval(statusTimer);
  statusTimer = setInterval(() => {
    status.textContent = `Round ${game.sequence.length}`;
  }, 250);
  await sleep(600);
  const ms = flashDuration(seq.length);
  for (const pad of seq) {
    await flash(pad, ms);
    await sleep(ms * GAP_RATIO);
  }
  setAccepting(true);
}

board.addEventListener('click', (e) => {
  const pad = (e.target as HTMLElement).dataset.pad;
  if (!accepting || !isPad(pad)) return;
  void flash(pad, 200);
  switch (game.press(pad)) {
    case 'wrong':
      setAccepting(false);
      beep(FAIL_TONE, 600);
      status.textContent = `Game over — score ${game.score}`;
      break;
    case 'round-complete':
      void nextRound();
      break;
    case 'correct':
      break;
  }
});

window.addEventListener('resize', () => {
  for (const node of document.querySelectorAll<HTMLElement>('.pad')) {
    node.style.height = `${node.offsetWidth}px`;
  }
});

startBtn.addEventListener('click', () => {
  game.reset();
  void nextRound();
});
