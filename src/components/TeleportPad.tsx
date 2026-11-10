import React, { useState, useEffect } from 'react';
import { Sparkles, Radio, Zap, ArrowRightLeft, ShieldAlert, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { PuzzleObject } from '../types';

export interface TeleportEvent {
  padId: string;
  targetId: string;
  timestamp: number;
  isEcho: boolean;
  echoIndex?: number;
}

interface TeleportPadProps {
  objects: PuzzleObject[];
  playerPos: { x: number; y: number };
  onTeleportRequest?: (padId: string) => void;
  lastTeleportEvent?: TeleportEvent | null;
  interactKeyName?: string;
}

export const TeleportPad: React.FC<TeleportPadProps> = ({
  objects,
  playerPos,
  onTeleportRequest,
  lastTeleportEvent,
  interactKeyName = 'E',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [recentTranslocations, setRecentTranslocations] = useState<TeleportEvent[]>([]);

  // Collect all teleport pads in the active level
  const teleportPads = objects.filter((o) => o.type === 'teleport_pad');

  // Track recent translocation events
  useEffect(() => {
    if (lastTeleportEvent) {
      setRecentTranslocations((prev) => [lastTeleportEvent, ...prev.slice(0, 4)]);
    }
  }, [lastTeleportEvent]);

  if (teleportPads.length === 0) {
    return null;
  }

  // Find nearest pad to player
  let nearestPad: PuzzleObject | null = null;
  let nearestDist = Infinity;

  for (const pad of teleportPads) {
    const dist = Math.hypot(pad.x + pad.width / 2 - playerPos.x, pad.y + pad.height / 2 - playerPos.y);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestPad = pad;
    }
  }

  const isStandingOnPad = nearestDist <= 0.65;
  const isNearPad = nearestDist <= 1.8;

  // Find destination pad for nearest pad
  const nearestTargetPad = nearestPad
    ? teleportPads.find(
        (o) =>
          o.id !== nearestPad?.id &&
          (o.id === nearestPad?.linkedPadId ||
            o.id === nearestPad?.linkedPodId ||
            nearestPad?.linkedIds?.includes(o.id) ||
            o.linkedPadId === nearestPad?.id)
      )
    : null;

  // Helper for color classes
  const getColorClasses = (colorKey?: string) => {
    switch (colorKey) {
      case 'magenta':
      case 'purple':
        return {
          badge: 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/50',
          glow: 'text-fuchsia-400',
          ring: 'border-fuchsia-400',
          bg: 'bg-fuchsia-500',
        };
      case 'amber':
      case 'gold':
        return {
          badge: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
          glow: 'text-amber-400',
          ring: 'border-amber-400',
          bg: 'bg-amber-500',
        };
      case 'emerald':
        return {
          badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
          glow: 'text-emerald-400',
          ring: 'border-emerald-400',
          bg: 'bg-emerald-500',
        };
      case 'cyan':
      default:
        return {
          badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
          glow: 'text-cyan-400',
          ring: 'border-cyan-400',
          bg: 'bg-cyan-500',
        };
    }
  };

  // Check if warp transition effect is currently active (within 550ms)
  const isWarping = lastTeleportEvent && Date.now() - lastTeleportEvent.timestamp < 550;

  return (
    <>
      {/* Holographic Quantum Translocation Distortion Flare */}
      {isWarping && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center animate-pulse">
          <div className="absolute inset-0 bg-cyan-500/15 backdrop-blur-[1px] transition-opacity duration-500" />
          <div className="w-96 h-96 rounded-full border-2 border-cyan-300/60 animate-ping" />
          <div className="w-64 h-64 rounded-full border border-white/80 animate-spin" />
        </div>
      )}

      {/* Proximity Action Prompt Card (when standing on or close to a pad) */}
      {isNearPad && nearestPad && nearestTargetPad && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-fade-in">
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border backdrop-blur-md shadow-2xl transition ${
              isStandingOnPad
                ? 'bg-cyan-950/90 border-cyan-400 shadow-cyan-950/80'
                : 'bg-neutral-950/85 border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-900/60 border border-cyan-500/60 text-cyan-300 animate-pulse">
              <Zap className="w-4 h-4" />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-pixel text-cyan-300">
                  {nearestPad.label || 'CHRONO-PAD'}
                </span>
                <ArrowRightLeft className="w-3 h-3 text-neutral-400" />
                <span className="text-[11px] font-bold font-pixel text-neutral-200">
                  {nearestTargetPad.label || 'DESTINATION'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono mt-0.5">
                {nearestPad.state === false ? (
                  <span className="text-red-400 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> OFFLINE (SWITCH REQUIRED)
                  </span>
                ) : nearestPad.cooldownTimer && nearestPad.cooldownTimer > 0 ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> RECHARGING ({nearestPad.cooldownTimer.toFixed(1)}s)
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> SYNCHRONIZED — STEP OR PRESS [{interactKeyName}]
                  </span>
                )}
              </div>
            </div>

            {nearestPad.state !== false && (!nearestPad.cooldownTimer || nearestPad.cooldownTimer <= 0) && (
              <button
                onClick={() => onTeleportRequest?.(nearestPad!.id)}
                className="ml-2 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold rounded-lg transition active:scale-95 shadow-md flex items-center gap-1"
              >
                <span>WARP</span>
                <span className="text-[9px] font-mono opacity-80">[{interactKeyName}]</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Quantum Matrix Telemetry Widget (Top-Right) */}
      <div className="absolute top-16 right-4 z-20 pointer-events-auto font-mono text-xs">
        <div className="bg-neutral-950/85 border border-cyan-600/40 rounded-xl p-2.5 backdrop-blur-md shadow-xl text-neutral-300 max-w-xs transition">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-neutral-800">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold font-pixel text-[10px]">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>TRANSLOCATION MATRIX</span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[9px] text-neutral-400 hover:text-cyan-300 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 transition"
            >
              {isExpanded ? 'MINIMIZE' : 'EXPAND'}
            </button>
          </div>

          {/* Expanded Matrix Details */}
          {isExpanded && (
            <div className="mt-2 space-y-2">
              {/* Teleport Pad Links List */}
              <div className="space-y-1.5">
                {teleportPads.map((pad) => {
                  const target = teleportPads.find(
                    (o) =>
                      o.id !== pad.id &&
                      (o.id === pad.linkedPadId ||
                        o.id === pad.linkedPodId ||
                        pad.linkedIds?.includes(o.id) ||
                        o.linkedPadId === pad.id)
                  );
                  const colors = getColorClasses(pad.colorKey);
                  const isReady = pad.state !== false && (!pad.cooldownTimer || pad.cooldownTimer <= 0);
                  const isCooling = !!(pad.cooldownTimer && pad.cooldownTimer > 0);

                  return (
                    <div
                      key={pad.id}
                      className="p-1.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`w-2 h-2 rounded-full ${colors.bg} ${isReady ? 'animate-ping' : ''}`} />
                        <span className="font-bold text-[10px] text-neutral-200 truncate">
                          {pad.label || pad.id}
                        </span>
                        <span className="text-neutral-500 text-[9px]">⇄</span>
                        <span className="text-neutral-400 text-[10px] truncate">
                          {target?.label || 'UNLINKED'}
                        </span>
                      </div>

                      <div className="shrink-0 text-[9px]">
                        {pad.state === false ? (
                          <span className="text-red-400 font-semibold">[OFFLINE]</span>
                        ) : isCooling ? (
                          <span className="text-amber-400 font-semibold">
                            {pad.cooldownTimer?.toFixed(1)}s
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 inline" /> READY
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Echo / Player Translocations Log */}
              {recentTranslocations.length > 0 && (
                <div className="pt-1.5 border-t border-neutral-900 text-[9px] text-neutral-400 space-y-0.5">
                  <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-bold block">
                    TELEMETRY DISPLACEMENT LOG
                  </span>
                  {recentTranslocations.slice(0, 2).map((ev, i) => (
                    <div key={i} className="flex items-center gap-1 text-cyan-300/80 truncate">
                      <Sparkles className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                      <span className="truncate">
                        {ev.isEcho ? `Echo #${ev.echoIndex || '?'}` : 'Operative'} ➔ Translocated across rift
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
