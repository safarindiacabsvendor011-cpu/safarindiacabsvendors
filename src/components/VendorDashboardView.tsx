import React, { useState } from 'react';
import { 
  Building2, 
  Car, 
  UserCheck, 
  Calendar, 
  Wallet, 
  PlusCircle, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { 
  UserProfile, 
  Cab, 
  Driver, 
  Duty, 
  WalletTransaction 
} from '../types';
import { VendorFleetManager } from './VendorFleetManager';
import { VendorDriverManager } from './VendorDriverManager';
import { MyBookings } from './MyBookings';

interface VendorDashboardViewProps {
  currentUser: UserProfile;
  cabs: Cab[];
  drivers: Driver[];
  duties: Duty[];
  transactions: WalletTransaction[];
  onAddCab: (cab: Cab) => void;
  onDeleteCab: (cabId: string) => void;
  onUpdateCab: (cab: Cab) => void;
  onAddDriver: (driver: Driver) => void;
  onDeleteDriver: (driverId: string) => void;
  onUpdateDriver: (driver: Driver) => void;
  onOpenPostDuty: () => void;
  onOpenWallet: () => void;
  onOpenMembership: () => void;
  onViewSlip: (duty: Duty) => void;
  onOpenChat: (duty: Duty) => void;
}

export const VendorDashboardView: React.FC<VendorDashboardViewProps> = ({
  currentUser,
  cabs,
  drivers,
  duties,
  transactions,
  onAddCab,
  onDeleteCab,
  onUpdateCab,
  onAddDriver,
  onDeleteDriver,
  onUpdateDriver,
  onOpenPostDuty,
  onOpenWallet,
  onOpenMembership,
  onViewSlip,
  onOpenChat
}) => {
  const [vendorTab, setVendorTab] = useState<'fleet' | 'drivers' | 'bookings' | 'ledger'>('fleet');

  // Vendor scoped data
  const myCabs = cabs.filter(c => c.vendorId === currentUser.id);
  const myDrivers = drivers.filter(d => d.vendorId === currentUser.id);
  const myPostedDuties = duties.filter(d => d.posterId === currentUser.id);
  const myClaimedDuties = duties.filter(d => d.claimedBy?.userId === currentUser.id);

  // Financial calculations
  const totalEarned = myClaimedDuties.reduce((acc, d) => acc + (d.driverNetEarning || 0), 0);
  const totalCommissionPaid = transactions
    .filter(t => t.type === 'debit' && t.status === 'success')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Vendor Profile & Quick Stats Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-sm border-2 border-amber-300">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{currentUser.companyName}</h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Vendor
                </span>
                <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Representative: <strong>{currentUser.name}</strong> • Phone: {currentUser.phone} • Base: {currentUser.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPostDuty}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              Post Cab Requirement
            </button>
            <button
              onClick={onOpenWallet}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Wallet className="h-4 w-4 text-emerald-400" />
              Wallet: ₹{currentUser.walletBalance.toLocaleString('en-IN')}
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>My Fleet (Cabs)</span>
              <Car className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{myCabs.length}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {myCabs.filter(c => c.status === 'approved').length} Verified & Active
            </p>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Verified Drivers</span>
              <UserCheck className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{myDrivers.length}</p>
            <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
              {myDrivers.filter(d => d.assignedCabId).length} Assigned to cabs
            </p>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Active Duties</span>
              <Calendar className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              {myPostedDuties.length + myClaimedDuties.length}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {myClaimedDuties.length} Claimed • {myPostedDuties.length} Broadcasted
            </p>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Gross Earnings</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-600">
              ₹{totalEarned.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Net earnings after commission
            </p>
          </div>
        </div>
      </div>

      {/* Vendor Navigation Sub-tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs flex overflow-x-auto gap-1">
        <button
          onClick={() => setVendorTab('fleet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            vendorTab === 'fleet'
              ? 'bg-[#0a2540] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Car className="h-4 w-4" />
          Fleet Management ({myCabs.length} Cabs)
        </button>

        <button
          onClick={() => setVendorTab('drivers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            vendorTab === 'drivers'
              ? 'bg-[#0a2540] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Driver Roster ({myDrivers.length} Drivers)
        </button>

        <button
          onClick={() => setVendorTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            vendorTab === 'bookings'
              ? 'bg-[#0a2540] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="h-4 w-4" />
          My Outstation Bookings ({myClaimedDuties.length + myPostedDuties.length})
        </button>

        <button
          onClick={() => setVendorTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            vendorTab === 'ledger'
              ? 'bg-[#0a2540] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Wallet & Commission Ledger
        </button>
      </div>

      {/* Tab 1: Fleet */}
      {vendorTab === 'fleet' && (
        <VendorFleetManager
          cabs={cabs}
          currentUser={currentUser}
          onAddCab={onAddCab}
          onDeleteCab={onDeleteCab}
          onUpdateCab={onUpdateCab}
        />
      )}

      {/* Tab 2: Drivers */}
      {vendorTab === 'drivers' && (
        <VendorDriverManager
          drivers={drivers}
          cabs={cabs}
          currentUser={currentUser}
          onAddDriver={onAddDriver}
          onDeleteDriver={onDeleteDriver}
          onUpdateDriver={onUpdateDriver}
        />
      )}

      {/* Tab 3: Bookings */}
      {vendorTab === 'bookings' && (
        <MyBookings
          duties={duties}
          currentUser={currentUser}
          onViewSlip={onViewSlip}
          onMarkCompleted={() => {}}
        />
      )}


      {/* Tab 4: Wallet & Commission Ledger */}
      {vendorTab === 'ledger' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Wallet & Commission Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent audit trail of your commission payments, refunds, and trip settlements.
              </p>
            </div>
            <button
              onClick={onOpenWallet}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              + Top-up Wallet Balance
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Transaction Details</th>
                    <th className="py-3 px-4">Trip Reference</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{tx.title}</div>
                        <div className="text-[11px] text-slate-500">{tx.description}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {tx.dutyNumber || 'General Wallet'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {tx.method || 'Wallet'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {tx.timestamp}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-sm">
                        <span className={tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}>
                          {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
