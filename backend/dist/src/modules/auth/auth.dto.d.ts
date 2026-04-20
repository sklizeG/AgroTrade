import { BUYER_TYPES } from '../../common/domain';
export declare class RegisterBuyerDto {
    email: string;
    password: string;
    buyerType: (typeof BUYER_TYPES)[number];
    displayName: string;
    companyName?: string;
    taxId?: string;
    phone?: string;
    avatarUrl?: string;
}
export declare class RegisterFarmerDto {
    email: string;
    password: string;
    displayName: string;
    companyName: string;
    farmTaxId: string;
    pickupAddress?: string;
    phone?: string;
    avatarUrl?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
