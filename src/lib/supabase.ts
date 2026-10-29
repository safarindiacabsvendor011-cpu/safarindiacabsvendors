import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('YOUR_SUPABASE_URL')
);

// If keys exist, create standard client. Otherwise create mockable placeholder client
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createClient('https://mock-safarindiacabs.supabase.co', 'mock-anon-key-placeholder') as unknown as SupabaseClient);

export interface SupabaseAuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'vendor';
    companyName: string;
    fullName: string;
    phone: string;
    status: 'approved' | 'pending' | 'suspended';
  };
  error?: string;
}

// Preset demo accounts for quick testing
export const DEMO_ACCOUNTS = [
  {
    role: 'admin' as const,
    label: 'Super Admin',
    email: 'admin@safarindiacabs.com',
    password: 'adminpassword',
    name: 'Chief Admin (SafarIndiaCabs)',
    company: 'Safar India Cabs HQ',
    phone: '+91 85060 46346'
  },
  {
    role: 'vendor' as const,
    label: 'Verified Vendor (Delhi NCR)',
    email: 'safarindiacabsvendor011@gmail.com',
    password: 'vendorpassword',
    name: 'SafarIndiaCabs Fleet',
    company: 'Safar India Cabs & Fleet',
    phone: '+91 85060 46346'
  },
  {
    role: 'vendor' as const,
    label: 'New Pending Vendor (Jaipur)',
    email: 'jaipur.travels@gmail.com',
    password: 'vendorpassword',
    name: 'Vikram Choudhary',
    company: 'Rajputana Heritage Cabs',
    phone: '+91 98290 12345'
  }
];
