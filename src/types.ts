export type Direction = 'up' | 'down' | 'left' | 'right';

export type PlayerAction = 'none' | 'interact' | 'push' | 'activate';

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
  | 'laser_barrier';

export interface PuzzleObject {
  id: string;
  type: PuzzleObjectType;
  x: number; // grid or world coordinate
  y: number;
  width: number;
  height: number;
  state: boolean | number | string; // e.g. isOpen, isPressed, etc.
  colorKey?: 'cyan' | 'amber' | 'emerald' | 'magenta' | 'red' | 'blue';
  linkedIds?: string[];
  timerDuration?: number;
  timeRemaining?: number;
  persistent?: boolean;
  label?: string;
  text?: string;
  logId?: string;
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

export interface StoryLog {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string[];
  isClassified?: boolean;
  revealsSecret?: boolean;
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
  hints?: LevelHint[];
  ambientColor?: string;
  maxRecommendedEchoes?: number;
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

export interface SavedGame {
  currentLevelIndex: number;
  highestUnlockedLevel: number;
  checkpointActivated: boolean;
  unlockedEndings: string[];
  readTerminalLogs: string[];
  secretUnlocked: boolean;
  timestamp: number;
}
