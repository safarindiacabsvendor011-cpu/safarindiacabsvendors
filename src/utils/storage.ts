import { Duty, ReturnCab, UserProfile, WalletTransaction, Cab, Driver, PlatformSettings } from '../types';
import { INITIAL_USER, INITIAL_DUTIES, INITIAL_RETURN_CABS, INITIAL_TRANSACTIONS, VERIFIED_VENDORS, INITIAL_CABS, INITIAL_DRIVERS, INITIAL_PLATFORM_SETTINGS } from '../data/mockData';

const KEYS = {
  USER: 'sic_vendor_user_v4',
  DUTIES: 'sic_vendor_duties_v4',
  RETURN_CABS: 'sic_vendor_return_cabs_v4',
  TRANSACTIONS: 'sic_vendor_transactions_v4',
  ALL_VENDORS: 'sic_all_registered_vendors_v4',
  CABS: 'sic_all_cabs_v4',
  DRIVERS: 'sic_all_drivers_v4',
  SETTINGS: 'sic_platform_settings_v4'
};

export const loadStoredUser = (): UserProfile => {
  try {
    const raw = localStorage.getItem(KEYS.USER);
    const parsed = raw ? JSON.parse(raw) : INITIAL_USER;
    return {
      ...INITIAL_USER,
      ...parsed,
      walletBalance: typeof parsed.walletBalance === 'number' ? parsed.walletBalance : INITIAL_USER.walletBalance
    };
  } catch {
    return INITIAL_USER;
  }
};

export const saveStoredUser = (user: UserProfile) => {
  try {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user', e);
  }
};

export const loadStoredDuties = (): Duty[] => {
  try {
    const raw = localStorage.getItem(KEYS.DUTIES);
    if (!raw) return INITIAL_DUTIES;
    const parsed: Duty[] = JSON.parse(raw);
    return parsed.map((d, index) => {
      const fare = typeof d.totalCustomerFare === 'number' ? d.totalCustomerFare : 0;
      const comm = typeof d.commissionAmount === 'number' ? d.commissionAmount : 0;
      const adv = typeof d.advanceReceived === 'number' ? d.advanceReceived : 0;
      const num = d.dutyNumber && d.dutyNumber.startsWith('SIC2') ? d.dutyNumber : `SIC${2601 + index}`;

      return {
        ...d,
        dutyNumber: num,
        totalCustomerFare: fare,
        advanceReceived: adv,
        balanceToCollect: typeof d.balanceToCollect === 'number' ? d.balanceToCollect : Math.max(0, fare - adv),
        commissionAmount: comm,
        driverNetEarning: typeof d.driverNetEarning === 'number' ? d.driverNetEarning : Math.max(0, fare - comm),
        extraRequirements: Array.isArray(d.extraRequirements) ? d.extraRequirements : [],
        chatMessages: Array.isArray(d.chatMessages) ? d.chatMessages : []
      };
    });
  } catch {
    return INITIAL_DUTIES;
  }
};

export const saveStoredDuties = (duties: Duty[]) => {
  try {
    localStorage.setItem(KEYS.DUTIES, JSON.stringify(duties));
  } catch (e) {
    console.error('Failed to save duties', e);
  }
};

export const loadStoredAllVendors = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(KEYS.ALL_VENDORS);
    return raw ? JSON.parse(raw) : VERIFIED_VENDORS;
  } catch {
    return VERIFIED_VENDORS;
  }
};

export const saveStoredAllVendors = (vendors: UserProfile[]) => {
  try {
    localStorage.setItem(KEYS.ALL_VENDORS, JSON.stringify(vendors));
  } catch (e) {
    console.error('Failed to save all vendors', e);
  }
};

export const loadStoredCabs = (): Cab[] => {
  try {
    const raw = localStorage.getItem(KEYS.CABS);
    return raw ? JSON.parse(raw) : INITIAL_CABS;
  } catch {
    return INITIAL_CABS;
  }
};

export const saveStoredCabs = (cabs: Cab[]) => {
  try {
    localStorage.setItem(KEYS.CABS, JSON.stringify(cabs));
  } catch (e) {
    console.error('Failed to save cabs', e);
  }
};

export const loadStoredDrivers = (): Driver[] => {
  try {
    const raw = localStorage.getItem(KEYS.DRIVERS);
    return raw ? JSON.parse(raw) : INITIAL_DRIVERS;
  } catch {
    return INITIAL_DRIVERS;
  }
};

export const saveStoredDrivers = (drivers: Driver[]) => {
  try {
    localStorage.setItem(KEYS.DRIVERS, JSON.stringify(drivers));
  } catch (e) {
    console.error('Failed to save drivers', e);
  }
};

export const loadStoredSettings = (): PlatformSettings => {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : INITIAL_PLATFORM_SETTINGS;
  } catch {
    return INITIAL_PLATFORM_SETTINGS;
  }
};

export const saveStoredSettings = (settings: PlatformSettings) => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};

export const loadStoredReturnCabs = (): ReturnCab[] => {
  try {
    const raw = localStorage.getItem(KEYS.RETURN_CABS);
    return raw ? JSON.parse(raw) : INITIAL_RETURN_CABS;
  } catch {
    return INITIAL_RETURN_CABS;
  }
};

export const saveStoredReturnCabs = (cabs: ReturnCab[]) => {
  try {
    localStorage.setItem(KEYS.RETURN_CABS, JSON.stringify(cabs));
  } catch (e) {
    console.error('Failed to save return cabs', e);
  }
};

export const loadStoredTransactions = (): WalletTransaction[] => {
  try {
    const raw = localStorage.getItem(KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : INITIAL_TRANSACTIONS;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
};

export const saveStoredTransactions = (transactions: WalletTransaction[]) => {
  try {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions', e);
  }
};

