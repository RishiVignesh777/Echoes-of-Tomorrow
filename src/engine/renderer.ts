import { Direction, Echo, GameSettings, LevelData, ParadoxEnemy, PuzzleObject, TileType, ObserverEntity } from '../types';
import { TILE_SIZE } from './physics';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class GameRenderer {
  private particles: Particle[] = [];
  private ambientTime: number = 0;

  public addParticle(x: number, y: number, color: string, count: number = 5, speed: number = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.8 + 0.2) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1.0,
        maxLife: Math.random() * 0.6 + 0.4,
        color,
        size: Math.random() * 2.5 + 1.5,
      });
    }
  }

  public updateParticles(deltaTime: number) {
    this.ambientTime += deltaTime;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= deltaTime / p.maxLife;
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    level: LevelData,
    player: { x: number; y: number; dir: Direction; isMoving: boolean; isHiding: boolean; walkFrame: number },
    echoes: Echo[],
    paradoxEnemies: ParadoxEnemy[],
    objects: PuzzleObject[],
    camera: { x: number; y: number; rotation?: number },
    settings: GameSettings,
    resetFlash: number = 0,
    deathTimer: number = 0,
    currentRoomState: 'A' | 'B' | 'C' = 'A',
    observerEntity: ObserverEntity | null = null
  ) {
    ctx.save();

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Apply Camera translation and volatile rotation tilt
    ctx.save();
    ctx.translate(Math.round(canvasWidth / 2), Math.round(canvasHeight / 2));
    if (camera.rotation) {
      ctx.rotate(camera.rotation);
    }
    ctx.translate(Math.round(-camera.x), Math.round(-camera.y));

    // 1. Draw Tiles
    this.drawTilemap(ctx, level, currentRoomState);

    // 2. Draw Level Hints (floor markings & holographic text)
    this.drawLevelHints(ctx, level);

    // 3. Draw Puzzle Objects (Floor layer: plates, water, hazard, pods)
    this.drawPuzzleObjectsFloor(ctx, objects, currentRoomState);

    // 4. Draw Echoes (Floor trails / shadows)
    for (const echo of echoes) {
      if (echo.active && !echo.isHiding) {
        this.drawEcho(ctx, echo, settings);
      }
    }

    // 5. Draw Observer Entity if present in chamber
    if (observerEntity && !observerEntity.vanished) {
      this.drawObserver(ctx, observerEntity);
    }

    // 6. Draw Player (if not hiding)
    if (!player.isHiding) {
      this.drawPlayer(ctx, player);
    } else {
      // Small hiding indicator
      ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.font = '10px "Share Tech Mono"';
      ctx.fillText('[HIDING]', (player.x + 0.1) * TILE_SIZE, (player.y - 0.2) * TILE_SIZE);
    }

    // 7. Draw Paradox Enemies
    for (const paradox of paradoxEnemies) {
      this.drawParadox(ctx, paradox, settings);
    }

    // 8. Draw Puzzle Objects (Over layer: crates, doors, terminals, lasers, core, decoys, collectibles)
    this.drawPuzzleObjectsTop(ctx, objects, currentRoomState);

    // 9. Draw Particle Systems
    this.drawParticles(ctx);

    // 10. Draw Dynamic Atmospheric Sci-Fi Lighting
    if (!settings.reducedFX) {
      this.drawLightingMask(ctx, level, player, echoes, paradoxEnemies, objects);
    }

    ctx.restore(); // Restore camera translation

    // 11. Post-processing FX (Reset Glitch Flash, Death Screen Overlay, CRT Vignette)
    if (resetFlash > 0) {
      this.drawResetGlitch(ctx, canvasWidth, canvasHeight, resetFlash);
    }

    if (deathTimer > 0) {
      ctx.fillStyle = `rgba(220, 38, 38, ${Math.min(0.6, deathTimer * 0.4)})`;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    ctx.restore();
  }

  private drawObserver(ctx: CanvasRenderingContext2D, observer: ObserverEntity) {
    const ox = observer.x * TILE_SIZE;
    const oy = observer.y * TILE_SIZE;
    const time = this.ambientTime;

    ctx.save();
    // Spectral shimmer
    const glitchX = Math.sin(time * 20 + observer.glitchPhase) * 2;
    ctx.globalAlpha = observer.vanishTimer > 0 ? Math.max(0, observer.vanishTimer / 0.6) : 0.85;

    // Dark mysterious silhouette
    ctx.fillStyle = '#020617';
    ctx.fillRect(ox + 5 + glitchX, oy + 4, 14, 20);

    // Glowing cyan/violet dual visor
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(ox + 7 + glitchX, oy + 7, 10, 3);
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(ox + 9 + glitchX, oy + 8, 6, 1);

    // Floating label
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 8px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('???', ox + 12, oy - 4);

    ctx.restore();
  }

  private drawTilemap(ctx: CanvasRenderingContext2D, level: LevelData, roomState: 'A' | 'B' | 'C' = 'A') {
    const time = this.ambientTime;
    let tiles = level.tiles;
    if (roomState === 'B' && level.stateTiles?.B) {
      tiles = level.stateTiles.B;
    } else if (roomState === 'C' && level.stateTiles?.C) {
      tiles = level.stateTiles.C;
    }

    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        const tile = tiles[y]?.[x] ?? TileType.EMPTY;
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if (tile === TileType.FLOOR) {
          // Dark metallic sci-fi floor
          ctx.fillStyle = (x + y) % 2 === 0 ? '#111827' : '#0f172a';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          // Subtle grid seam
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
          // Corner rivets
          ctx.fillStyle = '#334155';
          ctx.fillRect(px + 2, py + 2, 2, 2);
          ctx.fillRect(px + TILE_SIZE - 4, py + 2, 2, 2);
          ctx.fillRect(px + 2, py + TILE_SIZE - 4, 2, 2);
          ctx.fillRect(px + TILE_SIZE - 4, py + TILE_SIZE - 4, 2, 2);
        } else if (tile === TileType.ACCENT_FLOOR) {
          // Teal-tinted laboratory grid
          ctx.fillStyle = '#0f2937';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#155e75';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(px + TILE_SIZE / 2 - 1, py + TILE_SIZE / 2 - 1, 2, 2);
        } else if (tile === TileType.ABANDONED_FLOOR) {
          // Mossy cracked derelict floor
          ctx.fillStyle = '#141e1b';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#065f46';
          ctx.fillRect(px + 4, py + 6, 8, 4);
          ctx.fillRect(px + 14, py + 18, 10, 5);
          ctx.strokeStyle = '#2d3748';
          ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        } else if (tile === TileType.PHASE_BRIDGE) {
          // Shimmering quantum phase bridge
          const bridgePulse = 0.5 + Math.sin(time * 6 + x) * 0.3;
          ctx.fillStyle = `rgba(168, 85, 247, ${bridgePulse})`;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        } else if (tile === TileType.WALL) {
          // Heavy reinforced metal wall block
          ctx.fillStyle = roomState === 'C' ? '#1c1917' : '#1e293b';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

          // Top highlight bevel
          ctx.fillStyle = '#334155';
          ctx.fillRect(px, py, TILE_SIZE, 4);

          // Front shadow
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px, py + TILE_SIZE - 6, TILE_SIZE, 6);

          // Border seam
          ctx.strokeStyle = '#090d16';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

          // Glowing energy conduit strip on wall
          if ((x + y) % 4 === 0) {
            ctx.fillStyle = roomState === 'B' ? '#ef4444' : '#06b6d4';
            ctx.fillRect(px + 6, py + 10, TILE_SIZE - 12, 3);
          }
        } else if (tile === TileType.PIT) {
          // Deep abyss pit
          ctx.fillStyle = '#020617';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          // Dark gradient edges
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px, py, TILE_SIZE, 2);
          ctx.fillRect(px, py, 2, TILE_SIZE);
        } else if (tile === TileType.WATER) {
          // Flooded laboratory water with animated ripples
          ctx.fillStyle = '#082f49';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
          const waveOff = Math.sin(time * 3 + x * 0.5 + y * 0.5) * 4;
          ctx.fillRect(px + 2, py + 8 + waveOff, TILE_SIZE - 4, 3);
        } else if (tile === TileType.HAZARD_STRIPE) {
          // Yellow and black hazard warning floor
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#0f172a';
          for (let s = 0; s < 4; s++) {
            ctx.beginPath();
            ctx.moveTo(px + s * 10, py);
            ctx.lineTo(px + s * 10 + 6, py);
            ctx.lineTo(px + s * 10 - 2, py + TILE_SIZE);
            ctx.lineTo(px + s * 10 - 8, py + TILE_SIZE);
            ctx.fill();
          }
        }
      }
    }
  }

  private drawLevelHints(ctx: CanvasRenderingContext2D, level: LevelData) {
    if (!level.hints) return;

    for (const hint of level.hints) {
      const hx = hint.x * TILE_SIZE;
      const hy = hint.y * TILE_SIZE;

      ctx.save();
      ctx.fillStyle = 'rgba(45, 212, 191, 0.85)';
      ctx.font = 'bold 10px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';

      // Subtle floating bobbing effect
      const bob = Math.sin(this.ambientTime * 2 + hint.x) * 2;
      ctx.fillText(hint.text, hx + TILE_SIZE / 2, hy - 4 + bob);

      if (hint.subtext) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.font = '8px "Share Tech Mono", monospace';
        ctx.fillText(hint.subtext, hx + TILE_SIZE / 2, hy + 8 + bob);
      }
      ctx.restore();
    }
  }

  private drawPuzzleObjectsFloor(ctx: CanvasRenderingContext2D, objects: PuzzleObject[], roomState: 'A' | 'B' | 'C' = 'A') {
    const time = this.ambientTime;

    for (const obj of objects) {
      if (obj.roomStateMask && !obj.roomStateMask.includes(roomState)) continue;

      const ox = obj.x * TILE_SIZE;
      const oy = obj.y * TILE_SIZE;
      const ow = obj.width * TILE_SIZE;
      const oh = obj.height * TILE_SIZE;

      if (obj.type === 'echo_transfer_pod') {
        // Quantum Echo Transfer Pad
        const isTarget = !!obj.state;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ox + 2, oy + 2, ow - 4, oh - 4);

        // Circular teleportation ring
        ctx.strokeStyle = isTarget ? '#22d3ee' : '#0284c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ox + ow / 2, oy + oh / 2, ow / 2 - 4, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing quantum core
        const pulse = 4 + Math.sin(time * 6) * 2;
        ctx.fillStyle = isTarget ? 'rgba(34, 211, 238, 0.7)' : 'rgba(2, 132, 199, 0.4)';
        ctx.beginPath();
        ctx.arc(ox + ow / 2, oy + oh / 2, pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#67e8f9';
        ctx.font = 'bold 7px "Share Tech Mono"';
        ctx.textAlign = 'center';
        ctx.fillText(obj.label || 'TRANSFER POD', ox + ow / 2, oy + oh + 8);
      } else if (obj.type === 'pressure_plate' || obj.type === 'secret_console') {
        const isSecret = obj.type === 'secret_console';
        const isPressed = !!obj.state;
        const color = isSecret ? '#d946ef' : obj.colorKey === 'emerald' ? '#10b981' : obj.colorKey === 'amber' ? '#f59e0b' : '#06b6d4';

        // Outer base plate
        ctx.fillStyle = isPressed ? '#1e293b' : '#334155';
        ctx.fillRect(ox + 3, oy + 3, ow - 6, oh - 6);

        // Inner glowing core
        ctx.fillStyle = isPressed ? color : '#475569';
        ctx.fillRect(ox + 7, oy + 7, ow - 14, oh - 14);

        // Neon border ring
        ctx.strokeStyle = color;
        ctx.lineWidth = isPressed ? 2.5 : 1;
        ctx.strokeRect(ox + 5, oy + 5, ow - 10, oh - 10);

        if (isPressed) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fillRect(ox + ow / 2 - 2, oy + oh / 2 - 2, 4, 4);
        }
      } else if (obj.type === 'water_zone') {
        const isFlooded = !!obj.state;
        if (isFlooded) {
          ctx.fillStyle = 'rgba(14, 116, 144, 0.85)';
          ctx.fillRect(ox, oy, ow, oh);
          // Animated ripples
          ctx.strokeStyle = 'rgba(103, 232, 249, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let wx = 0; wx < ow; wx += 24) {
            const rippleY = oy + 12 + Math.sin(time * 4 + wx * 0.2) * 4;
            ctx.moveTo(ox + wx, rippleY);
            ctx.lineTo(ox + wx + 16, rippleY);
          }
          ctx.stroke();
        } else {
          // Drained metallic basin floor
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(ox, oy, ow, oh);
          ctx.strokeStyle = '#1e293b';
          ctx.strokeRect(ox + 2, oy + 2, ow - 4, oh - 4);
          ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
          ctx.font = '9px "Share Tech Mono"';
          ctx.fillText('[DRAINED]', ox + 6, oy + 18);
        }
      } else if (obj.type === 'electric_hazard' || obj.type === 'steam_hazard') {
        const isLive = !!obj.state;
        if (isLive) {
          if (obj.type === 'steam_hazard') {
            ctx.fillStyle = 'rgba(241, 245, 249, 0.35)';
            ctx.fillRect(ox, oy, ow, oh);
            // Swirling steam puff particles
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            for (let s = 0; s < 3; s++) {
              const sx = ox + 4 + ((s * 10 + time * 15) % (ow - 8));
              const sy = oy + 6 + Math.sin(time * 5 + s) * 4;
              ctx.beginPath();
              ctx.arc(sx, sy, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
            ctx.fillRect(ox, oy, ow, oh);
            // High voltage lightning spark arcs
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ox + 4, oy + oh / 2);
            ctx.lineTo(ox + ow * 0.3, oy + oh / 2 + (Math.random() * 8 - 4));
            ctx.lineTo(ox + ow * 0.7, oy + oh / 2 + (Math.random() * 8 - 4));
            ctx.lineTo(ox + ow - 4, oy + oh / 2);
            ctx.stroke();
          }
        }
      } else if (obj.type === 'moving_platform') {
        // Platform base
        ctx.fillStyle = '#475569';
        ctx.fillRect(ox + 1, oy + 1, ow - 2, oh - 2);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(ox + 3, oy + 3, ow - 6, oh - 6);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(ox + 2, oy + 2, ow - 4, oh - 4);
      }
    }
  }

  private drawPuzzleObjectsTop(ctx: CanvasRenderingContext2D, objects: PuzzleObject[], roomState: 'A' | 'B' | 'C' = 'A') {
    const time = this.ambientTime;

    for (const obj of objects) {
      if (obj.roomStateMask && !obj.roomStateMask.includes(roomState)) continue;

      const ox = obj.x * TILE_SIZE;
      const oy = obj.y * TILE_SIZE;
      const ow = obj.width * TILE_SIZE;
      const oh = obj.height * TILE_SIZE;

      if (obj.type === 'door') {
        const isOpen = !!obj.state;
        const color = obj.colorKey === 'amber' ? '#f59e0b' : obj.colorKey === 'emerald' ? '#10b981' : obj.colorKey === 'purple' ? '#a855f7' : '#06b6d4';

        if (!isOpen) {
          // Closed blast door
          ctx.fillStyle = '#334155';
          ctx.fillRect(ox, oy, ow, oh);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(ox + 2, oy + 4, ow - 4, oh - 8);

          // Hydraulic warning light
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(ox + ow / 2 - 3, oy + 6, 6, 6);

          // Color accent stripes
          ctx.fillStyle = color;
          ctx.fillRect(ox + 4, oy + oh / 2 - 2, ow - 8, 4);
        } else {
          // Open door frames on sides
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(ox, oy, 4, oh);
          ctx.fillRect(ox + ow - 4, oy, 4, oh);

          // Green unlocked status light
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(ox + 1, oy + 2, 2, 2);
          ctx.fillRect(ox + ow - 3, oy + 2, 2, 2);
        }
      } else if (obj.type === 'crate') {
        // Heavy metallic cargo crate
        ctx.fillStyle = '#b45309';
        ctx.fillRect(ox + 2, oy + 2, ow - 4, oh - 4);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(ox + 4, oy + 4, ow - 8, oh - 8);

        // Cross braces & reinforced corner brackets
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.strokeRect(ox + 3, oy + 3, ow - 6, oh - 6);
        ctx.beginPath();
        ctx.moveTo(ox + 4, oy + 4);
        ctx.lineTo(ox + ow - 4, oy + oh - 4);
        ctx.moveTo(ox + ow - 4, oy + 4);
        ctx.lineTo(ox + 4, oy + oh - 4);
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(ox + ow / 2 - 3, oy + oh / 2 - 3, 6, 6);
      } else if (obj.type === 'laser_barrier') {
        const isActive = !!obj.state;
        if (isActive) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(ox, oy, ow, 4);
          ctx.fillRect(ox, oy + oh - 4, ow, 4);

          // Pulsing laser beam
          const laserAlpha = 0.7 + Math.sin(time * 12) * 0.3;
          ctx.fillStyle = `rgba(239, 68, 68, ${laserAlpha})`;
          ctx.fillRect(ox + 2, oy + 4, ow - 4, oh - 8);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(ox + ow / 2 - 1, oy + 4, 2, oh - 8);
        }
      } else if (obj.type === 'echo_transfer_console') {
        // Echo Transfer Station Console
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ox + 2, oy + 2, ow - 4, oh - 4);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(ox + 4, oy + 4, ow - 8, 6);

        // Holographic beam antenna
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(ox + ow / 2 - 1, oy - 4, 2, 6);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 7px "Share Tech Mono"';
        ctx.textAlign = 'center';
        ctx.fillText('TRANSFER [E]', ox + ow / 2, oy + oh + 7);
      } else if (obj.type === 'temporal_decoy') {
        // Temporal Decoy Machine
        const isPulsing = !!obj.state;
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(ox + 3, oy + 3, ow - 6, oh - 6);

        // Glowing radar hologram
        const decoyPulse = Math.sin(time * 8) * 3;
        ctx.fillStyle = isPulsing ? '#ec4899' : '#8b5cf6';
        ctx.beginPath();
        ctx.arc(ox + ow / 2, oy + oh / 2, 5 + (isPulsing ? decoyPulse : 0), 0, Math.PI * 2);
        ctx.fill();

        // Expanding sonar rings if active
        if (isPulsing) {
          const ringRad = ((time * 30) % 24) + 6;
          ctx.strokeStyle = `rgba(236, 72, 153, ${Math.max(0, 1 - ringRad / 30)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ox + ow / 2, oy + oh / 2, ringRad, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = '#f472b6';
        ctx.font = 'bold 7px "Share Tech Mono"';
        ctx.textAlign = 'center';
        ctx.fillText(obj.cooldownTimer && obj.cooldownTimer > 0 ? `${Math.ceil(obj.cooldownTimer)}s` : 'DECOY [E]', ox + ow / 2, oy - 3);
      } else if (obj.type === 'chrono_phase_shifter') {
        // Reality Phase Shifter Console
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(ox + 2, oy + 2, ow - 4, oh - 4);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.strokeRect(ox + 3, oy + 3, ow - 6, oh - 6);

        // Phase letter icon
        ctx.fillStyle = roomState === 'A' ? '#38bdf8' : roomState === 'B' ? '#ef4444' : '#10b981';
        ctx.font = 'bold 12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(roomState, ox + ow / 2, oy + oh / 2 + 5);

        ctx.fillStyle = '#c084fc';
        ctx.font = 'bold 7px "Share Tech Mono"';
        ctx.fillText('SHIFT [E]', ox + ow / 2, oy - 3);
      } else if (obj.type === 'memory_fragment') {
        // Collectible Memory Fragment (Spinning Crystal Shard)
        const isCollected = !!obj.state;
        if (!isCollected) {
          const floatY = Math.sin(time * 4) * 3;
          ctx.save();
          ctx.translate(ox + ow / 2, oy + oh / 2 + floatY);
          ctx.rotate(time * 2);

          // Glowing diamond shape
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.moveTo(0, -8);
          ctx.lineTo(6, 0);
          ctx.lineTo(0, 8);
          ctx.lineTo(-6, 0);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = '#67e8f9';
          ctx.font = 'bold 7px "Share Tech Mono"';
          ctx.textAlign = 'center';
          ctx.fillText('MEMORY', ox + ow / 2, oy - 4);
        }
      } else if (obj.type === 'temporal_artifact') {
        // Collectible Temporal Artifact (Golden Orbiting Gyro-Sphere)
        const isCollected = !!obj.state;
        if (!isCollected) {
          const floatY = Math.sin(time * 3) * 3;
          ctx.save();
          ctx.translate(ox + ow / 2, oy + oh / 2 + floatY);

          // Golden core
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();

          // Orbiting ring
          ctx.rotate(time * 3);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, 9, 3, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 7px "Share Tech Mono"';
          ctx.textAlign = 'center';
          ctx.fillText('ARTIFACT', ox + ow / 2, oy - 4);
        }
      } else if (obj.type === 'button' || obj.type === 'timed_switch' || obj.type === 'water_pump' || obj.type === 'distraction_machine') {
        const isActive = !!obj.state;
        // Console base
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(ox + 4, oy + 4, ow - 8, oh - 8);

        const btnColor = obj.type === 'distraction_machine' ? '#f59e0b' : obj.type === 'water_pump' ? '#06b6d4' : '#10b981';
        ctx.fillStyle = isActive ? btnColor : '#475569';
        ctx.fillRect(ox + 8, oy + 8, ow - 16, oh - 16);

        // Interaction key hint indicator
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 8px "Share Tech Mono"';
        ctx.textAlign = 'center';
        ctx.fillText('[E]', ox + ow / 2, oy + oh / 2 + 3);
      } else if (obj.type === 'hiding_locker') {
        // Metallic storage locker
        ctx.fillStyle = '#334155';
        ctx.fillRect(ox + 3, oy + 2, ow - 6, oh - 4);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(ox + 5, oy + 6, ow - 10, 4);
        ctx.fillRect(ox + 5, oy + 14, ow - 10, 4);
        ctx.fillRect(ox + 5, oy + 22, ow - 10, 4);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '8px "Share Tech Mono"';
        ctx.textAlign = 'center';
        ctx.fillText('[HIDE]', ox + ow / 2, oy - 2);
      } else if (obj.type === 'terminal') {
        // Computer Terminal Console
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ox + 2, oy + 2, ow - 4, oh - 4);
        // Green glowing CRT screen
        const screenFlicker = Math.sin(time * 8) * 0.1 + 0.9;
        ctx.fillStyle = `rgba(34, 197, 94, ${screenFlicker})`;
        ctx.fillRect(ox + 5, oy + 5, ow - 10, oh - 14);

        // Scan lines on terminal
        ctx.fillStyle = '#052e16';
        ctx.fillRect(ox + 6, oy + 7, ow - 12, 1);
        ctx.fillRect(ox + 6, oy + 10, ow - 12, 1);
        ctx.fillRect(ox + 6, oy + 13, ow - 12, 1);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 8px "Share Tech Mono"';
        ctx.textAlign = 'center';
        ctx.fillText('[READ]', ox + ow / 2, oy - 2);
      } else if (obj.type === 'checkpoint') {
        const isReached = !!obj.state;
        // Checkpoint holographic diamond
        const floatY = Math.sin(time * 3) * 3;
        ctx.save();
        ctx.translate(ox + ow / 2, oy + oh / 2 + floatY);
        ctx.rotate(time * 1.5);

        ctx.fillStyle = isReached ? '#10b981' : '#38bdf8';
        ctx.fillRect(-6, -6, 12, 12);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-6, -6, 12, 12);
        ctx.restore();
      } else if (obj.type === 'exit_portal') {
        // Swirling temporal exit vortex
        ctx.save();
        ctx.translate(ox + ow / 2, oy + oh / 2);
        ctx.rotate(time * 2);

        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, ow / 2);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#06b6d4');
        grad.addColorStop(0.8, '#3b82f6');
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, ow / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#67e8f9';
        ctx.font = 'bold 9px "Share Tech Mono"';
        ctx.textAlign = 'center';
        ctx.fillText('EXIT', ox + ow / 2, oy - 4);
      } else if (obj.type === 'temporal_core') {
        // Massive Omega Temporal Core reactor
        ctx.save();
        ctx.translate(ox + ow / 2, oy + oh / 2);

        // Outer reactor shell
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, ow / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Rotating inner magnetic rings
        ctx.save();
        ctx.rotate(time * 2.5);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, ow / 2 - 8, 0, Math.PI * 1.6);
        ctx.stroke();
        ctx.restore();

        // Glowing core plasma
        const pulse = 12 + Math.sin(time * 5) * 4;
        const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, pulse);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.5, '#eab308');
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 10px "Share Tech Mono"';
        ctx.textAlign = 'center';
        ctx.fillText('OMEGA CORE [E]', ox + ow / 2, oy - 6);
      }
    }
  }

  private drawPlayer(
    ctx: CanvasRenderingContext2D,
    player: { x: number; y: number; dir: Direction; isMoving: boolean; walkFrame: number }
  ) {
    const px = player.x * TILE_SIZE;
    const py = player.y * TILE_SIZE;

    ctx.save();
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(px + 12, py + 22, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // High contrast distinct player outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px + 5, py + 3, 14, 18);

    // Operative Suit Body (Solid Cyan & Dark Armor)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(px + 6, py + 10, 12, 11);

    // Legs animation
    const legOffset = player.isMoving ? Math.sin(player.walkFrame * 8) * 3 : 0;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px + 7, py + 20, 4, 4 + legOffset);
    ctx.fillRect(px + 13, py + 20, 4, 4 - legOffset);

    // Helmet Head
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(px + 6, py + 4, 12, 8);

    // Directional Glowing Visor
    ctx.fillStyle = '#38bdf8';
    if (player.dir === 'down') {
      ctx.fillRect(px + 8, py + 7, 8, 3);
    } else if (player.dir === 'up') {
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(px + 8, py + 5, 8, 2);
    } else if (player.dir === 'left') {
      ctx.fillRect(px + 6, py + 7, 5, 3);
    } else if (player.dir === 'right') {
      ctx.fillRect(px + 13, py + 7, 5, 3);
    }

    ctx.restore();
  }

  private drawEcho(ctx: CanvasRenderingContext2D, echo: Echo, settings: GameSettings) {
    const px = echo.x * TILE_SIZE;
    const py = echo.y * TILE_SIZE;
    const time = this.ambientTime;

    ctx.save();
    // Holographic chromatic aberration / glitch displacement
    const glitchX = settings.reducedFX ? 0 : Math.sin(time * 15 + echo.timelineIndex) * 1.5;
    const glitchY = settings.reducedFX ? 0 : Math.cos(time * 12 + echo.timelineIndex) * 0.8;

    ctx.globalAlpha = 0.55;

    // Holographic silhouette with unique hue
    ctx.fillStyle = `hsl(${echo.hue}, 85%, 60%)`;
    ctx.fillRect(px + 6 + glitchX, py + 4 + glitchY, 12, 18);

    // Directional visor
    ctx.fillStyle = '#ffffff';
    if (echo.dir === 'down') {
      ctx.fillRect(px + 8 + glitchX, py + 7 + glitchY, 8, 3);
    } else if (echo.dir === 'left') {
      ctx.fillRect(px + 6 + glitchX, py + 7 + glitchY, 5, 3);
    } else if (echo.dir === 'right') {
      ctx.fillRect(px + 13 + glitchX, py + 7 + glitchY, 5, 3);
    }

    // Echo Timeline Number Badge
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = `hsl(${echo.hue}, 100%, 75%)`;
    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`E${echo.timelineIndex}`, px + 12, py - 2);

    ctx.restore();
  }

  private drawParadox(ctx: CanvasRenderingContext2D, paradox: ParadoxEnemy, settings: GameSettings) {
    const px = paradox.x * TILE_SIZE;
    const py = paradox.y * TILE_SIZE;
    const time = this.ambientTime;

    ctx.save();

    // 1. Draw detection range cone when in chase or searching
    if (paradox.alertLevel > 0.3) {
      ctx.fillStyle = `rgba(239, 68, 68, ${paradox.alertLevel * 0.15})`;
      ctx.beginPath();
      ctx.arc(px + 12, py + 12, 6 * TILE_SIZE, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Void Anomaly Shadow
    const shadowSize = 14 + Math.sin(time * 8) * 3;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(px + 12, py + 12, shadowSize, 0, Math.PI * 2);
    ctx.fill();

    // 3. Shifting Dark Tendrils
    const tendrilCount = 6;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    for (let i = 0; i < tendrilCount; i++) {
      const angle = (i / tendrilCount) * Math.PI * 2 + time * 3;
      const length = 12 + Math.sin(time * 10 + i) * 6;
      ctx.beginPath();
      ctx.moveTo(px + 12, py + 12);
      ctx.lineTo(px + 12 + Math.cos(angle) * length, py + 12 + Math.sin(angle) * length);
      ctx.stroke();
    }

    // 4. Glitch Body
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(px + 5, py + 5, 14, 14);

    // 5. Glowing Red Ocular Anomaly
    const eyeGlow = 3 + Math.sin(time * 12) * 1.5;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(px + 12, py + 12, eyeGlow, 0, Math.PI * 2);
    ctx.fill();

    // 6. Overhead Alert Indicator
    if (paradox.state === 'chasing') {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('!', px + 12, py - 4);
    } else if (paradox.state === 'searching' || paradox.state === 'investigating') {
      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 12px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText('?', px + 12, py - 4);
    }

    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1.0;
  }

  private drawLightingMask(
    ctx: CanvasRenderingContext2D,
    level: LevelData,
    player: { x: number; y: number; isHiding: boolean },
    echoes: Echo[],
    paradoxEnemies: ParadoxEnemy[],
    objects: PuzzleObject[]
  ) {
    // Semi-darkness overlay
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = level.width * TILE_SIZE;
    maskCanvas.height = level.height * TILE_SIZE;
    const mctx = maskCanvas.getContext('2d');
    if (!mctx) return;

    // Dark sci-fi room ambient tint
    mctx.fillStyle = 'rgba(5, 8, 18, 0.72)';
    mctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    mctx.globalCompositeOperation = 'destination-out';

    // Player flashlight/ambient aura
    if (!player.isHiding) {
      const pGrad = mctx.createRadialGradient(
        (player.x + 0.35) * TILE_SIZE,
        (player.y + 0.35) * TILE_SIZE,
        10,
        (player.x + 0.35) * TILE_SIZE,
        (player.y + 0.35) * TILE_SIZE,
        140
      );
      pGrad.addColorStop(0, 'rgba(0,0,0,1)');
      pGrad.addColorStop(0.7, 'rgba(0,0,0,0.6)');
      pGrad.addColorStop(1, 'rgba(0,0,0,0)');
      mctx.fillStyle = pGrad;
      mctx.beginPath();
      mctx.arc((player.x + 0.35) * TILE_SIZE, (player.y + 0.35) * TILE_SIZE, 140, 0, Math.PI * 2);
      mctx.fill();
    }

    // Echoes light aura
    for (const echo of echoes) {
      if (echo.active && !echo.isHiding) {
        const eGrad = mctx.createRadialGradient(
          (echo.x + 0.35) * TILE_SIZE,
          (echo.y + 0.35) * TILE_SIZE,
          5,
          (echo.x + 0.35) * TILE_SIZE,
          (echo.y + 0.35) * TILE_SIZE,
          70
        );
        eGrad.addColorStop(0, 'rgba(0,0,0,0.8)');
        eGrad.addColorStop(1, 'rgba(0,0,0,0)');
        mctx.fillStyle = eGrad;
        mctx.beginPath();
        mctx.arc((echo.x + 0.35) * TILE_SIZE, (echo.y + 0.35) * TILE_SIZE, 70, 0, Math.PI * 2);
        mctx.fill();
      }
    }

    // Puzzle light emitters (terminals, exit vortex, core)
    for (const obj of objects) {
      if (obj.type === 'terminal' || obj.type === 'exit_portal' || obj.type === 'temporal_core' || obj.type === 'laser_barrier') {
        const oGrad = mctx.createRadialGradient(
          (obj.x + obj.width / 2) * TILE_SIZE,
          (obj.y + obj.height / 2) * TILE_SIZE,
          10,
          (obj.x + obj.width / 2) * TILE_SIZE,
          (obj.y + obj.height / 2) * TILE_SIZE,
          90
        );
        oGrad.addColorStop(0, 'rgba(0,0,0,0.9)');
        oGrad.addColorStop(1, 'rgba(0,0,0,0)');
        mctx.fillStyle = oGrad;
        mctx.beginPath();
        mctx.arc(
          (obj.x + obj.width / 2) * TILE_SIZE,
          (obj.y + obj.height / 2) * TILE_SIZE,
          90,
          0,
          Math.PI * 2
        );
        mctx.fill();
      }
    }

    // Draw darkness mask onto scene
    ctx.drawImage(maskCanvas, 0, 0);
  }

  private drawResetGlitch(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progress: number
  ) {
    ctx.save();
    // Invert flash + glitch scanlines
    const alpha = Math.sin(Math.max(0, Math.min(1, progress)) * Math.PI);
    
    // Temporal rift backdrop flash
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.45})`;
    ctx.fillRect(0, 0, width, height);

    // RGB shift slice bars with displacement
    const barCount = 18;
    for (let i = 0; i < barCount; i++) {
      const by = Math.random() * height;
      const bh = Math.random() * 26 + 6;
      const offsetX = (Math.random() - 0.5) * 32 * alpha;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(6, 182, 212, 0.45)' : 'rgba(236, 72, 153, 0.45)';
      ctx.fillRect(offsetX, by, width, bh);
    }

    // Expanding concentric temporal shockwave rings
    const maxRadius = Math.max(width, height) * 0.75;
    const ringRadius1 = (1 - progress) * maxRadius;
    const ringRadius2 = ((1 - progress) * 0.7) * maxRadius;
    
    ctx.strokeStyle = `rgba(103, 232, 249, ${alpha * 0.8})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, ringRadius1, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(244, 114, 182, ${alpha * 0.6})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, ringRadius2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
