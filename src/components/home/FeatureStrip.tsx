import React from 'react';
import { Gamepad, Cloud, Sparkles, Headphones } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FeatureStrip: React.FC = () => {
  const { navigate, playUiSound } = useApp();

  const features = [
    {
      id: 'f-cross',
      title: 'CROSS-PLATFORM',
      desc: 'Play anywhere, anytime',
      icon: Gamepad,
      iconBg: 'bg-blue-100 text-blue-600',
      action: () => navigate('games'),
    },
    {
      id: 'f-cloud',
      title: 'CLOUD SAVE',
      desc: 'Your progress, safe everywhere',
      icon: Cloud,
      iconBg: 'bg-cyan-100 text-cyan-600',
      action: () => navigate('dashboard'),
    },
    {
      id: 'f-events',
      title: 'LIVE EVENTS',
      desc: 'Exciting events every week',
      icon: Sparkles,
      iconBg: 'bg-indigo-100 text-indigo-600',
      action: () => navigate('tournaments'),
    },
    {
      id: 'f-support',
      title: '24/7 SUPPORT',
      desc: "We're here for you",
      icon: Headphones,
      iconBg: 'bg-purple-100 text-purple-600',
      action: () => navigate('security'),
    },
  ];

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {features.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => {
                playUiSound('click');
                item.action();
              }}
              className={`flex items-center gap-4 cursor-pointer group hover:bg-slate-50/80 p-2 rounded-2xl transition ${
                idx !== 0 ? 'sm:pl-6' : ''
              } ${idx !== 0 ? 'pt-4 sm:pt-2' : ''}`}
            >
              <div className={`p-3 rounded-2xl ${item.iconBg} group-hover:scale-110 transition shrink-0`}>
                <IconComp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-slate-900 tracking-wider uppercase group-hover:text-blue-600 transition">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
