export type UserRole = 'admin' | 'farmer' | 'buyer';
export type BuyerType = 'b2c' | 'b2b';
export type DeliveryMode = 'pickup' | 'full_delivery' | 'partial_delivery';
export type CampaignStatus =
  | 'draft'
  | 'published'
  | 'closed'
  | 'fulfilled'
  | 'cancelled';
export type OrderStatus =
  | 'pending_payment'
  | 'reserved'
  | 'confirmed'
  | 'partially_delivered'
  | 'delivered'
  | 'cancelled';

export type BuyerProfile = {
  buyerType: BuyerType;
  displayName: string;
  avatarUrl?: string | null;
  companyName?: string | null;
  taxId?: string | null;
};

export type FarmerProfile = {
  displayName: string;
  avatarUrl?: string | null;
  companyName: string;
  farmTaxId: string;
  pickupAddress?: string | null;
  about?: string | null;
  region?: string | null;
  certification?: string | null;
  supplyTerms?: string | null;
};

export type FarmerReview = {
  id: string;
  buyerId?: string | null;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type FarmerPublicProfile = {
  id: string;
  email: string;
  phone?: string | null;
  farmerProfile?: FarmerProfile | null;
  campaigns: Campaign[];
  receivedReviews: FarmerReview[];
  reviewsCount: number;
  averageRating?: number | null;
};

export type User = {
  id: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: string;
  buyerProfile?: BuyerProfile | null;
  farmerProfile?: FarmerProfile | null;
};

export type Product = {
  id: string;
  name: string;
  unit: string;
  description?: string | null;
};

export type Campaign = {
  id: string;
  title: string;
  season: string;
  description?: string | null;
  imageUrls: string[];
  totalVolume: number;
  minOrderVolume: number;
  unitPrice: number;
  prepaymentPercent: number;
  preorderDeadline: string;
  availableFrom?: string | null;
  status: CampaignStatus;
  product: Product;
  farmer: {
    id: string;
    email: string;
    phone?: string | null;
    farmerProfile?: FarmerProfile | null;
  };
  reservedVolume?: number;
  availableVolume?: number;
};

export type PaymentRecord = {
  id: string;
  amount: number;
  status: string;
  method: string;
  paidAt?: string | null;
};

export type Order = {
  id: string;
  volume: number;
  quoteRequestedTotalVolume?: number | null;
  quoteBatchVolume?: number | null;
  quoteDeliveryFrequency?: 'once' | 'weekly' | 'daily' | null;
  fixedUnitPrice: number;
  totalAmount: number;
  prepaymentAmount: number;
  deliveryMode: DeliveryMode;
  deliveryAddress?: string | null;
  deliveryComment?: string | null;
  firstDeliveryDate?: string | null;
  status: OrderStatus;
  reservedAt?: string | null;
  createdAt: string;
  campaign: Campaign;
  paymentRecords: PaymentRecord[];
  buyer?: {
    id: string;
    email: string;
    phone?: string | null;
    buyerProfile?: BuyerProfile | null;
  };
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type FeedbackRequest = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
};
