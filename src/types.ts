export type Direction = 'up' | 'down' | 'left' | 'right';

export type PlayerAction = 'none' | 'interact' | 'push' | 'activate' | 'transfer' | 'decoy' | 'phase_shift';

export interface RecordedFrame {
  timestamp: number; // time in ms from start of timeline
  x: number;
  y: number;
  dir: Direction;
  isMoving: boolean;
  action: PlayerAction;
  targetId?: string;
  isHiding?: boolean;
}

export interface Echo {
  id: string;
  timelineIndex: number;
  hue: number;
  frames: RecordedFrame[];
  x: number;
  y: number;
  dir: Direction;
  isMoving: boolean;
  isHiding: boolean;
  active: boolean;
  opacity: number;
  lastAction?: PlayerAction;
}

export type RoomTimelineState = 'A' | 'B' | 'C';

export type PuzzleObjectType =
  | 'pressure_plate'
  | 'button'
  | 'timed_switch'
  | 'door'
  | 'crate'
  | 'water_zone'
  | 'water_pump'
  | 'electric_hazard'
  | 'moving_platform'
  | 'hiding_locker'
  | 'distraction_machine'
  | 'checkpoint'
  | 'terminal'
  | 'exit_portal'
  | 'temporal_core'
  | 'secret_console'
  | 'laser_barrier'
  // New Mechanics & Objects from Updates 1.1 - 2.0
  | 'echo_transfer_pod'
  | 'echo_transfer_console'
  | 'temporal_decoy'
  | 'chrono_phase_shifter'
  | 'memory_fragment'
  | 'temporal_artifact'
  | 'observer_beacon'
  | 'steam_hazard'
  | 'quantum_bridge';

export interface PuzzleObject {
  id: string;
  type: PuzzleObjectType;
  x: number; // grid or world coordinate
  y: number;
  width: number;
  height: number;
  state: boolean | number | string; // e.g. isOpen, isPressed, etc.
  colorKey?: 'cyan' | 'amber' | 'emerald' | 'magenta' | 'red' | 'blue' | 'purple' | 'gold';
  linkedIds?: string[];
  linkedPodId?: string;
  memoryId?: string;
  timerDuration?: number;
  timeRemaining?: number;
  persistent?: boolean;
  label?: string;
  text?: string;
  logId?: string;
  fragmentId?: string;
  artifactId?: string;
  targetPodId?: string;
  roomStateMask?: RoomTimelineState[]; // Only active in specific room states (A, B, C)
  charges?: number;
  maxCharges?: number;
  cooldown?: number;
  cooldownTimer?: number;
  // Dynamic runtime properties
  origX?: number;
  origY?: number;
  origState?: boolean | number | string;
  animTimer?: number;
  pathStart?: { x: number; y: number };
  pathEnd?: { x: number; y: number };
  moveSpeed?: number;
  moveDirection?: number; // 1 or -1
}

export enum TileType {
  EMPTY = 0,
  FLOOR = 1,
  WALL = 2,
  GRATE = 3,
  WATER = 4,
  PIT = 5,
  GLITCH_FLOOR = 6,
  GLASS_WALL = 7,
  ACCENT_FLOOR = 8,
  HAZARD_STRIPE = 9,
  PHASE_BRIDGE = 10,
  ABANDONED_FLOOR = 11,
}

export interface ParadoxEnemyDef {
  id: string;
  spawnX: number;
  spawnY: number;
  patrolNodes: { x: number; y: number }[];
  speed?: number;
}

export interface ParadoxEnemy {
  id: string;
  x: number;
  y: number;
  spawnX: number;
  spawnY: number;
  targetX: number;
  targetY: number;
  patrolNodes: { x: number; y: number }[];
  currentNodeIdx: number;
  state: 'patrol' | 'investigating' | 'chasing' | 'searching';
  dir: Direction;
  alertLevel: number; // 0 to 1
  speed: number;
  investigateTimer: number;
  investigateTarget?: { x: number; y: number };
  animFrame: number;
  phaseGlitch: number;
}

export interface ObserverEntity {
  id: string;
  x: number;
  y: number;
  vanished: boolean;
  vanishTimer: number;
  glitchPhase: number;
  dialogue?: string;
}

export interface StoryLog {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string[];
  sectorName?: string;
  category?: 'Research' | 'Security' | 'Classified' | 'Incident';
  isClassified?: boolean;
  revealsSecret?: boolean;
}

export interface MemoryFragment {
  id: string;
  title: string;
  subtitle: string;
  speaker: string;
  era: string;
  sectorId: number;
  sectorName: string;
  content: string[];
}

export interface TemporalArtifact {
  id: string;
  name: string;
  classification: string;
  sectorId: number;
  sectorName: string;
  description: string;
  lore: string;
  origin?: string;
  rarity?: string;
  chronologicalFunction?: string;
}

export interface LevelHint {
  x: number;
  y: number;
  text: string;
  subtext?: string;
}

export interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  objective: string;
  width: number;
  height: number;
  tiles: number[][];
  playerSpawn: { x: number; y: number; dir: Direction };
  checkpointSpawn?: { x: number; y: number; dir: Direction };
  objects: PuzzleObject[];
  paradoxSpawns?: ParadoxEnemyDef[];
  observerSpawn?: { x: number; y: number; dialogue?: string };
  hints?: LevelHint[];
  ambientColor?: string;
  maxRecommendedEchoes?: number;
  // Update 2.0 Room Timeline States
  defaultRoomState?: RoomTimelineState;
  stateTiles?: {
    B?: number[][];
    C?: number[][];
  };
  timeTrialBenchmarks?: {
    gold: number; // in seconds
    silver: number;
    bronze: number;
  };
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  screenShake: boolean;
  crtEffects: boolean;
  reducedFX: boolean;
  showControlsOverlay: boolean;
}

export interface TimeTrialRecord {
  levelId: number;
  bestTimeSeconds: number;
  medal: 'gold' | 'silver' | 'bronze';
  completedAt: number;
}

export interface EchoChallenge {
  id: string;
  title: string;
  description: string;
  levelId: number;
  type: 'limit' | 'perfect_loop' | 'one_second';
  param?: number;
  rewardBadge: string;
}

export interface UpdateLogEntry {
  version: string;
  title: string;
  releaseDate: string;
  description: string;
  isMajor?: boolean;
  newFeatures: string[];
  improvements: string[];
  fixes: string[];
}

export interface SavedGame {
  version: string;
  currentLevelIndex: number;
  highestUnlockedLevel: number;
  checkpointActivated: boolean;
  unlockedEndings: string[];
  readTerminalLogs: string[];
  collectedMemoryFragments?: string[];
  collectedArtifacts?: string[];
  memoryFragmentsCollected: string[];
  temporalArtifactsCollected: string[];
  timeTrialRecords?: Record<number, number>; // levelId -> bestTime
  completedChallenges: string[];
  secretUnlocked: boolean;
  lastSeenVersion?: string;
  timestamp: number;
}

