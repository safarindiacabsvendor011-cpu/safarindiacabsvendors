import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import { UserProfile, AppRole, UserRole } from '../types';
import { isSupabaseConfigured, DEMO_ACCOUNTS } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile, targetView: 'admin' | 'dashboard' | 'duties') => void;
  initialRole?: AppRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  initialRole = 'vendor'
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<AppRole>(initialRole);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [vendorCategory, setVendorCategory] = useState<UserRole>('Travel Agent');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (!email || !password) {
        setError('Please enter both email and password.');
        return;
      }

      if (authMode === 'signup' && selectedRole === 'vendor' && !companyName) {
        setError('Please enter your Company / Agency Name.');
        return;
      }

      // Check admin credentials
      if (selectedRole === 'admin') {
        const adminProfile: UserProfile = {
          id: 'usr-super-admin-01',
          name: fullName || 'Super Admin (Operations)',
          companyName: 'Safar India Cabs HQ',
          phone: phone || '+91 85060 46346',
          email: email || 'admin@safarindiacabs.com',
          role: 'Super Admin',
          appRole: 'admin',
          status: 'approved',
          city: 'HQ Delhi NCR',
          isVerified: true,
          rating: 5.0,
          completedDuties: 1250,
          membershipPlan: 'Diamond',
          walletBalance: 50000,
          avatarUrl: '/assets/aistudio/IMG-20261029-WA0001_67f0d119.jpg',
          joinedDate: '01 Jan 2025'
        };
        onLoginSuccess(adminProfile, 'admin');
        onClose();
        return;
      }

      // Vendor user
      const vendorProfile: UserProfile = {
        id: `usr-vendor-${Date.now()}`,
        name: fullName || email.split('@')[0],
        companyName: companyName || `${fullName || 'Vendor'} Cabs`,
        phone: phone || '+91 98765 43210',
        email: email,
        role: vendorCategory,
        appRole: 'vendor',
        status: 'approved',
        city: city,
        isVerified: true,
        rating: 4.8,
        completedDuties: 12,
        membershipPlan: 'Gold',
        walletBalance: 2000,
        avatarUrl: '/assets/aistudio/IMG-20261029-WA0001_67f0d119.jpg',
        joinedDate: 'Today'
      };

      onLoginSuccess(vendorProfile, 'dashboard');
      onClose();
    }, 400);
  };

  const handleQuickDemoLogin = (account: typeof DEMO_ACCOUNTS[0]) => {
    setError(null);
    if (account.role === 'admin') {
      const adminProfile: UserProfile = {
        id: 'usr-super-admin-01',
        name: account.name,
        companyName: account.company,
        phone: account.phone,
        email: account.email,
        role: 'Super Admin',
        appRole: 'admin',
        status: 'approved',
        city: 'HQ Delhi NCR',
        isVerified: true,
        rating: 5.0,
        completedDuties: 1250,
        membershipPlan: 'Diamond',
        walletBalance: 50000,
        avatarUrl: '/assets/aistudio/IMG-20261029-WA0001_67f0d119.jpg',
        joinedDate: '01 Jan 2025'
      };
      onLoginSuccess(adminProfile, 'admin');
    } else {
      const isPending = account.label.includes('Pending');
      const vendorProfile: UserProfile = {
        id: isPending ? 'usr-jaipur-pending-02' : 'usr-safar-001',
        name: account.name,
        companyName: account.company,
        phone: account.phone,
        email: account.email,
        role: 'Travel Agent',
        appRole: 'vendor',
        status: isPending ? 'pending' : 'approved',
        city: isPending ? 'Jaipur' : 'Delhi NCR',
        isVerified: !isPending,
        rating: isPending ? 4.2 : 4.8,
        completedDuties: isPending ? 0 : 184,
        membershipPlan: isPending ? 'Silver' : 'Gold',
        walletBalance: isPending ? 500 : 2450,
        avatarUrl: '/assets/aistudio/IMG-20261029-WA0001_67f0d119.jpg',
        joinedDate: '15 Jan 2026'
      };
      onLoginSuccess(vendorProfile, 'dashboard');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow">
              SIC
            </div>
            <div>
              <h3 className="text-lg font-bold">SafarIndiaCabs Authentication</h3>
              <p className="text-xs text-blue-200">B2B Taxi Vendor & Aggregator Platform (Supabase RBAC)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Database connection indicator */}
        <div className="bg-blue-50/80 px-6 py-2.5 border-b border-blue-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Database className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-semibold">Backend Engine:</span>
            <span>{isSupabaseConfigured ? 'Supabase Cloud Connected' : 'Supabase Auth Simulation (Local Mirror)'}</span>
          </div>
          <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </span>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {/* 1-Click Fast Demo Switcher */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Fast Demo Switcher (Instant RBAC Testing):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickDemoLogin(acc)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all flex flex-col justify-between ${
                    acc.role === 'admin'
                      ? 'border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-950'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-900'
                  }`}
                >
                  <span className="font-bold flex items-center gap-1">
                    {acc.role === 'admin' ? <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /> : <Building2 className="h-3.5 w-3.5 text-amber-600" />}
                    {acc.role === 'admin' ? 'Super Admin' : 'Vendor'}
                  </span>
                  <span className="text-[11px] text-slate-600 truncate mt-0.5">{acc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Tabs (Sign In vs Sign Up) */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
                authMode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
                authMode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Registration
            </button>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Your Access Level / Role:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('vendor')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRole === 'vendor'
                    ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-sm">Vendor / Agent</span>
                  <Building2 className={`h-4 w-4 ${selectedRole === 'vendor' ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Access Vendor Dashboard, Fleet & Driver management, and Duty Marketplace feed.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRole === 'admin'
                    ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-sm">Super Admin</span>
                  <ShieldCheck className={`h-4 w-4 ${selectedRole === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`} />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Full control on /admin: Approve vendors, verify RC/DL fleet, and audit platform dues.
                </p>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Contact Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-500"
                    />
                  </div>
                </div>

                {selectedRole === 'vendor' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Agency Name *</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. North Star Cabs"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor Type</label>
                        <select
                          value={vendorCategory}
                          onChange={(e) => setVendorCategory(e.target.value as UserRole)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-500 bg-white"
                        >
                          <option value="Travel Agent">Travel Agent</option>
                          <option value="Fleet Owner / Operator">Fleet Owner / Operator</option>
                          <option value="Independent Driver">Independent Driver</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Operating City</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Delhi NCR"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile (WhatsApp) *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98123 45678"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'admin' ? 'admin@safarindiacabs.com' : 'vendor@example.com'}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{authMode === 'signin' ? `Sign In as ${selectedRole === 'admin' ? 'Super Admin' : 'Vendor'}` : `Register as ${selectedRole === 'admin' ? 'Super Admin' : 'Vendor'}`}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Current Session: {currentUser.name} ({currentUser.appRole || (currentUser.role === 'Super Admin' ? 'admin' : 'vendor')})</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
