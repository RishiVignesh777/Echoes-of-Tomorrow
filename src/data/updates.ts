import { UpdateLogEntry } from '../types';

export const CURRENT_GAME_VERSION = '2.0';

export const UPDATE_LOGS: UpdateLogEntry[] = [
  {
    version: '2.0',
    title: 'THE COLLAPSE',
    releaseDate: '2091-03-01',
    description:
      'A catastrophic breakdown in local causality has caused the facility to fracture across concurrent timeline states. Shift room realities between Normal, Damaged, and Abandoned eras to solve multi-dimensional puzzles, navigate the Void Collapse, and discover the true ending of Project Tomorrow.',
    isMajor: true,
    newFeatures: [
      'Timeline Instability Engine: Interact with Chrono-Phase Shifters to switch rooms between State A (Normal), State B (Damaged), and State C (Abandoned).',
      'Expanded Sector Roster: Sectors 07 through 12 including The Lost Wing, Memory Vault, Observer Sanctum, Fractured Labs, and The Void Collapse.',
      'Challenge Mode & Time Trials: Replay any sector with speedrun timer and earn Gold, Silver, or Bronze medals.',
      'Echo Mastery Challenges: Test loop precision with Echo Limits, Perfect Single-Loop runs, and One-Second buzzer beaters.',
      'Facility Codex & Archives: Complete encyclopedia of all Research Logs, Memory Fragments, and Temporal Artifacts.',
      'Dynamic Timeline Glitch Events: Atmospheric anomalies, spatial fissures, and environmental flicker.',
    ],
    improvements: [
      'Comprehensive physics overhaul with sub-pixel collision precision.',
      'Enhanced CRT scanlines, chromatic aberration, and dynamic particle lightning.',
      'Refined touch & keyboard responsive input latency.',
      'Detailed speedrun HUD with medal delta tracking.',
    ],
    fixes: [
      'Resolved Echo spatial desync when rewinding near laser barriers.',
      'Fixed Paradox pathfinding lockup when navigating moving platforms.',
      'Eliminated rare state corruption during rapid level transitions.',
      'Corrected objective tracker desync on multi-stage terminal puzzles.',
    ],
  },
  {
    version: '1.4',
    title: 'THE OBSERVER',
    releaseDate: '2090-12-15',
    description:
      'A silent, enigmatic watcher has begun appearing across test sectors. Observing from distant gantries and vanishing upon approach, this spectral entity holds knowledge of forgotten timelines.',
    isMajor: false,
    newFeatures: [
      'The Observer Entity: Rare sighting encounters in high-security chambers.',
      'Chrono-spectral vanishing particle effects and spatial distortion SFX.',
      'Observer terminal fragments revealing encrypted timeline data.',
    ],
    improvements: [
      'Enhanced atmospheric sound design with dynamic ambient audio cues.',
      'Refined camera tracking with subtle predictive panning.',
    ],
    fixes: [
      'Fixed player sprite clipping into high-security lockers.',
      'Addressed audio crackle on rapid footstep triggering.',
    ],
  },
  {
    version: '1.3',
    title: 'MEMORIES',
    releaseDate: '2090-10-05',
    description:
      'Uncover the tragic origins of Project Tomorrow. Crystallized Memory Fragments scattered across test sectors unlock voice and text transcripts from Dr. Thorne and the original research team.',
    isMajor: false,
    newFeatures: [
      'Memory Fragments: Shimmering collectible crystals hidden across test chambers.',
      'Memory Playback System: Rich narrative logs detailing the First Experiment and the creation of the Paradox.',
      'Collection Tracker: HUD and menu counters for acquired lore.',
    ],
    improvements: [
      'Interactive lore reader modal with instant audio playback cues.',
      'Polished terminal text rendering with typewriter animation.',
    ],
    fixes: [
      'Fixed uncollected logs remaining marked as unread after death.',
      'Resolved save file timestamp mismatch across browser sessions.',
    ],
  },
  {
    version: '1.2',
    title: 'PARADOX PROTOCOL',
    releaseDate: '2090-08-20',
    description:
      'The facility security grid is upgraded. Paradox entities have learned player movement patterns, requiring the tactical deployment of Temporal Decoys to survive.',
    isMajor: false,
    newFeatures: [
      'Temporal Decoy Machine: Broadcast fake chronological signatures to lure Paradox patrol routes.',
      'Advanced Adaptive AI: Paradox responds to player heatmaps and sound triggers.',
      'Stealth Hiding Lockers with dynamic heartbeat tension audio.',
    ],
    improvements: [
      'Vision cone visual indicators and alert status transitions.',
      'Smoother Paradox turning and acceleration animations.',
    ],
    fixes: [
      'Prevented Paradox from detecting player through closed blast doors.',
      'Fixed crate physics blocking Paradox investigate states.',
    ],
  },
  {
    version: '1.1',
    title: 'THE LOST ITERATION',
    releaseDate: '2090-05-10',
    description:
      'Explore the sealed Lost Wing of Project Tomorrow. Master the revolutionary Echo Transfer Pods to teleport temporal remnants between isolated containment cells.',
    isMajor: true,
    newFeatures: [
      'The Lost Wing: 3 new secret puzzle sectors with high-voltage steam hazards.',
      'Echo Transfer Mechanic: Relocate active Echoes across spatial barriers via linked quantum pods.',
      'New Research Logs: Unveiling early prototypes of the Chrono-Loop.',
    ],
    improvements: [
      'Echo playback fidelity and crate synchronization.',
      'Pressure plate mechanical feedback and audio responsiveness.',
    ],
    fixes: [
      'Fixed Echo getting permanently stuck when walking into closing doors.',
      'Corrected countdown display flicker during 30s resets.',
    ],
  },
  {
    version: '1.0',
    title: 'INITIAL RECURRENCE',
    releaseDate: '2090-01-01',
    description:
      'The initial commercial launch of Echoes of Tomorrow. Experience the 30-second localized time loop, collaborate with your past selves, and solve intricate multi-echo puzzles.',
    isMajor: true,
    newFeatures: [
      'Core 30-second Time Loop and Echo recording engine.',
      '6 base puzzle sectors with pressure plates, crates, water pumps, and laser gates.',
      'The Paradox entity and stealth avoidance mechanics.',
      '3 distinct story endings (Escape, Loop, Emancipation).',
    ],
    improvements: ['Initial release.'],
    fixes: ['Initial release.'],
  },
];
