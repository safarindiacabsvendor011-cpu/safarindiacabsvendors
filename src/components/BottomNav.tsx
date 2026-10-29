import React from 'react';
import { 
  Compass, 
  BookmarkCheck, 
  Plus, 
  MessageSquare, 
  User,
  Car
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onOpenPostSelection: () => void;
  unreadChatsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenPostSelection,
  unreadChatsCount = 1
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-2 py-1.5 sm:hidden shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Market */}
        <button
          onClick={() => onChangeTab('duties')}
          className={`flex flex-col items-center justify-center p-1 transition cursor-pointer ${
            activeTab === 'duties' ? 'text-amber-600 font-black' : 'text-slate-400 font-bold'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Market</span>
        </button>

        {/* My Bookings */}
        <button
          onClick={() => onChangeTab('my_bookings')}
          className={`flex flex-col items-center justify-center p-1 transition cursor-pointer ${
            activeTab === 'my_bookings' ? 'text-amber-600 font-black' : 'text-slate-400 font-bold'
          }`}
        >
          <BookmarkCheck className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Bookings</span>
        </button>

        {/* Center Floating Post (+) Button */}
        <button
          onClick={onOpenPostSelection}
          className="flex flex-col items-center justify-center -mt-5 cursor-pointer"
        >
          <div className="w-13 h-13 rounded-full bg-[#0a2540] text-amber-400 border-4 border-white shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition">
            <Plus className="w-7 h-7 stroke-[3]" />
          </div>
          <span className="text-[10px] font-black text-slate-800 mt-0.5">Post</span>
        </button>

        {/* Chats */}
        <button
          onClick={() => onChangeTab('chats')}
          className={`relative flex flex-col items-center justify-center p-1 transition cursor-pointer ${
            activeTab === 'chats' ? 'text-amber-600 font-black' : 'text-slate-400 font-bold'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Chats</span>
          {unreadChatsCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
          )}
        </button>

        {/* Dashboard / Fleet */}
        <button
          onClick={() => onChangeTab('dashboard')}
          className={`flex flex-col items-center justify-center p-1 transition cursor-pointer ${
            activeTab === 'dashboard' ? 'text-amber-600 font-black' : 'text-slate-400 font-bold'
          }`}
        >
          <Car className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Fleet</span>
        </button>

      </div>
    </div>
  );
};
