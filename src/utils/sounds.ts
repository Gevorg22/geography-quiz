let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  return ctx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gainValue = 0.18,
) {
  const audio = getCtx();
  if (!audio) return;

  try {
    if (audio.state === "suspended") audio.resume();

    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audio.currentTime);
    gain.gain.setValueAtTime(gainValue, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);

    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(audio.currentTime);
    osc.stop(audio.currentTime + duration);
  } catch {
    /* ignore audio errors */
  }
}

export const sounds = {
  correct() {
    playTone(880, 0.12, "sine", 0.15);
    setTimeout(() => playTone(1100, 0.15, "sine", 0.12), 100);
  },

  streak() {
    playTone(660, 0.08, "sine", 0.12);
    setTimeout(() => playTone(880, 0.08, "sine", 0.12), 80);
    setTimeout(() => playTone(1320, 0.2, "sine", 0.15), 160);
  },

  wrong() {
    playTone(220, 0.18, "square", 0.1);
  },

  fail() {
    playTone(180, 0.1, "square", 0.12);
    setTimeout(() => playTone(140, 0.25, "square", 0.1), 100);
  },

  skip() {
    playTone(440, 0.1, "sine", 0.08);
  },

  hint() {
    playTone(600, 0.08, "sine", 0.1);
    setTimeout(() => playTone(800, 0.12, "sine", 0.08), 90);
  },
};
