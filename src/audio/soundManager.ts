import { GameSettings } from '../types';

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private ambientOscs: { osc: OscillatorNode; gain: GainNode }[] = [];
  private pulseInterval: number | null = null;
  private currentMusicIntensity: 'calm' | 'urgent' | 'danger' | 'victory' = 'calm';
  private stepToneToggle: boolean = false;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      this.startAmbientMusic();
    } catch {
      console.warn('Web Audio API not supported or blocked.');
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateVolumes(settings: GameSettings) {
    if (!this.ctx || !this.masterGain || !this.musicGain || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setTargetAtTime(settings.masterVolume, now, 0.05);
    this.musicGain.gain.setTargetAtTime(settings.musicVolume * 0.6, now, 0.05);
    this.sfxGain.gain.setTargetAtTime(settings.sfxVolume * 0.8, now, 0.05);
  }

  public setMusicIntensity(intensity: 'calm' | 'urgent' | 'danger' | 'victory') {
    if (this.currentMusicIntensity === intensity) return;
    this.currentMusicIntensity = intensity;
  }

  private startAmbientMusic() {
    if (!this.ctx || !this.musicGain) return;

    // Create 3 atmospheric drone oscillators
    const freqs = [65.41, 98.00, 130.81]; // C2, G2, C3 deep ambient sci-fi chord
    freqs.forEach((freq, i) => {
      if (!this.ctx || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = i === 0 ? 'sine' : i === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      // Gentle subtle LFO for sci-fi atmosphere
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + i * 0.05, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, this.ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.04 / (i + 1), this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start();

      this.ambientOscs.push({ osc, gain });
    });

    // Ambient pulsing loop
    let step = 0;
    this.pulseInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.ctx.state !== 'running') return;
      step++;
      const now = this.ctx.currentTime;

      if (this.currentMusicIntensity === 'urgent') {
        // Fast time running out heartbeat click
        this.playPulseBeat(440, 0.03, 0.08);
        if (step % 2 === 0) {
          this.playPulseBeat(880, 0.04, 0.05);
        }
      } else if (this.currentMusicIntensity === 'danger') {
        // Paradox chase alert pulse
        const alertFreq = 160 + (step % 4) * 40;
        this.playPulseBeat(alertFreq, 0.1, 0.15, 'sawtooth');
      } else if (this.currentMusicIntensity === 'calm') {
        // Eerie ambient crystal droplet
        if (step % 8 === 0) {
          const notes = [261.63, 329.63, 392.00, 523.25, 587.33];
          const note = notes[Math.floor(Math.random() * notes.length)];
          this.playPulseBeat(note, 0.4, 0.02, 'sine');
        }
      }
    }, 250);
  }

  private playPulseBeat(freq: number, duration: number, vol: number, type: OscillatorType = 'sine') {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio node cleanup safeguard
    }
  }

  // --- SOUND EFFECTS ---

  public playFootstep() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const now = this.ctx.currentTime;
    this.stepToneToggle = !this.stepToneToggle;
    const freq = this.stepToneToggle ? 140 : 120;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.06);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playButtonClick() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(1200, now + 0.03);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playPlateDown() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playPlateUp() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playDoorMove(open: boolean) {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Heavy mechanical servo sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    if (open) {
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.25);
    } else {
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.25);
    }

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playTimelineReset() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Reversed temporal sweep & deep bass rewind
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.9);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    // Glitch noise burst
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.3, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.1));
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now + 0.4);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    whiteNoise.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.9);
    whiteNoise.start(now + 0.4);
  }

  public playEchoSpawn() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Ascending holographic synth flourish
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteStart = now + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.12, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(noteStart);
      osc.stop(noteStart + 0.2);
    });
  }

  public playCratePush() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playAlarmDistraction() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.setValueAtTime(1000, now + 0.1);
    osc.frequency.setValueAtTime(800, now + 0.2);
    osc.frequency.setValueAtTime(1000, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  public playParadoxAlert() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Dissonant terrifying screech
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(370, now);
    osc2.frequency.setValueAtTime(392, now); // Minor second dissonance
    osc1.frequency.exponentialRampToValueAtTime(660, now + 0.3);
    osc2.frequency.exponentialRampToValueAtTime(700, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  public playPlayerDeath() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.65);
  }

  public playCheckpoint() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const now = this.ctx.currentTime;

    const notes = [440, 554.37, 659.25, 880]; // A major triumphant chime
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteStart = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.18, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(noteStart);
      osc.stop(noteStart + 0.4);
    });
  }

  public playTerminalType() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1400 + Math.random() * 300, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  public playSecretUnlocked() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const now = this.ctx.currentTime;

    const chord = [523.25, 659.25, 783.99, 987.77, 1318.51];
    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteStart = now + idx * 0.1;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.15, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(noteStart);
      osc.stop(noteStart + 0.8);
    });
  }

  public playVictory() {
    if (!this.ctx || !this.musicGain) return;
    this.resume();
    const now = this.ctx.currentTime;
    const chords = [
      [261.63, 329.63, 392.00], // C
      [349.23, 440.00, 523.25], // F
      [392.00, 493.88, 587.33], // G
      [523.25, 659.25, 783.99], // C high
    ];

    chords.forEach((chord, stepIdx) => {
      chord.forEach((freq) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + stepIdx * 0.35;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(start);
        osc.stop(start + 0.5);
      });
    });
  }
}

export const soundManager = new SoundManager();
