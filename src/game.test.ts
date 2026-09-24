import { describe, expect, it } from 'vitest';
import { SimonGame, flashDuration, type Pad } from './game';

/** Deterministic RNG that yields the given pad indices in order. */
const rngFor = (...indices: number[]) => {
  let i = 0;
  return () => (indices[i++ % indices.length]! + 0.5) / 4;
};

describe('SimonGame', () => {
  it('extends the sequence one pad at a time', () => {
    const game = new SimonGame(rngFor(0, 3, 1));
    expect(game.extend()).toEqual(['green']);
    expect(game.extend()).toEqual(['green', 'blue']);
    expect(game.extend()).toEqual(['green', 'blue', 'red']);
  });

  it('reports correct, then round-complete', () => {
    const game = new SimonGame(rngFor(1, 2));
    game.extend();
    game.extend();
    expect(game.press('red')).toBe('correct');
    expect(game.press('yellow')).toBe('round-complete');
  });

  it('rewinds the player after each extend', () => {
    const game = new SimonGame(rngFor(0, 0));
    game.extend();
    expect(game.press('green')).toBe('round-complete');
    game.extend();
    expect(game.press('green')).toBe('correct');
    expect(game.press('green')).toBe('round-complete');
  });

  it('flags a wrong press', () => {
    const game = new SimonGame(rngFor(2));
    game.extend();
    expect(game.press('blue' as Pad)).toBe('wrong');
  });

  it('scores completed rounds and resets', () => {
    const game = new SimonGame(rngFor(0));
    expect(game.score).toBe(0);
    game.extend();
    game.extend();
    game.extend();
    expect(game.score).toBe(2);
    game.reset();
    expect(game.sequence).toEqual([]);
    expect(game.score).toBe(0);
  });
});

describe('flashDuration', () => {
  it('stays at the base speed for the first five rounds', () => {
    for (const round of [1, 2, 3, 4, 5]) expect(flashDuration(round)).toBe(400);
  });

  it('speeds up 20% every five rounds', () => {
    expect(flashDuration(6)).toBe(320);
    expect(flashDuration(11)).toBe(256);
    expect(flashDuration(16)).toBe(205);
  });

  it('never goes below the floor', () => {
    expect(flashDuration(21)).toBe(180);
    expect(flashDuration(100)).toBe(180);
  });
});
