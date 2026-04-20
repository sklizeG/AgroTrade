export declare const USER_ROLES: readonly ["admin", "farmer", "buyer"];
export type UserRole = (typeof USER_ROLES)[number];
export declare const BUYER_TYPES: readonly ["b2c", "b2b"];
export type BuyerType = (typeof BUYER_TYPES)[number];
export declare const CAMPAIGN_STATUSES: readonly ["draft", "published", "closed", "fulfilled", "cancelled"];
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];
export declare const ORDER_STATUSES: readonly ["pending_payment", "reserved", "confirmed", "partially_delivered", "delivered", "cancelled"];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export declare const PAYMENT_STATUSES: readonly ["pending", "paid", "failed", "refunded"];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export declare const DELIVERY_MODES: readonly ["pickup", "full_delivery", "partial_delivery"];
export type DeliveryMode = (typeof DELIVERY_MODES)[number];
export type AuthUser = {
    sub: string;
    email: string;
    role: UserRole;
};
