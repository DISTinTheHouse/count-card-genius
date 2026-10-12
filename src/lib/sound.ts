import { readLocal, useLocal, writeLocal } from "./storage";

// Short synthesized sounds (no audio files to download) plus a light vibration where
// the device supports it (Android; iOS web views ignore it). One switch mutes both.

const KEY = "cuentacartas-sound";

export const useSoundOn = () => useLocal(KEY) !== "0";
export const setSoundOn = (on: boolean) => writeLocal(KEY, on ? "1" : "0");

export type Cue = "card" | "chip" | "win" | "lose";

// [frequency Hz, start s, length s] per note.
const NOTES: Record<Cue, [number, number, number][]> = {
  card: [[700, 0, 0.035]],
  chip: [
    [1900, 0, 0.04],
    [2400, 0.045, 0.04],
  ],
  win: [
    [523, 0, 0.09],
    [659, 0.08, 0.09],
    [784, 0.16, 0.16],
  ],
  lose: [
    [330, 0, 0.12],
    [247, 0.11, 0.2],
  ],
};
const BUZZ: Partial<Record<Cue, number | number[]>> = { chip: 8, win: [25, 50, 25], lose: 40 };

let ctx: AudioContext | null = null;

export function cue(c: Cue) {
  if (typeof window === "undefined" || readLocal(KEY) === "0") return;
  try {
    const buzz = BUZZ[c];
    if (buzz) navigator.vibrate?.(buzz);
  } catch {
    // Vibration blocked: sound only.
  }
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    for (const [freq, at, len] of NOTES[c]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = c === "card" ? "triangle" : "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + at);
      gain.gain.exponentialRampToValueAtTime(0.12, now + at + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + len);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + at);
      osc.stop(now + at + len + 0.02);
    }
  } catch {
    // No Web Audio: stay silent.
  }
}
