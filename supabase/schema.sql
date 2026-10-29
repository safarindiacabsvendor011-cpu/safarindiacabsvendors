-- ==============================================================================
-- SAFAR INDIA CABS (B2B Aggregator & Taxi Vendor Platform)
-- Supabase Database Schema & Row-Level Security (RLS) Policies
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE
-- Roles: 'admin', 'vendor'
-- Status: 'pending', 'approved', 'suspended'
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'vendor')) DEFAULT 'vendor',
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'suspended')) DEFAULT 'approved',
    company_name TEXT,
    full_name TEXT,
    phone TEXT,
    city TEXT DEFAULT 'Delhi NCR',
    rating NUMERIC(3, 2) DEFAULT 4.80,
    wallet_balance NUMERIC(12, 2) DEFAULT 1000.00,
    membership_plan TEXT DEFAULT 'Gold',
    kyc_document_url TEXT,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for role and status
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- ==============================================================================
-- 2. CABS TABLE (Fleet Management)
-- Status: 'pending', 'approved', 'rejected'
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cabs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_number TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Hatchback', 'Sedan', 'SUV', 'Premium SUV', 'Tempo Traveller', 'Luxury')) DEFAULT 'Sedan',
    rc_document TEXT NOT NULL,
    insurance_document TEXT,
    permit_document TEXT,
    fitness_expiry DATE,
    seating_capacity INT DEFAULT 4,
    fuel_type TEXT DEFAULT 'Diesel',
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    rejection_reason TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cabs_vendor_id ON public.cabs(vendor_id);
CREATE INDEX IF NOT EXISTS idx_cabs_status ON public.cabs(status);
CREATE INDEX IF NOT EXISTS idx_cabs_vehicle_number ON public.cabs(vehicle_number);

-- ==============================================================================
-- 3. DRIVERS TABLE (Driver Verification)
-- Status: 'pending', 'approved', 'rejected'
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    license_number TEXT NOT NULL,
    dl_document TEXT NOT NULL,
    badge_number TEXT,
    experience_years INT DEFAULT 5,
    assigned_cab_id UUID REFERENCES public.cabs(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    rejection_reason TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_drivers_vendor_id ON public.drivers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);

