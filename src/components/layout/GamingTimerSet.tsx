import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Zap,
  Bell,
  CheckCircle2,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GamingTimerSet: React.FC = () => {
  const { playUiSound, showToast } = useApp();

  // Mode: 'stopwatch' (Session Playtime), 'countdown' (Break / Game Limit), 'daily' (UTC Daily Reset)
  const [mode, setMode] = useState<'stopwatch' | 'countdown' | 'daily'>('stopwatch');

  // Stopwatch state (Session Timer)
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(true);

  // Countdown state (Custom / Preset Timer)
  const [countdownDuration, setCountdownDuration] = useState(25 * 60); // 25 mins default
  const [countdownRemaining, setCountdownRemaining] = useState(25 * 60);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number>(25);

  // Daily UTC Countdown state
  const [dailyTimeLeft, setDailyTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Sound chime synthesizer for countdown completion
  const playChimeSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;

      // Dual harmonic chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.4); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.6); // D6

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.85);
      osc2.stop(now + 0.85);
    } catch (e) {
      console.warn('AudioContext not available for chime', e);
    }
  };

  // Stopwatch interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStopwatchRunning]);

  // Countdown interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCountdownRunning) {
      interval = setInterval(() => {
        setCountdownRemaining((prev) => {
          if (prev <= 1) {
            setIsCountdownRunning(false);
            playChimeSound();
            showToast('Timer Completed!', 'Your gaming session interval reached 00:00. Time for a tactical break!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCountdownRunning, showToast]);

  // Daily UTC Countdown interval
  useEffect(() => {
    const updateDailyTime = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setUTCHours(23, 59, 59, 999);

      const diff = Math.max(0, endOfDay.getTime() - now.getTime());
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setDailyTimeLeft({ hours, minutes, seconds });
    };

    updateDailyTime();
    const interval = setInterval(updateDailyTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const setPresetCountdown = (mins: number) => {
    playUiSound('click');
    setSelectedPreset(mins);
    setCountdownDuration(mins * 60);
    setCountdownRemaining(mins * 60);
    setIsCountdownRunning(true);
  };

  return (
    <div className="p-3 border-t border-slate-100 bg-slate-50/80 rounded-b-xl space-y-2.5">
      {/* Header Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
          <Timer className="w-3.5 h-3.5 text-blue-600" />
          <span>Real-Time Gaming Timers</span>
        </div>
        <div className="flex items-center gap-0.5 bg-slate-200/80 p-0.5 rounded-lg text-[10px] font-bold">
          <button
            onClick={() => {
              playUiSound('click');
              setMode('stopwatch');
            }}
            className={`px-1.5 py-0.5 rounded-md transition ${
              mode === 'stopwatch' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Session
          </button>
          <button
            onClick={() => {
              playUiSound('click');
              setMode('countdown');
            }}
            className={`px-1.5 py-0.5 rounded-md transition ${
              mode === 'countdown' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Break
          </button>
          <button
            onClick={() => {
              playUiSound('click');
              setMode('daily');
            }}
            className={`px-1.5 py-0.5 rounded-md transition ${
              mode === 'daily' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Mode 1: Active Session Stopwatch */}
      {mode === 'stopwatch' && (
        <div className="bg-slate-900 text-white rounded-xl p-2.5 shadow-inner border border-slate-800 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isStopwatchRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                }`}
              />
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isStopwatchRunning ? 'Live Session Active' : 'Session Paused'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              +{Math.floor(stopwatchSeconds / 60) * 5} XP
            </span>
          </div>

          <div className="text-center py-0.5">
            <span className="font-mono text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 tracking-widest">
              {formatTime(stopwatchSeconds)}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-800">
            <button
              onClick={() => {
                playUiSound('click');
                setIsStopwatchRunning(!isStopwatchRunning);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                isStopwatchRunning
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
              }`}
            >
              {isStopwatchRunning ? (
                <>
                  <Pause className="w-3 h-3" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" /> Start
                </>
              )}
            </button>

            <button
              onClick={() => {
                playUiSound('click');
                setStopwatchSeconds(0);
                setIsStopwatchRunning(false);
              }}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Reset Stopwatch"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Break / Game Limit Countdown */}
      {mode === 'countdown' && (
        <div className="bg-slate-900 text-white rounded-xl p-2.5 shadow-inner border border-slate-800 space-y-2 animate-fadeIn">
          {/* Preset Buttons */}
          <div className="grid grid-cols-4 gap-1">
            {[15, 25, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => setPresetCountdown(mins)}
                className={`py-0.5 rounded text-[10px] font-bold font-mono transition ${
                  selectedPreset === mins
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>

          <div className="text-center py-0.5">
            <span
              className={`font-mono text-xl font-black tracking-widest ${
                countdownRemaining < 60
                  ? 'text-rose-400 animate-pulse'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400'
              }`}
            >
              {formatTime(countdownRemaining)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-800">
            <button
              onClick={() => {
                playUiSound('click');
                setIsCountdownRunning(!isCountdownRunning);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                isCountdownRunning
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
              }`}
            >
              {isCountdownRunning ? (
                <>
                  <Pause className="w-3 h-3" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" /> Start
                </>
              )}
            </button>

            <button
              onClick={() => {
                playUiSound('click');
                setCountdownRemaining(countdownDuration);
                setIsCountdownRunning(false);
              }}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: Daily UTC Reset Countdown */}
      {mode === 'daily' && (
        <div className="bg-slate-900 text-white rounded-xl p-2.5 shadow-inner border border-slate-800 space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Next Daily Reset (UTC)</span>
            </span>
            <span className="text-emerald-400 font-mono">Streak Safe</span>
          </div>

          <div className="flex items-center justify-center gap-2 py-1">
            <div className="flex flex-col items-center bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 min-w-[40px]">
              <span className="font-mono text-sm font-black text-cyan-300">
                {dailyTimeLeft.hours.toString().padStart(2, '0')}
              </span>
              <span className="text-[8px] uppercase tracking-wider text-slate-500">HRS</span>
            </div>
            <span className="text-slate-600 font-black">:</span>
            <div className="flex flex-col items-center bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 min-w-[40px]">
              <span className="font-mono text-sm font-black text-cyan-300">
                {dailyTimeLeft.minutes.toString().padStart(2, '0')}
              </span>
              <span className="text-[8px] uppercase tracking-wider text-slate-500">MIN</span>
            </div>
            <span className="text-slate-600 font-black">:</span>
            <div className="flex flex-col items-center bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 min-w-[40px]">
              <span className="font-mono text-sm font-black text-cyan-300">
                {dailyTimeLeft.seconds.toString().padStart(2, '0')}
              </span>
              <span className="text-[8px] uppercase tracking-wider text-slate-500">SEC</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
