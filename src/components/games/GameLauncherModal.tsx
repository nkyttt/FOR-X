import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Play,
  RotateCcw,
  Trophy,
  Zap,
  Volume2,
  VolumeX,
  Shield,
  Target,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const GameLauncherModal: React.FC = () => {
  const { activeLaunchingGame, closeGameSimulator, playUiSound, showToast } = useApp();
  const { addXpAndPoints } = useAuth();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [health, setHealth] = useState(100);

  const animationFrameRef = useRef<number | null>(null);

  // Game loop state refs
  const playerRef = useRef({ x: 200, y: 350, speed: 6, size: 24 });
  const targetsRef = useRef<{ x: number; y: number; size: number; speed: number; color: string }[]>([]);
  const bulletsRef = useRef<{ x: number; y: number; speed: number }[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault();
        shootBullet();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const shootBullet = () => {
    bulletsRef.current.push({
      x: playerRef.current.x,
      y: playerRef.current.y - 15,
      speed: 10,
    });
    playUiSound('laser');
  };

  const startGame = () => {
    setScore(0);
    setHealth(100);
    setGameState('playing');
    playerRef.current = { x: 200, y: 340, speed: 6, size: 20 };
    targetsRef.current = [];
    bulletsRef.current = [];
    playUiSound('click');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let targetSpawnTimer = 0;

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cyber Grid Background
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Move player with keys (ArrowLeft/Right or KeyA/KeyD)
      if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
        playerRef.current.x = Math.max(20, playerRef.current.x - playerRef.current.speed);
      }
      if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
        playerRef.current.x = Math.min(canvas.width - 20, playerRef.current.x + playerRef.current.speed);
      }

      // Draw Player (Neon Cyber Starship / Operative)
      const p = playerRef.current;
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 16);
      ctx.lineTo(p.x - 14, p.y + 12);
      ctx.lineTo(p.x + 14, p.y + 12);
      ctx.closePath();
      ctx.fill();

      // Engine Thruster Glow
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.arc(p.x, p.y + 14, 4 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Spawn Targets / Drone Enemies
      targetSpawnTimer++;
      if (targetSpawnTimer % 45 === 0) {
        targetsRef.current.push({
          x: Math.random() * (canvas.width - 40) + 20,
          y: -20,
          size: 16 + Math.random() * 8,
          speed: 2 + Math.random() * 2,
          color: Math.random() > 0.5 ? '#F43F5E' : '#A855F7',
        });
      }

      // Update & Draw Bullets
      for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
        const b = bulletsRef.current[i];
        b.y -= b.speed;
        ctx.fillStyle = '#22C55E';
        ctx.shadowColor = '#22C55E';
        ctx.shadowBlur = 10;
        ctx.fillRect(b.x - 2, b.y, 4, 12);
        ctx.shadowBlur = 0;

        if (b.y < -10) {
          bulletsRef.current.splice(i, 1);
        }
      }

      // Update & Draw Targets
      for (let i = targetsRef.current.length - 1; i >= 0; i--) {
        const t = targetsRef.current[i];
        t.y += t.speed;

        ctx.fillStyle = t.color;
        ctx.shadowColor = t.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Check bullet collisions
        for (let j = bulletsRef.current.length - 1; j >= 0; j--) {
          const b = bulletsRef.current[j];
          const dist = Math.hypot(b.x - t.x, b.y - t.y);
          if (dist < t.size + 4) {
            targetsRef.current.splice(i, 1);
            bulletsRef.current.splice(j, 1);
            setScore((prev) => {
              const newScore = prev + 100;
              if (newScore > highScore) setHighScore(newScore);
              return newScore;
            });
            break;
          }
        }

        // Check player collision
        if (t && Math.hypot(p.x - t.x, p.y - t.y) < t.size + p.size) {
          targetsRef.current.splice(i, 1);
          setHealth((h) => {
            const next = h - 25;
            if (next <= 0) {
              setGameState('gameover');
              playUiSound('claim');
              confetti({ particleCount: 60, spread: 60 });
              addXpAndPoints(50, 20, 'Cyber Arcade Session');
              showToast('Session Finished', `Earned +50 XP & +20 CyberCredits!`, 'success');
              return 0;
            }
            return next;
          });
        }

        // Off screen
        if (t && t.y > canvas.height + 20) {
          targetsRef.current.splice(i, 1);
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateAndDraw);
    };

    animationFrameRef.current = requestAnimationFrame(updateAndDraw);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, highScore]);

  if (!activeLaunchingGame) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={activeLaunchingGame.coverImage}
              alt={activeLaunchingGame.title}
              className="w-10 h-10 rounded-xl object-cover border border-slate-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">{activeLaunchingGame.title}</h3>
                <span className="px-2 py-0.5 bg-blue-600/80 text-white rounded text-[10px] font-bold">
                  LIVE CLOUD DEMO
                </span>
              </div>
              <p className="text-xs text-slate-400">Playable Browser Cyber Arcade Simulator</p>
            </div>
          </div>
          <button
            onClick={closeGameSimulator}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Canvas Stage */}
        <div className="relative w-full h-96 bg-slate-950 flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={480}
            height={380}
            className="w-full h-full max-w-[480px] max-h-[380px] bg-slate-950 block shadow-inner"
          />

          {/* Overlay for Idle / Game Over */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mb-4 shadow-xl shadow-blue-500/20">
                <Target className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-black mb-2">CYBER STRIKE ARCADE</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
                Use <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-blue-400">A</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-blue-400">D</kbd> or Arrow Keys to move, and <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-emerald-400">SPACE</kbd> to blast cyber targets!
              </p>
              <button
                onClick={startGame}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-black text-sm rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-2 transition transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Mission</span>
              </button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center text-white animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-3 text-rose-500">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black mb-1">MISSION DEBRIEF</h2>
              <p className="text-sm text-slate-400 mb-4">You eliminated cyber hostiles across the sector!</p>

              <div className="grid grid-cols-2 gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl mb-6 w-full max-w-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Score</span>
                  <p className="text-xl font-black text-blue-400">{score}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Reward</span>
                  <p className="text-xl font-black text-emerald-400">+50 XP</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startGame}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Play Again
                </button>
                <button
                  onClick={closeGameSimulator}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
                >
                  Exit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Game HUD */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-500 text-[10px] font-bold uppercase">SCORE</span>
              <p className="font-mono font-black text-base text-blue-400">{score}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] font-bold uppercase">SHIELD HP</span>
              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-200 ${
                    health > 50 ? 'bg-emerald-500' : health > 25 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${health}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (gameState === 'playing') {
                  shootBullet();
                }
              }}
              className="sm:hidden px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl active:bg-emerald-700"
            >
              FIRE
            </button>
            <span className="hidden sm:inline text-slate-400 text-[11px]">Controls: Arrow Keys + Space</span>
          </div>
        </div>
      </div>
    </div>
  );
};
