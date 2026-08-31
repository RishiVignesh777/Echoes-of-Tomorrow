import React, { useEffect, useRef, useState } from 'react';
import { Direction, Echo, GameSettings, LevelData, ParadoxEnemy, PlayerAction, PuzzleObject, StoryLog } from '../types';
import { LEVELS } from '../data/levels';
import { STORY_LOGS } from '../data/story';
import { GameRenderer } from '../engine/renderer';
import { TimelineRecorder } from '../engine/recorder';
import { isPositionSolid, tryPushCrate, updateParadoxAI, updatePuzzleObjects, TILE_SIZE } from '../engine/physics';
import { soundManager } from '../audio/soundManager';
import { HUD } from './HUD';

interface GameCanvasProps {
  currentLevelIndex: number;
  settings: GameSettings;
  onLevelComplete: (nextLevelIndex: number) => void;
  onGameOverEnding: (endingType: 'A' | 'B' | 'C') => void;
  onOpenTerminal: (log: StoryLog) => void;
  onPauseGame: () => void;
  onCheckpointReached: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentLevelIndex,
  settings,
  onLevelComplete,
  onGameOverEnding,
  onOpenTerminal,
  onPauseGame,
  onCheckpointReached,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Engine systems
  const rendererRef = useRef<GameRenderer>(new GameRenderer());
  const recorderRef = useRef<TimelineRecorder>(new TimelineRecorder());

  // Level & Game State
  const [level, setLevel] = useState<LevelData>(LEVELS[currentLevelIndex]);
  const [timeRemaining, setTimeRemaining] = useState<number>(30.0);
  const [echoCount, setEchoCount] = useState<number>(0);
  const [timelineIndex, setTimelineIndex] = useState<number>(0);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [paradoxAlert, setParadoxAlert] = useState<boolean>(false);
  const [isDead, setIsDead] = useState<boolean>(false);

  // Mutable Game Loop State
  const stateRef = useRef({
    player: {
      x: LEVELS[currentLevelIndex].playerSpawn.x,
      y: LEVELS[currentLevelIndex].playerSpawn.y,
      width: 0.7,
      height: 0.7,
      dir: LEVELS[currentLevelIndex].playerSpawn.dir,
      isMoving: false,
      isHiding: false,
      walkFrame: 0,
      speed: 4.2,
      activeLockerId: null as string | null,
    },
    objects: JSON.parse(JSON.stringify(LEVELS[currentLevelIndex].objects)) as PuzzleObject[],
    paradoxEnemies: (LEVELS[currentLevelIndex].paradoxSpawns || []).map((p) => ({
      id: p.id,
      x: p.spawnX,
      y: p.spawnY,
      spawnX: p.spawnX,
      spawnY: p.spawnY,
      targetX: p.spawnX,
      targetY: p.spawnY,
      patrolNodes: p.patrolNodes,
      currentNodeIdx: 0,
      state: 'patrol' as const,
      dir: 'down' as Direction,
      alertLevel: 0,
      speed: p.speed || 1.1,
      investigateTimer: 0,
      animFrame: 0,
      phaseGlitch: 0,
    })),
    camera: { x: 0, y: 0 },
    keys: {} as Record<string, boolean>,
    timeRemaining: 30.0,
    timelineElapsedMs: 0,
    isResetting: false,
    resetFlash: 0,
    deathTimer: 0,
    screenShake: 0,
    playerHeatmap: {} as Record<string, number>,
    lastHeatmapSample: 0,
    hasCheckpoint: false,
  });

  // Show quick toast banner
  const triggerNotification = (text: string, durationMs: number = 2500) => {
    setNotification(text);
    setTimeout(() => setNotification(null), durationMs);
  };

