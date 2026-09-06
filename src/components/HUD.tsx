import React from 'react';
import { RotateCcw, AlertTriangle, Users, Compass, Volume2, Sparkles } from 'lucide-react';
import { LevelData } from '../types';

interface HUDProps {
  level: LevelData;
  timeRemaining: number;
  totalTime: number;
  echoCount: number;
  maxEchoes: number;
  currentTimelineIndex: number;
  isResetting: boolean;
  notification: string | null;
  paradoxAlert: boolean;
  onManualReset: () => void;
  onPause: () => void;
  fragmentBalance?: number;
  isChronalInsightActive?: boolean;
  chronalInsightBrief?: string | null;
  onTriggerChronalInsight?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  timeRemaining,
  totalTime,
  echoCount,
  maxEchoes,
  currentTimelineIndex,
  isResetting,
  notification,
  paradoxAlert,
  onManualReset,
  onPause,
  fragmentBalance = 0,
  isChronalInsightActive = false,
  chronalInsightBrief = null,
  onTriggerChronalInsight,
}) => {
  const percentage = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));
  const isUrgent = timeRemaining <= 8 && !isResetting;
  const seconds = Math.floor(timeRemaining);
  const hundredths = Math.floor((timeRemaining % 1) * 100);
  const formattedTime = `00:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;

  return (
    <div
      id="game-hud"
      className={`absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 font-mono-tech select-none transition-transform ${
        isResetting ? 'animate-temporal-shake' : ''
      }`}
    >
      {/* Top Bar */}
      <div className="flex items-start justify-between w-full gap-4">
        {/* Top Left: Sector & Objective */}
        <div className="bg-neutral-950/85 border border-neutral-800 rounded-lg p-3 backdrop-blur-md max-w-sm pointer-events-auto shadow-lg shadow-black/50">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span>{level.title}</span>
          </div>
          <div className="text-neutral-200 text-sm font-medium leading-snug">
            {level.objective}
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1 uppercase tracking-wider">
            <span>
              Timeline Cycle: <span className="text-cyan-300 font-bold">#{currentTimelineIndex + 1}</span>
            </span>
            {level.ambientEnvironment && (
              <span className="flex items-center gap-1 text-teal-400/90 font-mono text-[9px] bg-teal-950/60 border border-teal-800/40 px-1.5 py-0.5 rounded">
                <Volume2 className="w-2.5 h-2.5 text-teal-400 animate-pulse" />
                {level.ambientEnvironment.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Top Center: Timer & Temporal Loop Bar */}
        <div className="flex flex-col items-center">
          <div
            className={`flex flex-col items-center bg-neutral-950/90 border px-6 py-2 rounded-xl backdrop-blur-md transition-all shadow-xl ${
              isUrgent
                ? 'border-red-500 shadow-red-950/60 animate-pulse'
                : 'border-cyan-500/40 shadow-cyan-950/30'
            }`}
          >
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-0.5">
              TIME REMAINING
            </span>
            <span
              className={`text-2xl font-bold font-pixel tracking-wider ${
                isUrgent ? 'text-red-400' : 'text-cyan-300'
              }`}
            >
              {formattedTime}
            </span>

            {/* Time progress bar */}
            <div className="w-36 h-1.5 bg-neutral-900 rounded-full overflow-hidden mt-1.5 border border-neutral-800">
              <div
                className={`h-full transition-all duration-75 ${
                  isUrgent ? 'bg-red-500' : 'bg-gradient-to-r from-teal-400 to-cyan-400'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {/* Quick Rewind Hint / Button */}
            <button
              id="hud-rewind-btn"
              onClick={onManualReset}
              className="text-[11px] bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-cyan-300 px-3 py-1 rounded-full border border-neutral-700 pointer-events-auto transition flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Instantly reset current timeline to spawn next Echo (R)"
            >
              <RotateCcw className="w-3 h-3" />
              <span>REWIND [R]</span>
            </button>

            {/* Chronal Insight Button */}
            <button
              id="hud-chronal-insight-btn"
              onClick={onTriggerChronalInsight}
              className={`text-[11px] px-3 py-1 rounded-full border pointer-events-auto transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                isChronalInsightActive
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse'
                  : fragmentBalance > 0
                  ? 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 hover:text-amber-100 border-amber-500/40 hover:border-amber-400 shadow-amber-950/40'
                  : 'bg-neutral-900/60 hover:bg-neutral-900 text-neutral-500 border-neutral-800'
              }`}
              title={
                fragmentBalance > 0
                  ? 'Spend 1 Memory Fragment to reveal ghost path for this puzzle (Hotkey: C)'
                  : 'Requires 1 Memory Fragment (Explore sectors to collect shards) (Hotkey: C)'
              }
            >
              <Sparkles className={`w-3.5 h-3.5 ${fragmentBalance > 0 ? 'text-amber-400' : 'text-neutral-500'}`} />
              <span className="font-semibold">
                {isChronalInsightActive ? 'GHOST PATH ACTIVE [C]' : 'INSIGHT [C]'}
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  fragmentBalance > 0
                    ? 'bg-amber-900/80 text-amber-200 border border-amber-500/40'
                    : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                {fragmentBalance}
              </span>
            </button>
          </div>
        </div>

        {/* Top Right: Echoes & System Status */}
        <div className="flex flex-col items-end gap-2">
          <div className="bg-neutral-950/85 border border-neutral-800 rounded-lg px-4 py-2.5 backdrop-blur-md pointer-events-auto flex items-center gap-3 shadow-lg shadow-black/50">
            <Users className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider">ACTIVE ECHOES</span>
              <div className="flex items-center gap-1">
                <span className="text-cyan-300 font-bold font-pixel text-xs">{echoCount}</span>
                <span className="text-neutral-500 text-xs">/ {maxEchoes}</span>
              </div>
            </div>
          </div>

          {/* Pause Button */}
          <button
            id="hud-pause-btn"
            onClick={onPause}
            className="bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-700 text-xs pointer-events-auto transition active:scale-95 flex items-center gap-1"
          >
            <span>PAUSE [ESC]</span>
          </button>
        </div>
      </div>

      {/* Center Toast / Notification Alerts & Chronal Insight banner */}
      <div className="flex flex-col items-center justify-center gap-2">
        {isChronalInsightActive && chronalInsightBrief && (
          <div className="bg-amber-950/95 border border-amber-400 text-amber-100 px-5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md max-w-xl mx-auto pointer-events-auto flex flex-col gap-1 text-center animate-fadeIn">
            <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider font-pixel text-[10px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              CHRONAL INSIGHT // OPTIMAL PATH REVEALED
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed font-mono">
              {chronalInsightBrief}
            </p>
          </div>
        )}

        {notification && (
          <div className="bg-cyan-950/90 border border-cyan-400 text-cyan-200 px-5 py-2 rounded-lg font-pixel text-xs tracking-wider uppercase shadow-xl animate-bounce">
            {notification}
          </div>
        )}

        {paradoxAlert && (
          <div className="bg-red-950/90 border border-red-500 text-red-300 px-4 py-1.5 rounded-md text-xs font-bold tracking-widest flex items-center gap-2 animate-pulse shadow-lg">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>PARADOX ANOMALY DETECTED IN SECTOR</span>
          </div>
        )}

        {isResetting && (
          <div className="bg-neutral-950/95 border border-cyan-400 text-cyan-300 px-6 py-3 rounded-xl font-pixel text-sm tracking-widest uppercase shadow-2xl animate-glitch">
            TEMPORAL ENVELOPE RESETTING...
          </div>
        )}
      </div>

      {/* Bottom Bar: Action Hints */}
      <div className="flex justify-between items-end w-full text-xs text-neutral-400">
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-md px-3 py-1.5 backdrop-blur flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-[10px] font-bold">W A S D</span>
            <span>Move</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-[10px] font-bold">E</span>
            <span>Interact</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-[10px] font-bold">SPACE</span>
            <span>Action</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-[10px] font-bold">R</span>
            <span>Rewind</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-amber-900/60 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded text-[10px] font-bold">C</span>
            <span className="text-amber-200/90">Chronal Insight</span>
          </span>
        </div>

        <div className="text-[11px] text-neutral-500 bg-neutral-950/60 px-2 py-1 rounded">
          PROJECT TOMORROW // CHRONO-TEST RUN
        </div>
      </div>
    </div>
  );
};
