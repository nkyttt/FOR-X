import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Gift,
  Flame,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  Tag,
  Zap,
  Shield,
  Star,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RewardsView: React.FC = () => {
  const { playUiSound, showToast, setIsAuthModalOpen } = useApp();
  const { currentUser, claimDailyStreak, addXpAndPoints } = useAuth();

  const [claimedStreak, setClaimedStreak] = useState(false);
  const [redeemedRewards, setRedeemedRewards] = useState<{ [id: string]: boolean }>({});

  const badges = [
    { id: 'b1', name: 'Cyber Pioneer', desc: 'Joined the CYBERX early access', icon: Zap, unlocked: true, color: 'text-blue-500 bg-blue-50' },
    { id: 'b2', name: 'Tactical Striker', desc: 'Played 10+ simulator missions', icon: Shield, unlocked: true, color: 'text-indigo-500 bg-indigo-50' },
    { id: 'b3', name: 'Tournament Contender', desc: 'Registered for an Esports Cup', icon: Award, unlocked: true, color: 'text-amber-500 bg-amber-50' },
    { id: 'b4', name: 'Grandmaster Elite', desc: 'Reach 10,000+ XP in season 2', icon: Flame, unlocked: false, color: 'text-rose-500 bg-rose-50' },
  ];

  const redeemableItems = [
    { id: 'r1', title: '$10 Gear Coupon', cost: 100, type: 'Voucher', code: 'CYBER10', icon: Tag },
    { id: 'r2', title: 'Neon Hologram Frame', cost: 250, type: 'Avatar Skin', icon: Sparkles },
    { id: 'r3', title: 'Esports VIP Entry Pass', cost: 500, type: 'Tournament', icon: Award },
    { id: 'r4', title: '20% Store Discount', cost: 150, type: 'Voucher', code: 'CYBERX20', icon: Gift },
  ];

  const handleClaimDaily = async () => {
    playUiSound('claim');
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const res = await claimDailyStreak();
    if (res.success) {
      confetti({ particleCount: 90, spread: 70 });
      setClaimedStreak(true);
      showToast('Daily Reward Claimed!', `Earned +${res.earnedXp} XP & +${res.earnedPoints} CyberCredits!`, 'success');
    } else {
      showToast('Already Claimed', res.message, 'info');
    }
  };

  const handleRedeem = (item: typeof redeemableItems[0]) => {
    playUiSound('claim');
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (currentUser.points < item.cost) {
      showToast('Insufficient CyberCredits', `You need ${item.cost} CC (You have ${currentUser.points} CC)`, 'error');
      return;
    }

    // Deduct points
    addXpAndPoints(0, -item.cost, `Redeemed ${item.title}`);
    setRedeemedRewards((prev) => ({ ...prev, [item.id]: true }));
    confetti({ particleCount: 60, spread: 60 });
    showToast('Reward Redeemed!', `You unlocked ${item.title}. Code: ${item.code || 'UNLOCKED'}`, 'success');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 p-8 sm:p-12 text-white border border-slate-800 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black tracking-widest uppercase mb-3 border border-blue-400/30">
            <Gift className="w-3.5 h-3.5" />
            <span>CYBERX GAMIFICATION & VAULT</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            EXCLUSIVE <span className="text-blue-400">REWARDS</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 font-normal leading-relaxed">
            Log in daily, level up, unlock rare badges, and redeem CyberCredits for discounts and tournament passes.
          </p>
        </div>
      </div>

      {/* Daily Streak Claim Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100">
            <Flame className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-black text-slate-900">Daily Login Streak</h2>
              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-xs font-black rounded-full">
                {currentUser?.streakDays || 1} Day Streak
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Claim daily to stack multiplier bonuses: +100 XP & +25 CyberCredits every 24 hours!
            </p>
          </div>
        </div>

        <button
          onClick={handleClaimDaily}
          className={`px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm transition flex items-center gap-2 shadow-lg ${
            claimedStreak
              ? 'bg-emerald-100 text-emerald-700 cursor-default'
              : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-rose-500/20 hover:scale-105'
          }`}
        >
          {claimedStreak ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Claimed for Today</span>
            </>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              <span>Claim Daily Reward</span>
            </>
          )}
        </button>
      </div>

      {/* Badges & Achievements Showcase */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" /> Achievements & Badges
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((b) => {
            const IconComp = b.icon;
            return (
              <div
                key={b.id}
                className={`bg-white rounded-3xl p-5 border shadow-xs transition flex items-start gap-3.5 ${
                  b.unlocked ? 'border-slate-200' : 'border-slate-200/50 opacity-60'
                }`}
              >
                <div className={`p-3 rounded-2xl ${b.color} shrink-0`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900">{b.name}</h4>
                    {b.unlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CyberCredits Redemption Vault */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" /> CyberCredits Vault
          </h3>
          <span className="text-xs font-bold text-slate-600">
            Your Balance: <strong className="text-blue-600">{currentUser?.points || 0} CC</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {redeemableItems.map((item) => {
            const isRedeemed = redeemedRewards[item.id];
            const IconComp = item.icon;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">
                      {item.type}
                    </span>
                    <span className="text-xs font-black text-blue-600">{item.cost} CC</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  {item.code && (
                    <span className="text-[11px] font-mono text-slate-400 block mt-1">Code: {item.code}</span>
                  )}
                </div>

                <button
                  disabled={isRedeemed}
                  onClick={() => handleRedeem(item)}
                  className={`mt-4 w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    isRedeemed
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-900 hover:bg-blue-600 text-white shadow-sm'
                  }`}
                >
                  {isRedeemed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isRedeemed ? 'Redeemed' : `Unlock for ${item.cost} CC`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
