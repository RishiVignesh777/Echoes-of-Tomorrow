import { AmbientDynamicsOptions, LevelEnvironmentType } from '../types';

interface EnvironmentAudioConfig {
  droneFreq: number;
  droneWave: OscillatorType;
  harmonicFreq: number;
  harmonicWave: OscillatorType;
  harmonicDetune: number;
  filterCutoff: number;
  filterQ: number;
  droneBaseVol: number;
  staticBaseVol: number;
  staticFilterFreq: number;
  staticFilterType: BiquadFilterType;
  staticFilterQ: number;
  distortionLevel: number; // 0 to 100
  lfoRate: number;
  lfoDepth: number;
  subRumbleVol: number;
  subFreq: number;
  description: string;
}

const ENVIRONMENT_CONFIGS: Record<LevelEnvironmentType, EnvironmentAudioConfig> = {
  facility_clean: {
    droneFreq: 60.0, // 60Hz clean AC electrical line hum
    droneWave: 'sine',
    harmonicFreq: 120.0, // Clean octave overtone
    harmonicWave: 'triangle',
    harmonicDetune: 0,
    filterCutoff: 380,
    filterQ: 1.5,
    droneBaseVol: 0.22,
    staticBaseVol: 0.04, // Gentle air ventilation static
    staticFilterFreq: 450,
    staticFilterType: 'lowpass',
    staticFilterQ: 0.8,
    distortionLevel: 2,
    lfoRate: 0.08,
    lfoDepth: 15,
    subRumbleVol: 0.06,
    subFreq: 40,
    description: 'Clean research laboratory humming with filtered ventilation',
  },
  industrial_factory: {
    droneFreq: 45.0, // Deep heavy machinery sub-bass
    droneWave: 'triangle',
    harmonicFreq: 90.0, // Motor harmonic
    harmonicWave: 'sawtooth',
    harmonicDetune: 4, // Slight chorusing beat frequency
    filterCutoff: 260,
    filterQ: 2.8,
    droneBaseVol: 0.28,
    staticBaseVol: 0.08, // Conveyor belt and mechanical steam hiss
    staticFilterFreq: 800,
    staticFilterType: 'bandpass',
    staticFilterQ: 1.8,
    distortionLevel: 15,
    lfoRate: 0.25, // Rhythmic machine pulsation
    lfoDepth: 35,
    subRumbleVol: 0.18,
    subFreq: 36,
    description: 'Sub-level manufacturing plant with low-frequency mechanical thrum',
  },
  flooded_lab: {
    droneFreq: 52.0, // Submerged cavernous drone
    droneWave: 'sine',
    harmonicFreq: 104.0,
    harmonicWave: 'sine',
    harmonicDetune: -2,
    filterCutoff: 180, // Heavy lowpass damping (underwater acoustics)
    filterQ: 4.2, // High resonance for fluid container pressure
    droneBaseVol: 0.24,
    staticBaseVol: 0.07, // Liquid bubbles and pipe rushing
    staticFilterFreq: 320,
    staticFilterType: 'bandpass',
    staticFilterQ: 3.5,
    distortionLevel: 5,
    lfoRate: 0.12,
    lfoDepth: 25,
    subRumbleVol: 0.14,
    subFreq: 42,
    description: 'Flooded hydro-containment ward with aquatic low-pass dampening',
  },
  containment_alert: {
    droneFreq: 58.27, // Bb1
    droneWave: 'sawtooth',
    harmonicFreq: 61.74, // B1 - Tritone / minor 2nd clash creating menacing beat interference
    harmonicWave: 'triangle',
    harmonicDetune: 8,
    filterCutoff: 340,
    filterQ: 3.2,
    droneBaseVol: 0.26,
    staticBaseVol: 0.12, // High-voltage containment buzzing
    staticFilterFreq: 1200,
    staticFilterType: 'peaking',
    staticFilterQ: 2.5,
    distortionLevel: 30,
    lfoRate: 0.5, // Tension heart-rate throb
    lfoDepth: 50,
    subRumbleVol: 0.20,
    subFreq: 38,
    description: 'Hazardous anomaly containment zone with electric field interference',
  },
  temporal_void: {
    droneFreq: 48.0, // Warped reality frequency
    droneWave: 'sine',
    harmonicFreq: 144.0, // Perfect 12th
    harmonicWave: 'sawtooth',
    harmonicDetune: 25, // Heavy phase drift
    filterCutoff: 520,
    filterQ: 2.5,
    droneBaseVol: 0.25,
    staticBaseVol: 0.18, // Heavy distorted chroniton static & cosmic radiation
    staticFilterFreq: 1800,
    staticFilterType: 'bandpass',
    staticFilterQ: 4.0,
    distortionLevel: 65, // Heavily distorted temporal static
    lfoRate: 0.15,
    lfoDepth: 80, // Dramatic frequency pitch wobble
    subRumbleVol: 0.22,
    subFreq: 34,
    description: 'Fractured timeline void with heavy chroniton static and phase distortion',
  },
  lost_wing: {
    droneFreq: 38.0, // Ultra-low lonely basement drone
    droneWave: 'triangle',
    harmonicFreq: 76.0,
    harmonicWave: 'sine',
    harmonicDetune: -6,
    filterCutoff: 210,
    filterQ: 1.8,
    droneBaseVol: 0.20,
    staticBaseVol: 0.06, // Cold air blowing through abandoned ducts
    staticFilterFreq: 480,
    staticFilterType: 'bandpass',
    staticFilterQ: 1.2,
    distortionLevel: 8,
    lfoRate: 0.05, // Very slow cold wind gusts
    lfoDepth: 40,
    subRumbleVol: 0.12,
    subFreq: 32,
    description: 'Abandoned isolation ward with cold, hollow reverberance and distant drafts',
  },
  spectral_sanctuary: {
    droneFreq: 73.42, // D2
    droneWave: 'sine',
    harmonicFreq: 110.0, // A2 (fifth)
    harmonicWave: 'sine',
    harmonicDetune: 0,
    filterCutoff: 650,
    filterQ: 1.2,
    droneBaseVol: 0.20,
    staticBaseVol: 0.04, // Ethereal crystalline shimmer
    staticFilterFreq: 2800,
    staticFilterType: 'highpass',
    staticFilterQ: 1.0,
    distortionLevel: 0,
    lfoRate: 0.07,
    lfoDepth: 10,
    subRumbleVol: 0.04,
    subFreq: 44,
    description: 'Ethereal sanctuary with singing crystalline resonance and phased harmonics',
  },
  singularity_core: {
    droneFreq: 32.7, // C1 (Sub-audible gravitational core)
    droneWave: 'triangle',
    harmonicFreq: 65.41, // C2
    harmonicWave: 'sawtooth',
    harmonicDetune: 12,
    filterCutoff: 420,
    filterQ: 3.8,
    droneBaseVol: 0.32,
    staticBaseVol: 0.22, // Massive gravitational shear static
    staticFilterFreq: 2200,
    staticFilterType: 'bandpass',
    staticFilterQ: 3.0,
    distortionLevel: 80, // Overdriven singularity field
    lfoRate: 0.18,
    lfoDepth: 95,
    subRumbleVol: 0.30,
    subFreq: 28,
    description: 'The Omega Singularity with gravitational sub-bass vortex and reality tearing',
  },
};