  // Initialize level
  useEffect(() => {
    const curLevel = LEVELS[currentLevelIndex];
    setLevel(curLevel);
    recorderRef.current.resetAll();

    // Reset runtime state
    stateRef.current.player.x = curLevel.playerSpawn.x;
    stateRef.current.player.y = curLevel.playerSpawn.y;
    stateRef.current.player.dir = curLevel.playerSpawn.dir;
    stateRef.current.player.isHiding = false;
    stateRef.current.player.activeLockerId = null;

    stateRef.current.objects = JSON.parse(JSON.stringify(curLevel.objects));
    stateRef.current.paradoxEnemies = (curLevel.paradoxSpawns || []).map((p) => ({
      id: p.id,
      x: p.spawnX,
      y: p.spawnY,
      spawnX: p.spawnX,
      spawnY: p.spawnY,
      targetX: p.spawnX,
      targetY: p.spawnY,
      patrolNodes: p.patrolNodes,
      currentNodeIdx: 0,
      state: 'patrol' as const,
      dir: 'down' as Direction,
      alertLevel: 0,
      speed: p.speed || 1.1,
      investigateTimer: 0,
      animFrame: 0,
      phaseGlitch: 0,
    }));

    stateRef.current.timeRemaining = 30.0;
    stateRef.current.timelineElapsedMs = 0;
    stateRef.current.isResetting = false;
    stateRef.current.deathTimer = 0;
    stateRef.current.hasCheckpoint = false;
    setIsDead(false);
    setTimeRemaining(30.0);
    setEchoCount(0);
    setTimelineIndex(0);

    triggerNotification(`ENTERED ${curLevel.title}`);
  }, [currentLevelIndex]);

  // Execute Timeline Reset (when time expires or manual R pressed)
  const performTimelineReset = () => {
    const s = stateRef.current;
    if (s.isResetting) return;

    s.isResetting = true;
    setIsResetting(true);
    soundManager.playTimelineReset();

    if (settings.screenShake) {
      s.screenShake = 12;
    }

    // 1. Finalize and store current recording into a new Echo
    const newEcho = recorderRef.current.finalizeTimelineAndSpawnEcho();
    const echoes = recorderRef.current.getEchoes();
    setEchoCount(echoes.length);
    setTimelineIndex(recorderRef.current.getTimelineCount());

    if (newEcho) {
      soundManager.playEchoSpawn();
      triggerNotification(`ECHO #${newEcho.timelineIndex} MANIFESTED`);
    }

    // 2. Animate reset glitch over 0.8s
    s.resetFlash = 1.0;

    setTimeout(() => {
      // 3. Reset player position
      const curLevel = LEVELS[currentLevelIndex];
      const spawn = s.hasCheckpoint && curLevel.checkpointSpawn ? curLevel.checkpointSpawn : curLevel.playerSpawn;
      s.player.x = spawn.x;
      s.player.y = spawn.y;
      s.player.dir = spawn.dir;
      s.player.isHiding = false;
      s.player.activeLockerId = null;

      // 4. Reset temporary objects (crates, switches, plates)
      const baseObjects = JSON.parse(JSON.stringify(curLevel.objects)) as PuzzleObject[];
      s.objects = baseObjects.map((obj) => {
        // preserve persistent checkpoints
        const prev = s.objects.find((o) => o.id === obj.id);
        if (obj.persistent && prev) {
          obj.state = prev.state;
        }
        return obj;
      });

      // 5. Reset Paradox positions
      s.paradoxEnemies.forEach((p) => {
        p.x = p.spawnX;
        p.y = p.spawnY;
        p.state = 'patrol';
        p.alertLevel = 0;
      });

      // 6. Reset Echo playback clocks
      recorderRef.current.restartTimelinePlayback();

      // 7. Reset timeline clock
      s.timeRemaining = 30.0;
      s.timelineElapsedMs = 0;
      s.isResetting = false;
      s.resetFlash = 0;
      setIsResetting(false);
      setTimeRemaining(30.0);
    }, 800);
  };

  // Player Death Trigger
  const handlePlayerDeath = () => {
    const s = stateRef.current;
    if (s.deathTimer > 0 || isDead) return;

    soundManager.playPlayerDeath();
    s.deathTimer = 1.8;
    setIsDead(true);
    if (settings.screenShake) {
      s.screenShake = 16;
    }

    setTimeout(() => {
      // Respawn at checkpoint or room start
      performTimelineReset();
      setIsDead(false);
      s.deathTimer = 0;
    }, 1800);
  };

  // Keyboard Input Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = true;

      // ESC for Pause
      if (e.key === 'Escape') {
        onPauseGame();
      }

      // R for Manual Rewind
      if (e.key === 'r' || e.key === 'R') {
        performTimelineReset();
      }

