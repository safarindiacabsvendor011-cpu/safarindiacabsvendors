export type VehicleType = 
  | 'Hatchback (WagonR/Tiago)'
  | 'Sedan (Dzire/Etios/Aura)'
  | 'SUV (Ertiga/Carens/Triber)'
  | 'Premium SUV (Innova Crysta/Hycross)'
  | 'Tempo Traveller (12/17/26 Seater)'
  | 'Luxury (Camry/Mercedes)';

export type DutyType = 
  | 'One Way'
  | 'Round Trip'
  | 'Local (8h / 80km)'
  | 'Airport Transfer'
  | 'Multi-day Tour';

export type DutyStatus = 'available' | 'negotiating' | 'claimed' | 'completed' | 'cancelled';

export type ExtraRequirement = 
  | 'With Luggage Carrier'
  | 'All Inclusive (Toll & State Tax)'
  | 'AC Throughout Trip'
  | 'Airport Parking Included'
  | 'Non-Smoker Driver'
  | 'Commercial Diesel Cab'
  | 'Strictly On Time';

export interface BookingChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  senderCompany: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  isCommissionOffer?: boolean;
  offerAmount?: number;
  isAccepted?: boolean;
}

export interface Duty {
  id: string;
  dutyNumber: string; // Sequential: SIC2601, SIC2602, SIC2603...
  title: string;
  dutyType: DutyType;
  vehicleType: VehicleType;
  
  // Location
  pickupCity: string;
  pickupAddress: string;
  dropCity: string;
  dropAddress: string;
  
  // Schedule
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  
  // Passenger & Notes
  passengerName: string;
  passengerPhone: string;
  passengerCount: number;
  luggageCount: number;
  specialInstructions?: string;
  extraRequirements?: ExtraRequirement[];
  
  // Pricing & Commission
  totalCustomerFare: number;
  advanceReceived: number;
  balanceToCollect: number;
  isTollTaxesIncluded: boolean;
  commissionAmount: number;
  driverNetEarning: number; // Total Fare - Commission
  isNegotiable?: boolean;
  
  // Poster Details
  posterId: string;
  posterName: string;
  posterCompany: string;
  posterPhone: string;
  posterCity: string;
  posterRating: number;
  isPosterVerified: boolean;
  
  // Deal & Commission Request state
  activeNegotiationWith?: {
    vendorId: string;
    vendorName: string;
    vendorCompany: string;
    vendorPhone: string;
    agreedCommission: number;
    requestStatus: 'pending_payment' | 'paid';
  };
  
  // Claim Details
  status: DutyStatus;
  claimedBy?: {
    userId: string;
    userName: string;
    userPhone: string;
    companyName: string;
    claimedAt: string;
    driverName?: string;
    driverPhone?: string;
    vehicleNumber?: string;
    paidCommission: number;
  };
  
  chatMessages?: BookingChatMessage[];
  createdAt: string;
  urgencyTag?: 'Urgent' | 'Instant' | 'High Fare' | 'Advance Paid';
}

export interface ReturnCab {
  id: string;
  driverName: string;
  driverPhone: string;
  companyName: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  fromCity: string;
  toCity: string;
  departureDate: string;
  departureTime: string;
  discountedFare: number;
  emptySeatsOrFull: string;
  isVerified: boolean;
  postedAt: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  title: string;
  description: string;
  timestamp: string;
  dutyId?: string;
  dutyNumber?: string;
  method?: 'UPI' | 'Wallet' | 'NetBanking' | 'Refund' | 'Commission Payout' | 'Admin Adjustment';
  status: 'success' | 'pending' | 'failed';
}

export interface VendorChat {
  id: string;
  dutyId: string;
  dutyNumber: string;
  route: string;
  vehicleType: string;
  fare: number;
  commission: number;
  counterPartyName: string;
  counterPartyCompany: string;
  counterPartyPhone: string;
  lastMessage: string;
  lastMessageTime: string;
  status: 'Active Negotiation' | 'Assigned' | 'Ended';
  unreadCount?: number;
  driverOffersCount?: number;
}

export type UserRole = 'Travel Agent' | 'Fleet Owner / Operator' | 'Independent Driver' | 'Super Admin';
export type AppRole = 'admin' | 'vendor';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type VendorAccountStatus = 'pending' | 'approved' | 'suspended';

export interface Cab {
  id: string;
  vendorId: string;
  vendorName?: string;
  vendorCompany?: string;
  vehicleNumber: string;
  model: string;
  category: 'Hatchback' | 'Sedan' | 'SUV' | 'Premium SUV' | 'Tempo Traveller' | 'Luxury';
  rcDocument: string;
  insuranceDocument?: string;
  permitDocument?: string;
  fitnessExpiry?: string;
  seatingCapacity?: number;
  fuelType?: string;
  status: VerificationStatus;
  rejectionReason?: string;
  isActive: boolean;
  addedAt: string;
}

export interface Driver {
  id: string;
  vendorId: string;
  vendorName?: string;
  vendorCompany?: string;
  name: string;
  phone: string;
  licenseNumber: string;
  dlDocument: string;
  badgeNumber?: string;
  experienceYears?: number;
  assignedCabId?: string;
  assignedCabNumber?: string;
  status: VerificationStatus;
  rejectionReason?: string;
  isActive: boolean;
  addedAt: string;
}

export interface PlatformSettings {
  defaultCommissionPercent: number;
  minCommissionFlat: number;
  autoApprovalVendors: boolean;
  autoApprovalFleet: boolean;
  contactPhone: string;
  contactEmail: string;
}

export interface UserProfile {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  role: UserRole;
  appRole?: AppRole; // 'admin' | 'vendor'
  status: VendorAccountStatus;
  city: string;
  isVerified: boolean;
  rating: number;
  completedDuties: number;
  membershipPlan: 'Free' | 'Silver' | 'Gold' | 'Diamond';
  walletBalance: number;
  avatarUrl?: string;
  joinedDate?: string;
  kycDocumentUrl?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  badge: string;
  price: number;
  duration: string;
  popular?: boolean;
  features: string[];
  platformFee: string;
}

