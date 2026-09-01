import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  Send,
  BrainCircuit,
  Zap,
  Target,
  Shield,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

export const AIAssistantModal: React.FC = () => {
  const { isAIAssistantOpen, setIsAIAssistantOpen, games, playUiSound, showToast } = useApp();

  const [prompt, setPrompt] = useState('');
  const [selectedGame, setSelectedGame] = useState('Cyber Strike');
  const [userRank, setUserRank] = useState('Grandmaster / Pro');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(
    `### 🎯 Tactical Meta Analysis: Cyber Strike (Sector 7)
**Recommended Role:** Quantum Infiltrator & Site Anchor

#### 1. Weapon & Gear Optimization
- **Primary:** *Vortex-9 Plasma Carbine* (Recoil Stabilizer Gen-3, Thermal Holographic Sight)
- **Secondary:** *Ion Phase Pistol* (Quickdraw Magnet Holster)
- **Tactical Utility:** Quantum Blink Beacon + EMP Disruptor Grenade

#### 2. Choke Point Positioning & Timings
- **0:15 Mark:** Deploy blink beacon on B-Balcony high ground before enemy utility pushes main gate.
- **0:45 Mark:** Chain EMP disruption to disable enemy auto-turrets and kinetic shields.
- **Late Round (1vX):** Fall back to Pillar 3, play sound cues with head-level crosshair placement.`
  );

  if (!isAIAssistantOpen) return null;

  const quickPrompts = [
    'Optimal weapon loadout and positioning for tournament clutch',
    'Best speedrun lines and boost chaining for Neon Riders',
    'High-DPS build and rune setup for Shadow Legends boss fight',
    'Squad communication callouts and counter-strategies for Battle Arena',
  ];

  const handleAskAI = async (customText?: string) => {
    const textToSend = customText || prompt;
    if (!textToSend.trim()) return;

    setLoading(true);
    playUiSound('click');

    try {
      const res = await fetch('/api/ai/tactical-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          gameTitle: selectedGame,
          userRank,
          context: 'CYBERX Esports & Meta Optimizer',
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      } else if (data.fallback) {
        setAnalysisResult(data.fallback);
      } else {
        setAnalysisResult('Analysis completed: Focus on crosshair placement, team economy, and rotational cooldowns.');
      }
      playUiSound('success');
    } catch (err: any) {
      console.warn('AI API network fetch fallback:', err);
      setAnalysisResult(
        `### 🎯 Tactical AI Mastermind Strategy
**Game:** ${selectedGame} | **Rank Tier:** ${userRank}

#### High-Thinking Meta Recommendations:
1. **Loadout Synergy:** Prioritize high projectile velocity and fast weapon swap attachments to punish aggressive pushes.
2. **Positional Control:** Hold elevation angles with covered retreat lines. Never engage without active cooldown support.
3. **Pacing & Timing:** Force opponents to expend utility before committing to site executes.`
      );
    } finally {
      setLoading(false);
      setPrompt('');
    }
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    showToast('Copied', 'Strategy copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 rounded-3xl overflow-hidden border border-indigo-500/40 shadow-2xl flex flex-col max-h-[90vh] text-white">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">CYBERX AI MASTERMIND</h3>
                <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded text-[10px] font-black">
                  HIGH THINKING
                </span>
              </div>
              <p className="text-xs text-slate-400">Gemini 3.1 Pro Esports Strategist & Game Theory Engine</p>
            </div>
          </div>

          <button
            onClick={() => setIsAIAssistantOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/90">
          {/* Game Selector & Rank Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5">Target Game</label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
              >
                {games.map((g) => (
                  <option key={g.id} value={g.title}>
                    {g.title} ({g.genre})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5">Player Skill Bracket</label>
              <select
                value={userRank}
                onChange={(e) => setUserRank(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Beginner (Learning Mechanics)">Beginner (Learning Mechanics)</option>
                <option value="Competitive Gold / Platinum">Competitive Gold / Platinum</option>
                <option value="Diamond / Master Tier">Diamond / Master Tier</option>
                <option value="Grandmaster / Esports Pro">Grandmaster / Esports Pro</option>
              </select>
            </div>
          </div>

          {/* Quick Prompts */}
          <div>
            <span className="text-xs font-black uppercase text-indigo-400 tracking-wider block mb-2">
              QUICK STRATEGY SCENARIOS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskAI(qp)}
                  className="p-2.5 text-left text-xs bg-slate-800/80 hover:bg-indigo-900/40 hover:border-indigo-500 border border-slate-700/70 rounded-xl text-slate-200 transition line-clamp-1"
                >
                  &bull; {qp}
                </button>
              ))}
            </div>
          </div>

          {/* AI Analysis Result Card */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 relative">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300">Tactical Strategy Breakdown</span>
              </div>
              <button
                onClick={handleCopy}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                <div>
                  <p className="text-sm font-bold text-white">Deep Thinking in Progress...</p>
                  <p className="text-xs text-slate-400">
                    Evaluating meta timings, weapon recoil statistics, and tournament win rates.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                {analysisResult}
              </div>
            )}
          </div>
        </div>

        {/* Footer Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAI();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask for custom loadouts, boss counters, choke point strategies..."
              className="flex-1 bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Analyze</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
