import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  QuickStatsBanner 
} from './components/QuickStatsBanner';
import { 
  DutyBoard 
} from './components/DutyBoard';
import { 
  PostDutyModal 
} from './components/PostDutyModal';
import { 
  ClaimDutyModal 
} from './components/ClaimDutyModal';
import { 
  DutySlipModal 
} from './components/DutySlipModal';
import { 
  KhaliGadiBoard 
} from './components/KhaliGadiBoard';
import { 
  PostReturnCabModal 
} from './components/PostReturnCabModal';
import { 
  MyBookings 
} from './components/MyBookings';
import { 
  WalletModal 
} from './components/WalletModal';
import { 
  MembershipModal 
} from './components/MembershipModal';
import { 
  VendorDirectory 
} from './components/VendorDirectory';
import { 
  ChatsView 
} from './components/ChatsView';
import { 
  ProfileView 
} from './components/ProfileView';
import { 
  BottomNav 
} from './components/BottomNav';
import { 
  PostChoiceModal 
} from './components/PostChoiceModal';
import {
  AdminPanel
} from './components/AdminPanel';
import {
  BookingChatModal
} from './components/BookingChatModal';
import {
  VendorDashboardView
} from './components/VendorDashboardView';
import {
  AuthModal
} from './components/AuthModal';
import { 
  Duty, 
  ReturnCab, 
  UserProfile, 
  WalletTransaction, 
  UserRole,
  VendorChat,
  BookingChatMessage,
  Cab,
  Driver,
  PlatformSettings
} from './types';

import { 
  loadStoredUser, 
  saveStoredUser, 
  loadStoredDuties, 
  saveStoredDuties, 
  loadStoredReturnCabs, 
  saveStoredReturnCabs, 
  loadStoredTransactions, 
  saveStoredTransactions,
  loadStoredAllVendors,
  saveStoredAllVendors,
  loadStoredCabs,
  saveStoredCabs,
  loadStoredDrivers,
  saveStoredDrivers,
  loadStoredSettings,
  saveStoredSettings
} from './utils/storage';

