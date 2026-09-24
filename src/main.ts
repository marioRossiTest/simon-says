import './style.css';
import { beep } from './audio';
import { PADS, SimonGame, type Pad } from './game';

const TONES: Record<Pad, number> = { green: 392, red: 330, yellow: 262, blue: 196 };
const FAIL_TONE = 110;

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const board = $<HTMLDivElement>('#board');
const status = $<HTMLDivElement>('#status');
const startBtn = $<HTMLButtonElement>('#start');

const game = new SimonGame();
let accepting = false;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const isPad = (v: string | undefined): v is Pad => PADS.includes(v as Pad);

function setAccepting(on: boolean): void {
  accepting = on;
  board.classList.toggle('locked', !on);
}

async function flash(pad: Pad, ms = 400): Promise<void> {
  const el = board.querySelector<HTMLElement>(`[data-pad="${pad}"]`)!;
  el.classList.add('lit');
  beep(TONES[pad], ms);
  await sleep(ms);
  el.classList.remove('lit');
}

async function nextRound(): Promise<void> {
  setAccepting(false);
  const seq = game.extend();
  status.textContent = `Round ${seq.length}`;
  await sleep(600);
  for (const pad of seq) {
    await flash(pad);
    await sleep(150);
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

startBtn.addEventListener('click', () => {
  game.reset();
  void nextRound();
});
