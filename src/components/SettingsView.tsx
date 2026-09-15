import React, { useState } from 'react';
import { Volume2, Radio, Keyboard, Sliders, Shield, Eye, Sparkles } from 'lucide-react';
import { GameSettings } from '../types';
import { soundManager } from '../audio/soundManager';
import { KeyRemapInterface } from './KeyRemapInterface';

interface SettingsViewProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onClose: () => void;
  inGame?: boolean;
  defaultTab?: 'audio' | 'controls';
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  inGame = false,
  defaultTab = 'audio',
}) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'controls'>(defaultTab);

  return (
    <div className="flex flex-col h-full">
      {/* Settings Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 mb-4 p-1 bg-neutral-950/80 border border-neutral-800 rounded-xl shrink-0">
        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('audio');
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'audio'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>AUDIO & VISUALS</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('controls');
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'controls'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>KEY REMAPPING</span>
        </button>
      </div>

      {/* Tab 1: Audio & Visuals */}
      {activeTab === 'audio' && (
        <div className="space-y-4 text-xs text-neutral-300 overflow-y-auto pr-1">
          {/* Master Volume */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="flex items-center gap-1.5 font-semibold text-neutral-200">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                Master Volume
              </span>
              <span className="font-mono text-cyan-400">{Math.round(settings.masterVolume * 100)}%</span>
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
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-neutral-200">Music & Synthesizer</span>
              <span className="font-mono text-cyan-400">{Math.round(settings.musicVolume * 100)}%</span>
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

          {/* Ambient Volume */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-teal-400" />
                <span>Ambient Drone & Temporal Static</span>
              </span>
              <span className="font-mono text-teal-400">
                {Math.round((settings.ambientVolume ?? 0.8) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.ambientVolume ?? 0.8}
              onChange={(e) =>
                onUpdateSettings({ ...settings, ambientVolume: parseFloat(e.target.value) })
              }
              className="w-full accent-teal-400 bg-neutral-800 h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* SFX Volume */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-neutral-200">Sound Effects (SFX)</span>
              <span className="font-mono text-cyan-400">{Math.round(settings.sfxVolume * 100)}%</span>
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

          {/* Active Soundscape Badge if in-game */}
          {inGame && (
            <div className="p-3 bg-teal-950/30 border border-teal-500/30 rounded-xl text-xs">
              <div className="flex items-center justify-between text-teal-300 font-bold mb-1">
                <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                  Dynamic Acoustic Soundscape
                </span>
                <span className="text-[10px] font-mono text-teal-400 bg-teal-900/60 px-2 py-0.5 rounded uppercase">
                  {soundManager.getCurrentEnvironment().replace('_', ' ')}
                </span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                {soundManager.getCurrentEnvironmentDescription()}
              </p>
            </div>
          )}

          {/* Visual Toggles */}
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-900 cursor-pointer transition">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <div>
                  <div className="font-semibold text-neutral-200">Screen Shake</div>
                  <div className="text-[10px] text-neutral-400">Kinetic impact during temporal resets and explosions</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.screenShake}
                onChange={(e) => onUpdateSettings({ ...settings, screenShake: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-900 cursor-pointer transition">
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <div>
                  <div className="font-semibold text-neutral-200">CRT Scanlines & Glitch</div>
                  <div className="text-[10px] text-neutral-400">Cathode-ray distortion and paradox visual noise</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.crtEffects}
                onChange={(e) => onUpdateSettings({ ...settings, crtEffects: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-900 cursor-pointer transition">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <div>
                  <div className="font-semibold text-neutral-200">Reduced FX (Performance Mode)</div>
                  <div className="text-[10px] text-neutral-400">Optimizes canvas drawing for lightweight rendering</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.reducedFX}
                onChange={(e) => onUpdateSettings({ ...settings, reducedFX: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab 2: Keyboard Remapping */}
      {activeTab === 'controls' && (
        <div className="overflow-y-auto max-h-[65vh] pr-1">
          <KeyRemapInterface settings={settings} onUpdateSettings={onUpdateSettings} />
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => {
          soundManager.playButtonClick();
          onClose();
        }}
        className="mt-4 w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl font-bold text-xs transition active:scale-98 shrink-0"
      >
        BACK
      </button>
    </div>
  );
};
