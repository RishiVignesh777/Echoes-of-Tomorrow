import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  RotateCcw,
  Sparkles,
  Check,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Hand,
  Clock,
  Pause,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { KeyBindings, DEFAULT_KEY_BINDINGS, GameSettings } from '../types';
import { formatKeyName } from '../utils/keyFormat';
import { soundManager } from '../audio/soundManager';

interface KeyRemapInterfaceProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
}

interface ActionMeta {
  key: keyof KeyBindings;
  label: string;
  category: 'movement' | 'action';
  description: string;
  icon: React.ReactNode;
}

const ACTION_METAS: ActionMeta[] = [
  {
    key: 'moveUp',
    label: 'Move Up',
    category: 'movement',
    description: 'Walk forward north through sector corridors',
    icon: <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />,
  },
  {
    key: 'moveLeft',
    label: 'Move Left',
    category: 'movement',
    description: 'Walk west toward terminal bays and lockers',
    icon: <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />,
  },
  {
    key: 'moveDown',
    label: 'Move Down',
    category: 'movement',
    description: 'Walk south toward pressure plates and crates',
    icon: <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />,
  },
  {
    key: 'moveRight',
    label: 'Move Right',
    category: 'movement',
    description: 'Walk east toward containment gates and exits',
    icon: <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />,
  },
  {
    key: 'interact',
    label: 'Interact / Action',
    category: 'action',
    description: 'Operate terminals, levers, buttons, lockers',
    icon: <Hand className="w-3.5 h-3.5 text-emerald-400" />,
  },
  {
    key: 'rewind',
    label: 'Manual Rewind',
    category: 'action',
    description: 'End timeline loop early & summon your next Echo',
    icon: <RotateCcw className="w-3.5 h-3.5 text-teal-400" />,
  },
  {
    key: 'chronalInsight',
    label: 'Chronal Insight',
    category: 'action',
    description: 'Expend 1 Memory Fragment to reveal ghost trajectory',
    icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
  },
  {
    key: 'pause',
    label: 'Pause Experiment',
    category: 'action',
    description: 'Open the temporal pause menu',
    icon: <Pause className="w-3.5 h-3.5 text-neutral-400" />,
  },
  {
    key: 'restartRoom',
    label: 'Restart Room',
    category: 'action',
    description: 'Quickly restart from spawn or active checkpoint',
    icon: <RefreshCw className="w-3.5 h-3.5 text-red-400" />,
  },
];

const PRESETS: { name: string; description: string; bindings: KeyBindings }[] = [
  {
    name: 'WASD Standard',
    description: 'Standard modern gamer layout',
    bindings: {
      moveUp: 'w',
      moveDown: 's',
      moveLeft: 'a',
      moveRight: 'd',
      interact: 'e',
      rewind: 'r',
      chronalInsight: 'c',
      pause: 'escape',
      restartRoom: 'backspace',
    },
  },
  {
    name: 'Arrow Keys',
    description: 'Classic arcade directional keys',
    bindings: {
      moveUp: 'arrowup',
      moveDown: 'arrowdown',
      moveLeft: 'arrowleft',
      moveRight: 'arrowright',
      interact: 'enter',
      rewind: 'r',
      chronalInsight: 'c',
      pause: 'escape',
      restartRoom: 'backspace',
    },
  },
  {
    name: 'ESDF Home-Row',
    description: 'Touch-typist layout with extra left keys',
    bindings: {
      moveUp: 'e',
      moveDown: 'd',
      moveLeft: 's',
      moveRight: 'f',
      interact: 'r',
      rewind: 't',
      chronalInsight: 'v',
      pause: 'escape',
      restartRoom: 'backspace',
    },
  },
  {
    name: 'ZQSD (AZERTY)',
    description: 'French/Belgian keyboard layout',
    bindings: {
      moveUp: 'z',
      moveDown: 's',
      moveLeft: 'q',
      moveRight: 'd',
      interact: 'e',
      rewind: 'r',
      chronalInsight: 'c',
      pause: 'escape',
      restartRoom: 'backspace',
    },
  },
];

