import { Direction, Echo, LevelData, ParadoxEnemy, PuzzleObject, TileType } from '../types';

export const TILE_SIZE = 32; // base pixel size per tile

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function checkAABB(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function isTileSolid(tile: number): boolean {
  return tile === TileType.WALL || tile === TileType.GLASS_WALL || tile === TileType.PIT;
}

export function isPositionSolid(
  x: number,
  y: number,
  width: number,
  height: number,
  level: LevelData,
  objects: PuzzleObject[],
  ignoreCrateId?: string
): boolean {
  // Check level tile bounds & wall tiles
  const minTileX = Math.floor(x);
  const maxTileX = Math.floor(x + width - 0.001);
  const minTileY = Math.floor(y);
  const maxTileY = Math.floor(y + height - 0.001);

  if (minTileX < 0 || maxTileX >= level.width || minTileY < 0 || maxTileY >= level.height) {
    return true;
  }

  for (let ty = minTileY; ty <= maxTileY; ty++) {
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      const tile = level.tiles[ty]?.[tx];
      if (tile === undefined || isTileSolid(tile)) {
        return true;
      }
    }
  }

  // Check solid objects: Closed doors, Crates, Active laser barriers, impassable flooded water
  const box: BoundingBox = { x, y, width, height };

  for (const obj of objects) {
    if (obj.type === 'door' && !obj.state) {
      const doorBox: BoundingBox = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
      if (checkAABB(box, doorBox)) return true;
    }

    if (obj.type === 'laser_barrier' && obj.state) {
      const laserBox: BoundingBox = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
      if (checkAABB(box, laserBox)) return true;
    }

    if (obj.type === 'crate' && obj.id !== ignoreCrateId) {
      const crateBox: BoundingBox = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
      if (checkAABB(box, crateBox)) return true;
    }

    if (obj.type === 'water_zone' && obj.state) {
      const waterBox: BoundingBox = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
      if (checkAABB(box, waterBox)) return true;
    }
  }

  return false;
}

export function tryPushCrate(
  crate: PuzzleObject,
  dx: number,
  dy: number,
  level: LevelData,
  objects: PuzzleObject[]
): boolean {
  const targetX = crate.x + dx;
  const targetY = crate.y + dy;

  // Verify target is free
  if (!isPositionSolid(targetX, targetY, crate.width, crate.height, level, objects, crate.id)) {
    crate.x = Math.round(targetX * 10) / 10;
    crate.y = Math.round(targetY * 10) / 10;
    return true;
  }
  return false;
}