-- ==============================================================================
-- 4. BOOKINGS TABLE (Marketplace & Duty Feed)
-- Status: 'available', 'negotiating', 'claimed', 'completed', 'cancelled'
-- Sequential ID: SIC2601, SIC2602...
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number TEXT UNIQUE NOT NULL,
    poster_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pickup TEXT NOT NULL,
    pickup_address TEXT,
    drop_location TEXT NOT NULL,
    drop_address TEXT,
    trip_type TEXT NOT NULL CHECK (trip_type IN ('One Way', 'Round Trip', 'Local (8h / 80km)', 'Airport Transfer', 'Multi-day Tour')),
    vehicle_type TEXT NOT NULL,
    fare NUMERIC(10, 2) NOT NULL,
    commission NUMERIC(10, 2) NOT NULL,
    advance_received NUMERIC(10, 2) DEFAULT 0.00,
    balance_to_collect NUMERIC(10, 2) DEFAULT 0.00,
    pickup_date DATE NOT NULL,
    pickup_time TEXT NOT NULL,
    passenger_name TEXT,
    passenger_phone TEXT,
    passenger_count INT DEFAULT 4,
    luggage_count INT DEFAULT 2,
    special_instructions TEXT,
    status TEXT NOT NULL CHECK (status IN ('available', 'negotiating', 'claimed', 'completed', 'cancelled')) DEFAULT 'available',
    assigned_vendor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    assigned_cab_id UUID REFERENCES public.cabs(id) ON DELETE SET NULL,
    commission_paid BOOLEAN DEFAULT false,
    dispute_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_poster ON public.bookings(poster_id);
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_vendor ON public.bookings(assigned_vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_number ON public.bookings(booking_number);

-- ==============================================================================
-- 5. WALLET & COMMISSION LEDGER TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wallet_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    amount NUMERIC(10, 2) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    payment_method TEXT DEFAULT 'Wallet',
    status TEXT NOT NULL CHECK (status IN ('success', 'pending', 'refunded')) DEFAULT 'success',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wallet_ledger_vendor ON public.wallet_ledger(vendor_id);

-- ==============================================================================
-- 6. COMMISSION & PLATFORM SETTINGS TABLE (Managed by Super Admin)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id TEXT PRIMARY KEY DEFAULT 'global_config',
    default_commission_percent NUMERIC(5, 2) DEFAULT 10.00,
    min_commission_flat NUMERIC(10, 2) DEFAULT 150.00,
    auto_approval_vendors BOOLEAN DEFAULT false,
    auto_approval_fleet BOOLEAN DEFAULT false,
    contact_phone TEXT DEFAULT '+91 85060 46346',
    contact_email TEXT DEFAULT 'admin@safarindiacabs.com',
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
-- Anyone authenticated can view vendor profiles for marketplace deals
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (id = auth.uid() OR public.is_admin());

-- Super Admin has full control on profiles
CREATE POLICY "Super Admins can manage all profiles" 
ON public.profiles FOR ALL 
TO authenticated 
USING (public.is_admin());

-- CABS POLICIES
-- Vendors see their own cabs; Admins see all cabs
CREATE POLICY "Vendors view own cabs, admins view all" 
ON public.cabs FOR SELECT 
TO authenticated 
USING (vendor_id = auth.uid() OR public.is_admin());

CREATE POLICY "Vendors insert their own cabs" 
ON public.cabs FOR INSERT 
TO authenticated 
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors update their own cabs or admin updates" 
ON public.cabs FOR UPDATE 
TO authenticated 
USING (vendor_id = auth.uid() OR public.is_admin());

CREATE POLICY "Vendors delete their own cabs or admin deletes" 
ON public.cabs FOR DELETE 
TO authenticated 
USING (vendor_id = auth.uid() OR public.is_admin());

-- DRIVERS POLICIES
CREATE POLICY "Vendors view own drivers, admins view all" 
ON public.drivers FOR SELECT 
TO authenticated 
USING (vendor_id = auth.uid() OR public.is_admin());

CREATE POLICY "Vendors insert their own drivers" 
ON public.drivers FOR INSERT 
TO authenticated 
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors and admin can update drivers" 
ON public.drivers FOR UPDATE 
TO authenticated 
USING (vendor_id = auth.uid() OR public.is_admin());

-- BOOKINGS POLICIES
-- All authenticated vendors can read available bookings; posters and assigned vendors can read their own
CREATE POLICY "Authenticated users view available and owned bookings" 
ON public.bookings FOR SELECT 
TO authenticated 
USING (status = 'available' OR poster_id = auth.uid() OR assigned_vendor_id = auth.uid() OR public.is_admin());

CREATE POLICY "Vendors can post new bookings" 
ON public.bookings FOR INSERT 
TO authenticated 
WITH CHECK (poster_id = auth.uid());

CREATE POLICY "Posters, assigned vendors, and admins can update bookings" 
ON public.bookings FOR UPDATE 
TO authenticated 
USING (poster_id = auth.uid() OR assigned_vendor_id = auth.uid() OR public.is_admin());

-- LEDGER POLICIES
CREATE POLICY "Users can view own transactions, admins view all" 
ON public.wallet_ledger FOR SELECT 
TO authenticated 
USING (vendor_id = auth.uid() OR public.is_admin());

-- PLATFORM SETTINGS POLICIES
CREATE POLICY "Anyone can view platform settings" 
ON public.platform_settings FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only admin can update platform settings" 
ON public.platform_settings FOR ALL 
TO authenticated 
USING (public.is_admin());

-- ==============================================================================
-- SEED INITIAL CONFIGURATION
-- ==============================================================================
INSERT INTO public.platform_settings (id, default_commission_percent, min_commission_flat)
VALUES ('global_config', 10.00, 150.00)
ON CONFLICT (id) DO NOTHING;
