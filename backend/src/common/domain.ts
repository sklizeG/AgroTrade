export const USER_ROLES = ['admin', 'farmer', 'buyer'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const BUYER_TYPES = ['b2c', 'b2b'] as const;
export type BuyerType = (typeof BUYER_TYPES)[number];

export const CAMPAIGN_STATUSES = [
  'draft',
  'published',
  'closed',
  'fulfilled',
  'cancelled',
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const ORDER_STATUSES = [
  'pending_payment',
  'reserved',
  'confirmed',
  'partially_delivered',
  'delivered',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  'pending',
  'paid',
  'failed',
  'refunded',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const DELIVERY_MODES = [
  'pickup',
  'full_delivery',
  'partial_delivery',
] as const;
export type DeliveryMode = (typeof DELIVERY_MODES)[number];

export type AuthUser = {
  sub: string;
  email: string;
  role: UserRole;
};
