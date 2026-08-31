import React, { useEffect, useState } from 'react';
import { Terminal, X, ShieldAlert, FileText } from 'lucide-react';
import { StoryLog } from '../types';
import { soundManager } from '../audio/soundManager';

interface TerminalModalProps {
  log: StoryLog;
  onClose: () => void;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({ log, onClose }) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);

  useEffect(() => {
    soundManager.playTerminalType();
    setDisplayedLines([]);
    setCurrentLineIdx(0);

    const interval = setInterval(() => {
      setCurrentLineIdx((prev) => {
        if (prev < log.content.length) {
          soundManager.playTerminalType();
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [log]);

  useEffect(() => {
    setDisplayedLines(log.content.slice(0, currentLineIdx));
  }, [currentLineIdx, log.content]);

  // Keyboard shortcut to close (ESC or E or Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in font-mono-tech select-none">
      <div className="w-full max-w-2xl bg-neutral-950 border-2 border-emerald-500/80 rounded-lg p-6 shadow-2xl shadow-emerald-950/40 relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3 mb-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span className="font-pixel text-xs tracking-wider">{log.title}</span>
          </div>

          <div className="flex items-center gap-3">
            {log.isClassified && (
              <span className="flex items-center gap-1 bg-red-950/80 border border-red-500 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                <ShieldAlert className="w-3 h-3" />
                CLASSIFIED
              </span>
            )}
            <button
              id="terminal-close-btn"
              onClick={onClose}
              className="text-neutral-400 hover:text-emerald-300 hover:bg-neutral-900 p-1 rounded transition"
              title="Close Terminal (ESC or E)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata info bar */}
        <div className="bg-neutral-900/80 border border-neutral-800 p-2.5 rounded text-xs text-neutral-400 mb-4 flex flex-col sm:flex-row justify-between gap-1">
          <div>
            <span className="text-neutral-500">AUTHOR: </span>
            <span className="text-emerald-300 font-semibold">{log.author}</span>
          </div>
          <div>
            <span className="text-neutral-500">TIMESTAMP: </span>
            <span className="text-neutral-300">{log.date}</span>
          </div>
        </div>

        {/* Terminal Body with glowing green text */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-sm text-emerald-300 leading-relaxed font-mono">
          {displayedLines.map((line, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-emerald-600 select-none">&gt;</span>
              <p>{line}</p>
            </div>
          ))}
          {currentLineIdx < log.content.length && (
            <div className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-4" />
          )}
        </div>

        {/* Footer Hint */}
        <div className="mt-4 pt-3 border-t border-emerald-900/60 flex items-center justify-between text-xs text-emerald-500">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            <span>ARCHIVE RECORD VERIFIED</span>
          </span>
          <button
            onClick={onClose}
            className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-200 px-4 py-1.5 rounded transition text-xs font-semibold"
          >
            DISMISS [E / ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