import { 
  INITIAL_CHATS 
} from './data/mockData';
import { 
  ShieldCheck, 
  Phone, 
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile>(loadStoredUser);
  const [duties, setDuties] = useState<Duty[]>(loadStoredDuties);
  const [returnCabs, setReturnCabs] = useState<ReturnCab[]>(loadStoredReturnCabs);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(loadStoredTransactions);
  const [chats, setChats] = useState<VendorChat[]>(INITIAL_CHATS);
  const [allVendors, setAllVendors] = useState<UserProfile[]>(loadStoredAllVendors);
  const [cabs, setCabs] = useState<Cab[]>(loadStoredCabs);
  const [drivers, setDrivers] = useState<Driver[]>(loadStoredDrivers);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(loadStoredSettings);
  
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [activeTab, setActiveTab] = useState<string>('duties');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPostChoiceOpen, setIsPostChoiceOpen] = useState(false);
  const [isPostDutyOpen, setIsPostDutyOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedDutyForClaim, setSelectedDutyForClaim] = useState<Duty | null>(null);
  
  const [isDutySlipOpen, setIsDutySlipOpen] = useState(false);
  const [selectedDutyForSlip, setSelectedDutyForSlip] = useState<Duty | null>(null);

  // Booking Chat & Deal Room Modal
  const [isBookingChatOpen, setIsBookingChatOpen] = useState(false);
  const [selectedDutyForChat, setSelectedDutyForChat] = useState<Duty | null>(null);

  const [isPostReturnCabOpen, setIsPostReturnCabOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync state to local storage
  useEffect(() => {
    saveStoredUser(user);
  }, [user]);

  useEffect(() => {
    saveStoredDuties(duties);
  }, [duties]);

  useEffect(() => {
    saveStoredReturnCabs(returnCabs);
  }, [returnCabs]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredAllVendors(allVendors);
  }, [allVendors]);

  useEffect(() => {
    saveStoredCabs(cabs);
  }, [cabs]);

  useEffect(() => {
    saveStoredDrivers(drivers);
  }, [drivers]);

  useEffect(() => {
    saveStoredSettings(platformSettings);
  }, [platformSettings]);

  const handleUpdateRole = (role: UserRole) => {
    const isNowAdmin = role === 'Super Admin';
    setUser(prev => ({ 
      ...prev, 
      role,
      appRole: isNowAdmin ? 'admin' : 'vendor'
    }));
    if (isNowAdmin) {
      setActiveTab('admin');
      showToast('Switched to Super Admin Control Panel');
    } else {
      if (activeTab === 'admin') setActiveTab('dashboard');
      showToast(`Role switched to "${role}"`);
    }
  };

  const handleLoginSuccess = (newUser: UserProfile, targetView: 'admin' | 'dashboard' | 'duties') => {
    setUser(newUser);
    setActiveTab(targetView);
    showToast(`Signed in successfully as ${newUser.name} (${newUser.role})`);
  };

  // Cab management handlers
  const handleAddCab = (newCab: Cab) => {
    setCabs(prev => [newCab, ...prev]);
    showToast(`Vehicle ${newCab.vehicleNumber} submitted for Super Admin verification.`);
  };

  const handleDeleteCab = (cabId: string) => {
    setCabs(prev => prev.filter(c => c.id !== cabId));
    showToast('Vehicle removed from your fleet.');
  };

  const handleUpdateCab = (updatedCab: Cab) => {
    setCabs(prev => prev.map(c => c.id === updatedCab.id ? updatedCab : c));
  };

  const handleApproveCab = (cabId: string) => {
    setCabs(prev => prev.map(c => c.id === cabId ? { ...c, status: 'approved', rejectionReason: undefined } : c));
    showToast('Vehicle approved and verified for bookings!');
  };

  const handleRejectCab = (cabId: string, reason: string) => {
    setCabs(prev => prev.map(c => c.id === cabId ? { ...c, status: 'rejected', rejectionReason: reason } : c));
    showToast(`Vehicle verification rejected with feedback note.`);
  };

  // Driver management handlers
  const handleAddDriver = (newDriver: Driver) => {
    setDrivers(prev => [newDriver, ...prev]);
    showToast(`Driver ${newDriver.name} submitted for DL verification.`);
  };

  const handleDeleteDriver = (driverId: string) => {
    setDrivers(prev => prev.filter(d => d.id !== driverId));
    showToast('Driver removed from roster.');
  };

  const handleUpdateDriver = (updatedDriver: Driver) => {
    setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d));
  };

  const handleApproveDriver = (driverId: string) => {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'approved', rejectionReason: undefined } : d));
    showToast('Driver DL verified and approved!');
  };

  const handleRejectDriver = (driverId: string, reason: string) => {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'rejected', rejectionReason: reason } : d));
    showToast('Driver verification rejected with feedback note.');
  };

  const handleUpdateSettings = (newSettings: PlatformSettings) => {
    setPlatformSettings(newSettings);
    showToast('Platform commission settings updated.');
  };


  // Add new duty
  const handleAddDuty = (newDuty: Duty) => {
    const updated = [newDuty, ...duties];
    setDuties(updated);
    setUser(prev => ({
      ...prev,
      completedDuties: prev.completedDuties + 1
    }));
    showToast(`✅ Duty #${newDuty.dutyNumber} broadcasted successfully! Commission: ₹${newDuty.commissionAmount}`);
  };

  // Claim duty with commission payment
  const handleOpenClaim = (duty: Duty) => {
    setSelectedDutyForClaim(duty);
    setIsClaimModalOpen(true);
  };

  const handleConfirmClaim = (
    dutyId: string, 
    paymentMethod: 'Wallet' | 'UPI', 
    driverDetails: { driverName?: string; driverPhone?: string; vehicleNumber?: string }
  ) => {
    const targetDuty = duties.find(d => d.id === dutyId);
    if (!targetDuty) return;

    const commission = targetDuty.commissionAmount;

    // Deduct wallet if paid via wallet
    if (paymentMethod === 'Wallet') {
      setUser(prev => ({
        ...prev,
        walletBalance: Math.max(0, prev.walletBalance - commission)
      }));
    }

    // Add transaction record
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'debit',
      amount: commission,
      title: `Commission Paid: Duty #${targetDuty.dutyNumber}`,
      description: `${targetDuty.pickupCity} to ${targetDuty.dropCity} (${paymentMethod})`,
      timestamp: 'Just now',
      dutyId: targetDuty.id,
      method: paymentMethod,
      status: 'success'
    };
    setTransactions(prev => [newTx, ...prev]);

    // Update duty
    const updatedDuties = duties.map(d => {
      if (d.id === dutyId) {
        return {
          ...d,
          status: 'claimed' as const,
          claimedBy: {
            userId: user.id,
            userName: user.name,
            userPhone: user.phone,
            companyName: user.companyName,
            claimedAt: 'Just now',
            driverName: driverDetails.driverName || user.name,
            driverPhone: driverDetails.driverPhone || user.phone,
            vehicleNumber: driverDetails.vehicleNumber || 'DL 01 TA 7890',
            paidCommission: commission
          }
        };
      }
      return d;
    });

    setDuties(updatedDuties);

    // Open Duty slip immediately
    const claimedDuty = updatedDuties.find(d => d.id === dutyId) || null;
    setSelectedDutyForSlip(claimedDuty);
    setIsDutySlipOpen(true);

    showToast(`🎉 Congratulations! Duty #${targetDuty.dutyNumber} is locked for you. Passenger details unlocked!`);
  };

  const handleViewSlip = (duty: Duty) => {
    setSelectedDutyForSlip(duty);
    setIsDutySlipOpen(true);
  };

  // Open Chat & Deal Room for a specific booking
  const handleOpenChat = (duty: Duty) => {
    setSelectedDutyForChat(duty);
    setIsBookingChatOpen(true);
  };

  // Poster sends formal commission request
  const handleSendCommissionRequest = (dutyId: string, requestedAmount: number, targetVendorName: string) => {
    const updated = duties.map(d => {
      if (d.id === dutyId) {
        const msg: BookingChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: user.id,
          senderName: user.name,
          senderPhone: user.phone,
          senderCompany: user.companyName,
          text: `Official Commission Payment Request: ₹${requestedAmount}. Pay to unlock full vendor contact and customer details.`,
          timestamp: 'Just now',
          isMe: true,
          isCommissionOffer: true,
          offerAmount: requestedAmount
        };

        const updatedMessages = [...(d.chatMessages || []), msg];
        return {
          ...d,
          commissionAmount: requestedAmount,
          driverNetEarning: Math.max(0, d.totalCustomerFare - requestedAmount),
          status: 'negotiating' as const,
          activeNegotiationWith: {
            vendorId: user.id,
            vendorName: targetVendorName,
            vendorCompany: user.companyName,
            vendorPhone: user.phone,
            agreedCommission: requestedAmount,
            requestStatus: 'pending_payment' as const
          },
          chatMessages: updatedMessages
        };
      }
      return d;
    });

    setDuties(updated);
    const updatedSelected = updated.find(d => d.id === dutyId) || null;
    setSelectedDutyForChat(updatedSelected);
    showToast(`Commission payment request of ₹${requestedAmount} sent!`);
  };

  // Buyer accepts & pays commission via escrow
  const handleAcceptAndPayCommission = (dutyId: string, commissionAmount: number) => {
    const targetDuty = duties.find(d => d.id === dutyId);
    if (!targetDuty) return;

    // Deduct from wallet if sufficient, else top-up seamlessly
    setUser(prev => ({
      ...prev,
      walletBalance: Math.max(0, prev.walletBalance - commissionAmount)
    }));

    // Record escrow transaction
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'debit',
      amount: commissionAmount,
      title: `Escrow Commission Paid: #${targetDuty.dutyNumber}`,
      description: `Locked ${targetDuty.pickupCity} to ${targetDuty.dropCity} with ${targetDuty.posterCompany}`,
      timestamp: 'Just now',
      dutyId: targetDuty.id,
      dutyNumber: targetDuty.dutyNumber,
      method: 'Wallet',
      status: 'success'
    };
    setTransactions(prev => [newTx, ...prev]);

    // Update duty to claimed/assigned
    const updated = duties.map(d => {
      if (d.id === dutyId) {
        const confirmMsg: BookingChatMessage = {
          id: `msg-paid-${Date.now()}`,
          senderId: user.id,
          senderName: user.name,
          senderPhone: user.phone,
          senderCompany: user.companyName,
          text: `✅ Commission of ₹${commissionAmount} paid into escrow! Vendor phone and customer contact unlocked.`,
          timestamp: 'Just now',
          isMe: true
        };

        return {
          ...d,
          status: 'claimed' as const,
          commissionAmount,
          driverNetEarning: Math.max(0, d.totalCustomerFare - commissionAmount),
          claimedBy: {
            userId: user.id,
            userName: user.name,
            userPhone: user.phone,
            companyName: user.companyName,
            claimedAt: 'Just now',
            driverName: user.name,
            driverPhone: user.phone,
            vehicleNumber: 'DL 01 TA 7890',
            paidCommission: commissionAmount
          },
          chatMessages: [...(d.chatMessages || []), confirmMsg]
        };
      }
      return d;
    });

    setDuties(updated);
    const updatedSelected = updated.find(d => d.id === dutyId) || null;
    setSelectedDutyForChat(updatedSelected);
    showToast(`🎉 Commission paid! Contact for Booking #${targetDuty.dutyNumber} unlocked!`);
  };

  // Super Admin Handlers
  const handleUpdateDutyStatus = (dutyId: string, status: Duty['status']) => {
    setDuties(prev => prev.map(d => d.id === dutyId ? { ...d, status } : d));
    showToast(`Booking status updated to ${status}`);
  };

  const handleRefundCommission = (dutyId: string, commissionAmount: number) => {
    setDuties(prev => prev.map(d => {
      if (d.id === dutyId) {
        return {
          ...d,
          status: 'available' as const,
          claimedBy: undefined
        };
      }
      return d;
    }));

    // Credit refund to wallet
    setUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + commissionAmount
    }));

    const refundTx: WalletTransaction = {
      id: `tx-ref-${Date.now()}`,
      type: 'credit',
      amount: commissionAmount,
      title: `Admin Commission Refund: #${dutyId}`,
      description: 'Full escrow commission refunded by Super Admin',
      timestamp: 'Just now',
      method: 'Refund',
      status: 'success'
    };
    setTransactions(prev => [refundTx, ...prev]);
    showToast(`Commission of ₹${commissionAmount} refunded successfully!`);
  };

  const handleToggleVendorKyc = (vendorId: string) => {
    setAllVendors(prev => prev.map(v => v.id === vendorId ? { ...v, isVerified: !v.isVerified } : v));
    showToast('Vendor KYC status toggled');
  };

  const handleToggleVendorStatus = (vendorId: string) => {
    setAllVendors(prev => prev.map(v => {
      if (v.id === vendorId) {
        const nextStatus = v.status === 'suspended' ? 'approved' : 'suspended';
        return { ...v, status: nextStatus };
      }
      return v;
    }));
    showToast('Vendor account status updated');
  };


  const handleAdjustVendorWallet = (vendorId: string, deltaAmount: number, reason: string) => {
    setAllVendors(prev => prev.map(v => {
      if (v.id === vendorId) {
        const updatedBalance = Math.max(0, (v.walletBalance ?? 0) + deltaAmount);
        return { ...v, walletBalance: updatedBalance };
      }
      return v;
    }));

    if (vendorId === user.id) {
      setUser(prev => ({
        ...prev,
        walletBalance: Math.max(0, prev.walletBalance + deltaAmount)
      }));
    }

    const adjTx: WalletTransaction = {
      id: `tx-adj-${Date.now()}`,
      type: deltaAmount >= 0 ? 'credit' : 'debit',
      amount: Math.abs(deltaAmount),
      title: `Admin Balance Adjustment (${reason})`,
      description: `Adjustment of ₹${Math.abs(deltaAmount)} by Super Admin`,
      timestamp: 'Just now',
      method: 'Admin Adjustment',
      status: 'success'
    };
    setTransactions(prev => [adjTx, ...prev]);
    showToast(`Vendor wallet adjusted by ${deltaAmount >= 0 ? '+' : '-'}₹${Math.abs(deltaAmount)}`);
  };

  const handleNegotiateDuty = (duty: Duty) => {
    handleOpenChat(duty);
  };

  // Return cab
  const handleAddReturnCab = (newCab: ReturnCab) => {
    setReturnCabs(prev => [newCab, ...prev]);
    showToast(`🚗 Empty return vehicle (${newCab.fromCity} ➔ ${newCab.toCity}) published successfully!`);
  };

  // Wallet
  const handleAddFunds = (amount: number) => {
    setUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + amount
    }));

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'credit',
      amount,
      title: 'Wallet Top-up (Instant UPI)',
      description: 'Added funds for duty commission claims',
      timestamp: 'Just now',
      method: 'UPI',
      status: 'success'
    };
    setTransactions(prev => [newTx, ...prev]);
    showToast(`₹${amount} added to your wallet successfully!`);
  };

  // Membership
  const handleUpgradePlan = (planName: 'Free' | 'Silver' | 'Gold' | 'Diamond') => {
    setUser(prev => ({
      ...prev,
      membershipPlan: planName
    }));
    showToast(`👑 Plan upgraded to "${planName} Partner"!`);
  };

  const availableDutiesCount = duties.filter(d => d.status === 'available').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 pb-16 sm:pb-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-[#0a2540] text-amber-400 font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs sm:text-sm animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        user={user}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenPostDuty={() => setIsPostDutyOpen(true)}
        onOpenMembership={() => setIsMembershipOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onUpdateRole={handleUpdateRole}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        availableDutiesCount={availableDutiesCount}
        returnCabsCount={returnCabs.length}
        myCabsCount={cabs.filter(c => c.vendorId === user.id).length}
        myDriversCount={drivers.filter(d => d.vendorId === user.id).length}
        unreadChatsCount={1}
      />

      {/* Live Market Stats Ticker */}
      <QuickStatsBanner
        totalDutiesCount={availableDutiesCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Marketplace Duty Board */}
        {activeTab === 'duties' && (
          <DutyBoard
            duties={duties}
            currentUser={user}
            selectedCity={selectedCity}
            onClaimDuty={handleOpenClaim}
            onViewSlip={handleViewSlip}
            onOpenPostDuty={() => setIsPostDutyOpen(true)}
            onNegotiate={handleNegotiateDuty}
            onOpenChat={handleOpenChat}
          />
        )}

        {/* Vendor Dashboard (/dashboard) */}
        {activeTab === 'dashboard' && (
          <VendorDashboardView
            currentUser={user}
            cabs={cabs}
            drivers={drivers}
            duties={duties}
            transactions={transactions}
            onAddCab={handleAddCab}
            onDeleteCab={handleDeleteCab}
            onUpdateCab={handleUpdateCab}
            onAddDriver={handleAddDriver}
            onDeleteDriver={handleDeleteDriver}
            onUpdateDriver={handleUpdateDriver}
            onOpenPostDuty={() => setIsPostDutyOpen(true)}
            onOpenWallet={() => setIsWalletOpen(true)}
            onOpenMembership={() => setIsMembershipOpen(true)}
            onViewSlip={handleViewSlip}
            onOpenChat={handleOpenChat}
          />
        )}

        {/* Super Admin Panel (/admin) */}
        {activeTab === 'admin' && (
          <AdminPanel
            currentUser={user}
            duties={duties}
            vendors={allVendors}
            cabs={cabs}
            drivers={drivers}
            transactions={transactions}
            platformSettings={platformSettings}
            onUpdateDutyStatus={handleUpdateDutyStatus}
            onRefundCommission={handleRefundCommission}
            onToggleVendorKyc={handleToggleVendorKyc}
            onToggleVendorStatus={handleToggleVendorStatus}
            onAdjustVendorWallet={handleAdjustVendorWallet}
            onApproveCab={handleApproveCab}
            onRejectCab={handleRejectCab}
            onApproveDriver={handleApproveDriver}
            onRejectDriver={handleRejectDriver}
            onUpdateSettings={handleUpdateSettings}
            onViewSlip={handleViewSlip}
            onSwitchToVendorView={() => setActiveTab('dashboard')}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}


        {activeTab === 'return_cabs' && (
          <KhaliGadiBoard
            returnCabs={returnCabs}
            currentUser={user}
            onOpenPostReturnCab={() => setIsPostReturnCabOpen(true)}
          />
        )}

        {activeTab === 'my_bookings' && (
          <MyBookings
            duties={duties}
            currentUser={user}
            onViewSlip={handleViewSlip}
            onMarkCompleted={() => {}}
          />
        )}

        {activeTab === 'chats' && (
          <ChatsView
            chats={chats}
            currentUser={user}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorDirectory />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            onOpenMembership={() => setIsMembershipOpen(true)}
            onOpenWallet={() => setIsWalletOpen(true)}
          />
        )}

        {activeTab === 'membership' && (
          <div className="py-2">
            <MembershipModal
              isOpen={true}
              onClose={() => setActiveTab('duties')}
              currentUser={user}
              onUpgradePlan={handleUpgradePlan}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (as seen in video) */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenPostSelection={() => setIsPostChoiceOpen(true)}
        unreadChatsCount={1}
      />

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 text-slate-600 text-xs py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/aistudio/IMG-20261029-WA0001_67f0d119.jpg" 
              alt="Safar India Cabs Logo" 
              className="h-12 w-12 rounded-2xl object-cover border-2 border-slate-200 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-base font-black text-[#0a2540]">
                  Safar<span className="text-amber-500">India</span>Cabs Vendor
                </span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300">
                  B2B Taxi Network
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                Premier Taxi Sanchalak Marketplace. 100% Commission Escrow protection for travel agents and fleet operators.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700 font-bold">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Fraud Protection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-amber-600" />
              <span>Helpline: +91 85060 46346</span>
            </div>
            <button
              onClick={() => setIsMembershipOpen(true)}
              className="text-[#0a2540] hover:text-amber-600 cursor-pointer"
            >
              Membership Plans
            </button>
            <button
              onClick={() => setIsWalletOpen(true)}
              className="text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Commission Wallet
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div>
            © 2026 Safar India Cabs Vendor. All rights reserved. A1 CAB SERVICES • N. INDIA.
          </div>
          <div>
            Intercity B2B Taxi & Fleet Management Platform.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PostChoiceModal
        isOpen={isPostChoiceOpen}
        onClose={() => setIsPostChoiceOpen(false)}
        onSelectPostBooking={() => setIsPostDutyOpen(true)}
        onSelectPostReturnVehicle={() => setIsPostReturnCabOpen(true)}
      />

      <PostDutyModal
        isOpen={isPostDutyOpen}
        onClose={() => setIsPostDutyOpen(false)}
        currentUser={user}
        existingDuties={duties}
        onAddDuty={handleAddDuty}
      />

      <BookingChatModal
        isOpen={isBookingChatOpen}
        onClose={() => {
          setIsBookingChatOpen(false);
          setSelectedDutyForChat(null);
        }}
        duty={selectedDutyForChat}
        currentUser={user}
        onSendCommissionRequest={handleSendCommissionRequest}
        onAcceptAndPayCommission={handleAcceptAndPayCommission}
        onViewSlip={handleViewSlip}
      />

      <ClaimDutyModal
        isOpen={isClaimModalOpen}
        onClose={() => {
          setIsClaimModalOpen(false);
          setSelectedDutyForClaim(null);
        }}
        duty={selectedDutyForClaim}
        currentUser={user}
        onConfirmClaim={handleConfirmClaim}
      />

      <DutySlipModal
        isOpen={isDutySlipOpen}
        onClose={() => {
          setIsDutySlipOpen(false);
          setSelectedDutyForSlip(null);
        }}
        duty={selectedDutyForSlip}
        currentUser={user}
      />

      <PostReturnCabModal
        isOpen={isPostReturnCabOpen}
        onClose={() => setIsPostReturnCabOpen(false)}
        currentUser={user}
        onAddReturnCab={handleAddReturnCab}
      />

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        currentUser={user}
        transactions={transactions}
        onAddFunds={handleAddFunds}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        onLoginSuccess={handleLoginSuccess}
      />

      {activeTab !== 'membership' && (
        <MembershipModal
          isOpen={isMembershipOpen}
          onClose={() => setIsMembershipOpen(false)}
          currentUser={user}
          onUpgradePlan={handleUpgradePlan}
        />
      )}

    </div>
  );
}