export function updatePuzzleObjects(
  objects: PuzzleObject[],
  player: { x: number; y: number; width: number; height: number; isHiding: boolean },
  echoes: Echo[],
  deltaTime: number,
  onSoundTrigger?: (sound: string) => void
) {
  // 1. Update moving platforms
  for (const obj of objects) {
    if (obj.type === 'moving_platform' && obj.pathStart && obj.pathEnd) {
      const speed = (obj.moveSpeed || 1) * deltaTime;
      const dir = obj.moveDirection || 1;
      const totalDx = obj.pathEnd.x - obj.pathStart.x;
      const totalDy = obj.pathEnd.y - obj.pathStart.y;
      const totalDist = Math.hypot(totalDx, totalDy) || 1;

      const stepX = (totalDx / totalDist) * speed * dir;
      const stepY = (totalDy / totalDist) * speed * dir;

      obj.x += stepX;
      obj.y += stepY;

      // Check endpoints
      const distFromStart = Math.hypot(obj.x - obj.pathStart.x, obj.y - obj.pathStart.y);
      const distFromEnd = Math.hypot(obj.x - obj.pathEnd.x, obj.y - obj.pathEnd.y);

      if (dir > 0 && distFromStart >= totalDist) {
        obj.x = obj.pathEnd.x;
        obj.y = obj.pathEnd.y;
        obj.moveDirection = -1;
      } else if (dir < 0 && distFromEnd >= totalDist) {
        obj.x = obj.pathStart.x;
        obj.y = obj.pathStart.y;
        obj.moveDirection = 1;
      }
    }

    // Update timed switches countdown
    if (obj.type === 'timed_switch' && obj.timeRemaining !== undefined && obj.timeRemaining > 0) {
      obj.timeRemaining -= deltaTime;
      if (obj.timeRemaining <= 0) {
        obj.timeRemaining = 0;
        obj.state = false;
        onSoundTrigger?.('plate_up');
      }
    }
  }

  // 2. Collect all active physical entity positions (Player + non-hiding Echoes + Crates)
  const activeSensors: BoundingBox[] = [];
  if (!player.isHiding) {
    activeSensors.push({ x: player.x, y: player.y, width: player.width, height: player.height });
  }

  for (const echo of echoes) {
    if (echo.active && !echo.isHiding) {
      activeSensors.push({ x: echo.x, y: echo.y, width: 0.7, height: 0.7 });
    }
  }

  for (const obj of objects) {
    if (obj.type === 'crate') {
      activeSensors.push({ x: obj.x, y: obj.y, width: obj.width, height: obj.height });
    }
  }

  // 3. Update pressure plates and secret consoles
  for (const obj of objects) {
    if (obj.type === 'pressure_plate' || obj.type === 'secret_console') {
      const plateBox: BoundingBox = {
        x: obj.x + 0.1,
        y: obj.y + 0.1,
        width: obj.width - 0.2,
        height: obj.height - 0.2,
      };

      let isPressed = false;
      for (const sensor of activeSensors) {
        if (checkAABB(sensor, plateBox)) {
          isPressed = true;
          break;
        }
      }

      const prevState = !!obj.state;
      obj.state = isPressed;

      if (isPressed !== prevState) {
        if (isPressed) {
          onSoundTrigger?.('plate_down');
        } else {
          onSoundTrigger?.('plate_up');
        }
      }
    }
  }

  // 4. Update linked mechanisms (Doors, Laser Barriers, Water Zones, Hazards)
  for (const obj of objects) {
    if (obj.type === 'door' || obj.type === 'laser_barrier') {
      // Find all objects linked to this door
      const controllers = objects.filter((o) => o.linkedIds?.includes(obj.id));
      if (controllers.length > 0) {
        // Must have ALL controllers satisfied (e.g. multi-switch puzzle)
        const allSatisfied = controllers.every((c) => !!c.state);
        const prevDoorState = !!obj.state;

        if (obj.type === 'door') {
          obj.state = allSatisfied; // true = opened
        } else if (obj.type === 'laser_barrier') {
          obj.state = !allSatisfied; // true = active barrier, false = disabled
        }

        if (obj.state !== prevDoorState) {
          onSoundTrigger?.('door_open');
        }
      }
    }

    if (obj.type === 'water_zone') {
      // Linked to pump
      const pump = objects.find((o) => o.type === 'water_pump' && o.linkedIds?.includes(obj.id));
      if (pump) {
        // Water is drained when pump is held/active
        obj.state = !pump.state;
      }
    }

    if (obj.type === 'electric_hazard') {
      const breaker = objects.find((o) => o.type === 'button' && o.linkedIds?.includes(obj.id));
      if (breaker) {
        obj.state = !breaker.state; // breaker active cuts electricity
      }
    }
  }
}

// Line of sight raycasting for Paradox AI
export function hasLineOfSight(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  level: LevelData,
  objects: PuzzleObject[]
): boolean {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  if (dist === 0) return true;
  const steps = Math.ceil(dist * 5); // 5 checks per tile

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const cx = x1 + (x2 - x1) * t;
    const cy = y1 + (y2 - y1) * t;
    const tx = Math.floor(cx);
    const ty = Math.floor(cy);

    if (tx < 0 || tx >= level.width || ty < 0 || ty >= level.height) return false;
    const tile = level.tiles[ty]?.[tx];
    if (tile === undefined || tile === TileType.WALL || tile === TileType.GLASS_WALL) {
      return false;
    }

    // Check closed doors
    for (const obj of objects) {
      if (obj.type === 'door' && !obj.state) {
        if (cx >= obj.x && cx <= obj.x + obj.width && cy >= obj.y && cy <= obj.y + obj.height) {
          return false;
        }
      }
    }
  }

  return true;
}

