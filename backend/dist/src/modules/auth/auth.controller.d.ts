import type { AuthUser } from '../../common/domain';
import { AuthService } from './auth.service';
import { LoginDto, RegisterBuyerDto, RegisterFarmerDto } from './auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    registerBuyer(dto: RegisterBuyerDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            status: import("@prisma/client").$Enums.UserStatus;
            buyerProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                buyerType: import("@prisma/client").$Enums.BuyerType;
                displayName: string;
                avatarUrl: string | null;
                companyName: string | null;
                taxId: string | null;
            } | null;
            farmerProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                displayName: string;
                avatarUrl: string | null;
                companyName: string;
                farmTaxId: string;
                pickupAddress: string | null;
                about: string | null;
                region: string | null;
                certification: string | null;
                supplyTerms: string | null;
            } | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    registerFarmer(dto: RegisterFarmerDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            status: import("@prisma/client").$Enums.UserStatus;
            buyerProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                buyerType: import("@prisma/client").$Enums.BuyerType;
                displayName: string;
                avatarUrl: string | null;
                companyName: string | null;
                taxId: string | null;
            } | null;
            farmerProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                displayName: string;
                avatarUrl: string | null;
                companyName: string;
                farmTaxId: string;
                pickupAddress: string | null;
                about: string | null;
                region: string | null;
                certification: string | null;
                supplyTerms: string | null;
            } | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            status: import("@prisma/client").$Enums.UserStatus;
            buyerProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                buyerType: import("@prisma/client").$Enums.BuyerType;
                displayName: string;
                avatarUrl: string | null;
                companyName: string | null;
                taxId: string | null;
            } | null;
            farmerProfile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                displayName: string;
                avatarUrl: string | null;
                companyName: string;
                farmTaxId: string;
                pickupAddress: string | null;
                about: string | null;
                region: string | null;
                certification: string | null;
                supplyTerms: string | null;
            } | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    me(user: AuthUser): Promise<{
        id: string;
        email: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        buyerProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            buyerType: import("@prisma/client").$Enums.BuyerType;
            displayName: string;
            avatarUrl: string | null;
            companyName: string | null;
            taxId: string | null;
        } | null;
        farmerProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            displayName: string;
            avatarUrl: string | null;
            companyName: string;
            farmTaxId: string;
            pickupAddress: string | null;
            about: string | null;
            region: string | null;
            certification: string | null;
            supplyTerms: string | null;
        } | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