export const KeyRemapInterface: React.FC<KeyRemapInterfaceProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const currentBindings: KeyBindings = {
    ...DEFAULT_KEY_BINDINGS,
    ...(settings.keyBindings || {}),
  };

  const [recordingAction, setRecordingAction] = useState<keyof KeyBindings | null>(null);
  const [conflictNotice, setConflictNotice] = useState<string | null>(null);

  // Key listening effect when in recording mode
  useEffect(() => {
    if (!recordingAction) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const pressedKey = e.key.toLowerCase();

      // Cancel on Escape only if NOT explicitly remapping the pause key
      if (pressedKey === 'escape' && recordingAction !== 'pause') {
        setRecordingAction(null);
        setConflictNotice(null);
        soundManager.playButtonClick();
        return;
      }

      // Find if this key is currently mapped to any other action
      const conflictingAction = (Object.keys(currentBindings) as (keyof KeyBindings)[]).find(
        (actionKey) => actionKey !== recordingAction && currentBindings[actionKey]?.toLowerCase() === pressedKey
      );

      const updatedBindings: KeyBindings = { ...currentBindings };

      if (conflictingAction) {
        // Swap bindings with conflicting action
        const oldKeyForCurrent = currentBindings[recordingAction] || 'w';
        updatedBindings[conflictingAction] = oldKeyForCurrent;
        updatedBindings[recordingAction] = pressedKey;

        const conflictingLabel = ACTION_METAS.find((m) => m.key === conflictingAction)?.label || conflictingAction;
        setConflictNotice(
          `Key "${formatKeyName(pressedKey)}" was assigned to ${conflictingLabel} — keys swapped automatically.`
        );
      } else {
        updatedBindings[recordingAction] = pressedKey;
        setConflictNotice(null);
      }

      soundManager.playButtonClick();
      onUpdateSettings({
        ...settings,
        keyBindings: updatedBindings,
      });

      setRecordingAction(null);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [recordingAction, currentBindings, settings, onUpdateSettings]);

  const handleApplyPreset = (presetBindings: KeyBindings) => {
    soundManager.playButtonClick();
    onUpdateSettings({
      ...settings,
      keyBindings: { ...presetBindings },
    });
    setRecordingAction(null);
    setConflictNotice(null);
  };

  const handleResetDefaults = () => {
    soundManager.playButtonClick();
    onUpdateSettings({
      ...settings,
      keyBindings: { ...DEFAULT_KEY_BINDINGS },
    });
    setRecordingAction(null);
    setConflictNotice('Key bindings reset to default WASD configuration.');
  };

  const movementActions = ACTION_METAS.filter((a) => a.category === 'movement');
  const actionActions = ACTION_METAS.filter((a) => a.category === 'action');

  return (
    <div className="space-y-4">
      {/* Banner / Instructions */}
      <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl flex items-start justify-between gap-3 text-xs">
        <div className="flex items-start gap-2">
          <Keyboard className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <div className="font-bold text-cyan-300">CUSTOM KEY REMAPPING</div>
            <p className="text-neutral-400 text-[11px] mt-0.5">
              Click any keycap to rebind. Press the new key on your keyboard. Conflicting assignments swap automatically.
            </p>
          </div>
        </div>
        <button
          onClick={handleResetDefaults}
          className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 rounded-lg text-[10px] font-bold transition shrink-0 flex items-center gap-1 active:scale-95"
          title="Restore factory WASD bindings"
        >
          <RotateCcw className="w-3 h-3 text-cyan-400" />
          <span>RESET DEFAULTS</span>
        </button>
      </div>

      {/* Recording Alert Banner */}
      {recordingAction && (
        <div className="p-3 bg-amber-950/80 border-2 border-amber-400 rounded-xl text-amber-200 text-xs flex items-center justify-between animate-pulse shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>
              PRESS ANY KEY FOR{' '}
              <strong className="text-white uppercase font-pixel tracking-wider">
                {ACTION_METAS.find((m) => m.key === recordingAction)?.label}
              </strong>
            </span>
          </div>
          <button
            onClick={() => setRecordingAction(null)}
            className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white text-[10px] rounded font-mono font-bold"
          >
            CANCEL [ESC]
          </button>
        </div>
      )}

      {/* Conflict / Notification Banner */}
      {conflictNotice && !recordingAction && (
        <div className="p-2.5 bg-neutral-900/90 border border-teal-500/40 rounded-lg text-teal-300 text-[11px] flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>{conflictNotice}</span>
        </div>
      )}

      {/* Presets Bar */}
      <div>
        <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1.5 flex items-center gap-1">
          <Sliders className="w-3 h-3 text-cyan-400" />
          <span>KEYBOARD PRESETS</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyPreset(preset.bindings)}
              className="p-2 bg-neutral-900/70 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500/50 rounded-lg text-left transition group active:scale-95"
            >
              <div className="text-xs font-bold text-neutral-200 group-hover:text-cyan-300">{preset.name}</div>
              <div className="text-[9px] text-neutral-500 truncate">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Movement Section */}
      <div>
        <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ArrowUp className="w-3 h-3 text-cyan-400" />
            <span>MOVEMENT CONTROLS</span>
          </span>
          <span className="text-[9px] font-mono text-neutral-500 font-normal">
            Arrow keys also function as universal secondary
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {movementActions.map((action) => {
            const isRecording = recordingAction === action.key;
            const currentKey = currentBindings[action.key];
            const formatted = formatKeyName(currentKey);

            return (
              <div
                key={action.key}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                  isRecording
                    ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-500/40'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300">
                    {action.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-200">{action.label}</div>
                    <div className="text-[10px] text-neutral-400">{action.description}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    setRecordingAction(action.key);
                    setConflictNotice(null);
                  }}
                  className={`min-w-[56px] px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition shadow-[0_2px_0_rgba(0,0,0,0.8)] active:translate-y-0.5 ${
                    isRecording
                      ? 'bg-amber-400 text-neutral-950 border-amber-300 animate-pulse font-bold'
                      : 'bg-neutral-950 hover:bg-cyan-950/60 text-cyan-300 hover:text-cyan-200 border-neutral-700 hover:border-cyan-500'
                  }`}
                  title={`Click to rebind ${action.label}`}
                >
                  {isRecording ? 'PRESS...' : formatted}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Controls Section */}
      <div>
        <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Hand className="w-3 h-3 text-emerald-400" />
            <span>ACTION CONTROLS</span>
          </span>
          <span className="text-[9px] font-mono text-neutral-500 font-normal">
            Interact also supports Space unless rebound
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {actionActions.map((action) => {
            const isRecording = recordingAction === action.key;
            const currentKey = currentBindings[action.key];
            const formatted = formatKeyName(currentKey);

            return (
              <div
                key={action.key}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                  isRecording
                    ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-500/40'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300">
                    {action.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-200">{action.label}</div>
                    <div className="text-[10px] text-neutral-400">{action.description}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    setRecordingAction(action.key);
                    setConflictNotice(null);
                  }}
                  className={`min-w-[56px] px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition shadow-[0_2px_0_rgba(0,0,0,0.8)] active:translate-y-0.5 ${
                    isRecording
                      ? 'bg-amber-400 text-neutral-950 border-amber-300 animate-pulse font-bold'
                      : 'bg-neutral-950 hover:bg-emerald-950/60 text-emerald-300 hover:text-emerald-200 border-neutral-700 hover:border-emerald-500'
                  }`}
                  title={`Click to rebind ${action.label}`}
                >
                  {isRecording ? 'PRESS...' : formatted}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
