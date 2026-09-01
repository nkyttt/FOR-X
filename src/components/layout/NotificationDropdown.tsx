import React from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, ShoppingBag, MessageSquare, Gift, Info, CheckCheck } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, navigate } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'tournament':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case 'community':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'reward':
        return <Gift className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-cyan-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
          <p className="text-[11px] text-slate-500">Live platform alerts & events</p>
        </div>
        <button
          onClick={markAllNotificationsAsRead}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No notifications at the moment</div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationAsRead(item.id);
                if (item.link) {
                  navigate(item.link as any);
                  onClose();
                }
              }}
              className={`p-3.5 hover:bg-slate-50 cursor-pointer flex items-start gap-3 transition ${
                !item.isRead ? 'bg-blue-50/40' : ''
              }`}
            >
              <div className="mt-0.5 p-2 rounded-xl bg-white shadow-xs border border-slate-200">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                  <span className="text-[10px] text-slate-400 shrink-0">{item.createdAt}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{item.message}</p>
              </div>
              {!item.isRead && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>

      <div className="px-4 pt-2 border-t border-slate-100 text-center">
        <button
          onClick={() => {
            navigate('dashboard');
            onClose();
          }}
          className="text-xs font-bold text-slate-600 hover:text-blue-600 transition"
        >
          View all in Dashboard &rarr;
        </button>
      </div>
    </div>
  );
};
