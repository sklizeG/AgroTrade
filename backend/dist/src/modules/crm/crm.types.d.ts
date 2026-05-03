export type CrmOrderPayload = {
    orderId: string;
    status: string;
    totalAmount: number;
    volume: number;
    buyerEmail: string;
    buyerPhone?: string | null;
    buyerDisplayName: string;
    buyerCompanyName?: string | null;
    campaignTitle: string;
};
export type CrmFeedbackPayload = {
    id: string;
    name: string;
    phone: string;
    createdAt: Date;
};
export type CrmRegistrationPayload = {
    userId: string;
    role: 'buyer' | 'farmer';
    email: string;
    phone?: string | null;
    displayName: string;
    companyName?: string | null;
    buyerType?: string | null;
    taxId?: string | null;
    farmTaxId?: string | null;
    pickupAddress?: string | null;
};
