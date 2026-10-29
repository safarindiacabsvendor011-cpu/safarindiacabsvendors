import React, { useState } from 'react';
import { 
  Wallet, 
  PlusCircle, 
  ShieldCheck, 
  MapPin, 
  UserCheck, 
  Sparkles,
  Bell,
  HelpCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { CITIES_LIST } from '../data/mockData';

interface HeaderProps {
  user: UserProfile;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onOpenWallet: () => void;
  onOpenPostDuty: () => void;
  onOpenMembership: () => void;
  onOpenAuthModal: () => void;
  onUpdateRole: (role: UserRole) => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  availableDutiesCount: number;
  returnCabsCount: number;
  myCabsCount: number;
  myDriversCount: number;
  unreadChatsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  selectedCity,
  onSelectCity,
  onOpenWallet,
  onOpenPostDuty,
  onOpenMembership,
  onOpenAuthModal,
  onUpdateRole,
  activeTab,
  onChangeTab,
  availableDutiesCount,
  returnCabsCount,
  myCabsCount,
  myDriversCount,
  unreadChatsCount = 1
}) => {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const isAdmin = user.role === 'Super Admin' || user.appRole === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-slate-200 shadow-xs text-slate-800">
      {/* Top Banner Bar */}
      <div className="bg-[#0a2540] text-white text-xs py-1.5 px-4 border-b border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span className="font-bold text-slate-200 tracking-wide text-[11px] sm:text-xs">
              ⚡ Safar India Cabs B2B Network • Supabase RBAC Auth • Real-time Duty Exchange
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Live Alerts Toggle */}
            <div className="flex items-center gap-2 bg-slate-900/60 px-2.5 py-0.5 rounded-full border border-slate-700">
              <span className="text-[11px] font-bold text-slate-300">Live Alerts</span>
              <button
                type="button"
                onClick={() => setAlertsEnabled(!alertsEnabled)}
                className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  alertsEnabled ? 'bg-amber-400' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out mt-0.5 ${
                    alertsEnabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Current user badge & quick auth switch */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-full text-indigo-200 hover:text-white transition cursor-pointer text-[11px]"
              title="Click to Switch Accounts or Login with Supabase"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">{user.name.split(' ')[0]}</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1 rounded font-black uppercase">
                {isAdmin ? 'ADMIN' : 'VENDOR'}
              </span>
            </button>

            <button 
              onClick={onOpenMembership}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2.5 py-0.5 rounded-full shadow-xs transition cursor-pointer text-[11px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              <span>{user.membershipPlan} Partner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Area */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <img 
              src="/assets/aistudio/IMG-20261029-WA0001_67f0d119.jpg" 
              alt="Safar India Cabs Logo" 
              className="h-12 w-12 rounded-2xl object-cover shadow-xs border-2 border-slate-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-[#0a2540]">
                  Safar<span className="text-amber-500">India</span>Cabs
                </span>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] uppercase font-black px-1.5 py-0.5 rounded">
                  B2B Transport Platform
                </span>
                <span title="Verified Network">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold">
                Taxi Sanchalak B2B Exchange • Outstation & Intercity Marketplace
              </p>
            </div>
          </div>

          {/* Controls: City, Role, Wallet, Post Duty */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* City Selector */}
            <div className="flex items-center bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 transition">
              <MapPin className="w-3.5 h-3.5 text-amber-600 mr-1.5 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className="bg-transparent text-xs text-slate-900 font-black focus:outline-none cursor-pointer"
              >
                {CITIES_LIST.map((city) => (
                  <option key={city} value={city} className="bg-white text-slate-900 font-semibold">
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Switcher */}
            <div className="hidden lg:flex items-center bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600 mr-1.5 shrink-0" />
              <select
                value={user.role}
                onChange={(e) => onUpdateRole(e.target.value as UserRole)}
                className="bg-transparent text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
                title="Switch persona"
              >
                <option value="Travel Agent" className="bg-white">Travel Agent (Lead Poster)</option>
                <option value="Fleet Owner / Operator" className="bg-white">Fleet Owner (Cab Operator)</option>
                <option value="Independent Driver" className="bg-white">Commercial Cab Driver</option>
                <option value="Super Admin" className="bg-white">🛡️ Super Admin (Full Control)</option>
              </select>
            </div>

            {/* Wallet Button */}
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-emerald-500 px-3 py-1.5 rounded-xl text-xs transition cursor-pointer shadow-2xs group"
            >
              <div className="p-1 bg-emerald-100 text-emerald-800 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-500 font-bold leading-none">Wallet</div>
                <div className="font-black text-emerald-700 leading-tight">₹{(user.walletBalance ?? 0).toLocaleString('en-IN')}</div>
              </div>
            </button>

            {/* Post Duty CTA Button */}
            <button
              onClick={onOpenPostDuty}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-sm shadow-amber-500/20 transition cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Post Booking</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 overflow-x-auto no-scrollbar text-xs">
          {/* Marketplace / Duty Board */}
          <button
            onClick={() => onChangeTab('duties')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black transition cursor-pointer shrink-0 ${
              activeTab === 'duties'
                ? 'bg-[#0a2540] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
            }`}
          >
            <span>Duty Feed</span>
            <span className={`text-[10px] font-black px-2 py-0.2 rounded-full ${
              activeTab === 'duties' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
            }`}>
              {availableDutiesCount}
            </span>
          </button>

          {/* Vendor Dashboard (/dashboard) */}
          <button
            onClick={() => onChangeTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black transition cursor-pointer shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-[#0a2540] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
            }`}
          >
            <span>Vendor Dashboard</span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
              activeTab === 'dashboard' ? 'bg-amber-400 text-slate-950' : 'bg-blue-100 text-blue-800'
            }`}>
              Fleet & Drivers
            </span>
          </button>

          <button
            onClick={() => onChangeTab('return_cabs')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black transition cursor-pointer shrink-0 ${
              activeTab === 'return_cabs'
                ? 'bg-[#0a2540] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
            }`}
          >
            <span>Empty Return Cabs</span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
              activeTab === 'return_cabs' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
            }`}>
              {returnCabsCount}
            </span>
          </button>

          <button
            onClick={() => onChangeTab('my_bookings')}
            className={`px-3.5 py-1.5 rounded-xl font-black transition cursor-pointer shrink-0 ${
              activeTab === 'my_bookings'
                ? 'bg-[#0a2540] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
            }`}
          >
            My Bookings
          </button>

          <button
            onClick={() => onChangeTab('chats')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black transition cursor-pointer shrink-0 ${
              activeTab === 'chats'
                ? 'bg-[#0a2540] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
            }`}
          >
            <span>Deal Room & Chats</span>
            {unreadChatsCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {unreadChatsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onChangeTab('vendors')}
            className={`px-3.5 py-1.5 rounded-xl font-black transition cursor-pointer shrink-0 ${
              activeTab === 'vendors'
                ? 'bg-[#0a2540] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
            }`}
          >
            Vendor Directory
          </button>

          {/* Super Admin Panel (/admin) */}
          <button
            onClick={() => onChangeTab('admin')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black transition cursor-pointer shrink-0 border ${
              activeTab === 'admin'
                ? 'bg-indigo-900 text-amber-300 border-amber-400 shadow-xs'
                : 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <span>🛡️ Super Admin Panel</span>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              /admin
            </span>
          </button>

          <button
            onClick={() => onChangeTab('profile')}
            className={`px-3.5 py-1.5 rounded-xl font-black transition cursor-pointer shrink-0 ${
              activeTab === 'profile'
                ? 'bg-[#0a2540] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
            }`}
          >
            Vendor Profile
          </button>

          <button
            onClick={onOpenMembership}
            className={`px-3.5 py-1.5 rounded-xl font-black transition cursor-pointer shrink-0 ${
              activeTab === 'membership'
                ? 'bg-amber-500 text-slate-950'
                : 'text-amber-800 hover:bg-amber-50 hover:text-amber-900'
            }`}
          >
            ★ Subscriptions
          </button>
        </nav>
      </div>
    </header>
  );
};

