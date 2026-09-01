import React, { useState, useEffect } from 'react';
import { GameSettings, SavedGame, StoryLog } from './types';
import { MainMenu } from './components/MainMenu';
import { GameCanvas } from './components/GameCanvas';
import { PauseMenu } from './components/PauseMenu';
import { TerminalModal } from './components/TerminalModal';
import { EndingScreen } from './components/EndingScreen';
import { UpdateLogModal } from './components/UpdateLogModal';
import { CodexModal } from './components/CodexModal';
import { soundManager } from './audio/soundManager';
import { LEVELS } from './data/levels';
import { CURRENT_GAME_VERSION } from './data/updates';

const SAVE_KEY = 'echoes_of_tomorrow_save';
const SETTINGS_KEY = 'echoes_of_tomorrow_settings';
const LAST_NOTIFIED_VERSION_KEY = 'echoes_of_tomorrow_last_notified_ver';

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  screenShake: true,
  crtEffects: true,
  reducedFX: false,
  showControlsOverlay: true,
};

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'ending'>('menu');
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [activeEnding, setActiveEnding] = useState<'A' | 'B' | 'C'>('A');
  const [activeTerminalLog, setActiveTerminalLog] = useState<StoryLog | null>(null);
  const [showUpdateLog, setShowUpdateLog] = useState<boolean>(false);
  const [showCodex, setShowCodex] = useState<boolean>(false);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);

  // Load Settings and Save data on mount with version migration
  useEffect(() => {
    try {
      const savedSettingsStr = localStorage.getItem(SETTINGS_KEY);
      if (savedSettingsStr) {
        const parsed = JSON.parse(savedSettingsStr);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }

      const savedGameStr = localStorage.getItem(SAVE_KEY);
      if (savedGameStr) {
        const parsed: Partial<SavedGame> = JSON.parse(savedGameStr);

        // Safe lossless Save Migration to CURRENT_GAME_VERSION
        const migratedSave: SavedGame = {
          version: CURRENT_GAME_VERSION,
          currentLevelIndex: parsed.currentLevelIndex || 0,
          highestUnlockedLevel: parsed.highestUnlockedLevel || 0,
          checkpointActivated: !!parsed.checkpointActivated,
          unlockedEndings: parsed.unlockedEndings || [],
          readTerminalLogs: parsed.readTerminalLogs || [],
          secretUnlocked: !!parsed.secretUnlocked,
          memoryFragmentsCollected: parsed.memoryFragmentsCollected || [],
          temporalArtifactsCollected: parsed.temporalArtifactsCollected || [],
          completedChallenges: parsed.completedChallenges || [],
          timestamp: parsed.timestamp || Date.now(),
        };

        setSavedGame(migratedSave);
        localStorage.setItem(SAVE_KEY, JSON.stringify(migratedSave));
      }

      // Check if user should be notified about new update version
      const lastNotifiedVer = localStorage.getItem(LAST_NOTIFIED_VERSION_KEY);
      if (!lastNotifiedVer || lastNotifiedVer !== CURRENT_GAME_VERSION) {
        setShowUpdateLog(true);
        localStorage.setItem(LAST_NOTIFIED_VERSION_KEY, CURRENT_GAME_VERSION);
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  // Update sound volumes when settings change
  useEffect(() => {
    soundManager.updateVolumes(settings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // LocalStorage fallback
    }
  }, [settings]);

  // Save game progress helper
  const saveProgress = (levelIdx: number, checkpoint: boolean = false) => {
    const updatedSave: SavedGame = {
      version: CURRENT_GAME_VERSION,
      currentLevelIndex: levelIdx,
      highestUnlockedLevel: Math.max(savedGame?.highestUnlockedLevel || 0, levelIdx),
      checkpointActivated: checkpoint,
      unlockedEndings: savedGame?.unlockedEndings || [],
      readTerminalLogs: savedGame?.readTerminalLogs || [],
      secretUnlocked: savedGame?.secretUnlocked || false,
      memoryFragmentsCollected: savedGame?.memoryFragmentsCollected || [],
      temporalArtifactsCollected: savedGame?.temporalArtifactsCollected || [],
      completedChallenges: savedGame?.completedChallenges || [],
      timestamp: Date.now(),
    };
    setSavedGame(updatedSave);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(updatedSave));
    } catch {
      // LocalStorage fallback
    }
  };

  const handleStartGame = (levelIdx: number = 0) => {
    setCurrentLevelIndex(levelIdx);
    setGameState('playing');
    saveProgress(levelIdx);
  };

  const handleLevelComplete = (nextLevelIdx: number) => {
    if (nextLevelIdx >= LEVELS.length) {
      // Completed all levels -> show Ending A default
      handleGameOverEnding('A');
    } else {
      setCurrentLevelIndex(nextLevelIdx);
      saveProgress(nextLevelIdx);
    }
  };

  const handleGameOverEnding = (endingType: 'A' | 'B' | 'C') => {
    setActiveEnding(endingType);
    setGameState('ending');

    // Record unlocked ending
    if (savedGame) {
      const endings = Array.from(new Set([...savedGame.unlockedEndings, endingType]));
      const updatedSave: SavedGame = {
        ...savedGame,
        unlockedEndings: endings,
      };
      setSavedGame(updatedSave);
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(updatedSave));
      } catch {
        // LocalStorage fallback
      }
    }
  };

  const handleCollectMemory = (memoryId: string) => {
    if (!savedGame) return;
    if (!savedGame.memoryFragmentsCollected.includes(memoryId)) {
      const updated: SavedGame = {
        ...savedGame,
        memoryFragmentsCollected: [...savedGame.memoryFragmentsCollected, memoryId],
      };
      setSavedGame(updated);
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  const handleCollectArtifact = (artifactId: string) => {
    if (!savedGame) return;
    if (!savedGame.temporalArtifactsCollected.includes(artifactId)) {
      const updated: SavedGame = {
        ...savedGame,
        temporalArtifactsCollected: [...savedGame.temporalArtifactsCollected, artifactId],
      };
      setSavedGame(updated);
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  const handleResetSave = () => {
    setSavedGame(null);
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // LocalStorage fallback
    }
  };

  return (
    <main className="w-screen h-screen bg-neutral-950 text-neutral-100 overflow-hidden relative select-none">
      {/* 1. Main Menu View */}
      {gameState === 'menu' && (
        <MainMenu
          savedGame={savedGame}
          settings={settings}
          onStartGame={handleStartGame}
          onUpdateSettings={setSettings}
          onResetSave={handleResetSave}
          onOpenUpdateLog={() => setShowUpdateLog(true)}
          onOpenCodex={() => setShowCodex(true)}
        />
      )}

      {/* 2. Active Game Canvas & HUD */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <GameCanvas
          currentLevelIndex={currentLevelIndex}
          settings={settings}
          onLevelComplete={handleLevelComplete}
          onGameOverEnding={handleGameOverEnding}
          onOpenTerminal={(log) => {
            setActiveTerminalLog(log);
            if (savedGame && !savedGame.readTerminalLogs.includes(log.id)) {
              const updated = {
                ...savedGame,
                readTerminalLogs: [...savedGame.readTerminalLogs, log.id],
              };
              setSavedGame(updated);
              try {
                localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
              } catch {}
            }
          }}
          onPauseGame={() => setGameState('paused')}
          onCheckpointReached={() => saveProgress(currentLevelIndex, true)}
          onCollectMemory={handleCollectMemory}
          onCollectArtifact={handleCollectArtifact}
        />
      )}

      {/* 3. Pause & Settings Overlay */}
      {gameState === 'paused' && (
        <PauseMenu
          settings={settings}
          onUpdateSettings={setSettings}
          onResume={() => setGameState('playing')}
          onRestartRoom={() => {
            setGameState('playing');
            // Re-trigger level component reset
            setCurrentLevelIndex((prev) => prev);
          }}
          onMainMenu={() => {
            soundManager.setMusicIntensity('calm');
            setGameState('menu');
          }}
        />
      )}

      {/* 4. Terminal Log Reader Modal */}
      {activeTerminalLog && (
        <TerminalModal
          log={activeTerminalLog}
          onClose={() => setActiveTerminalLog(null)}
        />
      )}

      {/* 5. Update Log Modal */}
      {showUpdateLog && (
        <UpdateLogModal
          onClose={() => setShowUpdateLog(false)}
        />
      )}

      {/* 6. Facility Codex & Archives Modal */}
      {showCodex && (
        <CodexModal
          savedGame={savedGame}
          onClose={() => setShowCodex(false)}
          onStartChallenge={(levelIndex) => {
            setShowCodex(false);
            handleStartGame(levelIndex);
          }}
        />
      )}

      {/* 7. Ending Story Cutscene */}
      {gameState === 'ending' && (
        <EndingScreen
          endingType={activeEnding}
          onRestartGame={() => handleStartGame(0)}
          onMainMenu={() => {
            soundManager.setMusicIntensity('calm');
            setGameState('menu');
          }}
        />
      )}
    </main>
  );
}