      // E or Space for Interaction
      if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
        handleInteract();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentLevelIndex]);

  // Handle Player Interaction
  const handleInteract = () => {
    const s = stateRef.current;
    const px = s.player.x + 0.35;
    const py = s.player.y + 0.35;

    // 1. If hiding, exit locker
    if (s.player.isHiding) {
      s.player.isHiding = false;
      s.player.activeLockerId = null;
      soundManager.playDoorMove(true);
      triggerNotification('EXITED LOCKER');
      return;
    }

    // 2. Check nearby puzzle objects
    for (const obj of s.objects) {
      const objCenterX = obj.x + obj.width / 2;
      const objCenterY = obj.y + obj.height / 2;
      const dist = Math.hypot(objCenterX - px, objCenterY - py);

      if (dist <= 1.4) {
        // Read Terminal
        if (obj.type === 'terminal' && obj.logId) {
          const log = STORY_LOGS[obj.logId];
          if (log) {
            onOpenTerminal(log);
            return;
          }
        }

        // Hide in Locker
        if (obj.type === 'hiding_locker') {
          s.player.isHiding = true;
          s.player.activeLockerId = obj.id;
          soundManager.playDoorMove(false);
          triggerNotification('CONCEALED IN LOCKER');
          recorderRef.current.recordFrame(
            s.timelineElapsedMs,
            s.player.x,
            s.player.y,
            s.player.dir,
            false,
            'interact',
            obj.id,
            true
          );
          return;
        }

        // Flip Timed Switch / Button / Water Pump
        if (obj.type === 'timed_switch' || obj.type === 'button' || obj.type === 'water_pump') {
          if (obj.type === 'timed_switch') {
            obj.state = true;
            obj.timeRemaining = obj.timerDuration || 10;
          } else {
            obj.state = !obj.state;
          }
          soundManager.playButtonClick();
          recorderRef.current.recordFrame(
            s.timelineElapsedMs,
            s.player.x,
            s.player.y,
            s.player.dir,
            false,
            'interact',
            obj.id
          );
          return;
        }

        // Trigger Distraction Alarm
        if (obj.type === 'distraction_machine') {
          obj.state = true;
          soundManager.playAlarmDistraction();
          triggerNotification('ALARM KLAXON ACTIVE! PARADOX DISTRACTED');
          recorderRef.current.recordFrame(
            s.timelineElapsedMs,
            s.player.x,
            s.player.y,
            s.player.dir,
            false,
            'interact',
            obj.id
          );
          return;
        }

        // Final Omega Core Interaction (Level 6 Endings!)
        if (obj.type === 'temporal_core') {
          // Check if secret resonance consoles are all active
          const secretConsoles = s.objects.filter((o) => o.type === 'secret_console');
          const allSecretsHeld = secretConsoles.length > 0 && secretConsoles.every((c) => !!c.state);

          if (allSecretsHeld) {
            // Secret Ending C: Break the Loop!
            soundManager.playSecretUnlocked();
            onGameOverEnding('C');
          } else {
            // Standard Escape Ending A
            soundManager.playVictory();
            onGameOverEnding('A');
          }
          return;
        }
      }
    }
  };

  // Main Canvas Render & Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const s = stateRef.current;
      const curLevel = LEVELS[currentLevelIndex];

      // 1. Update Countdown & Timeline Clock
      if (!s.isResetting && s.deathTimer <= 0) {
        s.timeRemaining -= dt;
        s.timelineElapsedMs += dt * 1000;
        setTimeRemaining(Math.max(0, s.timeRemaining));

        // Audio intensity update
        if (s.paradoxEnemies.some((p) => p.state === 'chasing')) {
          soundManager.setMusicIntensity('danger');
          setParadoxAlert(true);
        } else if (s.timeRemaining <= 8) {
          soundManager.setMusicIntensity('urgent');
          setParadoxAlert(false);
        } else {
          soundManager.setMusicIntensity('calm');
          setParadoxAlert(false);
        }

        if (s.timeRemaining <= 0) {
          performTimelineReset();
        }
      }

      // 2. Update Player Movement (if not dead or resetting or hiding)
      if (!s.isResetting && s.deathTimer <= 0 && !s.player.isHiding) {
        let dx = 0;
        let dy = 0;

        if (s.keys['w'] || s.keys['arrowup']) dy -= 1;
        if (s.keys['s'] || s.keys['arrowdown']) dy += 1;
        if (s.keys['a'] || s.keys['arrowleft']) dx -= 1;
        if (s.keys['d'] || s.keys['arrowright']) dx += 1;

        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        const isMoving = dx !== 0 || dy !== 0;
        s.player.isMoving = isMoving;

        if (isMoving) {
          s.player.walkFrame += dt;
          if (Math.abs(dx) > Math.abs(dy)) {
            s.player.dir = dx > 0 ? 'right' : 'left';
          } else {
            s.player.dir = dy > 0 ? 'down' : 'up';
          }

          // Step sound
          if (Math.floor(s.player.walkFrame * 6) % 2 === 0 && Math.random() < 0.15) {
            soundManager.playFootstep();
          }

          const moveStep = s.player.speed * dt;
          const newX = s.player.x + dx * moveStep;
          const newY = s.player.y + dy * moveStep;

          // Push Crates if collided
          let pushedCrate = false;
          for (const obj of s.objects) {
            if (obj.type === 'crate') {
              const pBox = { x: newX, y: newY, width: s.player.width, height: s.player.height };
              const cBox = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
              if (
                pBox.x < cBox.x + cBox.width &&
                pBox.x + pBox.width > cBox.x &&
                pBox.y < cBox.y + cBox.height &&
                pBox.y + pBox.height > cBox.y
              ) {
                const pushDx = dx > 0 ? 1 : dx < 0 ? -1 : 0;
                const pushDy = dy > 0 ? 1 : dy < 0 ? -1 : 0;
                if (tryPushCrate(obj, pushDx, pushDy, curLevel, s.objects)) {
                  soundManager.playCratePush();
                  pushedCrate = true;
                  recorderRef.current.recordFrame(
                    s.timelineElapsedMs,
                    s.player.x,
                    s.player.y,
                    s.player.dir,
                    true,
                    'push',
                    obj.id
                  );
                }
              }
            }
          }

          // Move along X if collision is free
          if (!isPositionSolid(newX, s.player.y, s.player.width, s.player.height, curLevel, s.objects)) {
            s.player.x = newX;
          }
          // Move along Y if collision is free
          if (!isPositionSolid(s.player.x, newY, s.player.width, s.player.height, curLevel, s.objects)) {
            s.player.y = newY;
          }

          // Record player trajectory frame for Echo replay
          recorderRef.current.recordFrame(
            s.timelineElapsedMs,
            s.player.x,
            s.player.y,
            s.player.dir,
            isMoving,
            pushedCrate ? 'push' : 'none'
          );

          // Update player route memory heatmap for Paradox AI
          if (currentTime - s.lastHeatmapSample > 400) {
            s.lastHeatmapSample = currentTime;
            const tileKey = `${Math.floor(s.player.x)},${Math.floor(s.player.y)}`;
            s.playerHeatmap[tileKey] = (s.playerHeatmap[tileKey] || 0) + 1;
          }
        }
      }

      // 3. Update Echoes Replay Engine
      if (!s.isResetting) {
        recorderRef.current.updateEchoes(
          s.timelineElapsedMs,
          curLevel,
          s.objects,
          (sound) => {
            if (sound === 'plate_down') soundManager.playPlateDown();
            if (sound === 'plate_up') soundManager.playPlateUp();
            if (sound === 'button_click') soundManager.playButtonClick();
            if (sound === 'crate_push') soundManager.playCratePush();
            if (sound === 'alarm_distraction') soundManager.playAlarmDistraction();
          }
        );
      }

      // 4. Update Puzzle Mechanisms (Platforms, Plates, Doors, Laser, Water, Electricity)
      updatePuzzleObjects(
        s.objects,
        s.player,
        recorderRef.current.getEchoes(),
        dt,
        (sound) => {
          if (sound === 'plate_down') soundManager.playPlateDown();
          if (sound === 'plate_up') soundManager.playPlateUp();
          if (sound === 'door_open') soundManager.playDoorMove(true);
        }
      );

      // Check if player stepped on active electric hazard
      for (const obj of s.objects) {
        if (obj.type === 'electric_hazard' && obj.state) {
          const pBox = { x: s.player.x, y: s.player.y, width: s.player.width, height: s.player.height };
          const hBox = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
          if (
            pBox.x < hBox.x + hBox.width &&
            pBox.x + pBox.width > hBox.x &&
            pBox.y < hBox.y + hBox.height &&
            pBox.y + pBox.height > hBox.y
          ) {
            handlePlayerDeath();
          }
        }
      }

      // 5. Update Paradox AI
      for (const paradox of s.paradoxEnemies) {
        const caught = updateParadoxAI(
          paradox,
          s.player,
          curLevel,
          s.objects,
          dt,
          s.playerHeatmap,
          () => {
            soundManager.playParadoxAlert();
            triggerNotification('WARNING: PARADOX SPOTTED YOU!');
          }
        );

        if (caught && s.deathTimer <= 0) {
          handlePlayerDeath();
        }
      }

      // 6. Check Checkpoints and Exit Portal
      for (const obj of s.objects) {
        const pBox = { x: s.player.x, y: s.player.y, width: s.player.width, height: s.player.height };
        const oBox = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };

        if (
          pBox.x < oBox.x + oBox.width &&
          pBox.x + pBox.width > oBox.x &&
          pBox.y < oBox.y + oBox.height &&
          pBox.y + pBox.height > oBox.y
        ) {
          if (obj.type === 'checkpoint' && !obj.state) {
            obj.state = true;
            s.hasCheckpoint = true;
            soundManager.playCheckpoint();
            triggerNotification('CHECKPOINT ACTIVATED');
            onCheckpointReached();
          }

          if (obj.type === 'exit_portal' && obj.state) {
            soundManager.playVictory();
            onLevelComplete(currentLevelIndex + 1);
            return;
          }
        }
      }

      // 7. Update Camera (Smooth tracking target)
      const targetCamX = (s.player.x + 0.35) * TILE_SIZE;
      const targetCamY = (s.player.y + 0.35) * TILE_SIZE;
      s.camera.x += (targetCamX - s.camera.x) * 0.12;
      s.camera.y += (targetCamY - s.camera.y) * 0.12;

      // Apply screen shake
      if (s.screenShake > 0) {
        s.camera.x += (Math.random() * 2 - 1) * s.screenShake;
        s.camera.y += (Math.random() * 2 - 1) * s.screenShake;
        s.screenShake = Math.max(0, s.screenShake - dt * 25);
      }

      // 8. Render Scene to Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          rendererRef.current.updateParticles(dt);
          rendererRef.current.render(
            ctx,
            canvas.width,
            canvas.height,
            curLevel,
            s.player,
            recorderRef.current.getEchoes(),
            s.paradoxEnemies,
            s.objects,
            s.camera,
            settings,
            s.resetFlash,
            s.deathTimer
          );
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentLevelIndex, settings, isDead]);

  // Handle ResizeObserver for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-neutral-950 flex items-center justify-center overflow-hidden select-none"
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {/* Retro CRT scanlines overlay */}
      {settings.crtEffects && <div className="absolute inset-0 crt-overlay pointer-events-none" />}
      <div className="absolute inset-0 crt-vignette pointer-events-none" />

      {/* In-Game HUD */}
      <HUD
        level={level}
        timeRemaining={timeRemaining}
        totalTime={30.0}
        echoCount={echoCount}
        maxEchoes={level.maxRecommendedEchoes || 8}
        currentTimelineIndex={timelineIndex}
        isResetting={isResetting}
        notification={notification}
        paradoxAlert={paradoxAlert}
        onManualReset={performTimelineReset}
        onPause={onPauseGame}
      />

      {/* Death Overlay Message */}
      {isDead && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-950/80 backdrop-blur-sm animate-fade-in font-mono-tech select-none">
          <h2 className="text-2xl sm:text-3xl font-pixel font-bold text-red-400 tracking-wider mb-2 animate-glitch">
            TIMELINE TERMINATED
          </h2>
          <p className="text-sm text-neutral-300 mb-6">Restoring latest temporal checkpoint...</p>
          <div className="px-5 py-2 bg-neutral-900 border border-red-500 rounded-lg text-xs text-red-300 font-bold uppercase tracking-widest animate-pulse">
            RESTARTING EXPERIMENT
          </div>
        </div>
      )}
    </div>
  );
};
