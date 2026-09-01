import React, { useState } from 'react';
import { Play, RotateCcw, Compass, Settings, HelpCircle, ShieldAlert, Award, Sparkles, BookOpen, History, Flame } from 'lucide-react';
import { GameSettings, SavedGame } from '../types';
import { LEVELS } from '../data/levels';
import { CURRENT_GAME_VERSION } from '../data/updates';
import { soundManager } from '../audio/soundManager';

interface MainMenuProps {
  savedGame: SavedGame | null;
  settings: GameSettings;
  onStartGame: (levelIndex?: number) => void;
  onUpdateSettings: (settings: GameSettings) => void;
  onResetSave: () => void;
  onOpenUpdateLog: () => void;
  onOpenCodex: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  savedGame,
  settings,
  onStartGame,
  onUpdateSettings,
  onResetSave,
  onOpenUpdateLog,
  onOpenCodex,
}) => {
  const [view, setView] = useState<'main' | 'levels' | 'settings' | 'help'>('main');

  const handleStart = (levelIdx: number = 0) => {
    soundManager.init();
    soundManager.playButtonClick();
    onStartGame(levelIdx);
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-neutral-950 font-mono-tech select-none p-4 relative overflow-hidden">
      {/* Background Animated Pixel Grid & Glitch Particles */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,rgba(0,0,0,0.95)_75%)] pointer-events-none" />

      {/* Retro Title Box */}
      <div className="z-10 text-center mb-6 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border border-cyan-500/50 rounded-full text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3 shadow-lg">
          <Compass className="w-3.5 h-3.5 animate-spin" />
          <span>PROJECT TOMORROW // TEMPORAL RECURRENCE</span>
          <button
            onClick={onOpenUpdateLog}
            className="ml-2 px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 rounded-full text-[10px] font-bold transition flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-cyan-300" />
            <span>v{CURRENT_GAME_VERSION}</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-5xl font-pixel font-bold text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-teal-300 to-cyan-500 tracking-wider drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]">
          ECHOES OF TOMORROW
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-2 tracking-widest font-mono uppercase">
          30 SECONDS. COOPERATE WITH YOUR PAST SELVES.
        </p>
      </div>

      {/* Main Action Menu */}
      {view === 'main' && (
        <div className="z-10 w-full max-w-sm flex flex-col gap-2.5">
          {savedGame && savedGame.currentLevelIndex > 0 ? (
            <button
              id="menu-continue-btn"
              onClick={() => handleStart(savedGame.currentLevelIndex)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-neutral-950 font-bold text-base rounded-xl transition flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-950/60 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>CONTINUE (SECTOR 0{savedGame.currentLevelIndex + 1})</span>
            </button>
          ) : null}

          <button
            id="menu-start-btn"
            onClick={() => handleStart(0)}
            className="w-full py-3 px-6 bg-neutral-900 hover:bg-neutral-800 text-cyan-300 hover:text-white border border-cyan-500/50 font-bold rounded-xl transition flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-black/40"
          >
            <Play className="w-4 h-4" />
            <span>NEW GAME</span>
          </button>

          <button
            id="menu-levels-btn"
            onClick={() => setView('levels')}
            className="w-full py-2.5 px-6 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-semibold rounded-xl transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>SECTOR SELECT (12 SECTORS)</span>
          </button>

          <button
            id="menu-codex-btn"
            onClick={onOpenCodex}
            className="w-full py-2.5 px-6 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-teal-500/30 hover:border-teal-500/70 font-semibold rounded-xl transition flex items-center justify-center gap-2 active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-teal-400" />
            <span>FACILITY CODEX & MEMORIES</span>
          </button>

          <button
            id="menu-updates-btn"
            onClick={onOpenUpdateLog}
            className="w-full py-2.5 px-6 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-semibold rounded-xl transition flex items-center justify-center gap-2 active:scale-95"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>UPDATE LOGS (v{CURRENT_GAME_VERSION})</span>
          </button>

          <button
            id="menu-settings-btn"
            onClick={() => setView('settings')}
            className="w-full py-2.5 px-6 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-semibold rounded-xl transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>SETTINGS & AUDIO</span>
          </button>

          <button
            id="menu-help-btn"
            onClick={() => setView('help')}
            className="w-full py-2.5 px-6 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-semibold rounded-xl transition flex items-center justify-center gap-2 active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>HOW TO PLAY & LORE</span>
          </button>

          {savedGame && (
            <button
              onClick={() => {
                if (window.confirm('Reset all saved progress and unlocked sectors?')) {
                  onResetSave();
                }
              }}
              className="mt-1 text-xs text-neutral-500 hover:text-red-400 transition text-center py-1"
            >
              Reset Saved Progress
            </button>
          )}
        </div>
      )}

      {/* Sector Level Select View */}
      {view === 'levels' && (
        <div className="z-10 w-full max-w-2xl bg-neutral-900/95 border border-cyan-500/60 rounded-xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-800">
            <div>
              <h3 className="text-lg font-pixel text-cyan-300">FACILITY SECTOR SELECTION</h3>
              <p className="text-xs text-neutral-400">12 Expansive Sectors across 6 Update Eras</p>
            </div>
            <button
              onClick={() => setView('main')}
              className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 rounded-lg transition"
            >
              BACK
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {LEVELS.map((lvl, idx) => {
              const isUnlocked = idx <= (savedGame?.highestUnlockedLevel || 0);
              return (
                <button
                  key={lvl.id}
                  disabled={!isUnlocked}
                  onClick={() => handleStart(idx)}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between transition min-h-[90px] ${
                    isUnlocked
                      ? 'bg-neutral-950/80 hover:bg-neutral-800 border-cyan-600/60 text-neutral-200 cursor-pointer active:scale-98'
                      : 'bg-neutral-950/40 border-neutral-900 text-neutral-600 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold font-pixel">
                      <span className={isUnlocked ? 'text-cyan-400' : 'text-neutral-600'}>
                        SECTOR 0{lvl.id}
                      </span>
                      {!isUnlocked && <span className="text-[9px] text-neutral-600">[LOCKED]</span>}
                    </div>
                    <span className="text-xs font-semibold mt-1 block truncate">{lvl.title}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 line-clamp-1">{lvl.subtitle}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setView('main')}
            className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-semibold text-sm transition"
          >
            BACK TO MAIN MENU
          </button>
        </div>
      )}

      {/* Settings View */}
      {view === 'settings' && (
        <div className="z-10 w-full max-w-md bg-neutral-900/90 border border-cyan-500/60 rounded-xl p-6 shadow-2xl">
          <h3 className="text-lg font-pixel text-cyan-300 text-center mb-4">SETTINGS</h3>
          <div className="space-y-4 text-xs text-neutral-300 mb-6">
            <div>
              <div className="flex justify-between mb-1">
                <span>Master Volume</span>
                <span>{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, masterVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-400 bg-neutral-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Music & Ambient Synth</span>
                <span>{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, musicVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-400 bg-neutral-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Sound Effects (SFX)</span>
                <span>{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, sfxVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-400 bg-neutral-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-neutral-800 space-y-2">
              <label className="flex items-center justify-between p-2 rounded bg-neutral-950/60 cursor-pointer">
                <span>Screen Shake</span>
                <input
                  type="checkbox"
                  checked={settings.screenShake}
                  onChange={(e) => onUpdateSettings({ ...settings, screenShake: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-neutral-950/60 cursor-pointer">
                <span>CRT Scanlines & Temporal Glitch</span>
                <input
                  type="checkbox"
                  checked={settings.crtEffects}
                  onChange={(e) => onUpdateSettings({ ...settings, crtEffects: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-neutral-950/60 cursor-pointer">
                <span>Reduced FX (Performance)</span>
                <input
                  type="checkbox"
                  checked={settings.reducedFX}
                  onChange={(e) => onUpdateSettings({ ...settings, reducedFX: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 rounded"
                />
              </label>
            </div>
          </div>
          <button
            onClick={() => setView('main')}
            className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-semibold text-sm transition"
          >
            BACK
          </button>
        </div>
      )}

      {/* Help / Lore View */}
      {view === 'help' && (
        <div className="z-10 w-full max-w-xl bg-neutral-900/90 border border-cyan-500/60 rounded-xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
          <h3 className="text-lg font-pixel text-cyan-300 text-center mb-4">HOW TO PLAY</h3>
          <div className="space-y-3 text-xs text-neutral-300 mb-6">
            <div className="bg-neutral-950/80 p-3 rounded border border-neutral-800">
              <h4 className="text-cyan-400 font-bold mb-1">THE TEMPORAL LOOP</h4>
              <p className="text-neutral-400 leading-relaxed">
                You have 30 seconds before time resets. Your previous timeline is recorded into a transparent Echo that replicates your exact steps. Cooperate with yourself to unlock doors, push crates, and drain flooded sectors!
              </p>
            </div>

            <div className="bg-neutral-950/80 p-3 rounded border border-neutral-800">
              <h4 className="text-purple-400 font-bold mb-1">THE PARADOX</h4>
              <p className="text-neutral-400 leading-relaxed">
                A dangerous temporal entity patrols later sectors. It adapts to routes you take repeatedly. Hide inside lockers or trigger noise machines to slip by!
              </p>
            </div>

            <div className="bg-neutral-950/80 p-3 rounded border border-neutral-800">
              <h4 className="text-amber-400 font-bold mb-1">KEYBOARD CONTROLS</h4>
              <ul className="space-y-1">
                <li><span className="text-cyan-300">W, A, S, D / Arrows:</span> Move Player</li>
                <li><span className="text-cyan-300">E / Space:</span> Interact (Terminals, Levers, Lockers)</li>
                <li><span className="text-cyan-300">R:</span> Early Rewind / Spawn Next Echo</li>
                <li><span className="text-cyan-300">ESC:</span> Pause Game</li>
              </ul>
            </div>
          </div>
          <button
            onClick={() => setView('main')}
            className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-semibold text-sm transition"
          >
            BACK
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="z-10 mt-8 text-[11px] text-neutral-600 font-mono">
        ECHOES OF TOMORROW // INDIE PUZZLE ADVENTURE
      </div>
    </div>
  );
};
