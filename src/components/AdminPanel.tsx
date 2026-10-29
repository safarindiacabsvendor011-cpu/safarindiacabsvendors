import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Car, 
  User, 
  Phone, 
  DollarSign, 
  ArrowRight, 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  RotateCcw, 
  Lock, 
  Unlock, 
  SlidersHorizontal,
  Check,
  X,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Database,
  Copy,
  CheckCheck,
  Sliders,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { 
  Duty, 
  UserProfile, 
  WalletTransaction, 
  Cab, 
  Driver, 
  PlatformSettings,
  VerificationStatus,
  VendorAccountStatus
} from '../types';

interface AdminPanelProps {
  currentUser: UserProfile;
  duties: Duty[];
  vendors: UserProfile[];
  cabs: Cab[];
  drivers: Driver[];
  transactions: WalletTransaction[];
  platformSettings: PlatformSettings;
  onUpdateDutyStatus: (dutyId: string, status: Duty['status']) => void;
  onRefundCommission: (dutyId: string, commissionAmount: number) => void;
  onToggleVendorKyc: (vendorId: string) => void;
  onToggleVendorStatus: (vendorId: string) => void;
  onAdjustVendorWallet: (vendorId: string, deltaAmount: number, reason: string) => void;
  onApproveCab: (cabId: string) => void;
  onRejectCab: (cabId: string, reason: string) => void;
  onApproveDriver: (driverId: string) => void;
  onRejectDriver: (driverId: string, reason: string) => void;
  onUpdateSettings: (settings: PlatformSettings) => void;
  onViewSlip: (duty: Duty) => void;
  onSwitchToVendorView: () => void;
  onOpenAuthModal: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  duties,
  vendors,
  cabs,
  drivers,
  transactions,
  platformSettings,
  onUpdateDutyStatus,
  onRefundCommission,
  onToggleVendorKyc,
  onToggleVendorStatus,
  onAdjustVendorWallet,
  onApproveCab,
  onRejectCab,
  onApproveDriver,
  onRejectDriver,
  onUpdateSettings,
  onViewSlip,
  onSwitchToVendorView,
  onOpenAuthModal
}) => {
  // RBAC Guard
  const isAdmin = currentUser.role === 'Super Admin' || currentUser.appRole === 'admin';

  const [activeAdminTab, setActiveAdminTab] = useState<'vendors' | 'cabs' | 'drivers' | 'bookings' | 'commissions' | 'sql'>('vendors');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Wallet adjustment modal state
  const [selectedVendorForWallet, setSelectedVendorForWallet] = useState<UserProfile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustAction, setAdjustAction] = useState<'add' | 'deduct'>('add');
  const [adjustReason, setAdjustReason] = useState<string>('Platform Incentive / Refund Adjustment');

  // Document Inspection Modal
  const [inspectedDoc, setInspectedDoc] = useState<{
    type: 'rc' | 'dl' | 'kyc';
    title: string;
    targetId: string;
    url: string;
    details: { [key: string]: string };
    currentStatus: string;
  } | null>(null);

  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [isRejectInputOpen, setIsRejectInputOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Settings form state
  const [commissionPercent, setCommissionPercent] = useState(platformSettings.defaultCommissionPercent);
  const [minFlatCommission, setMinFlatCommission] = useState(platformSettings.minCommissionFlat);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // KPI calculations
  const totalBookings = duties.length;
  const activeBookings = duties.filter(d => d.status === 'available' || d.status === 'negotiating').length;
  const claimedBookings = duties.filter(d => d.status === 'claimed').length;
  const completedBookings = duties.filter(d => d.status === 'completed').length;
  
  const totalGrossRevenue = duties.reduce((acc, d) => acc + (d.totalCustomerFare || 0), 0);
  const totalCommissionPool = duties.reduce((acc, d) => acc + (d.commissionAmount || 0), 0);
  const platformEarnings = Math.round(totalCommissionPool * (platformSettings.defaultCommissionPercent / 100));

  const pendingCabs = cabs.filter(c => c.status === 'pending');
  const pendingDrivers = drivers.filter(d => d.status === 'pending');

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-10 text-center max-w-xl mx-auto my-12 shadow-sm">
        <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted (Super Admin Only)</h2>
        <p className="text-sm text-slate-600 mt-2 mb-6">
          Your current account <strong>{currentUser.name}</strong> is signed in as <strong>{currentUser.role}</strong>. Only authenticated platform Super Administrators can access the Super Admin Panel.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenAuthModal}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            Sign in as Super Admin
          </button>
          <button
            onClick={onSwitchToVendorView}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-sm transition-colors"
          >
            Return to Vendor Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForWallet || adjustAmount <= 0) return;
    const delta = adjustAction === 'add' ? adjustAmount : -adjustAmount;
    onAdjustVendorWallet(selectedVendorForWallet.id, delta, adjustReason);
    setSelectedVendorForWallet(null);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...platformSettings,
      defaultCommissionPercent: Number(commissionPercent),
      minCommissionFlat: Number(minFlatCommission)
    });
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  const handleCopySql = () => {
    const sqlText = `-- SafarIndiaCabs Supabase DDL
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'vendor')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'suspended')) DEFAULT 'approved'
);

CREATE TABLE public.cabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.profiles(id),
  vehicle_number TEXT NOT NULL,
  model TEXT NOT NULL,
  rc_document TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending'
);

CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  license_number TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending'
);

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL,
  pickup TEXT NOT NULL,
  drop_location TEXT NOT NULL,
  trip_type TEXT NOT NULL,
  fare NUMERIC NOT NULL,
  commission NUMERIC NOT NULL,
  status TEXT DEFAULT 'available',
  assigned_vendor_id UUID REFERENCES public.profiles(id)
);`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white shadow-lg border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow">
              <ShieldCheck className="h-7 w-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">Super Admin Control Centre</h1>
                <span className="text-[11px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                  Master Authority
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                SafarIndiaCabs B2B Network • Supabase RBAC • Fleet Verification • Commission Escrow & Dues
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToVendorView}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-1.5"
            >
              <Building2 className="h-3.5 w-3.5 text-amber-400" />
              Switch to Vendor Feed
            </button>
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-1.5"
            >
              <User className="h-3.5 w-3.5" />
              Switch Account
            </button>
          </div>
        </div>

        {/* Global KPI bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-[11px] text-indigo-200 font-medium">Total Registered Vendors</p>
            <p className="text-xl font-bold text-white mt-0.5">{vendors.length}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-[11px] text-indigo-200 font-medium">Pending Cab Approvals</p>
            <p className={`text-xl font-bold mt-0.5 ${pendingCabs.length > 0 ? 'text-amber-400 font-black' : 'text-white'}`}>
              {pendingCabs.length}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-[11px] text-indigo-200 font-medium">Pending Driver Checks</p>
            <p className={`text-xl font-bold mt-0.5 ${pendingDrivers.length > 0 ? 'text-amber-400 font-black' : 'text-white'}`}>
              {pendingDrivers.length}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-[11px] text-indigo-200 font-medium">Active Trips (Claimed)</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{claimedBookings}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-[11px] text-indigo-200 font-medium">Gross Booking GMV</p>
            <p className="text-xl font-bold text-white mt-0.5">₹{totalGrossRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-[11px] text-indigo-200 font-medium">Platform Est. Revenue</p>
            <p className="text-xl font-bold text-amber-400 mt-0.5">₹{platformEarnings.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs flex overflow-x-auto gap-1">
        <button
          onClick={() => setActiveAdminTab('vendors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeAdminTab === 'vendors'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Vendor Management ({vendors.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('cabs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeAdminTab === 'cabs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Car className="h-4 w-4" />
          Fleet & Car Verification
          {pendingCabs.length > 0 && (
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {pendingCabs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('drivers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeAdminTab === 'drivers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Driver Verification
          {pendingDrivers.length > 0 && (
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {pendingDrivers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeAdminTab === 'bookings'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="h-4 w-4" />
          Booking & Dispute Oversight ({duties.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('commissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeAdminTab === 'commissions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Commission & Financial Settings
        </button>

        <button
          onClick={() => setActiveAdminTab('sql')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeAdminTab === 'sql'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="h-4 w-4" />
          Supabase SQL Schema
        </button>
      </div>

      {/* TAB 1: VENDOR MANAGEMENT */}
      {activeAdminTab === 'vendors' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendor by name, city, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-600"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing {vendors.length} Registered Travel Agents & Fleet Owners
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Vendor & Agency</th>
                    <th className="py-3 px-4">Role & Location</th>
                    <th className="py-3 px-4">KYC Document</th>
                    <th className="py-3 px-4">Status & Access</th>
                    <th className="py-3 px-4">Wallet Balance</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors
                    .filter(v => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return v.name.toLowerCase().includes(q) || 
                             v.companyName.toLowerCase().includes(q) || 
                             v.city.toLowerCase().includes(q) ||
                             v.phone.includes(q);
                    })
                    .map((vendor) => {
                      const isSuspended = vendor.status === 'suspended';
                      return (
                        <tr key={vendor.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{vendor.name}</div>
                            <div className="text-slate-500">{vendor.companyName}</div>
                            <div className="text-[11px] text-slate-400">{vendor.phone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800">{vendor.role}</span>
                            <div className="text-slate-500">{vendor.city}</div>
                          </td>
                          <td className="py-3 px-4">
                            {vendor.kycDocumentUrl ? (
                              <button
                                onClick={() => setInspectedDoc({
                                  type: 'kyc',
                                  title: `KYC Document: ${vendor.companyName}`,
                                  targetId: vendor.id,
                                  url: vendor.kycDocumentUrl!,
                                  details: {
                                    'Vendor Name': vendor.name,
                                    'Company': vendor.companyName,
                                    'Contact': vendor.phone,
                                    'City': vendor.city
                                  },
                                  currentStatus: vendor.isVerified ? 'approved' : 'pending'
                                })}
                                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Inspect KYC
                              </button>
                            ) : (
                              <span className="text-slate-400 italic">Self-attested</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onToggleVendorStatus(vendor.id)}
                                className={`px-2.5 py-1 rounded font-bold text-[11px] transition-colors border ${
                                  isSuspended
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                }`}
                                title="Click to toggle Block / Active status"
                              >
                                {isSuspended ? '🚫 Suspended / Blocked' : '✅ Active & Approved'}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            ₹{vendor.walletBalance.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedVendorForWallet(vendor);
                                setAdjustAmount(500);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] transition-colors"
                            >
                              Adjust Wallet
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FLEET & CAR VERIFICATION */}
      {activeAdminTab === 'cabs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Fleet & Vehicle Review Queue</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review commercial Registration Certificates (RC), Insurance, and fitness validity before authorizing cabs on the marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cabs.map((cab) => (
              <div 
                key={cab.id} 
                className={`bg-white rounded-xl border shadow-xs overflow-hidden flex flex-col justify-between ${
                  cab.status === 'pending' ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {cab.category} • {cab.fuelType || 'Diesel'}
                      </span>
                      <h4 className="text-base font-black text-slate-900">{cab.model}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      cab.status === 'approved' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : cab.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-100 text-amber-900 font-black'
                    }`}>
                      {cab.status}
                    </span>
                  </div>

                  {/* Number plate */}
                  <div className="my-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-400 text-slate-950 font-black tracking-widest text-xs border border-amber-500">
                    <span className="text-[10px] font-normal text-slate-800">IND</span>
                    <span>{cab.vehicleNumber}</span>
                  </div>

                  {/* Vendor details */}
                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div><span className="text-slate-400">Vendor:</span> <strong className="text-slate-800">{cab.vendorCompany || cab.vendorName}</strong></div>
                    <div><span className="text-slate-400">Seats:</span> {cab.seatingCapacity || 4} Passenger Capacity</div>
                    <div><span className="text-slate-400">Fitness Valid Till:</span> {cab.fitnessExpiry || '2027'}</div>
                  </div>

                  {cab.rejectionReason && (
                    <div className="mt-2.5 p-2 bg-rose-50 rounded border border-rose-200 text-xs text-rose-800">
                      <strong>Rejection Reason:</strong> {cab.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Verification Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setInspectedDoc({
                      type: 'rc',
                      title: `RC Inspection: ${cab.vehicleNumber}`,
                      targetId: cab.id,
                      url: cab.rcDocument,
                      details: {
                        'Vehicle Number': cab.vehicleNumber,
                        'Model': cab.model,
                        'Category': cab.category,
                        'Vendor': cab.vendorCompany || cab.vendorName || 'Vendor'
                      },
                      currentStatus: cab.status
                    })}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Inspect RC
                  </button>

                  <div className="flex items-center gap-1">
                    {cab.status !== 'approved' && (
                      <button
                        onClick={() => onApproveCab(cab.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
                      >
                        Approve
                      </button>
                    )}
                    {cab.status !== 'rejected' && (
                      <button
                        onClick={() => {
                          setInspectedDoc({
                            type: 'rc',
                            title: `Reject Cab: ${cab.vehicleNumber}`,
                            targetId: cab.id,
                            url: cab.rcDocument,
                            details: { 'Vehicle': cab.vehicleNumber },
                            currentStatus: cab.status
                          });
                          setIsRejectInputOpen(true);
                        }}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-bold"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DRIVER VERIFICATION */}
      {activeAdminTab === 'drivers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Commercial Driver Verification Roster</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Validate government-issued transport badges, driver licenses, and background authenticity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver) => (
              <div 
                key={driver.id} 
                className={`bg-white rounded-xl border shadow-xs overflow-hidden flex flex-col justify-between ${
                  driver.status === 'pending' ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-black text-slate-900">{driver.name}</h4>
                      <p className="text-xs text-slate-500">{driver.phone}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      driver.status === 'approved' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : driver.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-100 text-amber-900 font-black'
                    }`}>
                      {driver.status}
                    </span>
                  </div>

                  <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                    <div><span className="text-slate-400">Vendor:</span> <strong className="text-slate-800">{driver.vendorCompany || driver.vendorName}</strong></div>
                    <div><span className="text-slate-400">DL Number:</span> <span className="font-mono font-bold text-slate-900">{driver.licenseNumber}</span></div>
                    <div><span className="text-slate-400">Experience:</span> {driver.experienceYears || 5} Years Commercial</div>
                    <div><span className="text-slate-400">Assigned Cab:</span> {driver.assignedCabNumber || 'Unassigned'}</div>
                  </div>

                  {driver.rejectionReason && (
                    <div className="mt-2.5 p-2 bg-rose-50 rounded border border-rose-200 text-xs text-rose-800">
                      <strong>Rejection Reason:</strong> {driver.rejectionReason}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setInspectedDoc({
                      type: 'dl',
                      title: `DL Inspection: ${driver.name}`,
                      targetId: driver.id,
                      url: driver.dlDocument,
                      details: {
                        'Driver Name': driver.name,
                        'Phone': driver.phone,
                        'DL Number': driver.licenseNumber,
                        'Vendor': driver.vendorCompany || driver.vendorName || 'Vendor'
                      },
                      currentStatus: driver.status
                    })}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Inspect DL
                  </button>

                  <div className="flex items-center gap-1">
                    {driver.status !== 'approved' && (
                      <button
                        onClick={() => onApproveDriver(driver.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs"
                      >
                        Approve
                      </button>
                    )}
                    {driver.status !== 'rejected' && (
                      <button
                        onClick={() => {
                          setInspectedDoc({
                            type: 'dl',
                            title: `Reject Driver: ${driver.name}`,
                            targetId: driver.id,
                            url: driver.dlDocument,
                            details: { 'Driver': driver.name },
                            currentStatus: driver.status
                          });
                          setIsRejectInputOpen(true);
                        }}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-bold"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE BOOKINGS & DISPUTES */}
      {activeAdminTab === 'bookings' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Audit by ID (e.g. SIC2601) or Route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
              >
                <option value="all">All Bookings</option>
                <option value="available">Available</option>
                <option value="negotiating">Negotiating</option>
                <option value="claimed">Claimed (Locked)</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Route & Trip</th>
                    <th className="py-3 px-4">Poster Vendor</th>
                    <th className="py-3 px-4">Claimed Vendor</th>
                    <th className="py-3 px-4">Fare / Commission</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Super Admin Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {duties
                    .filter(d => {
                      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return d.dutyNumber.toLowerCase().includes(q) ||
                             d.pickupCity.toLowerCase().includes(q) ||
                             d.dropCity.toLowerCase().includes(q) ||
                             d.posterCompany.toLowerCase().includes(q);
                    })
                    .map((duty) => (
                      <tr key={duty.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-black text-indigo-700">
                          {duty.dutyNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{duty.pickupCity} → {duty.dropCity}</div>
                          <div className="text-[11px] text-slate-500">{duty.vehicleType} • {duty.dutyType}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{duty.posterCompany}</div>
                          <div className="text-[11px] text-slate-400">{duty.posterPhone}</div>
                        </td>
                        <td className="py-3 px-4">
                          {duty.claimedBy ? (
                            <div>
                              <div className="font-bold text-emerald-700">{duty.claimedBy.companyName}</div>
                              <div className="text-[11px] text-slate-500">Cab: {duty.claimedBy.vehicleNumber}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unclaimed / Available</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">₹{duty.totalCustomerFare}</div>
                          <div className="text-[11px] text-amber-700 font-semibold">Comm: ₹{duty.commissionAmount}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            duty.status === 'claimed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : duty.status === 'completed'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {duty.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => onViewSlip(duty)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-[11px]"
                          >
                            Duty Slip
                          </button>
                          {duty.status === 'claimed' && (
                            <button
                              onClick={() => onRefundCommission(duty.id, duty.commissionAmount)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-bold text-[11px]"
                              title="Resolve dispute: Refund commission to buyer"
                            >
                              Refund Escrow
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COMMISSION & FINANCIAL SETTINGS */}
      {activeAdminTab === 'commissions' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Platform Commission & Financial Parameters</h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure global platform fee cuts, minimum required commission per booking, and financial dues tracking.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg">
              {settingsSavedToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Commission configuration updated across Supabase & platform successfully!
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Platform Revenue Share (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="30"
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-indigo-600"
                    />
                    <span className="absolute right-3 top-2 text-sm text-slate-400">%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Platform cut calculated on every completed commission escrow.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minimum Flat Commission (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="10"
                      min="50"
                      max="1000"
                      value={minFlatCommission}
                      onChange={(e) => setMinFlatCommission(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-indigo-600"
                    />
                    <span className="absolute right-3 top-2 text-sm text-slate-400">₹</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Floor price for posting outstation or one-way duties.</p>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
              >
                Save Platform Parameters
              </button>
            </form>
          </div>

          {/* Ledger History */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Platform Escrow & Commission Transactions</h4>
            <div className="divide-y divide-slate-100 text-xs">
              {transactions.slice(0, 8).map(tx => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{tx.title}</p>
                    <p className="text-[11px] text-slate-500">{tx.description} • {tx.timestamp}</p>
                  </div>
                  <span className={`font-mono font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SUPABASE SQL SCHEMA */}
      {activeAdminTab === 'sql' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-600" />
                Supabase SQL Database Blueprint & RLS Policies
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Copy and run in the Supabase SQL Editor to provision all tables: profiles, cabs, drivers, bookings, and RLS policies.
              </p>
            </div>

            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              {copiedSql ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedSql ? 'Copied to Clipboard!' : 'Copy Supabase SQL'}
            </button>
          </div>

          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed max-h-96">
{`-- SafarIndiaCabs Complete Supabase DDL
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'vendor')) DEFAULT 'vendor',
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'suspended')) DEFAULT 'approved',
  company_name TEXT,
  phone TEXT,
  city TEXT DEFAULT 'Delhi NCR',
  wallet_balance NUMERIC DEFAULT 1000.00
);

CREATE TABLE public.cabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_number TEXT NOT NULL,
  model TEXT NOT NULL,
  category TEXT DEFAULT 'Sedan',
  rc_document TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending'
);

CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  license_number TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending'
);

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL,
  poster_id UUID NOT NULL REFERENCES public.profiles(id),
  pickup TEXT NOT NULL,
  drop_location TEXT NOT NULL,
  trip_type TEXT NOT NULL,
  fare NUMERIC NOT NULL,
  commission NUMERIC NOT NULL,
  status TEXT DEFAULT 'available',
  assigned_vendor_id UUID REFERENCES public.profiles(id)
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;`}
          </pre>
        </div>
      )}

      {/* Document Inspector Modal */}
      {inspectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-400" />
                {inspectedDoc.title}
              </h4>
              <button 
                onClick={() => {
                  setInspectedDoc(null);
                  setIsRejectInputOpen(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 shadow-inner">
                <img 
                  src={inspectedDoc.url} 
                  alt="Document Specimen"
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Document Metadata Details */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                {Object.entries(inspectedDoc.details).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-slate-400 font-medium">{key}:</span>
                    <p className="font-bold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>

              {/* Rejection input */}
              {isRejectInputOpen && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-rose-900">
                    Specify Rejection Note for Vendor:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Blurred RC photo / Expired Insurance / Invalid DL..."
                    value={rejectionReasonText}
                    onChange={(e) => setRejectionReasonText(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-rose-300 rounded-lg focus:outline-rose-600 bg-white"
                  />
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setInspectedDoc(null);
                  setIsRejectInputOpen(false);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {!isRejectInputOpen ? (
                  <button
                    onClick={() => setIsRejectInputOpen(true)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold"
                  >
                    Reject with Reason
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (inspectedDoc.type === 'rc') {
                        onRejectCab(inspectedDoc.targetId, rejectionReasonText || 'Invalid document photo');
                      } else if (inspectedDoc.type === 'dl') {
                        onRejectDriver(inspectedDoc.targetId, rejectionReasonText || 'Invalid commercial license');
                      }
                      setInspectedDoc(null);
                      setIsRejectInputOpen(false);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow"
                  >
                    Confirm Rejection
                  </button>
                )}

                <button
                  onClick={() => {
                    if (inspectedDoc.type === 'rc') {
                      onApproveCab(inspectedDoc.targetId);
                    } else if (inspectedDoc.type === 'dl') {
                      onApproveDriver(inspectedDoc.targetId);
                    } else if (inspectedDoc.type === 'kyc') {
                      onToggleVendorKyc(inspectedDoc.targetId);
                    }
                    setInspectedDoc(null);
                    setIsRejectInputOpen(false);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow"
                >
                  Verify & Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Adjustment Modal */}
      {selectedVendorForWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm">Adjust Vendor Wallet</h4>
              <button onClick={() => setSelectedVendorForWallet(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleWalletSubmit} className="p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-500">Selected Vendor</p>
                <p className="font-bold text-slate-900 text-sm">{selectedVendorForWallet.name} ({selectedVendorForWallet.companyName})</p>
                <p className="text-xs text-emerald-600 font-mono mt-0.5">Current Balance: ₹{selectedVendorForWallet.walletBalance}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustAction('add')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    adjustAction === 'add'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  + Add Credit
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustAction('deduct')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    adjustAction === 'deduct'
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  - Deduct Penalty
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={50}
                  step={50}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Note</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVendorForWallet(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
