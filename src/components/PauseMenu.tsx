import React, { useState } from 'react';
import { Play, RotateCcw, Settings, HelpCircle, LogOut, Volume2, VolumeX, Eye, Shield, Sliders } from 'lucide-react';
import { GameSettings } from '../types';

interface PauseMenuProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onResume: () => void;
  onRestartRoom: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  settings,
  onUpdateSettings,
  onResume,
  onRestartRoom,
  onMainMenu,
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'settings' | 'help'>('menu');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-mono-tech select-none">
      <div className="w-full max-w-md bg-neutral-950 border border-cyan-500/60 rounded-xl p-6 shadow-2xl shadow-cyan-950/40 relative flex flex-col">
        {/* Header */}
        <div className="text-center pb-4 mb-4 border-b border-neutral-800">
          <h2 className="text-xl font-bold font-pixel text-cyan-300 tracking-wider">
            {activeTab === 'menu' && 'SYSTEM PAUSED'}
            {activeTab === 'settings' && 'SETTINGS & ACCESS'}
            {activeTab === 'help' && 'HOW TO PLAY'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">ECHOES OF TOMORROW // TEMPORAL MATRIX</p>
        </div>

        {/* Main Pause Buttons */}
        {activeTab === 'menu' && (
          <div className="flex flex-col gap-3">
            <button
              id="pause-resume-btn"
              onClick={onResume}
              className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold rounded-lg transition flex items-center justify-center gap-2 active:scale-98"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>RESUME EXPERIMENT</span>
            </button>

            <button
              id="pause-restart-btn"
              onClick={onRestartRoom}
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-semibold rounded-lg transition flex items-center justify-center gap-2 active:scale-98"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>RESTART ROOM / CHECKPOINT</span>
            </button>

            <button
              id="pause-settings-btn"
              onClick={() => setActiveTab('settings')}
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-semibold rounded-lg transition flex items-center justify-center gap-2 active:scale-98"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>SETTINGS & AUDIO</span>
            </button>

            <button
              id="pause-help-btn"
              onClick={() => setActiveTab('help')}
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-semibold rounded-lg transition flex items-center justify-center gap-2 active:scale-98"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>CONTROLS & LORE GUIDE</span>
            </button>

            <button
              id="pause-menu-btn"
              onClick={onMainMenu}
              className="w-full py-2.5 px-4 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 font-semibold rounded-lg transition flex items-center justify-center gap-2 mt-2 active:scale-98"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>EXIT TO MAIN MENU</span>
            </button>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-4">
            {/* Master Volume */}
            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  Master Volume
                </span>
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

            {/* Music Volume */}
            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span className="font-semibold">Music & Ambient Drone</span>
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

            {/* SFX Volume */}
            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span className="font-semibold">Sound Effects (SFX)</span>
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

            {/* Toggles */}
            <div className="space-y-2 pt-2 border-t border-neutral-800 text-xs">
              <label className="flex items-center justify-between p-2 rounded bg-neutral-900/60 hover:bg-neutral-900 cursor-pointer">
                <span>Screen Shake</span>
                <input
                  type="checkbox"
                  checked={settings.screenShake}
                  onChange={(e) => onUpdateSettings({ ...settings, screenShake: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-neutral-900/60 hover:bg-neutral-900 cursor-pointer">
                <span>CRT Retro Scanlines & Glitch</span>
                <input
                  type="checkbox"
                  checked={settings.crtEffects}
                  onChange={(e) => onUpdateSettings({ ...settings, crtEffects: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-neutral-900/60 hover:bg-neutral-900 cursor-pointer">
                <span>Reduced Visual FX (Performance)</span>
                <input
                  type="checkbox"
                  checked={settings.reducedFX}
                  onChange={(e) => onUpdateSettings({ ...settings, reducedFX: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
                />
              </label>
            </div>

            <button
              onClick={() => setActiveTab('menu')}
              className="mt-2 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-lg transition"
            >
              BACK TO PAUSE MENU
            </button>
          </div>
        )}

        {/* How To Play Tab */}
        {activeTab === 'help' && (
          <div className="flex flex-col gap-3 text-xs text-neutral-300 max-h-96 overflow-y-auto pr-1">
            <div className="bg-neutral-900/80 p-3 rounded border border-neutral-800">
              <h4 className="text-cyan-400 font-bold mb-1">THE 30-SECOND TEMPORAL LOOP</h4>
              <p className="leading-relaxed text-neutral-400">
                Every timeline lasts 30 seconds. When the timer hits 00:00, you are reset to the start, and an <span className="text-cyan-300 font-bold">Echo</span> of your exact movements and actions replays automatically.
              </p>
            </div>

            <div className="bg-neutral-900/80 p-3 rounded border border-neutral-800">
              <h4 className="text-emerald-400 font-bold mb-1">COOPERATION IS KEY</h4>
              <p className="leading-relaxed text-neutral-400">
                Stand on pressure plates, push heavy crates, or flip circuit breakers in Timeline 1. In Timeline 2, your Echo will hold them while you venture ahead through opened doors!
              </p>
            </div>

            <div className="bg-neutral-900/80 p-3 rounded border border-neutral-800">
              <h4 className="text-purple-400 font-bold mb-1">THE PARADOX ENEMY</h4>
              <p className="leading-relaxed text-neutral-400">
                A dangerous entity born from severed cycles. It learns your frequent paths. Use maintenance lockers to hide, or trigger noise alarms to bait it away.
              </p>
            </div>

            <div className="bg-neutral-900/80 p-3 rounded border border-neutral-800">
              <h4 className="text-amber-400 font-bold mb-1">KEYBOARD CONTROLS</h4>
              <ul className="space-y-1 text-neutral-300">
                <li><span className="text-neutral-400">W, A, S, D / Arrows:</span> Move character</li>
                <li><span className="text-neutral-400">E / Space:</span> Interact (Terminals, Buttons, Lockers)</li>
                <li><span className="text-neutral-400">R:</span> Instantly Rewind / Start Next Echo</li>
                <li><span className="text-neutral-400">ESC:</span> Pause Menu</li>
              </ul>
            </div>

            <button
              onClick={() => setActiveTab('menu')}
              className="mt-2 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-lg transition"
            >
              BACK TO PAUSE MENU
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