export class AmbientSoundSystem {
  private ctx: AudioContext | null = null;
  private outputNode: GainNode | null = null;
  private masterAmbientGain: GainNode | null = null;

  // Active Environment State
  private currentEnv: LevelEnvironmentType = 'facility_clean';
  private currentConfig: EnvironmentAudioConfig = ENVIRONMENT_CONFIGS.facility_clean;
  private isRunning: boolean = false;

  // Audio Nodes - Low Frequency Drone Layer
  private oscFund: OscillatorNode | null = null;
  private oscHarmonic: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;
  private droneLfo: OscillatorNode | null = null;
  private droneLfoGain: GainNode | null = null;

  // Audio Nodes - Sub-Bass Seismic Rumble
  private oscSub: OscillatorNode | null = null;
  private subGain: GainNode | null = null;

  // Audio Nodes - Distorted Temporal Static & Chroniton Noise Layer
  private noiseBuffer: AudioBuffer | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private staticFilter: BiquadFilterNode | null = null;
  private staticDistortion: WaveShaperNode | null = null;
  private staticGain: GainNode | null = null;

  // Distortion curve cache
  private distortionCurveCache: Map<number, Float32Array> = new Map();

  // Sporadic Atmospheric Cue Timer
  private eventTimer: number | null = null;

