import React, { useState } from 'react';
import { X, Sparkles, Wrench, Bug, ShieldCheck, CheckCircle2, History, ChevronRight } from 'lucide-react';
import { UPDATE_LOGS, CURRENT_GAME_VERSION } from '../data/updates';
import { UpdateLogEntry } from '../types';

interface UpdateLogModalProps {
  onClose: () => void;
  initialVersion?: string;
}

export const UpdateLogModal: React.FC<UpdateLogModalProps> = ({ onClose, initialVersion = CURRENT_GAME_VERSION }) => {
  const [selectedVersion, setSelectedVersion] = useState<string>(initialVersion);

  const activeEntry: UpdateLogEntry =
    UPDATE_LOGS.find((log) => log.version === selectedVersion) || UPDATE_LOGS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md font-mono-tech select-none animate-fade-in">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-pixel font-bold text-cyan-300">FACILITY UPDATE LOG</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300 rounded-full">
                  CURRENT: V{CURRENT_GAME_VERSION}
                </span>
              </div>
              <p className="text-xs text-neutral-400">Project Tomorrow expansion archives and patch logs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar version selector + Details */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Version Selector Sidebar */}
          <div className="w-full md:w-56 bg-neutral-950/60 border-b md:border-b-0 md:border-r border-neutral-800 p-3 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0">
            {UPDATE_LOGS.map((log) => {
              const isSelected = log.version === selectedVersion;
              return (
                <button
                  key={log.version}
                  onClick={() => setSelectedVersion(log.version)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition shrink-0 md:shrink ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500/80 text-white shadow-lg shadow-cyan-950/50'
                      : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-pixel text-xs font-bold text-cyan-400">v{log.version}</span>
                      {log.isMajor && (
                        <span className="px-1.5 py-0.2 text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded uppercase font-bold">
                          MAJOR
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-neutral-200 truncate mt-0.5">{log.title}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{log.releaseDate}</div>
                  </div>
                  <ChevronRight className={`w-4 h-4 hidden md:block ${isSelected ? 'text-cyan-400' : 'text-neutral-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Version Changelog Details */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* Version Banner */}
            <div className="p-4 bg-gradient-to-r from-cyan-950/40 via-neutral-900 to-neutral-900 border border-cyan-500/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">
                  VERSION {activeEntry.version} // {activeEntry.releaseDate}
                </span>
                {activeEntry.isMajor && (
                  <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500 text-cyan-300 text-[10px] font-bold rounded">
                    MAJOR EXPANSION
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-pixel font-bold text-white mb-2">{activeEntry.title}</h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">{activeEntry.description}</p>
            </div>

            {/* New Features Section */}
            {activeEntry.newFeatures && activeEntry.newFeatures.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>NEW SYSTEMS & CONTENT</span>
                </div>
                <div className="space-y-2">
                  {activeEntry.newFeatures.map((feat, i) => (
                    <div
                      key={i}
                      className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg flex items-start gap-2.5 text-xs text-neutral-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements Section */}
            {activeEntry.improvements && activeEntry.improvements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider mb-3">
                  <Wrench className="w-4 h-4 text-teal-400" />
                  <span>QUALITY OF LIFE & GRAPHICS</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeEntry.improvements.map((imp, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-neutral-950/60 border border-neutral-800/80 rounded-lg text-xs text-neutral-300 flex items-start gap-2"
                    >
                      <span className="text-teal-400 font-bold">•</span>
                      <span>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fixes Section */}
            {activeEntry.fixes && activeEntry.fixes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                  <Bug className="w-4 h-4 text-amber-400" />
                  <span>RESOLVED ANOMALIES & BUG FIXES</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeEntry.fixes.map((fix, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-neutral-950/60 border border-neutral-800/80 rounded-lg text-xs text-neutral-400 flex items-start gap-2"
                    >
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{fix}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>SAVE PROGRESS BACKWARDS COMPATIBLE ACROSS ALL UPDATES</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold rounded-lg transition"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};