export function updateParadoxAI(
  paradox: ParadoxEnemy,
  player: { x: number; y: number; isHiding: boolean },
  level: LevelData,
  objects: PuzzleObject[],
  deltaTime: number,
  playerHeatmap: Record<string, number>,
  onAlertTrigger?: () => void
): boolean {
  paradox.animFrame = (paradox.animFrame + deltaTime * 6) % 4;
  paradox.phaseGlitch = (paradox.phaseGlitch + deltaTime * 2) % 1;

  // Check if player is hiding
  const playerVisible = !player.isHiding;
  const distToPlayer = Math.hypot(player.x - paradox.x, player.y - paradox.y);

  // Vision cone detection
  let canSeePlayer = false;
  if (playerVisible && distToPlayer <= 7.0) {
    canSeePlayer = hasLineOfSight(paradox.x, paradox.y, player.x, player.y, level, objects);
  }

  // State transitions
  if (canSeePlayer) {
    if (paradox.state !== 'chasing') {
      onAlertTrigger?.();
    }
    paradox.state = 'chasing';
    paradox.targetX = player.x;
    paradox.targetY = player.y;
    paradox.alertLevel = 1.0;
  } else if (paradox.state === 'chasing') {
    // Player escaped or hid! Search last known position
    paradox.state = 'searching';
    paradox.investigateTimer = 3.5;
  }

  // Handle searching / investigating timer
  if (paradox.state === 'searching' || paradox.state === 'investigating') {
    paradox.investigateTimer -= deltaTime;
    if (paradox.investigateTimer <= 0) {
      paradox.state = 'patrol';
      paradox.alertLevel = 0;
    }
  }

  // Check for distraction alarms activated
  const activeAlarm = objects.find((o) => o.type === 'distraction_machine' && o.state);
  if (activeAlarm && paradox.state !== 'chasing') {
    paradox.state = 'investigating';
    paradox.targetX = activeAlarm.x;
    paradox.targetY = activeAlarm.y;
    paradox.investigateTimer = 6.0;
    paradox.alertLevel = 0.8;
  }

  // Patrol target with Adaptive Memory integration!
  if (paradox.state === 'patrol') {
    // If player has heavily frequented certain tiles in previous timelines, bias patrol towards highest traffic node
    if (paradox.patrolNodes.length > 0) {
      const node = paradox.patrolNodes[paradox.currentNodeIdx];
      paradox.targetX = node.x;
      paradox.targetY = node.y;

      const distToNode = Math.hypot(paradox.targetX - paradox.x, paradox.targetY - paradox.y);
      if (distToNode < 0.4) {
        // Move to next patrol node
        paradox.currentNodeIdx = (paradox.currentNodeIdx + 1) % paradox.patrolNodes.length;

        // Paradox route memory adaptation check:
        // Look through heatmap keys to see if an adjacent area has high player traffic (>3 visits)
        let highestFreq = 0;
        let bestTarget: { x: number; y: number } | null = null;
        for (const [key, count] of Object.entries(playerHeatmap)) {
          if (count > 3 && count > highestFreq) {
            const [hx, hy] = key.split(',').map(Number);
            if (Math.hypot(hx - paradox.x, hy - paradox.y) <= 8) {
              highestFreq = count;
              bestTarget = { x: hx, y: hy };
            }
          }
        }
        if (bestTarget && Math.random() < 0.4) {
          paradox.targetX = bestTarget.x;
          paradox.targetY = bestTarget.y;
        }
      }
    }
  }

  // Movement towards target
  const dx = paradox.targetX - paradox.x;
  const dy = paradox.targetY - paradox.y;
  const dist = Math.hypot(dx, dy);

  if (dist > 0.1) {
    const moveSpeed = (paradox.state === 'chasing' ? paradox.speed * 1.3 : paradox.speed) * deltaTime;
    const stepX = (dx / dist) * moveSpeed;
    const stepY = (dy / dist) * moveSpeed;

    // Update facing direction
    if (Math.abs(dx) > Math.abs(dy)) {
      paradox.dir = dx > 0 ? 'right' : 'left';
    } else {
      paradox.dir = dy > 0 ? 'down' : 'up';
    }

    // Check collision before moving
    if (!isPositionSolid(paradox.x + stepX, paradox.y, 0.7, 0.7, level, objects)) {
      paradox.x += stepX;
    }
    if (!isPositionSolid(paradox.x, paradox.y + stepY, 0.7, 0.7, level, objects)) {
      paradox.y += stepY;
    }
  }

  // Check collision with player -> Kill condition
  if (playerVisible && distToPlayer < 0.6) {
    return true; // Player caught!
  }

  return false;
}
