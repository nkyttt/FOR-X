import React from 'react';
import { useApp } from '../../context/AppContext';

export const LatestNewsSidebar: React.FC = () => {
  const { news, navigate, playUiSound } = useApp();

  const handleNewsClick = (slug: string) => {
    playUiSound('click');
    navigate('news', { newsSlug: slug });
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black tracking-wider text-slate-900 uppercase">
          LATEST NEWS
        </h3>
        <button
          onClick={() => {
            playUiSound('click');
            navigate('news');
          }}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
        >
          View All
        </button>
      </div>

      {/* News Items List matching reference */}
      <div className="space-y-3.5">
        {news.slice(0, 4).map((item) => (
          <div
            key={item.id}
            onClick={() => handleNewsClick(item.slug)}
            className="group flex items-start gap-3 cursor-pointer p-1.5 rounded-2xl hover:bg-slate-50 transition"
          >
            {/* Thumbnail */}
            <div className="w-16 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-100 shadow-xs">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 line-clamp-1 transition leading-tight">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
                {item.excerpt}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>{item.publishedAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
