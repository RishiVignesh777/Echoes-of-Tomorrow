import React, { useEffect, useState } from 'react';
import { Sparkles, RotateCcw, Home, Award } from 'lucide-react';
import { ENDING_CONTENT } from '../data/story';
import { soundManager } from '../audio/soundManager';

interface EndingScreenProps {
  endingType: 'A' | 'B' | 'C';
  onRestartGame: () => void;
  onMainMenu: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({
  endingType,
  onRestartGame,
  onMainMenu,
}) => {
  const ending = ENDING_CONTENT[endingType];
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    soundManager.playVictory();
    const interval = setInterval(() => {
      setLineIdx((prev) => {
        if (prev < ending.lines.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [ending.lines.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950 p-6 font-mono-tech select-none overflow-y-auto">
      <div className="w-full max-w-2xl bg-neutral-900/90 border-2 border-cyan-500/70 rounded-2xl p-8 shadow-2xl shadow-cyan-950/60 flex flex-col items-center text-center relative">
        {/* Header Badges */}
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-6 h-6 text-amber-400" />
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
            TEMPORAL SEQUENCE CONCLUDED
          </span>
        </div>

        {/* Ending Title */}
        <h1 className="text-2xl sm:text-3xl font-pixel font-bold text-cyan-300 tracking-wider mb-2">
          {ending.title}
        </h1>
        <h3 className="text-sm uppercase tracking-widest text-neutral-400 font-semibold mb-6">
          {ending.subtitle}
        </h3>

        {/* Narrative Box */}
        <div className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-6 mb-8 text-left space-y-4 shadow-inner min-h-[220px]">
          {ending.lines.slice(0, lineIdx).map((line, idx) => (
            <p
              key={idx}
              className="text-neutral-300 text-sm sm:text-base leading-relaxed animate-fade-in font-mono"
            >
              {line}
            </p>
          ))}
          {lineIdx < ending.lines.length && (
            <div className="inline-block w-2 h-4 bg-cyan-400 animate-pulse" />
          )}
        </div>

        {/* Status Stamp */}
        <div className="mb-8 px-6 py-2.5 bg-neutral-950 border border-cyan-400/80 rounded-full">
          <span className="text-cyan-300 font-pixel text-sm sm:text-base tracking-widest uppercase">
            &ldquo;{ending.statusText}&rdquo;
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            id="ending-restart-btn"
            onClick={onRestartGame}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            id="ending-menu-btn"
            onClick={onMainMenu}
            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-xl transition flex items-center justify-center gap-2 border border-neutral-700 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
