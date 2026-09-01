import React from 'react';
import { Gamepad2, Users, Trophy, Gift, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StatisticsSection: React.FC = () => {
  const { navigate, playUiSound } = useApp();

  const stats = [
    {
      id: 'stat-games',
      value: '1000+',
      label: 'Games',
      description: 'Diverse collection',
      icon: Gamepad2,
      bgColor: 'bg-indigo-50/80',
      iconColor: 'text-indigo-600',
      borderColor: 'border-indigo-100',
      target: 'games',
    },
    {
      id: 'stat-players',
      value: '50K+',
      label: 'Active Players',
      description: 'Join the community',
      icon: Users,
      bgColor: 'bg-cyan-50/80',
      iconColor: 'text-cyan-600',
      borderColor: 'border-cyan-100',
      target: 'community',
    },
    {
      id: 'stat-tournaments',
      value: '200+',
      label: 'Tournaments',
      description: 'Compete & win',
      icon: Trophy,
      bgColor: 'bg-amber-50/80',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-100',
      target: 'tournaments',
    },
    {
      id: 'stat-rewards',
      value: 'Exclusive',
      label: 'Rewards',
      description: 'Earn and unlock',
      icon: Gift,
      bgColor: 'bg-blue-50/80',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100',
      target: 'rewards',
    },
    {
      id: 'stat-security',
      value: 'Secure',
      label: '& Safe',
      description: 'Your safety first',
      icon: ShieldCheck,
      bgColor: 'bg-emerald-50/80',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
      target: 'security',
    },
  ];

  const handleCardClick = (target: string) => {
    playUiSound('click');
    navigate(target as any);
  };

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 my-8">
      {stats.map((item) => {
        const IconComponent = item.icon;
        return (
          <div
            key={item.id}
            onClick={() => handleCardClick(item.target)}
            className="group cursor-pointer bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3.5"
          >
            {/* Icon Container */}
            <div
              className={`p-3 rounded-2xl ${item.bgColor} ${item.iconColor} ${item.borderColor} border group-hover:scale-110 transition shrink-0`}
            >
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            {/* Texts */}
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {item.value}
                </span>
                <span className="text-xs font-bold text-slate-700 truncate">{item.label}</span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
