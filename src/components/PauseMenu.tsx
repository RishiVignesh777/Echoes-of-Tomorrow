import React, { useState } from 'react';
import { Play, RotateCcw, Settings, HelpCircle, LogOut, Keyboard } from 'lucide-react';
import { GameSettings, DEFAULT_KEY_BINDINGS } from '../types';
import { SettingsView } from './SettingsView';
import { formatKeyName } from '../utils/keyFormat';

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
  const bindings = settings.keyBindings || DEFAULT_KEY_BINDINGS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-mono-tech select-none">
      <div
        className={`w-full ${
          activeTab === 'settings' ? 'max-w-xl max-h-[90vh]' : 'max-w-md'
        } bg-neutral-950 border border-cyan-500/60 rounded-xl p-6 shadow-2xl shadow-cyan-950/40 relative flex flex-col transition-all duration-200`}
      >
        {/* Header */}
        <div className="text-center pb-4 mb-4 border-b border-neutral-800 shrink-0">
          <h2 className="text-xl font-bold font-pixel text-cyan-300 tracking-wider">
            {activeTab === 'menu' && 'SYSTEM PAUSED'}
            {activeTab === 'settings' && 'SETTINGS & CONTROLS'}
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
              <span>SETTINGS & KEY REMAPPING</span>
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
          <div className="flex-1 overflow-hidden">
            <SettingsView
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              onClose={() => setActiveTab('menu')}
              inGame={true}
            />
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
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-amber-400" />
                  ACTIVE KEYBOARD CONTROLS
                </h4>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                >
                  Customize in Settings
                </button>
              </div>
              <ul className="space-y-1.5 text-neutral-300 font-mono text-[11px]">
                <li className="flex justify-between">
                  <span className="text-neutral-400">Movement:</span>
                  <span className="text-cyan-300 font-bold">
                    {formatKeyName(bindings.moveUp)}, {formatKeyName(bindings.moveLeft)},{' '}
                    {formatKeyName(bindings.moveDown)}, {formatKeyName(bindings.moveRight)} / Arrows
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-neutral-400">Interact (Terminals/Doors):</span>
                  <span className="text-emerald-300 font-bold">{formatKeyName(bindings.interact)} / Space</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-neutral-400">Rewind / Next Echo:</span>
                  <span className="text-teal-300 font-bold">{formatKeyName(bindings.rewind)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-neutral-400">Chronal Insight Hint:</span>
                  <span className="text-amber-300 font-bold">{formatKeyName(bindings.chronalInsight)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-neutral-400">Pause Menu:</span>
                  <span className="text-neutral-300 font-bold">{formatKeyName(bindings.pause)}</span>
                </li>
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
