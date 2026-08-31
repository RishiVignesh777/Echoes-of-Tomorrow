import { Direction, Echo, LevelData, PlayerAction, PuzzleObject, RecordedFrame } from '../types';
import { tryPushCrate } from './physics';

const MAX_ECHOES = 8;
const ECHO_HUES = [185, 260, 140, 310, 45, 200, 280, 160]; // Distinct vivid holographic hues

export class TimelineRecorder {
  private currentFrames: RecordedFrame[] = [];
  private echoes: Echo[] = [];
  private timelineCount: number = 0;

  public resetAll() {
    this.currentFrames = [];
    this.echoes = [];
    this.timelineCount = 0;
  }

  public recordFrame(
    timeMs: number,
    x: number,
    y: number,
    dir: Direction,
    isMoving: boolean,
    action: PlayerAction = 'none',
    targetId?: string,
    isHiding?: boolean
  ) {
    this.currentFrames.push({
      timestamp: timeMs,
      x,
      y,
      dir,
      isMoving,
      action,
      targetId,
      isHiding: !!isHiding,
    });
  }

  public finalizeTimelineAndSpawnEcho(): Echo | null {
    if (this.currentFrames.length === 0) return null;

    this.timelineCount++;
    const hue = ECHO_HUES[(this.timelineCount - 1) % ECHO_HUES.length];

    const newEcho: Echo = {
      id: `echo_${this.timelineCount}_${Date.now()}`,
      timelineIndex: this.timelineCount,
      hue,
      frames: [...this.currentFrames],
      x: this.currentFrames[0].x,
      y: this.currentFrames[0].y,
      dir: this.currentFrames[0].dir,
      isMoving: false,
      isHiding: false,
      active: true,
      opacity: 0.75,
    };

    // Add new Echo
    this.echoes.push(newEcho);

    // Enforce 8 Echo limit - automatically remove oldest echo if > 8
    if (this.echoes.length > MAX_ECHOES) {
      this.echoes.shift();
    }

    // Reset current frames for new timeline
    this.currentFrames = [];

    return newEcho;
  }

  public restartTimelinePlayback() {
    this.currentFrames = [];
    for (const echo of this.echoes) {
      if (echo.frames.length > 0) {
        echo.x = echo.frames[0].x;
        echo.y = echo.frames[0].y;
        echo.dir = echo.frames[0].dir;
        echo.isMoving = false;
        echo.isHiding = false;
        echo.active = true;
      }
    }
  }

  public updateEchoes(
    currentTimelineMs: number,
    level: LevelData,
    objects: PuzzleObject[],
    onSoundTrigger?: (sound: string) => void
  ) {
    for (const echo of this.echoes) {
      if (!echo.active || echo.frames.length === 0) continue;

      // Find recorded frame corresponding to current timeline time
      // Search for the closest frame or linearly interpolate between adjacent frames
      const frames = echo.frames;
      let frameIdx = 0;
      while (frameIdx < frames.length - 1 && frames[frameIdx + 1].timestamp <= currentTimelineMs) {
        frameIdx++;
      }

      const curFrame = frames[frameIdx];
      const nextFrame = frames[frameIdx + 1];

      if (curFrame) {
        if (nextFrame && nextFrame.timestamp > curFrame.timestamp) {
          const t = Math.max(
            0,
            Math.min(1, (currentTimelineMs - curFrame.timestamp) / (nextFrame.timestamp - curFrame.timestamp))
          );
          echo.x = curFrame.x + (nextFrame.x - curFrame.x) * t;
          echo.y = curFrame.y + (nextFrame.y - curFrame.y) * t;
          echo.dir = curFrame.dir;
          echo.isMoving = curFrame.isMoving;
          echo.isHiding = curFrame.isHiding;
        } else {
          echo.x = curFrame.x;
          echo.y = curFrame.y;
          echo.dir = curFrame.dir;
          echo.isMoving = curFrame.isMoving;
          echo.isHiding = curFrame.isHiding;
        }

        // Execute recorded interaction action if triggered at this timestamp
        if (curFrame.action !== 'none' && echo.lastAction !== curFrame.action) {
          echo.lastAction = curFrame.action;
          this.executeEchoAction(echo, curFrame, level, objects, onSoundTrigger);
        } else if (curFrame.action === 'none') {
          echo.lastAction = 'none';
        }
      }
    }
  }

  private executeEchoAction(
    echo: Echo,
    frame: RecordedFrame,
    level: LevelData,
    objects: PuzzleObject[],
    onSoundTrigger?: (sound: string) => void
  ) {
    // Find nearby interactive object
    for (const obj of objects) {
      const dist = Math.hypot(obj.x + obj.width / 2 - (echo.x + 0.35), obj.y + obj.height / 2 - (echo.y + 0.35));
      if (dist <= 1.5) {
        if (obj.type === 'button' || obj.type === 'timed_switch' || obj.type === 'water_pump' || obj.type === 'distraction_machine') {
          if (obj.type === 'timed_switch') {
            obj.state = true;
            obj.timeRemaining = obj.timerDuration || 10;
            onSoundTrigger?.('button_click');
          } else if (obj.type === 'button') {
            obj.state = !obj.state;
            onSoundTrigger?.('button_click');
          } else if (obj.type === 'water_pump') {
            obj.state = !obj.state;
            onSoundTrigger?.('button_click');
          } else if (obj.type === 'distraction_machine') {
            obj.state = true;
            onSoundTrigger?.('alarm_distraction');
          }
        } else if (obj.type === 'crate' && frame.action === 'push') {
          let dx = 0;
          let dy = 0;
          if (echo.dir === 'left') dx = -1;
          if (echo.dir === 'right') dx = 1;
          if (echo.dir === 'up') dy = -1;
          if (echo.dir === 'down') dy = 1;
          if (tryPushCrate(obj, dx, dy, level, objects)) {
            onSoundTrigger?.('crate_push');
          }
        }
      }
    }
  }

  public getEchoes(): Echo[] {
    return this.echoes;
  }

  public getTimelineCount(): number {
    return this.timelineCount;
  }

  public removeOldestEcho(): boolean {
    if (this.echoes.length > 0) {
      this.echoes.shift();
      return true;
    }
    return false;
  }
}
