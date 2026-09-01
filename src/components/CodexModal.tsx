import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Award, FileText, CheckCircle, Lock, Trophy, Zap, Shield, Play } from 'lucide-react';
import { MEMORY_FRAGMENTS, TEMPORAL_ARTIFACTS } from '../data/collectibles';
import { ECHO_CHALLENGES } from '../data/challenges';
import { STORY_LOGS } from '../data/story';
import { SavedGame, MemoryFragment, TemporalArtifact, EchoChallenge, StoryLog } from '../types';
import { soundManager } from '../audio/soundManager';

interface CodexModalProps {
  savedGame: SavedGame | null;
  onClose: () => void;
  onStartChallenge?: (levelIndex: number) => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({ savedGame, onClose, onStartChallenge }) => {
  const [tab, setTab] = useState<'memories' | 'artifacts' | 'challenges' | 'terminals'>('memories');
  const [selectedMemory, setSelectedMemory] = useState<MemoryFragment | null>(Object.values(MEMORY_FRAGMENTS)[0]);
  const [selectedArtifact, setSelectedArtifact] = useState<TemporalArtifact | null>(Object.values(TEMPORAL_ARTIFACTS)[0]);
  const [selectedLog, setSelectedLog] = useState<StoryLog | null>(Object.values(STORY_LOGS)[0]);

  const collectedMemories = savedGame?.memoryFragmentsCollected || [];
  const collectedArtifacts = savedGame?.temporalArtifactsCollected || [];
  const readLogs = savedGame?.readTerminalLogs || [];
  const completedChallenges = savedGame?.completedChallenges || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md font-mono-tech select-none animate-fade-in">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-950 border border-teal-500/60 flex items-center justify-center text-teal-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-pixel font-bold text-teal-300">FACILITY CODEX & ARCHIVES</h2>
              <p className="text-xs text-neutral-400">Project Tomorrow classified lore, crystallized memories, and challenges</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 py-2.5 bg-neutral-950/50 border-b border-neutral-800 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setTab('memories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              tab === 'memories'
                ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>MEMORIES ({collectedMemories.length}/{Object.keys(MEMORY_FRAGMENTS).length})</span>
          </button>

          <button
            onClick={() => setTab('artifacts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              tab === 'artifacts'
                ? 'bg-purple-950 border border-purple-500 text-purple-300 shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <span>ARTIFACTS ({collectedArtifacts.length}/{Object.keys(TEMPORAL_ARTIFACTS).length})</span>
          </button>

          <button
            onClick={() => setTab('challenges')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              tab === 'challenges'
                ? 'bg-amber-950 border border-amber-500 text-amber-300 shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>ECHO CHALLENGES ({completedChallenges.length}/{ECHO_CHALLENGES.length})</span>
          </button>

          <button
            onClick={() => setTab('terminals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              tab === 'terminals'
                ? 'bg-teal-950 border border-teal-500 text-teal-300 shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>TERMINAL LOGS ({readLogs.length}/{Object.keys(STORY_LOGS).length})</span>
          </button>
        </div>

        {/* Tab 1: Memory Fragments */}
        {tab === 'memories' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* List */}
            <div className="w-full md:w-72 bg-neutral-950/70 border-b md:border-b-0 md:border-r border-neutral-800 p-3 space-y-2 overflow-y-auto shrink-0">
              {Object.values(MEMORY_FRAGMENTS).map((frag) => {
                const isUnlocked = collectedMemories.includes(frag.id);
                const isSelected = selectedMemory?.id === frag.id;
                return (
                  <button
                    key={frag.id}
                    onClick={() => {
                      setSelectedMemory(frag);
                      soundManager.playButtonClick();
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-start justify-between transition ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 text-white'
                        : isUnlocked
                        ? 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                        : 'bg-neutral-950/40 border-neutral-900 text-neutral-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold font-pixel">
                        <span className={isUnlocked ? 'text-cyan-400' : 'text-neutral-600'}>{frag.title}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate mt-0.5">{frag.speaker}</div>
                      <div className="text-[9px] text-neutral-500">{frag.sectorName}</div>
                    </div>
                    {isUnlocked ? (
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-neutral-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Viewer */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedMemory ? (
                <div className="space-y-4">
                  <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-xl">
                    <div className="flex items-center justify-between text-xs text-cyan-400 mb-1">
                      <span className="font-bold">{selectedMemory.speaker}</span>
                      <span className="text-[10px] font-mono">{selectedMemory.era}</span>
                    </div>
                    <h3 className="text-lg font-pixel font-bold text-white mb-1">{selectedMemory.title}</h3>
                    <p className="text-xs text-cyan-300/80">{selectedMemory.subtitle} // {selectedMemory.sectorName}</p>
                  </div>

                  <div className="p-5 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-3 font-mono text-sm leading-relaxed text-neutral-200">
                    {selectedMemory.content.map((paragraph, idx) => (
                      <p key={idx} className="italic text-cyan-100/90">{paragraph}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-500 text-xs">
                  Select a Memory Fragment from the list
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Temporal Artifacts */}
        {tab === 'artifacts' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* List */}
            <div className="w-full md:w-72 bg-neutral-950/70 border-b md:border-b-0 md:border-r border-neutral-800 p-3 space-y-2 overflow-y-auto shrink-0">
              {Object.values(TEMPORAL_ARTIFACTS).map((art) => {
                const isUnlocked = collectedArtifacts.includes(art.id);
                const isSelected = selectedArtifact?.id === art.id;
                return (
                  <button
                    key={art.id}
                    onClick={() => {
                      setSelectedArtifact(art);
                      soundManager.playButtonClick();
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-start justify-between transition ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500 text-white'
                        : isUnlocked
                        ? 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                        : 'bg-neutral-950/40 border-neutral-900 text-neutral-600'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold font-pixel text-purple-300">{art.name}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{art.origin}</div>
                    </div>
                    {isUnlocked ? (
                      <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-neutral-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Viewer */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedArtifact ? (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl">
                    <div className="flex items-center justify-between text-xs text-purple-400 mb-1">
                      <span className="font-bold">RARITY: {selectedArtifact.rarity.toUpperCase()}</span>
                      <span className="text-[10px] font-mono">{selectedArtifact.origin}</span>
                    </div>
                    <h3 className="text-lg font-pixel font-bold text-white mb-1">{selectedArtifact.name}</h3>
                  </div>

                  <div className="p-5 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-4 text-xs text-neutral-200">
                    <div>
                      <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-1">
                        PHYSICAL DESCRIPTION
                      </span>
                      <p className="leading-relaxed text-neutral-300">{selectedArtifact.description}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block mb-1">
                        CHRONOLOGICAL FUNCTION
                      </span>
                      <p className="leading-relaxed text-neutral-300">{selectedArtifact.chronologicalFunction}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-500 text-xs">
                  Select an Artifact to inspect
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Echo Challenges */}
        {tab === 'challenges' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ECHO_CHALLENGES.map((chall) => {
                const isCompleted = completedChallenges.includes(chall.id);
                return (
                  <div
                    key={chall.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                      isCompleted
                        ? 'bg-amber-950/30 border-amber-500/60 text-neutral-100'
                        : 'bg-neutral-950/70 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold rounded">
                          SECTOR 0{chall.levelId}
                        </span>
                        {isCompleted ? (
                          <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                            <Award className="w-4 h-4" />
                            <span>COMPLETED</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-neutral-500">[UNCLAIMED]</span>
                        )}
                      </div>
                      <h4 className="text-sm font-pixel font-bold text-white mb-1">{chall.title}</h4>
                      <p className="text-xs text-neutral-400 mb-3">{chall.description}</p>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                      <div className="text-[10px] text-amber-400 font-bold">
                        REWARD: {chall.rewardBadge}
                      </div>
                      {onStartChallenge && (
                        <button
                          onClick={() => {
                            onClose();
                            onStartChallenge(chall.levelId - 1);
                          }}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>LAUNCH</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Terminal Logs */}
        {tab === 'terminals' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* List */}
            <div className="w-full md:w-72 bg-neutral-950/70 border-b md:border-b-0 md:border-r border-neutral-800 p-3 space-y-2 overflow-y-auto shrink-0">
              {Object.values(STORY_LOGS).map((log) => {
                const isRead = readLogs.includes(log.id);
                const isSelected = selectedLog?.id === log.id;
                return (
                  <button
                    key={log.id}
                    onClick={() => {
                      setSelectedLog(log);
                      soundManager.playButtonClick();
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-start justify-between transition ${
                      isSelected
                        ? 'bg-teal-950/60 border-teal-500 text-white'
                        : isRead
                        ? 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                        : 'bg-neutral-950/40 border-neutral-900 text-neutral-600'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold font-pixel text-teal-300 truncate">{log.title}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{log.sectorName}</div>
                    </div>
                    {isRead ? (
                      <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-neutral-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Viewer */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedLog ? (
                <div className="space-y-4">
                  <div className="p-4 bg-teal-950/30 border border-teal-500/30 rounded-xl">
                    <div className="flex items-center justify-between text-xs text-teal-400 mb-1">
                      <span className="font-bold">{selectedLog.author}</span>
                      <span className="text-[10px] font-mono">{selectedLog.date}</span>
                    </div>
                    <h3 className="text-base font-pixel font-bold text-white mb-1">{selectedLog.title}</h3>
                    <p className="text-xs text-teal-300/80">{selectedLog.sectorName} // CATEGORY: {selectedLog.category}</p>
                  </div>

                  <div className="p-5 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-2.5 font-mono text-xs leading-relaxed text-neutral-200">
                    {selectedLog.content.map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-500 text-xs">
                  Select a Terminal Log from the list
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <span>PROGRESS IS PERSISTED AUTOMATICALLY ACROSS TIMELINES</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg transition"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
