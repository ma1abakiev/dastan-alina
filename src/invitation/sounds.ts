/**
 * Synthesised "opening" sound (no audio file needed): a soft sweep as the doors part,
 * followed by a shimmering bell arpeggio. Must be called from a user gesture (the tap that opens the invitation).
 */
export function playOpeningSound(): void {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;

  try {
    const ctx = new Ctx();
    void ctx.resume();
    const t0 = ctx.currentTime + 0.02;

    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);

    // gentle reverb-ish echo
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.23;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(master);

    // 1) doors sweep: filtered noise rising then fading
    const len = Math.floor(ctx.sampleRate * 1.8);
    const noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 0.8;
    bp.frequency.setValueAtTime(300, t0);
    bp.frequency.exponentialRampToValueAtTime(3800, t0 + 1.5);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t0);
    ng.gain.exponentialRampToValueAtTime(0.28, t0 + 0.9);
    ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.8);
    noise.connect(bp).connect(ng).connect(master);
    noise.start(t0);

    // 2) low warm swell
    const swell = ctx.createOscillator();
    swell.type = "sine";
    swell.frequency.setValueAtTime(110, t0);
    swell.frequency.exponentialRampToValueAtTime(220, t0 + 1.4);
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.0001, t0);
    sg.gain.exponentialRampToValueAtTime(0.18, t0 + 1.0);
    sg.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.2);
    swell.connect(sg).connect(master);
    swell.start(t0);
    swell.stop(t0 + 2.3);

    // 3) bell arpeggio (D major pentatonic), starting as the doors open
    const bell = (freq: number, at: number, vol: number) => {
      // inharmonic partials give a bell-like timbre
      [
        [1, 1],
        [2.01, 0.45],
        [3.02, 0.22],
        [4.2, 0.12],
      ].forEach(([mult, amp]) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq * mult;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(vol * amp, at + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 2.4 / Math.sqrt(mult));
        osc.connect(g);
        g.connect(master);
        g.connect(delay);
        osc.start(at);
        osc.stop(at + 2.6);
      });
    };

    const notes = [587.33, 739.99, 880, 1108.73, 1318.51, 1760]; // D5 F#5 A5 C#6 E6 A6
    notes.forEach((f, i) => bell(f, t0 + 0.55 + i * 0.17, 0.22 - i * 0.02));
    bell(293.66, t0 + 0.55, 0.2); // low D anchor

    window.setTimeout(() => void ctx.close(), 6500);
  } catch {
    /* audio is a nice-to-have; never break the invitation */
  }
}