  // Current Dynamic Modulations
  private lastDynamics: AmbientDynamicsOptions = {
    timeRemaining: 30,
    paradoxProximity: 0,
    roomState: 'A',
    echoCount: 0,
    hasActiveHazardNear: false,
  };

  constructor() {
    // Lazy initialized when AudioContext is provided
  }

  public init(ctx: AudioContext, destination: GainNode) {
    if (this.ctx) return;
    this.ctx = ctx;
    this.outputNode = destination;

    // Master ambient volume bus
    this.masterAmbientGain = this.ctx.createGain();
    this.masterAmbientGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
    this.masterAmbientGain.connect(this.outputNode);

    // Generate Pink/Brown Noise Buffer (4 seconds seamless loop)
    this.createNoiseBuffer();

    // Start audio graph
    this.startAudioGraph();
  }

  public setMasterVolume(vol: number) {
    if (!this.ctx || !this.masterAmbientGain) return;
    const now = this.ctx.currentTime;
    this.masterAmbientGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), now, 0.05);
  }

  public getCurrentEnvironment(): LevelEnvironmentType {
    return this.currentEnv;
  }

  public getCurrentEnvironmentDescription(): string {
    return this.currentConfig.description;
  }

  /**
   * Seamlessly switches the ambient soundscape to a new level environment with cross-fading.
   */
  public setEnvironment(env: LevelEnvironmentType, immediate: boolean = false) {
    if (!ENVIRONMENT_CONFIGS[env]) {
      env = 'facility_clean';
    }
    if (this.currentEnv === env && this.isRunning) {
      return;
    }

    this.currentEnv = env;
    this.currentConfig = ENVIRONMENT_CONFIGS[env];

    if (!this.ctx || !this.isRunning) {
      return;
    }

    const now = this.ctx.currentTime;
    const rampTime = immediate ? 0.05 : 0.6; // Smooth transition constant

    try {
      // 1. Re-tune Fundamental and Harmonic Oscillators
      if (this.oscFund) {
        this.oscFund.type = this.currentConfig.droneWave;
        this.oscFund.frequency.setTargetAtTime(this.currentConfig.droneFreq, now, rampTime);
      }

      if (this.oscHarmonic) {
        this.oscHarmonic.type = this.currentConfig.harmonicWave;
        this.oscHarmonic.frequency.setTargetAtTime(this.currentConfig.harmonicFreq, now, rampTime);
        this.oscHarmonic.detune.setTargetAtTime(this.currentConfig.harmonicDetune, now, rampTime);
      }

      // 2. Adjust Low-pass Drone Filter
      if (this.droneFilter) {
        this.droneFilter.frequency.setTargetAtTime(this.currentConfig.filterCutoff, now, rampTime);
        this.droneFilter.Q.setTargetAtTime(this.currentConfig.filterQ, now, rampTime);
      }

      // 3. Adjust Drone LFO
      if (this.droneLfo && this.droneLfoGain) {
        this.droneLfo.frequency.setTargetAtTime(this.currentConfig.lfoRate, now, rampTime);
        this.droneLfoGain.gain.setTargetAtTime(this.currentConfig.lfoDepth, now, rampTime);
      }

      // 4. Adjust Sub Rumble
      if (this.oscSub && this.subGain) {
        this.oscSub.frequency.setTargetAtTime(this.currentConfig.subFreq, now, rampTime);
        this.subGain.gain.setTargetAtTime(this.currentConfig.subRumbleVol, now, rampTime);
      }

      // 5. Adjust Distorted Temporal Static Layer
      if (this.staticFilter) {
        this.staticFilter.type = this.currentConfig.staticFilterType;
        this.staticFilter.frequency.setTargetAtTime(this.currentConfig.staticFilterFreq, now, rampTime);
        this.staticFilter.Q.setTargetAtTime(this.currentConfig.staticFilterQ, now, rampTime);
      }

      if (this.staticDistortion) {
        this.staticDistortion.curve = this.getDistortionCurve(this.currentConfig.distortionLevel);
      }

      // Apply initial dynamic modulation with new environment baseline
      this.applyDynamics(this.lastDynamics, immediate);
    } catch {
      // Safeguard for audio param constraints
    }
  }

  /**
   * Real-time dynamic modulation driven by in-game events and physics.
   * Modulates distortion, static density, and filter cutoffs smoothly.
   */
  public updateDynamics(options: AmbientDynamicsOptions) {
    this.lastDynamics = { ...options };
    this.applyDynamics(options, false);
  }

  private applyDynamics(options: AmbientDynamicsOptions, immediate: boolean) {
    if (!this.ctx || !this.isRunning) return;
    const now = this.ctx.currentTime;
    const ramp = immediate ? 0.02 : 0.12;

    const {
      timeRemaining = 30,
      paradoxProximity = 0,
      roomState = 'A',
      echoCount = 0,
      hasActiveHazardNear = false,
    } = options;

    // Temporal Instability factor (0 = stable, 1 = collapsing reality right before 00:00 reset)
    const normalizedTime = Math.max(0, Math.min(30, timeRemaining));
    const instability = normalizedTime <= 10 ? Math.pow((10 - normalizedTime) / 10, 1.4) : 0;

    // Room State modifiers (A = pristine, B = electrical breach, C = decayed ruin)
    let stateDroneFreqMod = 0;
    let stateStaticBoost = 0;
    let stateDistortionBoost = 0;

    if (roomState === 'B') {
      // Hazard State: high-voltage buzzing static
      stateStaticBoost = 0.08;
      stateDistortionBoost = 25;
    } else if (roomState === 'C') {
      // Decayed State: deep hollow detune, brown noise flutter
      stateDroneFreqMod = -6; // Frequency sag
      stateStaticBoost = 0.05;
      stateDistortionBoost = 15;
    }

    // Paradox anomaly proximity: creates intense localized distortion static
    const anomalyStaticBoost = paradoxProximity * 0.16;
    const anomalyDistortion = paradoxProximity * 40;

    // Hazard proximity (electric arcing or steam vent)
    const hazardBoost = hasActiveHazardNear ? 0.06 : 0;

    // Multiple Echoes chorus modulation
    const echoChorus = Math.min(echoCount * 3, 15);

    try {
      // Drone Gain
      if (this.droneGain) {
        const droneTarget = (this.currentConfig.droneBaseVol + (instability * 0.08)) * (roomState === 'C' ? 0.8 : 1.0);
        this.droneGain.gain.setTargetAtTime(Math.max(0.01, droneTarget), now, ramp);
      }

      // Drone Frequency Detune (warping under high instability or echo density)
      if (this.oscHarmonic) {
        const totalDetune = this.currentConfig.harmonicDetune + echoChorus + (instability * 16) + (paradoxProximity * 20);
        this.oscHarmonic.detune.setTargetAtTime(totalDetune, now, ramp);
      }

      if (this.oscFund) {
        const fundTarget = Math.max(20, this.currentConfig.droneFreq + stateDroneFreqMod - (instability * 4));
        this.oscFund.frequency.setTargetAtTime(fundTarget, now, ramp);
      }

      // Static Filter: Opens wide as temporal instability rises
      if (this.staticFilter) {
        const baseCutoff = this.currentConfig.staticFilterFreq;
        const dynamicCutoff = baseCutoff + (instability * 1800) + (paradoxProximity * 1200) + (hazardBoost * 800);
        this.staticFilter.frequency.setTargetAtTime(Math.min(8000, dynamicCutoff), now, ramp);
      }

      // Static Gain: Ramps up significantly during loop collapse or paradox approach
      if (this.staticGain) {
        const baseStatic = this.currentConfig.staticBaseVol;
        const totalStatic = baseStatic + (instability * 0.22) + anomalyStaticBoost + stateStaticBoost + hazardBoost;
        this.staticGain.gain.setTargetAtTime(Math.min(0.65, totalStatic), now, ramp);
      }

      // Static Distortion Curve: Dynamically recalculates or fetches cached curve
      if (this.staticDistortion) {
        const totalDist = Math.min(
          100,
          this.currentConfig.distortionLevel + (instability * 45) + anomalyDistortion + stateDistortionBoost
        );
        this.staticDistortion.curve = this.getDistortionCurve(Math.round(totalDist));
      }

      // Sub-Bass Seismic Rumble: Warps near singularity or final 5 seconds of countdown
      if (this.subGain) {
        const subBoost = (instability > 0.5 ? (instability - 0.5) * 0.2 : 0) + (paradoxProximity * 0.1);
        this.subGain.gain.setTargetAtTime(this.currentConfig.subRumbleVol + subBoost, now, ramp);
      }
    } catch {
      // Audio param bounds safety
    }
  }

  /**
   * Initializes the procedural Web Audio graph nodes and connections.
   */
  private startAudioGraph() {
    if (!this.ctx || !this.masterAmbientGain) return;
    this.stopAudioGraph();

    const now = this.ctx.currentTime;
    const cfg = this.currentConfig;

    try {
      // 1. Low-Frequency Drone Layer
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(cfg.droneBaseVol, now);

      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(cfg.filterCutoff, now);
      this.droneFilter.Q.setValueAtTime(cfg.filterQ, now);

      // Drone LFO for gentle pulse
      this.droneLfo = this.ctx.createOscillator();
      this.droneLfoGain = this.ctx.createGain();
      this.droneLfo.type = 'sine';
      this.droneLfo.frequency.setValueAtTime(cfg.lfoRate, now);
      this.droneLfoGain.gain.setValueAtTime(cfg.lfoDepth, now);
      this.droneLfo.connect(this.droneFilter.frequency);
      this.droneLfo.start();

      this.oscFund = this.ctx.createOscillator();
      this.oscFund.type = cfg.droneWave;
      this.oscFund.frequency.setValueAtTime(cfg.droneFreq, now);

      this.oscHarmonic = this.ctx.createOscillator();
      this.oscHarmonic.type = cfg.harmonicWave;
      this.oscHarmonic.frequency.setValueAtTime(cfg.harmonicFreq, now);
      this.oscHarmonic.detune.setValueAtTime(cfg.harmonicDetune, now);

      // Connect drone voices through filter and gain
      this.oscFund.connect(this.droneFilter);
      this.oscHarmonic.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.masterAmbientGain);

      this.oscFund.start();
      this.oscHarmonic.start();

      // 2. Sub-Bass Rumble Layer
      this.subGain = this.ctx.createGain();
      this.subGain.gain.setValueAtTime(cfg.subRumbleVol, now);

      this.oscSub = this.ctx.createOscillator();
      this.oscSub.type = 'sine';
      this.oscSub.frequency.setValueAtTime(cfg.subFreq, now);
      this.oscSub.connect(this.subGain);
      this.subGain.connect(this.masterAmbientGain);
      this.oscSub.start();

      // 3. Distorted Temporal Static & Chroniton Noise Layer
      if (this.noiseBuffer) {
        this.noiseSource = this.ctx.createBufferSource();
        this.noiseSource.buffer = this.noiseBuffer;
        this.noiseSource.loop = true;

        this.staticFilter = this.ctx.createBiquadFilter();
        this.staticFilter.type = cfg.staticFilterType;
        this.staticFilter.frequency.setValueAtTime(cfg.staticFilterFreq, now);
        this.staticFilter.Q.setValueAtTime(cfg.staticFilterQ, now);

        this.staticDistortion = this.ctx.createWaveShaper();
        this.staticDistortion.curve = this.getDistortionCurve(cfg.distortionLevel);
        this.staticDistortion.oversample = '2x';

        this.staticGain = this.ctx.createGain();
        this.staticGain.gain.setValueAtTime(cfg.staticBaseVol, now);

        // Noise -> Filter -> Distortion -> Gain -> Master
        this.noiseSource.connect(this.staticFilter);
        this.staticFilter.connect(this.staticDistortion);
        this.staticDistortion.connect(this.staticGain);
        this.staticGain.connect(this.masterAmbientGain);

        this.noiseSource.start();
      }

      this.isRunning = true;

      // Start sporadic atmospheric cue scheduler
      this.startAtmosphericScheduler();
    } catch (err) {
      console.warn('Ambient audio graph initialization error:', err);
    }
  }

  private stopAudioGraph() {
    this.isRunning = false;

    if (this.eventTimer) {
      window.clearInterval(this.eventTimer);
      this.eventTimer = null;
    }

    try {
      if (this.oscFund) {
        this.oscFund.stop();
        this.oscFund.disconnect();
        this.oscFund = null;
      }
      if (this.oscHarmonic) {
        this.oscHarmonic.stop();
        this.oscHarmonic.disconnect();
        this.oscHarmonic = null;
      }
      if (this.droneLfo) {
        this.droneLfo.stop();
        this.droneLfo.disconnect();
        this.droneLfo = null;
      }
      if (this.oscSub) {
        this.oscSub.stop();
        this.oscSub.disconnect();
        this.oscSub = null;
      }
      if (this.noiseSource) {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
        this.noiseSource = null;
      }
    } catch {
      // Ignore disconnect errors
    }
  }

  /**
   * Generates a 4-second seamless loop of Pink/Brown noise for high-fidelity ambient textures.
   */
  private createNoiseBuffer() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 4; // 4 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Pink noise filter algorithm (Paul Kellet's filter method)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    // Apply quick smooth cross-fade window at boundaries for seamless loop
    const fadeLen = Math.floor(sampleRate * 0.05); // 50ms fade
    for (let i = 0; i < fadeLen; i++) {
      const frac = i / fadeLen;
      data[i] = data[i] * frac + data[bufferSize - fadeLen + i] * (1 - frac);
    }

    this.noiseBuffer = buffer;
  }

  /**
   * Generates a non-linear sigmoid wave-shaping distortion curve for temporal static.
   */
  private getDistortionCurve(amount: number): Float32Array {
    const clampedAmount = Math.max(0, Math.min(100, Math.round(amount)));
    if (this.distortionCurveCache.has(clampedAmount)) {
      return this.distortionCurveCache.get(clampedAmount)!;
    }

    const nSamples = 1024;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    const k = clampedAmount * 2.5;

    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      if (k === 0) {
        curve[i] = x;
      } else {
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
    }

    this.distortionCurveCache.set(clampedAmount, curve);
    return curve;
  }

  /**
   * Schedules subtle, procedural atmospheric cues (water drops, distant machinery clicks, crystal tones).
   */
  private startAtmosphericScheduler() {
    if (this.eventTimer) window.clearInterval(this.eventTimer);

    this.eventTimer = window.setInterval(() => {
      if (!this.ctx || !this.isRunning || this.ctx.state !== 'running') return;
      if (Math.random() > 0.6) return; // 40% probability per tick

      this.triggerAtmosphericCue();
    }, 2800);
  }

  private triggerAtmosphericCue() {
    if (!this.ctx || !this.masterAmbientGain) return;
    const now = this.ctx.currentTime;

    try {
      switch (this.currentEnv) {
        case 'flooded_lab': {
          // Resonant water drip drop
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const startFreq = 750 + Math.random() * 300;
          osc.frequency.setValueAtTime(startFreq, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
          osc.connect(gain);
          gain.connect(this.masterAmbientGain);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }

        case 'industrial_factory': {
          // Hydraulic valve pressure release puff
          if (this.noiseBuffer) {
            const src = this.ctx.createBufferSource();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            src.buffer = this.noiseBuffer;
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400, now);
            filter.frequency.exponentialRampToValueAtTime(300, now + 0.45);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
            src.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterAmbientGain);
            src.start(now);
            src.stop(now + 0.45);
          }
          break;
        }

        case 'spectral_sanctuary': {
          // High-frequency crystal harmonic chime
          const notes = [1046.5, 1318.5, 1567.98, 2093.0];
          const note = notes[Math.floor(Math.random() * notes.length)];
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note, now);
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
          osc.connect(gain);
          gain.connect(this.masterAmbientGain);
          osc.start(now);
          osc.stop(now + 0.9);
          break;
        }

        case 'containment_alert': {
          // Distant radar ping / anomaly blip
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, now);
          gain.gain.setValueAtTime(0.02, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
          osc.connect(gain);
          gain.connect(this.masterAmbientGain);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'temporal_void':
        case 'singularity_core': {
          // Distant chroniton static burst / spatial crackle
          if (this.noiseBuffer) {
            const src = this.ctx.createBufferSource();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            src.buffer = this.noiseBuffer;
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(3500, now);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
            src.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterAmbientGain);
            src.start(now);
            src.stop(now + 0.15);
          }
          break;
        }

        default:
          break;
      }
    } catch {
      // Audio node scheduling safe guard
    }
  }

  public dispose() {
    this.stopAudioGraph();
    this.distortionCurveCache.clear();
  }
}
